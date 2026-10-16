# U13A — Application-Folder Saves

During the authorized U13A task on October 15, 2026, the user clarified that active saves must live inside the application's folder. The user then explicitly selected **Leave Data in the Application Folder** on uninstall. This supersedes the earlier U02/U12 external-data location for future builds; U12's preserved source is not deleted.

The installer is therefore revised to a **per-user Forge/WiX MSI**. Squirrel's standard full-root uninstall is unsuitable for this requirement. The pinned MSI generator's own recursive root purge is also removed and checked before building. The installer owns its program files and shortcuts; it does not own any files under Data. Full Windows Installer validation and actual lifecycle checks are required before release.

```text
%LOCALAPPDATA%\ROMDexDesktop\
  ROMDex.exe                  Installed launcher
  .installInfo.json           Installed-version identity
  app-0.5.1\                  Replaceable application/runtime
  Data\
    thegobindsingh-PMON\      Saves, metadata, queues, files, protected connection
    Runtime\                  Retained desktop session/cache
```

The existing AppData profile is copied into Data only after the earlier application has quit, source ownership is acquired, all bytes/credential protection are verified, and the user reviews the preview. The original remains as recovery material. A valid existing Data profile wins on subsequent launches and reinstalls; missing/corrupt established saves stop for recovery.

Uninstall removes installed application files/shortcuts and leaves Data. Reinstall reuses it. Current-data/cloud synchronization, updater downloads and signing remain unchanged in scope: NPCDex cloud is U14–U19, approved update delivery is U13B, and private builds remain unsigned. Installers are kept local/private during U13A.

The first lifecycle verification uses a disposable installation under the task workspace with an isolated fixture profile, paused pending work, file bytes and a synthetic Windows-protected credential. It must not touch the live profile. Adoption of current user data occurs only after those checks pass, through the concrete native review.

Reference: [Forge MSI maker](https://www.electronforge.io/config/makers/wix-msi). The actual pinned generator template is inspected and tested; stock defaults are not assumed to preserve Data.
