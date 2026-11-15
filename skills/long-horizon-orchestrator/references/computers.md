# Tasks on another computer

In T3 Code, the owner's computers can be linked to one another (Settings → Labs → Linked environments), and every T3 tool then acts on a linked computer when given its `environmentId`. A run can place a task there: to keep the computer the owner uses every day free, to spare a weak computer the heavy work, or for a tool that exists on one computer only. Plain Claude Code and Codex hosts can't reach another computer: under them, every task runs where you run.

"Your computer" below is the one you, the orchestrator, run on; "the other computer" is any linked one. Name each computer by its `LocalHostName` (`scutil --get LocalHostName` on macOS, `hostname -s` elsewhere), the name of its section in the owner's profile ([routing.md](routing.md#6-the-owners-profile)). The examples use two made-up Macs: `studio-mac`, the daily one, and `den-mac`, an older one that is always on.

## 1. When a task goes elsewhere

Tasks run on your computer unless the contract places one elsewhere and says why. Three reasons count:

- **Capacity:** the owner works on the daily computer during the run, or a weak computer should get only light tasks.
- **A tool that exists only there:** a harness or helper installed and signed in on one computer, a simulator, a device, a signed-in service.
- **The owner's wish.**

Read what each computer can do from its `## Machine` section in the profile before placing anything: its role, what is installed and signed in there, and what can't run there. A preference that names a tool ("computer use on Codex") applies only on a computer where that tool exists.

- **Keep a task that uses the real screen** on a computer whose warm-up you ran with the owner at it. The warm-up needs them at that computer's keyboard ([machine.md](machine.md#3-the-warm-up)), so a screen task on a computer they won't sit at before they leave stays off it.
- **A weak computer** (an older chip, little memory or free disk, on battery) takes fewer tasks at once, and no task whose builds or installs are heavy there: on an Intel Mac, for example, some package installs compile from source and take far longer.
- **A computer that doesn't answer now** (`t3_environment_links` shows its `status`), or whose link expires before the run's estimate plus a day (`expiresAt`), gets no task. Ask the owner to link it again before they leave, or place its tasks on your computer.

## 2. Discover each computer

Before the contract, for your computer and each linked one:

1. **Who you are:** `t3_environment_read` with no `environmentId` gives your own `environmentId`, label and platform. Every brief elsewhere needs your `environmentId` to report back to you.
2. **What is linked:** `t3_environment_links` lists each linked computer's `environmentId`, label, `status`, `access` and `expiresAt`; `t3_environment_read({environmentId})` gives its platform (`os`, `arch`). Use only a computer with `access: "full-access"`, since tasks commit and run commands there.
3. **Its providers and models:** `orchestrator_capabilities({environmentId})`. Read the targets for a computer from its own catalog, and never copy one computer's into a brief for the other: model IDs and their options differ by computer (one may list a model with its reasoning in the ID, the other the same model with a reasoning option), and a provider instance or helper may exist on one only. The same holds for the "Help available" sections of a brief elsewhere: list that computer's targets.
4. **Its projects:** `t3_project_list({environmentId})` and the entry whose `workspaceRoot` is the repository's checkout there. A repository checked out there that isn't a T3 project yet needs `t3_project_create({environmentId, workspaceRoot})`. A repository not checked out there at all is a pre-flight item: clone it only if the contract says so.

Record each computer in the ledger: its name, `environmentId`, label, platform, role, project IDs, and the targets you read.

## 3. Pre-flight on the other computer

You can't run a command on the other computer yourself. A short thread there runs them: launch it with `t3_thread_launch` and that computer's `environmentId` and `projectId`, without `workspaceStrategy`, so it runs in the project's own checkout and changes nothing there but fetched refs, on your home harness at medium reasoning, with a message that lists the commands below and asks for their output in its final message, which you read with `t3_thread_read({environmentId, threadId})`. Run it before you post the contract, so its findings go in the contract, and settle the thread once you have read it.

- **Power and disk:** `pmset -g batt` (on battery is a pre-flight item: ask the owner to plug it in before they leave) and free disk (`df -h /System/Volumes/Data`).
- **Active runs there:** ledgers under `${XDG_STATE_HOME:-~/.local/state}/agent-skills/long-horizon-orchestrator/` whose status line says `running` or `paused`. Another run there shares that computer's capacity and its leases ([routing.md](routing.md#running-beside-another-orchestrator)).
- **Its repositories against the remote:** for each repository the run touches, `git fetch origin`, the branch it is on, whether it is clean, and its local default branch's commits that the remote lacks (`git rev-list --left-right --count origin/<default>...<default>`).
- **Its installed skill versions:** `metadata.version` of this skill and of `review-gate` in the copies its harnesses read. Tasks there follow the review gate from their own worktree's copy, so a difference matters only for the scripts the brief names there: name the paths that exist on that computer, from that computer's skill folder.
- **Leftover processes and a start snapshot:** `ps -axo pid,lstart,command`, saved in the run directory there, so the finish can tell the run's leftovers from the owner's own.

In the same thread, once the owner has approved the contract (or in a second short thread then), start that computer's keep-awake: `nohup caffeinate -i -t <seconds> >/dev/null 2>&1 & echo $!`, with `-d` too if a task there uses the real screen ([machine.md](machine.md#4-keeping-the-computer-awake)). Record its process ID in the ledger and in `<run directory>/keep-awake.pid` there. On battery, `caffeinate` doesn't stop a sleep that a closed lid or a flat battery brings.

## 4. In the contract

Add one part, **Computers**, when any task runs elsewhere:

- each computer: its role, why it gets the tasks it gets, and its limit on tasks at once and on heavy builds at once (the `cpu` lease's slots there): leases and limits are per computer, while subscriptions, live usage and the run's budgets are shared by all of them;
- what its pre-flight found that needs the owner before they leave: power, free disk, another active run, unpushed commits, a link that expires, a repository missing there;
- the run branch and the briefs branch below, which are pushes the owner approves with the contract;
- what you won't be able to watch there (section 8).

Each task's line gives its computer, and its reason when it isn't yours.

## 5. Briefs and rules reach it through git

The computers share no files. The run directory lives on your computer; a task elsewhere keeps its files at the same path under its own home folder (`${XDG_STATE_HOME:-~/.local/state}/agent-skills/long-horizon-orchestrator/<run>/<task ID>/`), and its final message carries its whole handoff, since you can't read that folder.

The common file and the briefs reach it on a throwaway branch of the owner's private state repository, `lho/<run>-briefs`, which holds only `common.md` and `<task ID>.md`:

- Make it from a worktree of that repository in your run directory (`git worktree add --detach`, then `git switch --orphan lho/<run>-briefs`), commit the files, and push the branch. Never commit anything else there.
- The launch message is short: it says to run `git -C <state repository there> fetch -q origin lho/<run>-briefs`, then `git show FETCH_HEAD:common.md` and `git show FETCH_HEAD:<task ID>.md`, with `GIT_TERMINAL_PROMPT=0` and `GIT_SSH_COMMAND='ssh -o BatchMode=yes'` so nothing can prompt, to read both in full and do the brief, and to fetch the common file again before its merge gate. If the fetch fails three times a minute apart, the task stops and ends with a `status=failed` report as its final message.
- A rule added during the run is a new commit and push to that branch, and, for a running task, a steer as well (`t3_thread_send` with its `environmentId`, mode `steer`), as for any task ([task-brief.md](task-brief.md#one-common-file-for-every-brief)).

## 6. Commits travel through the remote

Your computer's checkout may be far behind or ahead of the other's, and a branch on one computer doesn't exist on the other. So a run with a task elsewhere integrates on a **run branch** on the shared remote, `lho/<run>`, in each repository it changes:

1. **Start it from the newest default branch.** Compare each computer's local default branch with the remote's (the pre-flight's counts). The computer whose default branch holds all the others' commits pushes it as `lho/<run>`; when it is the other computer, its pre-flight thread pushes it. If two computers each hold commits the other lacks, that is a pre-flight item for the owner: don't pick one for them.
2. **Every task, on any computer, bases on it and merges into it with a plain push.** Launch with `workspaceStrategy: {type: "worktree", baseRef: "origin/lho/<run>", branch: "<task branch>", startFromOrigin: true}`. Its merge gate is: `git fetch origin`, `git rebase origin/lho/<run>`, the full validation, then `git push <remote> HEAD:refs/heads/lho/<run>`, never forced. A rejected push means the branch moved: fetch, rebase, validate and push again. When a task changes two repositories, it pushes the private one first. The default merge policy, where a task fast-forwards the integration checkout itself, works only for tasks on your computer, so the whole run uses the run branch instead.
3. **Verify merges in your own worktree of the run branch,** kept in the run directory (`git -C <checkout> worktree add <run directory>/integration lho/<run>`, on a local branch `lho/<run>` made from `origin/lho/<run>` if your computer didn't push it), not in the owner's checkout, which stays as it was until the finish; when the repository is the skills' own, your installed skills then don't change under you. On a wake that brings a report, `git fetch origin`, fast-forward that worktree, and check `git merge-base --is-ancestor <task head> origin/lho/<run>` ([integration.md](integration.md#verifying-a-merged-report)). Give that worktree as `repo` in `watch.json`.
4. **At the finish,** fast-forward each computer's local default branch to the run branch where its checkout is on that branch, clean, and behind it (your computer yourself; the other through its finish thread). A default branch that can't fast-forward stays as it is, and the report says so. Then remove your run-branch worktree (`git worktree remove`; it holds no work). Pushing the default branch, and deleting the run and briefs branches on the remote, stay the owner's: the report names each branch the run left there.

## 7. Launch and report-back

- **Launch** with `t3_thread_launch` as [host-t3.md](host-t3.md#launch-a-task) says, adding `environmentId` and that computer's `projectId`, and `modelSelection` from that computer's catalog. Record the task's computer in the ledger and in `watch.json`.
- **Report-back:** the brief's `t3_thread_send` carries your `environmentId` as well as your `threadId`, so the message crosses to your computer. The brief also tells the task to end with the report as its final message, whether the send worked or not: when the send can't reach you (your computer asleep, the link down), you still read the report with `t3_thread_read({environmentId, threadId})`. A failed send is retried a minute apart, three times at most.
- **Every other call about it** (`t3_thread_read`, `t3_thread_send`, `t3_thread_interrupt`, `t3_queue`, `t3_thread_organize`) takes its `environmentId` too.

## 8. Watching it

`scripts/run-watch` and `scripts/heartbeat` read processes and files on your computer only. Give each task elsewhere `"computer": "<its computer>"` in `watch.json`, and set the top-level `"computer"` to yours: `run-watch` then reads nothing of that task (its worktree path would be another folder here) and calls it `blind` once, saying where it runs, and the heartbeat names it on every wake, so a wake with a task elsewhere is never idle.

- **On every wake,** read each task elsewhere with `t3_thread_read({environmentId, threadId})`: its status, its last message, and `pendingRequestCount`. A running task with a pending request is waiting for approval: interrupt its turn and tell it how to finish without that command. A failed or interrupted thread is nudged as on your computer ([host-t3.md](host-t3.md#when-a-tasks-run-fails-or-is-cancelled)).
- **Not watched there:** password dialogs, free disk and swap, sleep, the keep-awake, and leftover processes; the usage sampler's machine samples are your computer's only. Each brief elsewhere therefore asks the task to name in its report any dialog it saw, and to check free disk before a heavy build. When a task elsewhere has shown no progress for an hour, or reports a dialog or a full disk, launch a short check thread there, as in section 3: the keep-awake's process ID, free disk, the system's password dialog ([machine.md](machine.md#7-during-the-run) gives the command), and processes naming the run directory or a task's worktree.
- **A merge elsewhere** doesn't show in `run-watch`'s `merged` lines, which read your computer's reflog: take its time from the report and the run branch's commit time after `git fetch`.

Watching another computer with scripts over the link is not built yet; until it is, the thread and the check threads are all you see there.

## 9. The ledger, the finish and the report

- **Ledger:** a "Computers" part beside "The computer": for each, its name, `environmentId`, label, platform, role, limit, keep-awake process ID, pre-flight findings and threads, and at the finish what was stopped and restored. Each task's row gives its `computer`.
- **Finish:** for each other computer, one short finish thread there, after your own finish steps 1 to 3: it stops the keep-awake by its recorded process ID, stops the run's leftover processes there against the pre-flight's snapshot, does the cleanup gate for the merged tasks of that computer ([integration.md](integration.md#cleanup-after-a-merge), with that computer's `prune-runs`), puts `KEEP` in the folders of unfinished tasks, fast-forwards the default branches (section 6, step 4), and reports free disk, the run directory's size there and what it couldn't do. Settle the threads there with their `environmentId`.
- **Report:** when tasks ran on more than one computer, each task names its computer; "Side effects" and the cleanup are given per computer; one line says what wasn't watched on the other computer; and "What needs you" lists the branches left on the remote and any default branch that couldn't fast-forward.
