"""Seekable read-only file over HTTP range requests (for remote Parquet / GeoTIFF)."""
import io, threading, urllib.request

class HttpFile(io.RawIOBase):
    def __init__(self, url, block=1 << 20):
        self.url, self.block, self.pos, self.cache = url, block, 0, {}
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=60) as r:
            self.size = int(r.headers["Content-Length"])
        self.lock = threading.Lock()
        self.fetched = 0

    def readable(self): return True
    def seekable(self): return True
    def tell(self): return self.pos

    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else (self.pos + off if whence == 1 else self.size + off)
        return self.pos

    def _get(self, a, b):
        for attempt in range(5):
            try:
                req = urllib.request.Request(self.url, headers={"Range": f"bytes={a}-{b - 1}"})
                with urllib.request.urlopen(req, timeout=120) as r:
                    d = r.read()
                self.fetched += len(d)
                return d
            except Exception as e:
                if attempt == 4: raise
        return b""

    def read(self, n=-1):
        if n < 0: n = self.size - self.pos
        n = min(n, self.size - self.pos)
        if n <= 0: return b""
        a, b = self.pos, self.pos + n
        b0, b1 = a // self.block, (b - 1) // self.block
        miss = [i for i in range(b0, b1 + 1) if i not in self.cache]
        if miss:
            lo, hi = miss[0] * self.block, min((miss[-1] + 1) * self.block, self.size)
            d = self._get(lo, hi)
            for i in range(miss[0], miss[-1] + 1):
                self.cache[i] = d[(i - miss[0]) * self.block:(i - miss[0] + 1) * self.block]
        out = b"".join(self.cache[i] for i in range(b0, b1 + 1))
        off = a - b0 * self.block
        self.pos = b
        if len(self.cache) > 256:
            for k in list(self.cache)[:128]: del self.cache[k]
        return out[off:off + n]

    def readinto(self, buf):
        d = self.read(len(buf)); buf[:len(d)] = d; return len(d)
