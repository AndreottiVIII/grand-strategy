"""Tiny local receiver for harvests done inside the browser pane.

The UN Digital Library sits behind a bot challenge that only a real browser passes, so
the votes are harvested by a script running in the page (tools/datasets/unga_page.js)
and POSTed here. Usage:

    python tools/datasets/receive.py            # listens on http://localhost:8787

POST /unga/<year>  with the JSON body -> data/datasets/unga/<year>.json
"""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
UNGA = ROOT / "data" / "datasets" / "unga"


class H(BaseHTTPRequestHandler):
    def _cors(self):
        # a public https page posting to localhost needs the private-network allowance too
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n)
        parts = self.path.strip("/").split("/")
        try:
            obj = json.loads(body)
            if parts[0] == "unga" and len(parts) == 2 and parts[1].isdigit() and "records" in obj:
                UNGA.mkdir(parents=True, exist_ok=True)
                out = UNGA / f"{parts[1]}.json"
                out.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
                msg = f"saved {out.name}: {len(obj['records'])} records"
            else:
                msg = "ignored"
        except Exception as e:  # noqa: BLE001
            msg = f"error {e}"
        print(msg, flush=True)
        self.send_response(200); self._cors(); self.send_header("Content-Type", "text/plain"); self.end_headers()
        self.wfile.write(msg.encode())

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print("receiver on http://localhost:8787", flush=True)
    HTTPServer(("127.0.0.1", 8787), H).serve_forever()
