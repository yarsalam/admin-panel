#!/usr/bin/env python3
"""YQH: local SQLite acceptance, traceability and evidence hub."""
from __future__ import annotations
import argparse, json, sqlite3, uuid
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS expectations (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, domain TEXT NOT NULL, priority TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'unverified', acceptance_json TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS code_entities (
 id TEXT PRIMARY KEY, repository TEXT NOT NULL, path TEXT NOT NULL, symbol TEXT,
 kind TEXT NOT NULL, line INTEGER, fingerprint TEXT NOT NULL, scan_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_code_repo_path ON code_entities(repository,path);
CREATE TABLE IF NOT EXISTS work_items (
 repo TEXT NOT NULL, kind TEXT NOT NULL, number INTEGER NOT NULL, title TEXT NOT NULL,
 state TEXT NOT NULL, url TEXT NOT NULL, updated_at TEXT, merged INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(repo,kind,number)
);
CREATE TABLE IF NOT EXISTS evidence (
 id TEXT PRIMARY KEY, expectation_id TEXT NOT NULL REFERENCES expectations(id) ON DELETE CASCADE,
 criterion TEXT NOT NULL, evidence_type TEXT NOT NULL, status TEXT NOT NULL,
 summary TEXT NOT NULL, source_ref TEXT NOT NULL, observed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS links (
 expectation_id TEXT NOT NULL REFERENCES expectations(id) ON DELETE CASCADE,
 target_type TEXT NOT NULL, target_ref TEXT NOT NULL, relation TEXT NOT NULL,
 confidence REAL NOT NULL DEFAULT 1.0,
 PRIMARY KEY(expectation_id,target_type,target_ref,relation)
);
"""

VALID_STATUSES = {"unverified","in_progress","verified","blocked","not_applicable"}

def connect(db_path: Path):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    db.executescript(SCHEMA)
    return db

def seed_expectations(db, config_path: Path):
    data = json.loads(config_path.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat()
    for item in data["expectations"]:
        db.execute("""INSERT INTO expectations
        (id,title,domain,priority,status,acceptance_json,description,updated_at)
        VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET title=excluded.title, domain=excluded.domain,
        priority=excluded.priority, acceptance_json=excluded.acceptance_json,
        description=excluded.description, updated_at=excluded.updated_at""",
        (item["id"],item["title"],item["domain"],item.get("priority","P2"),
         item.get("status","unverified"),json.dumps(item.get("acceptance_criteria",[]),ensure_ascii=False),
         item.get("description",""),now))
    db.commit()

def import_inventory(db, inventory_path: Path):
    manifest = json.loads(inventory_path.read_text(encoding="utf-8"))
    scan_id = manifest.get("generated_at","unknown")
    count = 0
    for repo in manifest["repositories"]:
        for entity in repo.get("entities",[]):
            db.execute("""INSERT INTO code_entities
            (id,repository,path,symbol,kind,line,fingerprint,scan_id) VALUES(?,?,?,?,?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET fingerprint=excluded.fingerprint,
            line=excluded.line, scan_id=excluded.scan_id""",
            (entity["id"],entity["repository"],entity["path"],entity.get("symbol"),
             entity["kind"],entity.get("line"),entity["fingerprint"],scan_id))
            count += 1
    db.commit()
    return count

def upsert_work_item(db, item):
    db.execute("""INSERT INTO work_items
    (repo,kind,number,title,state,url,updated_at,merged) VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(repo,kind,number) DO UPDATE SET title=excluded.title,state=excluded.state,
    url=excluded.url,updated_at=excluded.updated_at,merged=excluded.merged""",
    (item["repo"],item["kind"],int(item["number"]),item["title"],item["state"],
     item["url"],item.get("updated_at"),int(bool(item.get("merged",False)))))

def add_link(db, expectation_id, target_type, target_ref, relation, confidence=1.0):
    db.execute("""INSERT OR IGNORE INTO links
    (expectation_id,target_type,target_ref,relation,confidence) VALUES(?,?,?,?,?)""",
    (expectation_id,target_type,target_ref,relation,max(0.0,min(1.0,float(confidence)))))

def add_evidence(db, expectation_id, criterion, evidence_type, status, summary, source_ref):
    row = db.execute("SELECT acceptance_json FROM expectations WHERE id=?", (expectation_id,)).fetchone()
    if not row:
        raise ValueError(f"Unknown expectation ID: {expectation_id}")
    criteria = json.loads(row["acceptance_json"])
    if criterion not in criteria:
        raise ValueError("Criterion must exactly match one acceptance_criteria entry for this expectation")
    if status not in {"passed","failed","blocked","informational"}:
        raise ValueError("Evidence status must be passed, failed, blocked or informational")
    evidence_id = str(uuid.uuid4())
    db.execute("""INSERT INTO evidence
    (id,expectation_id,criterion,evidence_type,status,summary,source_ref,observed_at)
    VALUES(?,?,?,?,?,?,?,?)""",
    (evidence_id,expectation_id,criterion,evidence_type,status,summary,source_ref,
     datetime.now(timezone.utc).isoformat()))
    db.commit()
    return evidence_id

def set_expectation_status(db, expectation_id, status):
    row = db.execute("SELECT acceptance_json FROM expectations WHERE id=?", (expectation_id,)).fetchone()
    if not row:
        raise ValueError(f"Unknown expectation ID: {expectation_id}")
    if status == "verified":
        criteria = json.loads(row["acceptance_json"])
        if not criteria:
            raise ValueError("Cannot verify an expectation with no acceptance criteria")
        passed = {r["criterion"] for r in db.execute(
            "SELECT criterion FROM evidence WHERE expectation_id=? AND status='passed'", (expectation_id,))}
        missing = [criterion for criterion in criteria if criterion not in passed]
        if missing:
            raise ValueError(f"Cannot verify: {len(missing)} acceptance criterion/criteria lack passed evidence")
    cur = db.execute("UPDATE expectations SET status=?,updated_at=? WHERE id=?",
        (status,datetime.now(timezone.utc).isoformat(),expectation_id))
    db.commit()
    return cur.rowcount == 1

def report(db):
    rows = db.execute("SELECT status,COUNT(*) AS n FROM expectations GROUP BY status").fetchall()
    counts = {row["status"]:row["n"] for row in rows}
    total = sum(counts.values()); verified = counts.get("verified",0)
    expectations = [dict(r) for r in db.execute("""SELECT id,title,domain,priority,status
        FROM expectations ORDER BY CASE priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END,id""")]
    return {"expectations_total":total,"verified":verified,
        "verified_percent":round(100*verified/total,1) if total else 0.0,
        "status_counts":counts,
        "code_entities":db.execute("SELECT COUNT(*) FROM code_entities").fetchone()[0],
        "work_items":db.execute("SELECT COUNT(*) FROM work_items").fetchone()[0],
        "links":db.execute("SELECT COUNT(*) FROM links").fetchone()[0],
        "expectations":expectations}

def main():
    p=argparse.ArgumentParser(description="YQH acceptance and evidence hub")
    sub=p.add_subparsers(dest="command",required=True)
    for name in ("init","report"):
        q=sub.add_parser(name); q.add_argument("--db",default="data/yqh.sqlite3")
        if name=="init": q.add_argument("--expectations",default="config/expectations.json")
    q=sub.add_parser("import-inventory"); q.add_argument("--db",default="data/yqh.sqlite3"); q.add_argument("--inventory",default="data/yqe/inventory.json")
    q=sub.add_parser("set-status"); q.add_argument("--db",default="data/yqh.sqlite3"); q.add_argument("expectation_id"); q.add_argument("status",choices=sorted(VALID_STATUSES))
    q=sub.add_parser("add-evidence"); q.add_argument("--db",default="data/yqh.sqlite3")
    q.add_argument("--expectation-id",required=True); q.add_argument("--criterion",required=True)
    q.add_argument("--type",dest="evidence_type",required=True); q.add_argument("--status",required=True,choices=["passed","failed","blocked","informational"])
    q.add_argument("--summary",required=True); q.add_argument("--source-ref",required=True)
    a=p.parse_args(); db=connect(Path(a.db))
    try:
        if a.command=="init":
            seed_expectations(db,Path(a.expectations)); print("YQH initialized")
        elif a.command=="import-inventory":
            print(json.dumps({"imported_entities":import_inventory(db,Path(a.inventory))}))
        elif a.command=="set-status":
            try: set_expectation_status(db,a.expectation_id,a.status)
            except ValueError as exc: raise SystemExit(str(exc))
            print(f"{a.expectation_id}: {a.status}")
        elif a.command=="add-evidence":
            try: eid=add_evidence(db,a.expectation_id,a.criterion,a.evidence_type,a.status,a.summary,a.source_ref)
            except ValueError as exc: raise SystemExit(str(exc))
            print(json.dumps({"evidence_id":eid,"expectation_id":a.expectation_id,"status":a.status}))
        else:
            print(json.dumps(report(db),ensure_ascii=False,indent=2))
    finally:
        db.close()

if __name__=="__main__": main()
