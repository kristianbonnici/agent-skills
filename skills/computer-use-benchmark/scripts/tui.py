"""A real terminal for an interactive program, read through pyte."""
import errno
import fcntl
import os
import pty
import select
import signal
import struct
import termios
import time
import pyte


class Screen:
    def __init__(self, argv, cwd, rows=50, cols=130, env=None):
        child_env = dict(os.environ if env is None else env)
        for key in list(child_env):
            if key.startswith(("CLAUDE", "ANTHROPIC_")):
                del child_env[key]
        child_env["TERM"] = "xterm-256color"
        self.pid = None
        self.fd = None
        self._closed = False
        self.screen = None
        self.stream = None
        pid, fd = pty.fork()
        if pid == 0:
            try:
                os.chdir(cwd)
                os.execvpe(argv[0], argv, child_env)
            except BaseException:
                pass
            os._exit(127)
        self.pid, self.fd = pid, fd
        try:
            fcntl.ioctl(self.fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
            self.screen = pyte.Screen(cols, rows)
            self.stream = pyte.ByteStream(self.screen)
        except BaseException:
            self.close()
            raise

    def pump(self, seconds):
        if self.fd is None:
            return False
        end = time.time() + seconds
        while time.time() < end:
            try:
                ready, _, _ = select.select([self.fd], [], [], 0.1)
            except OSError:
                return False
            if ready:
                try:
                    data = os.read(self.fd, 65536)
                except OSError:
                    return False
                if not data:
                    return False
                self.stream.feed(data)
        return True

    def show(self):
        if self.screen is None:
            return ""
        return "\n".join(line.rstrip() for line in self.screen.display if line.strip())

    def send(self, text):
        if self.fd is None:
            raise OSError(errno.EBADF, "PTY is closed")
        os.write(self.fd, text.encode())

    def paste(self, text):
        self.send("\x1b[200~" + text + "\x1b[201~")

    def _drain_nonblocking(self):
        if self.fd is None or self.stream is None:
            return
        for _ in range(32):
            try:
                ready, _, _ = select.select([self.fd], [], [], 0)
            except OSError:
                break
            if not ready:
                break
            try:
                data = os.read(self.fd, 65536)
            except OSError:
                break
            if not data:
                break
            self.stream.feed(data)

    def _signal(self, sig):
        if self.pid is None:
            return
        try:
            os.killpg(self.pid, sig)
        except ProcessLookupError:
            pass
        except PermissionError:
            try:
                os.kill(self.pid, sig)
            except ProcessLookupError:
                pass

    def close(self, wait=3.0):
        if self._closed:
            return
        try:
            if self.pid is not None:
                self._signal(signal.SIGTERM)
                deadline = time.time() + wait
                while time.time() < deadline:
                    try:
                        pid, _ = os.waitpid(self.pid, os.WNOHANG)
                    except ChildProcessError:
                        self.pid = None
                        self._drain_nonblocking()
                        break
                    if pid == self.pid:
                        self.pid = None
                        self._drain_nonblocking()
                        break
                    if self.fd is not None and self.stream is not None:
                        try:
                            ready, _, _ = select.select([self.fd], [], [], 0.05)
                        except OSError:
                            ready = []
                        if ready:
                            try:
                                data = os.read(self.fd, 65536)
                            except OSError:
                                data = b""
                            if data:
                                self.stream.feed(data)
                    else:
                        time.sleep(0.05)
                if self.pid is not None:
                    self._signal(signal.SIGKILL)
                    while True:
                        try:
                            os.waitpid(self.pid, 0)
                            break
                        except InterruptedError:
                            continue
                        except ChildProcessError:
                            break
                    self.pid = None
        finally:
            if self.fd is not None:
                fd, self.fd = self.fd, None
                try:
                    os.close(fd)
                except OSError:
                    pass
            self._closed = True
