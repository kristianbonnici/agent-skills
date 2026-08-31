from __future__ import annotations

import argparse
import os
import re
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RangeRequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            source = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(source.fileno()).st_size
        content_type = self.guess_type(path)
        start = 0
        end = max(0, size - 1)
        range_header = self.headers.get("Range")

        if range_header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
            if not match:
                source.close()
                self.send_error(416, "Invalid byte range")
                return None

            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), size - 1) if last else size - 1
            elif last:
                length = min(int(last), size)
                start = size - length
                end = size - 1

            if start < 0 or start >= size or end < start:
                source.close()
                self.send_error(416, "Requested range not satisfiable")
                return None

            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self._byte_range = (start, end)
        else:
            self.send_response(200)
            self._byte_range = None

        self.send_header("Content-Type", content_type)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Last-Modified", self.date_time_string(os.fstat(source.fileno()).st_mtime))
        self.end_headers()
        source.seek(start)
        return source

    def copyfile(self, source, outputfile):
        if self._byte_range is None:
            return super().copyfile(source, outputfile)

        start, end = self._byte_range
        remaining = end - start + 1
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


def main():
    parser = argparse.ArgumentParser(description="Serve the synchronized report reader with byte-range audio seeking.")
    parser.add_argument("--directory", required=True)
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--max-lifetime",
        type=int,
        default=7200,
        help="Maximum server lifetime in seconds; defaults to two hours.",
    )
    args = parser.parse_args()

    handler = partial(RangeRequestHandler, directory=args.directory)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    server.daemon_threads = True
    server.timeout = 1
    deadline = time.monotonic() + max(1, args.max_lifetime)
    actual_port = server.server_address[1]
    print(
        f"Serving range-aware reader at http://127.0.0.1:{actual_port}/ "
        f"for at most {args.max_lifetime} seconds.",
        flush=True,
    )
    try:
        while time.monotonic() < deadline:
            server.handle_request()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("Reader server stopped.", flush=True)


if __name__ == "__main__":
    main()
