# reviewer-benchmark changelog

## 1.0.0 (2026-11-15)

- **A benchmark for reviewer models** (owner, 2026-11-15: "a rerunnable, versioned benchmark for these reviews", "stored properly"). Models review the owner's private set of past changes, whose defects are known, and their reports are scored blind. It replaces waiting for about 20 live trial reviews of each model, on different changes, with one evening on the same ones ([evidence.md](evidence.md)).
- **`scripts/bench`:** `setup` makes a copy of each change that holds nothing made after its review; `run` has one model review every change, read-only, with the review gate's brief, and records a review that passes its time; `blind` names the reports by letter for the scorers and `unblind` saves their scores under the models' names; `totals` prints one line per model.
- **Two scoring passes:** each report against the key, then every other blocker or follow-up against the code, with a verdict of real, true but minor, there before, or false. The second pass goes to the strongest model at hand.
- **The key grows:** a finding outside the key that held up is added to it, checked against today's code, and the set's version goes up, so the key doesn't stay tilted toward the reviewers who wrote it.
- **The data is the owner's:** the set, keys, reports and scores live in the private state repository, and the commits a key names are kept from deletion by a name in their own repository. Nothing of them is in this repository.
- `tests/reviewer-benchmark-test` checks the script with a made-up set.
