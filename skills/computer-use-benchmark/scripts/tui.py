"""A real terminal for an interactive program, read through pyte."""
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
        self.pid, self.fd = pty.fork()
        if self.pid == 0:
            os.chdir(cwd)
            os.execvpe(argv[0], argv, child_env)
        fcntl.ioctl(self.fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
        self.screen = pyte.Screen(cols, rows)
        self.stream = pyte.ByteStream(self.screen)

    def pump(self, seconds):
        end = time.time() + seconds
        while time.time() < end:
            ready, _, _ = select.select([self.fd], [], [], 0.1)
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
        return "\n".join(line.rstrip() for line in self.screen.display if line.strip())

    def send(self, text):
        os.write(self.fd, text.encode())

    def paste(self, text):
        self.send("\x1b[200~" + text + "\x1b[201~")

    def close(self):
        try:
            os.kill(self.pid, signal.SIGTERM)
        except OSError:
            pass
