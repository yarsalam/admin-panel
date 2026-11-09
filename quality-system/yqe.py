#!/usr/bin/env python3
"""YQE: read-only source inventory for the Yarsalam repositories (stdlib only)."""
from __future__ import annotations
import argparse, ast, hashlib, json, re, subprocess
from datetime import datetime, timezone
from pathlib import Path

SCHEMA_VERSION = 1
SOURCE_EXTENSIONS = {'.py', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.java', '.kt', '.go', '.php', '.rb', '.cs', '.sql', '.prisma'}
SKIP_DIRS = {'.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', 'vendor', 'Pods', 'target', 'apk-download'}
JS_SYMBOL = re.compile(r'(?m)^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)|^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^\n]*?\)|[A-Za-z_$][\w$]*)\s*=>')
NEST_ROUTE = re.compile(r'@(?P<verb>Get|Post|Put|Patch|Delete)\s*\(\s*(?P<path>[^)]*)\)', re.I)
NEST_CONTROLLER = re.compile(r'@Controller\s*\(\s*([^)]*)\)', re.I)


def run_git(repo: Path, *args: str) -> str | None:
    try:
        p = subprocess.run(['git', '-C', str(repo), *args], capture_output=True, text=True, timeout=8, check=True)
        return p.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return None


def stable_id(prefix: str, value: str) -> str:
    return f'{prefix}-{hashlib.sha256(value.encode("utf-8")).hexdigest()[:14].upper()}'


def parse_python(text: str):
    rows = []
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return rows
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            rows.append({'symbol': node.name, 'kind': 'class' if isinstance(node, ast.ClassDef) else 'function', 'line': getattr(node, 'lineno', 1)})
    return rows


def parse_javascript(text: str):
    rows = []
    for match in JS_SYMBOL.finditer(text):
        name = match.group(1) or match.group(2)
        if name:
            prefix = text[max(0, match.start()-80):match.start()]
            kind = 'class' if re.search(r'\bclass\s+$', match.group(0)) else ('component_or_hook' if name[:1].isupper() or name.startswith('use') else 'function_or_value')
            rows.append({'symbol': name, 'kind': kind, 'line': text.count('\n', 0, match.start()) + 1})
    return rows


def scan_repository(repo_cfg: dict) -> dict:
    repo_path = Path(repo_cfg['path']).expanduser().resolve()
    repo_name = repo_cfg['name']
    if not repo_path.is_dir():
        return {'repository': repo_name, 'path': str(repo_path), 'available': False, 'error': 'repository path does not exist', 'entities': [], 'routes': []}
    head = run_git(repo_path, 'rev-parse', 'HEAD')
    branch = run_git(repo_path, 'branch', '--show-current')
    status = run_git(repo_path, 'status', '--porcelain')
    entities, routes = [], []
    for file_path in sorted(repo_path.rglob('*')):
        if not file_path.is_file() or file_path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue
        rel_parts = file_path.relative_to(repo_path).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        try:
            if file_path.stat().st_size > 1_500_000:
                continue
            content = file_path.read_text(encoding='utf-8', errors='replace')
        except OSError:
            continue
        rel = file_path.relative_to(repo_path).as_posix()
        fingerprint = hashlib.sha256(content.encode('utf-8')).hexdigest()
        file_id = stable_id('FILE', f'{repo_name}:{rel}')
        entities.append({'id': file_id, 'repository': repo_name, 'path': rel, 'symbol': None, 'kind': 'source_file', 'line': 1, 'fingerprint': fingerprint})
        symbols = parse_python(content) if file_path.suffix.lower() == '.py' else parse_javascript(content)
        for item in symbols:
            item_id = stable_id('CODE', f"{repo_name}:{rel}:{item['line']}:{item['symbol']}")
            entities.append({'id': item_id, 'repository': repo_name, 'path': rel, **item, 'fingerprint': fingerprint})
        if file_path.suffix.lower() in {'.ts', '.js'}:
            controller = NEST_CONTROLLER.search(content)
            base = controller.group(1).strip().strip("'\" ") if controller else ''
            for match in NEST_ROUTE.finditer(content):
                raw_path = match.group('path').strip().strip("'\" ")
                route = '/' + '/'.join(x.strip('/') for x in (base, raw_path) if x)
                routes.append({'id': stable_id('ROUTE', f'{repo_name}:{rel}:{match.start()}:{match.group("verb")}:{route}'), 'repository': repo_name, 'path': rel, 'method': match.group('verb').upper(), 'route': route, 'line': content.count('\n', 0, match.start()) + 1})
    return {'repository': repo_name, 'path': str(repo_path), 'available': True, 'git': {'head': head, 'branch': branch, 'clean': status == '' if status is not None else None}, 'entities': entities, 'routes': routes,
            'counts': {'files': sum(e['kind'] == 'source_file' for e in entities), 'symbols': sum(e['kind'] != 'source_file' for e in entities), 'routes': len(router)}}


def scan(config_path: Path, output_path: Path) -> dict:
    cfg = json.loads(config_path.read_text(encoding='utf-8'))
    results = [scan_repository(item) for item in cfg['repositories']]
    manifest = {'schema_version': SCHEMA_VERSION, 'generated_at': datetime.now(timezone.utc).isoformat(), 'tool': 'YQE', 'repositories': results,
                'summary': {'repositories': len(results), 'available': sum(r['available'] for r in results), 'files': sum(r.get('counts', {}).get('files', 0) for r in results), 'symbols': sum(r.get('counts', {}).get('symbols', 0) for r in results), 'routes': sum(r.get('counts', {}).get('routes', 0) for r in results)}}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return manifest


def main():
    p = argparse.ArgumentParser(description='YQE read-only source inventory')
    sub = p.add_subparsers(dest='command', required=True)
    s = sub.add_parser('scan'); s.add_argument('--config', default='config/repos.json'); s.add_argument('--output', default='data/yqe/inventory.json')
    a = p.parse_args()
    result = scan(Path(a.config), Path(a.output))
    print(json.dumps(result['summary'], ensure_ascii=False, indent=2))
    missing = [r['repository'] for r in result['repositories'] if not r['available']]
    if missing:
        print('Missing repositories: ' + ', '.join(missing))
        raise SystemExit(2)

if __name__ == '__main__': main()
