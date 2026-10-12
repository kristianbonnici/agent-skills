# The user's computer: permissions, staying awake, shared resources

A long run happens while the user is away, on the computer they use every day. Whatever needs them (a password, a click on Allow, a setting) is done before they leave. Whatever the run touches outside the repository is left as it was found.

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
| **Settings for the run** | The user changes them, or you, with their approval | Automatic screen lock off and Stage Manager off when any task or helper uses the real screen (Stage Manager hides windows from Codex's screen capture); Do Not Disturb on, so banners don't cover windows under test |

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
2. Make each remaining prompt appear on purpose, from the harness the tasks run under (in T3, from your own thread), so they all come at once and the user clicks Allow on each:

   ```sh
   osascript -e 'tell application "System Events" to get name of first process'   # Automation: System Events
   osascript -e 'tell application "Finder" to get name of startup disk'            # Automation: Finder
   osascript -e 'tell application "<app>" to get name'                             # Automation: each app the tasks script
   echo 'import ApplicationServices; print(AXIsProcessTrustedWithOptions(["AXTrustedCheckOptionPrompt": true] as CFDictionary))' | swift -   # Accessibility
   echo 'import CoreGraphics; print(CGRequestScreenCaptureAccess())' | swift -     # Screen Recording
   ```

   Some permissions can't be added from a prompt: Developer Tools, a permission that needs the app restarted, or one denied before (Automation then fails with error -1743). For those, the user switches it on in System Settings → Privacy & Security.
3. Run each check again and show the result, for example "7 of 7 granted". Record it in the ledger, and in the owner's profile under "Machine" with the date.
4. Start keeping the computer awake (section 4).

If the user doesn't wait for the warm-up, launch anyway. Tasks then skip what isn't granted and list it under "Couldn't check".

## 4. Keeping the computer awake

A sleeping computer stops every task. So, from the warm-up to the finish, keep it awake. On macOS:

```sh
caffeinate -i -d -t <seconds> &   # -i: no idle sleep; -d: keep the display on (needed when anything uses the screen)
```

- Use `-i` alone when no task or helper uses the real screen.
- Set `-t` to the run's estimate plus a few hours, record the process ID in the ledger, and start a new one if the run outlasts it.
- Stop it at the finish, or if the user stops the run.
- It keeps the computer awake, but a screen lock the user set still locks it, which is why "automatic screen lock off" is in the permissions list.
- Say in the contract that you will do this.

## 5. The user's own things

In the contract, list what belongs to the user and must be left as found: their running copy of the app, its settings and data, services it depends on, its link scheme and app identity, their other apps' windows, and their dev-server ports.

- **Snapshot at the start**, into the run directory. Adapt it to the project, for example:
  - the app's settings (`defaults export <domain> <file>` on macOS);
  - the list of files in `~/Library/Preferences`;
  - background services (`launchctl list`);
  - app copies registered with the system (on macOS, `"$LSREGISTER" -dump | grep '^path:'`, with `LSREGISTER=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister`, which isn't on the PATH);
  - free disk space.
- **Rules for the briefs:**
  - launch your own build by its path (on macOS, `open -a <path>`), because a link or app identifier can open another copy;
  - give your build its own settings, sockets and data folders;
  - close only windows you opened;
  - never send work to the user's live services.
- **At the finish, compare with the snapshot:**
  - restore changed settings;
  - delete leftover test files;
  - unregister builds whose worktrees were removed (on macOS, `"$LSREGISTER" -u <app>`);
  - list anything you couldn't restore under "Side effects" in the report.

In the 2026-10-12 run, a test build opened by a bare link spoke through the user's live speech service and wrote into their app's history. Tests also left about 5,700 settings files, and the user's sound volume set to zero.

## 6. Shared resources and disk

- **Leases.** Some resources only one or two tasks can use at a time: the real screen, the GPU, a hardware device, a single test account. Declare them in the contract, and let tasks take turns with `scripts/lease`. Copy it into `<run directory>/bin/` at the start and write `<run directory>/leases.json`, for example:

  ```json
  {"screen": {"slots": 1, "max_minutes": 15}, "gpu": {"slots": 2, "max_minutes": 30}}
  ```

  Briefs give tasks the command (`<run directory>/bin/lease acquire screen --owner <task ID>`). Turns are first come, first served, and a lease expires after its limit.
  - Tasks hold a lease only while using it.
  - Tasks prefer checks that need no lease; rendering a view to an image needs none.
  - A merged task never waits for the screen.

  In the 2026-10-12 run, tasks waited up to 69 minutes for the screen until leases were capped at 15 minutes.
- **Disk.** Check free space on every wake.
  - Tasks keep large files (profiler traces, recordings, downloads) in the run directory, delete what isn't evidence, and list downloads with sizes in the handoff.
  - In the 2026-10-12 run, 61 GB of profiler traces in the temporary folder took free space from 123 GB to 23 GB.
- **Downloads into shared caches** (model hubs, package caches): record each one in the ledger. At the finish, remove only what the run added and nothing else still uses.

## 7. During the run

- **A password dialog on the screen** means a task ran something that asks for one, and nobody will answer it. On macOS, `pgrep -x SecurityAgent` finds it. Find the command and stop it, tell the task, and note it for the report.
- **A permission dialog for something approved** may be answered Allow, by the task or a helper. Any other dialog is cancelled, and the task mentions it in its report-back.
- **Don't plan on a helper answering prompts mid-run.** The task usually doesn't know a dialog is there. The warm-up is the way to grant permissions.
