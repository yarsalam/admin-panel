import json, tempfile, unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import yqe, yqh, yqte

class YQETests(unittest.TestCase):
    def test_python_ast_extracts_functions_and_classes(self):
        rows=yqe.parse_python("class UserService:\n def load(self): pass\nasync def run(): pass\n")
        self.assertTrue({"UserService","load","run"} <= {x["symbol"] for x in rows})

    def test_typescript_extracts_declarations_and_routes(self):
        source="@Controller('payments')\nexport class PaymentsController {\n @Post('proof')\n submit() {}\n}\nexport const useWallet = () => {};\n"
        rows=yqe.parse_javascript(source)
        names={x["symbol"] for x in rows}
        self.assertIn("PaymentsController",names)
        self.assertIn("useWallet",names)
        route=yqe.NEST_ROUTE.search(source)
        self.assertIsNotNone(route)
        self.assertEqual(route.group("verb").lower(),"post")

    def test_scan_is_read_only_and_records_dirty_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/"src").mkdir(); (root/"src"/"a.py").write_text("def hello(): pass\n")
            cfg=root/"repos.json"; cfg.write_text(json.dumps({"repositories":[{"name":"fixture","path":str(root)}]}))
            out=root/"out.json"; result=yqe.scan(cfg,out)
            self.assertTrue(result["repositories"][0]["available"])
            self.assertGreaterEqual(result["summary"]["files"],1)
            self.assertTrue(out.exists())

    def test_yqh_seed_and_import_and_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); db=yqh.connect(root/"hub.sqlite3")
            exp=root/"expectations.json"; exp.write_text(json.dumps({"expectations":[{"id":"YH-TEST-001","title":"t","domain":"test","priority":"P1","acceptance_criteria":["works"]}]}))
            yqh.seed_expectations(db,exp)
            inv=root/"inventory.json"; inv.write_text(json.dumps({"generated_at":"now","repositories":[{"entities":[{"id":"FILE-1","repository":"fixture","path":"a.py","symbol":None,"kind":"source_file","line":1,"fingerprint":"abc"}]}]}))
            self.assertEqual(yqh.import_inventory(db,inv),1)
            rep=yqh.report(db)
            self.assertEqual(rep["expectations_total"],1)
            self.assertEqual(rep["verified_percent"],0.0)
            self.assertEqual(rep["code_entities"],1)
            db.close()

    def test_verified_requires_passed_evidence_for_every_criterion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); db=yqh.connect(root/"hub.sqlite3")
            criteria=["API rejects unauthenticated requests","Integration test confirms owner scoping"]
            exp=root/"expectations.json"; exp.write_text(json.dumps({"expectations":[{"id":"YH-TEST-002","title":"secure route","domain":"test","priority":"P0","acceptance_criteria":criteria}]}))
            yqh.seed_expectations(db,exp)
            with self.assertRaisesRegex(ValueError,"lack passed evidence"):
                yqh.set_expectation_status(db,"YH-TEST-002","verified")
            yqh.add_evidence(db,"YH-TEST-002",criteria[0],"automated-test","passed","401 returned","run:123")
            with self.assertRaisesRegex(ValueError,"lack passed evidence"):
                yqh.set_expectation_status(db,"YH-TEST-002","verified")
            yqh.add_evidence(db,"YH-TEST-002",criteria[1],"integration-test","passed","cross-account rejected","run:124")
            self.assertTrue(yqh.set_expectation_status(db,"YH-TEST-002","verified"))
            db.close()

    def test_link_config_is_explicit_and_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); db=yqh.connect(root/"hub.sqlite3")
            exp=root/"expectations.json"; exp.write_text(json.dumps({"expectations":[{"id":"YH-TEST-001","title":"t","domain":"test","priority":"P1","acceptance_criteria":[]}]}))
            yqh.seed_expectations(db,exp)
            links={"code_selectors":[],"work_items":[{"repo":"owner/repo","kind":"issue","number":5,"expectation_ids":["YH-TEST-001"]}]}
            self.assertEqual(yqte.seed_external_links(db,links),1)
            self.assertEqual(yqte.seed_external_links(db,links),1)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM links").fetchone()[0],1)
            db.close()

if __name__=="__main__":
    unittest.main()
