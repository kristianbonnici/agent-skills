# disk-cleanup changelog

## 1.0.0 (2026-10-31)

- First release: a read-only scan, then sort, prove unused, report, and clear only what the owner picks, with their decisions kept in private state so later rounds show what's new. A scheduled run only reports. From two manual cleanup rounds that freed about 140 GB, where the checks that mattered were running processes, LaunchAgents and whether anything still referenced a folder, and where estimates from `du` overstated what hard-linked caches would free.
