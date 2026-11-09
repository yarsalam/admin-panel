#!/usr/bin/env python3
"""YQTE: traceability between extracted source, expectations and GitHub work."""
from __future__ import annotations
import argparse, json, re, shutil, subprocess
from pathlib import Path
import yqh

YQH_TAG = re.compile(r"\b(YH-[A-Z0-9]+-[0-9]{3,})\b")

def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def gh_json(args: list[str], timeout: int=90):
    if not shutil.which("gh"):
        raise RuntimeError("GitHub CLI (gh) is not installed")
    try:
        proc = subprocess.run(["gh","api","--paginate","--slurp",*args],
            capture_output=True,text=True,timeout=timeout,check=True)
    except subprocess.CalledProcessError as exc:
        detail=(exc.stderr or exc.stdout or str(exc)).strip()
        raise RuntimeError(f"gh api failed: {detail}") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"gh api timed out after {timeout}s: {args[-1]}") from exc
    try:
        pages=json.loads(proc.stdout or "[]")
    except json.JSONDecodeError as exc:
        raise RuntimeError("gh api returned invalid JSON") from exc
    if not isinstance(pages,list):
        return pages
    flattened=[]
    for page in pages:
        if isinstance(page,list): flattened.extend(page)
        elif page is not None: flattened.append(page)
    return flattened

def repo_rows(repos_path: Path):
    return load_json(repos_path)["repositories"]

def seed_external_links(db, links_cfg):
    count=0
    for item in links_cfg.get("work_items",[]):
        repo=item["repo"]; kind=item["kind"]; number=int(item["number"])
        ref=f"{repo}#{number}"
        for expectation_id in item.get("expectation_ids",[]):
            yqh.add_link(db,expectation_id,"github_"+kind,ref,
                item.get("relation","tracks"),item.get("confidence",1.0))
            count+=1
    db.commit()
    return count

def apply_code_selectors(db, links_cfg):
    count=0
    for mapping in links_cfg.get("code_selectors",[]):
        query="SELECT id FROM code_entities WHERE repository=?"
        params=[mapping["repo"]]
        if mapping.get("path_contains"):
            query+=" AND path LIKE ?"; params.append("%"+mapping["path_contains"]+"%")
        if mapping.get("symbol_contains"):
            query+=" AND COALESCE(symbol,'') LIKE ?"; params.append("%"+mapping["symbol_contains"]+"%")
        if mapping.get("kind"):
            query+=" AND kind=?"; params.append(mapping["kind"])
        for row in db.execute(query,params).fetchall():
            yqh.add_link(db,mapping["expectation_id"],"code_entity",row["id"],
                mapping.get("relation","implements"),mapping.get("confidence",0.9))
            count+=1
    db.commit()
    return count

def sync_github(db, repos_path: Path, links_path: Path):
    cfg=load_json(links_path)
    repos=repo_rows(repos_path)
    mapped={(x["repo"],x["kind"],int(x["number"])):x for x in cfg.get("work_items",[])}
    counts={"issues":0,"pull_requests":0,"changed_file_links":0,"expectation_links":0}
    for repo_cfg in repos:
        repo=repo_cfg["github"]
        issues=gh_json([f"repos/{repo}/issues?state=all&per_page=100"])
        for obj in issues:
            if "pull_request" in obj:
                continue
            number=int(obj["number"])
            item={"repo":repo,"kind":"issue","number":number,"title":obj.get("title","(untitled)"),
                "state":obj.get("state","unknown"),"url":obj.get("html_url",""),
                "updated_at":obj.get("updated_at")}
            yqh.upsert_work_item(db,item); counts["issues"]+=1
            text=(obj.get("title","")+"\n"+(obj.get("body") or ""))
            for expectation_id in YQH_TAG.findall(text):
                if db.execute("SELECT 1 FROM expectations WHERE id=?",(expectation_id,)).fetchone():
                    yqh.add_link(db,expectation_id,"github_issue",f"{repo}#{number}","mentions",0.95)
                    counts["expectation_links"]+=1
            mapping=mapped.get((repo,"issue",number))
            if mapping:
                for eid in mapping.get("expectation_ids",[]):
                    yqh.add_link(db,eid,"github_issue",f"{repo}#{number}",
                        mapping.get("relation","tracks"),mapping.get("confidence",1.0))
                    counts["expectation_links"]+=1

        prs=gh_json([f"repos/{repo}/pulls?state=all&per_page=100"])
        for obj in prs:
            number=int(obj["number"])
            item={"repo":repo,"kind":"pr","number":number,"title":obj.get("title","(untitled)"),
                "state":obj.get("state","unknown"),"url":obj.get("html_url",""),
                "updated_at":obj.get("updated_at"),"merged":bool(obj.get("merged_at"))}
            yqh.upsert_work_item(db,item); counts["pull_requests"]+=1
            text=(obj.get("title","")+"\n"+(obj.get("body") or ""))
            for expectation_id in YQH_TAG.findall(text):
                if db.execute("SELECT 1 FROM expectations WHERE id=?",(expectation_id,)).fetchone():
                    yqh.add_link(db,expectation_id,"github_pr",f"{repo}#{number}","mentions",0.95)
                    counts["expectation_links"]+=1
            mapping=mapped.get((repo,"pr",number))
            if mapping:
                for eid in mapping.get("expectation_ids",[]):
                    yqh.add_link(db,eid,"github_pr",f"{repo}#{number}",
                        mapping.get("relation","implements"),mapping.get("confidence",1.0))
                    counts["expectation_links"]+=1
            # For open PRs, link changed paths to the extracted source entities.
            if obj.get("state")=="open":
                files=gh_json([f"repos/{repo}/pulls/{number}/files?per_page=100"])
                for changed in files:
                    path=changed.get("filename")
                    if not path:
                        continue
                    code_rows=db.execute(
                        "SELECT id FROM code_entities WHERE repository=? AND path=?",(repo,path)).fetchall()
                    for code in code_rows:
                        for eid in (mapping or {}).get("expectation_ids",[]):
                            yqh.add_link(db,eid,"code_entity",code["id"],
                                f"changed-by:{repo}#{number}",0.85)
                            counts["changed_file_links"]+=1
        db.commit()
    return counts

def main():
    parser=argparse.ArgumentParser(description="YQTE traceability engine")
    sub=parser.add_subparsers(dest="command",required=True)
    for name in ("link","sync-github","reconcile"):
        cmd=sub.add_parser(name)
        cmd.add_argument("--db",default="data/yqh.sqlite3")
        cmd.add_argument("--repos",default="config/repos.json")
        cmd.add_argument("--links",default="config/links.json")
    args=parser.parse_args()
    db=yqh.connect(Path(args.db))
    try:
        code_count=0; item_count=0; github_counts={}
        if args.command in ("link","reconcile"):
            inventory=Path("data/yqe/inventory.json")
            if inventory.exists():
                yqh.import_inventory(db,inventory)
            links_cfg=load_json(Path(args.links))
            code_count=apply_code_selectors(db,links_cfg)
            item_count=seed_external_links(db,links_cfg)
        if args.command in ("sync-github","reconcile"):
            github_counts=sync_github(db,Path(args.repos),Path(args.links))
        print(json.dumps({"code_links":code_count,"configured_work_item_links":item_count,
            "github_sync":github_counts,"report":yqh.report(db)},ensure_ascii=False,indent=2))
    finally:
        db.close()

if __name__=="__main__":
    main()
