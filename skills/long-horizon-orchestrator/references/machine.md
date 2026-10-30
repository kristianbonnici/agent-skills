# The user's computer: permissions, staying awake, shared resources

A long run happens on the computer the user uses every day, while they are away or, in an evening run, sometimes still at it. Whatever needs them (a password, a click on Allow, a setting) is done before they leave. Whatever the run touches outside the repository is left as it was found.

In the 2026-10-12 run, this went wrong in several ways:
- a task's check of the login items put seven password prompts on the screen, and the user had to turn on Developer mode in the middle of the night;
- a task answered "Don't Allow" to "T3 Code wants to control Finder", because nothing told it the permission was wanted;
- a package download put a keychain prompt on the screen;
- tasks were allowed to hand any prompt to Codex computer use, and none did: a task whose command waits on a dialog sees only a hang, not the dialog.

The commands below are for macOS, where these runs happen. On another system, apply the same steps with its own tools.

## 1. What can't happen unattended

Anything that asks for a password or Touch ID. Agents never type one, and helpers never do either. On macOS that includes:
- `sudo` and anything run through it, `sfltool`, `DevToolsSecurity`, `tccutil reset`, `systemsetup`, `pmset` changes, `softwareupdate`, `.pkg` installers, and user changes with `dscl` or `sysadminctl`;
- creating or reading keychain items (`security add-…`, `security find-… -w`), and tools that store credentials there;
- System Settings panes behind the lock.

Each of these is either done in the warm-up while the user is there, or the task skips it and lists it under "Couldn't check". Never give agents standing `sudo` (a `NOPASSWD` rule in sudoers): doing the admin steps once in the warm-up gets the same result with far less risk.

## 2. Build the permissions list

Work out what the tasks need, then add what the kind of project usually needs. Be generous: the user prefers granting too much to finding a prompt in the morning. List only what's missing, after reading the current state.

| Kind | How it's granted | Typical items |
|---|---|---|
| **Admin commands** | The user pastes one block into Terminal | Developer mode (`sudo DevToolsSecurity -enable`), so profilers and debuggers run without prompts; toolchain licenses and first-launch steps (`sudo xcodebuild -license accept`, `xcodebuild -runFirstLaunch`); toolchain components and tools the tasks will install |
| **Privacy permissions for the harness app** | Prompts in the warm-up, or System Settings → Privacy & Security | Accessibility, Screen Recording, Developer Tools, Automation of System Events, Finder and each app the tasks script; Full Disk Access if tasks read protected folders |
| **The computer-use helper** (Codex) | The same, if it is listed separately | Accessibility, Screen Recording |
| **The app the tasks build or test** | Prompts in the warm-up | Whatever it asks for: Accessibility, Microphone, Camera, Speech Recognition, Automation… Test builds must keep one signing identity, or every build asks again. |
| **Credentials** | Resolve dependencies once, before launch | Run the project's install or resolve step in the integration checkout (`npm ci`, `uv sync`, `swift package resolve`…), so worktrees find packages cached. A keychain prompt then gets "Always Allow". Tasks never create keychain items: test keys and secrets live in files in the run directory. |
| **Settings for the run** | The user changes them, or you, with their approval | Automatic screen lock off and Stage Manager off when any task or helper uses the real screen (Stage Manager hides windows from Codex's screen capture), and in an evening run the screen saver's password too, or both set well after the time the screen waits for the user to be away ([section 6](#6-shared-resources-and-disk)); Do Not Disturb on, so banners don't cover windows under test |

Under T3, every command a task runs is a child of T3 Code. macOS asks on T3 Code's behalf ("T3 Code wants to control Finder"), and the permission belongs to T3 Code. Under plain Claude Code or Codex, it belongs to the terminal or app they run in.

Read the current state first. These commands only read:

```sh
DevToolsSecurity -status                                     # want "Developer mode is currently enabled."
sysadminctl -screenLock status 2>&1 | tail -1                # want "screenLock is off"
defaults read com.apple.WindowManager GloballyEnabled 2>&1   # Stage Manager: want 0, or "does not exist"
pmset -g | grep -E '^ *(sleep|displaysleep) '                # system and display sleep, in minutes (0 = never)
```

The owner's profile ([routing.md](routing.md#6-the-owners-profile)) lists what earlier runs granted on this computer, so ask only for what's new.

## 3. The warm-up

Right after approval, while the user is still at the computer (about five minutes):

1. Give the user the admin block to paste into Terminal, if there is one.
2. Make each remaining prompt appear on purpose, from the harness the tasks run under (in T3, from your own thread), so they all come at once and the user clicks Allow on each. Each command waits until its prompt is answered, so never run one in the foreground: start each in the background with its output in a file in the run directory (`… > <run directory>/warmup/<name>.txt 2>&1 &`, recording its process ID), then read the files after a minute. One still running is a prompt nobody has answered: stop it by its process ID and count that permission as missing.

   ```sh
   osascript -e 'tell application "System Events" to get name of first process'   # Automation: System Events
   osascript -e 'tell application "Finder" to get name of startup disk'            # Automation: Finder
   osascript -e 'tell application "<app>" to get name'                             # Automation: each app the tasks script
   echo 'import ApplicationServices; print(AXIsProcessTrustedWithOptions(["AXTrustedCheckOptionPrompt": true] as CFDictionary))' | swift -   # Accessibility
   echo 'import CoreGraphics; print(CGRequestScreenCaptureAccess())' | swift -     # Screen Recording
   ```

   Some permissions can't be added from a prompt: Developer Tools, a permission that needs the app restarted, or one denied before (Automation then fails with error -1743). For those, the user switches it on in System Settings → Privacy & Security.
3. Run each check again and show the result, for example "7 of 7 granted". Record it in the ledger, and in the owner's profile under this computer's "Machine" section with the date.
4. Start keeping the computer awake (section 4).

If the user doesn't wait for the warm-up, launch anyway: the one-off wake you scheduled before posting the admin block (the skill's Prepare step) brings you back about 10 minutes later if nobody answers. Tasks then skip what isn't granted and list it under "Couldn't check".

## 4. Keeping the computer awake

A sleeping computer stops every task. So, from the warm-up to the finish, keep it awake. On macOS:

```sh
nohup caffeinate -i -d -t <seconds> >/dev/null 2>&1 &   # -i: no idle sleep; -d: keep the display on (needed when anything uses the screen)
```

- Confirm it runs (`ps -p <pid>`) and record its process ID.
- Use `-i -d` from the warm-up for as long as any task still to run may use the real screen, and `-i` alone once none will, counting reserve tasks and relaunches as tasks still to run: a display kept awake while no screen work is left keeps the window server drawing for nothing (on 2026-10-22, a `-d` kept all day while every task rested made the user's Mac run warm). Never let the display sleep while screen work remains, and don't hand that to the tasks: when the display sleeps, macOS may lock the session even when the screen-lock setting reads off, and a task that wants the screen later finds it locked, with nobody to type the password. On 2026-10-23, a run started with `-i` alone, the display slept after 10 idle minutes (`pmset -g`: `displaysleep 10`), and the screen locked 10 minutes into the run although `sysadminctl -screenLock status` said off; the screen task found it locked and blocked.
- Set `-t` to the run's estimate plus a few hours, record the process ID in the ledger, and start a new one if the run outlasts it.
- Stop it at the finish, or if the user stops the run.
- It keeps the computer awake, but a screen lock the user set still locks it, which is why "automatic screen lock off" is in the permissions list.
- In a run that starts while the user is at the computer, `-d` matters most once they leave: a screen that waits for them to be away ([section 6](#6-shared-resources-and-disk)) is wanted exactly when nobody touches the computer, which is when the display would otherwise sleep and lock.
- Say in the contract that you will do this.

## 5. The user's own things

In the contract, list what belongs to the user and must be left as found: their running copy of the app, its settings and data, services it depends on, its link scheme and app identity, their other apps' windows, and their dev-server ports.

- **Snapshot at the start**, into the run directory. Adapt it to the project, for example:
  - the app's settings (on macOS, `defaults export <domain> <file>` for restoring with `defaults import`, and `defaults export <domain> - > <file>.xml` for comparing: a file export is binary);
  - the list of files in `~/Library/Preferences`;
  - background services (`launchctl list`);
  - the settings the run itself turns off or on: automatic screen lock (`sysadminctl -screenLock status`), Stage Manager (`defaults read com.apple.WindowManager GloballyEnabled`), and a Focus the user set for the run;
  - app copies registered with the system (on macOS, `"$LSREGISTER" -dump | grep '^path:'`, with `LSREGISTER=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister`, which isn't on the PATH);
  - free disk space.
- **Rules for the briefs:**
  - launch your own build by its path (on macOS, `open -a <path>`), because a link or app identifier can open another copy;
  - give your build its own settings, sockets and data folders;
  - prefer launch arguments to writing the user's settings; when a step writes one anyway (a settings window that remembers its last page, a first-run window), read the value first and put it back right after;
  - close only windows you opened;
  - stop only processes you started, by the process ID you recorded, never with `pkill`, `killall` or a name or pattern, which can match another task's build or the user's own app;
  - never press global keyboard shortcuts, and never operate the user's own running copy of the app: use only builds and windows you launched;
  - never send work to the user's live services.
- **System registries** (on macOS, LaunchServices, login items, launchd): when unregistering builds or removing entries, match exact paths or bundle identifiers, never a substring, and look at every match before changing anything. If a wrong entry was changed, restore it at once (`"$LSREGISTER" -f <app>` re-registers an app) and note it for the report.
- **Sandbox containers** (`~/Library/Containers/<test build's identifier>`): don't delete them during the run. macOS asks for the user's password before removing an app's container, and nobody is there to answer. Leave them, and list them under "Side effects" as safe to delete.
- **At the finish, compare with the snapshot:**
  - restore changed settings;
  - delete leftover test files;
  - unregister builds whose worktrees were removed (on macOS, `"$LSREGISTER" -u <app>`);
  - turn back on what the run turned off, where no password is needed (Stage Manager, with `defaults write`); a setting only the user can restore (automatic screen lock needs their password) goes in the report's "Side effects" with how to turn it back on;
  - list anything you couldn't restore under "Side effects" in the report.

In the 2026-10-12 run, a test build opened by a bare link spoke through the user's live speech service and wrote into their app's history. Tests also left about 5,700 settings files, and the user's sound volume set to zero. In the 2026-10-14 run:
- one task's `pkill -f` stopped two other tasks' builds, and a `pkill -x` quit one of the user's own apps;
- a cleanup's `grep -i atest` over the registered apps also matched another app's `UpdATESTaging` folder and unregistered it;
- deleting test containers in Finder put password dialogs on the screen.

## 6. Shared resources and disk

- **Leases.** Some resources only one or two tasks can use at a time: the real screen, the GPU, a hardware device, a single test account, and the processor's capacity for builds and heavy test suites (a `cpu` lease, with about one slot for every two performance cores, so timing checks aren't failed by contention). Declare them in the contract, and let tasks take turns with `scripts/lease`. Copy it into `<run directory>/bin/` at the start and write `<run directory>/leases.json` (when another run shares the computer, use one lease folder for both instead, below), for example:

  ```json
  {"screen": {"slots": 1, "max_minutes": 15, "wait_minutes": 45}, "gpu": {"slots": 2, "max_minutes": 30, "wait_minutes": 60}, "cpu": {"slots": 5, "max_minutes": 45, "wait_minutes": 150}}
  ```

  Briefs give tasks the command (`<run directory>/bin/lease acquire screen --owner <task ID>`). Turns are first come, first served, and a lease expires after its limit.
  - Tasks hold a lease only while using it.
  - **A turn is bounded.** Renewing (acquiring again with the same owner) is only for finishing the same check. While others wait, a holder's turn lasts at most `turn_minutes` (by default the resource's `max_minutes`), counted from when the first of them began waiting. A renewal after that, or one that would leave less than a minute, releases the lease and exits 76, and the task queues again behind the others. A holder that doesn't renew keeps its lease until it expires, at most `max_minutes` after its last acquire, so a waiter waits at most about `turn_minutes` plus `max_minutes` for each holder ahead of it. Set `turn_minutes` above the longest single check.
  - **A wait is bounded too.** A task waits at most `wait_minutes` for a turn (exit 75), then lists the check under "Couldn't check" and goes on. Size it for the queue you expect: about the number of tasks that may wait at once times `turn_minutes`. Too short, and everyone behind the first waiter skips their check.
  - **When the user may be at the computer** (an evening run, or one they don't leave at once), the contract says so, and the screen waits until they are away: give it `"needs_owner_away_seconds": 300` in `leases.json`. The first waiter in line then gets the screen only once it is unlocked and nobody has touched the keyboard, mouse or trackpad for that long (on macOS, `HIDIdleTime` read with `ioreg`; a state that can't be read counts as not away; on other systems the script refuses a resource with the key, so leave it out and keep screen work for when the user is gone). The queue keeps its order, and the wait counts toward `wait_minutes`. The requirement lives in `leases.json`, not in each command, so a task that takes the lease can't skip the wait, and a run sharing the lease folder gets it too. Copy the current `scripts/lease` into a shared folder's `bin/` before adding the key: an older copy ignores it and has no `check`.
    - Everything that touches the real screen or the speakers waits for that lease: moving the pointer, posting events, recording or capturing the screen, opening windows on it, and sound out loud (a real voice, a recording's audio). Until then, tasks use what needs no lease, and silent test engines.
    - Only the first acquire waits for the user: a renewal, and a `lease run` command once started, don't look again. So during its turn the holder runs `lease check screen --owner <task ID>` between steps, at a point where it has posted no events of its own for `owner_back_seconds` (default 30), since any input counts. Exit 0 means go on. Anything else means stop at the next safe point, quit what is showing, release, and acquire again later: 1 the user is back, 2 the screen is locked (or its state can't be read), 3 the lease is no longer the task's, 64 a mistake in the command. Use `lease run` on such a screen only for a command of a minute or two.
    - The user's automatic screen lock, and a screen saver that asks for the password, must be off or start well after `needs_owner_away_seconds`; otherwise the screen locks before the user counts as away, and every wait ends "the screen is locked". The contract asks for it with the other settings for the run (section 2).
    - Size the screen's `wait_minutes` for when the user is likely to leave. A task that gets no turn within it merges on its other checks and lists the screen check under "Couldn't check", with the exact scene to run, for a later task to record once the user is gone.
  - Tasks prefer checks that need no lease; rendering a view to an image needs none.
  - A merged task never waits for a lease. Its own leases are released only once its processes have stopped ([integration.md](integration.md#cleanup-after-a-merge)).
  - When another orchestrator runs on the same computer, both use one lease folder ([routing.md](routing.md#running-beside-another-orchestrator)).

  In the 2026-10-12 run, tasks waited up to 69 minutes for the screen until leases were capped at 15 minutes. On 2026-10-15, one task kept renewing the screen for over an hour while seven waited, so most of their screen checks were skipped; the turn limit is there to stop that. On 2026-10-19, a check's drags landed in the window the user was working in, and their own mouse spoiled the check. On 2026-10-24 and 2026-10-26, evening runs found the user at the computer when tasks wanted the screen; the 2026-10-26 run added an idle check to its briefs by hand, which `needs_owner_away_seconds` and `lease check` replace.
- **Disk.** Check free space on every wake.
  - Tasks keep large files (profiler traces, recordings, downloads) in the run directory, delete what isn't evidence, and list downloads with sizes in the handoff.
  - In the 2026-10-12 run, 61 GB of profiler traces in the temporary folder took free space from 123 GB to 23 GB.
- **Downloads into shared caches** (model hubs, package caches): record each one in the ledger. At the finish, remove only what the run added and nothing else still uses.

## 7. During the run

On every wake:

- **The user's settings:** compare them with the start snapshot, which takes a second (on macOS, `defaults export <domain> - | diff <snapshot>.xml -`). Restore what a test build changed at once, key by key (`defaults write` or `defaults delete` of that key; importing the whole snapshot would also undo what the user's own copy wrote since), note it, and tell the task that did it, so it changes how it runs the step. Keys the user's own running copy writes in normal use are its own state: note them, and leave them. In four runs between 2026-10-13 and 2026-10-15, test builds sharing the user's settings cleared a chosen model, and wrote first-run state and a window's last page.
- **Processes:** stop a stray process only by its process ID, after checking with `ps -p <pid> -o command=` that it is the run's.
- **A password dialog on the screen** means a task ran something that asks for one, and nobody will answer it. On macOS, `pgrep -x SecurityAgent` finds it. Find the command and stop it, tell the task, and note it for the report.
- **A permission dialog for something approved** may be answered Allow, by the task or a helper. Any other dialog is cancelled, and the task mentions it in its report-back.
- **Don't plan on a helper answering prompts mid-run.** The task usually doesn't know a dialog is there. The warm-up is the way to grant permissions.

## 8. Leftover processes

Much of what tasks start outlives the task: computer-use services, test builds, the kit's browsers and app copies, log watchers, monitors. Each keeps using the processor, the screen or memory long after its work ended, and the user finds a warm, busy Mac. In the 2026-10-22 run:
- Codex Computer Use's background service (`SkyComputerUseService`, started by the ChatGPT app for a computer-use step) used 17–26% CPU for two days, keeping a screen capture going, long after the run that needed it;
- a task left `tail -F` on its log, and another a measurement monitor;
- a task paused on its usage limit left its test build running with the reading orb's auto-click on, which would have read the user's own selections.

So:
- **At the start,** snapshot the processes into the run directory (`ps -axo pid,lstart,command > <run directory>/owner/processes.txt`), so leftovers can be told from the user's own.
- **After each merge and on every wake,** look for processes started since the run began that belong to it: command lines naming the run directory or a task's worktree, test builds, the kit's browsers and apps, log watchers, and the computer-use helpers of the providers the run used (Codex: `~/.codex/computer-use/Codex Computer Use.app`'s `SkyComputerUseService` and the ChatGPT app's `cua_node` processes, whose working folder is a task's worktree). Stop each by its process ID once no running task uses it; a computer-use service starts again when the next step needs it. One already running before the run started is the user's: leave it, and name it in the report if it runs hot.
- **A task that pauses** (a usage window, a long lease wait) quits its test builds and helpers first; stop a paused task's leftovers yourself, by process ID, when it didn't.
- **At the finish,** compare with the start snapshot, stop every leftover of the run by process ID, and list in the report's "Side effects" what you stopped, and anything of the user's that used the processor heavily for hours, so they can decide.

## 9. The usage sampler

The final report shows how the run used its resources: the percent left of each subscription's weekly window (Copilot's monthly one, and a model's own limit such as Gemini 4 Argon's), and the Mac's processor, graphics, memory and free disk, over the run's own time axis. `scripts/usage-sampler` collects the numbers while the run goes on, and costs no model tokens: the Mac every 30 seconds from `ps`, `vm_stat`, `ioreg` and the disk; the subscriptions every 5 minutes from what the harnesses wrote to their own logs (`provider-usage --cached`), and every hour a live reading (`provider-usage`, which spends no quota). Measured on 2026-10-29: a Mac sample 0.06 s of processor time, a cached reading 0.09 s, a live reading 22 s (it starts `claude`, `codex` and `agy`), so about 30 s an hour in all (under 1% of one core), three quarters of it the hourly live reading.

- **Start it in Prepare, once:** `scripts/usage-sampler <run directory>/usage > /dev/null 2>&1 &`, then record `$!` in the ledger and in `<run directory>/usage/sampler.pid`. It finds `provider-usage` beside itself. A second sampler on the same folder exits at once (code 3), so a restart that forgot to stop the first one does no harm.
- **Stop it at the finish** with `kill <pid>` (SIGTERM), by the recorded process ID like everything else you started. It ends within a moment, stopping any reading in progress, and writes its CPU time to `usage/sampler.log`.
- **If it dies,** start it again on the same folder: the files are appended to, and the graphs show a gap.
- **The folder holds only numbers and times** (`machine.jsonl`, `providers.jsonl`, `sampler.log`). `scripts/run-charts` reads it when the facts file names it, and a run without the folder draws what it always drew.
- When another run uses the same subscriptions, the windows' numbers are shared totals, not this run's: say so under the graph ([final-report.md](final-report.md#usage-graphs)).
