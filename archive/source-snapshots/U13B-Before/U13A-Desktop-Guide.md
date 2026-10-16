# ROMDex — Private Windows Installer

Install the private Windows x64 MSI, then open **ROMDex** from the Start Menu. No separate Chrome or Node installation is required. This private test build is unsigned, as approved. Application updates remain manual until U13B; Auto-Sync controls project data only.

ROMDex installs for your Windows account under **%LOCALAPPDATA%\ROMDexDesktop**. Its root ROMDex.exe launcher selects the installed program version. **Data\thegobindsingh-PMON** contains current saves, pending work, queued files, recovery records and the Windows-protected remembered connection. **Data\Runtime** contains the desktop session/cache. Both remain inside the application folder.

Before the first installed launch, finish/cancel open forms and choose **Quit ROMDex** from the older desktop's tray menu. The new app previews a verified copy of your established U12 saves into Data and preserves the original. It does not substitute the packaged baseline. Existing Data is never replaced by an old copy during reinstall.

Quit ROMDex before installing another version or uninstalling. Updates replace program files while leaving Data in place. Uninstall removes the installed program/shortcuts and **retains Data in the application folder**. Reinstall uses that retained Data, including its protected connection. To remove saves permanently, that would be a separate, explicit action; the uninstaller does not offer or perform it.

Close hides the app to its Windows tray; Quit checkpoints local work and exits. Offline/paused work stays local. A remembered token works on the same Windows account; copying the folder to another account/computer does not grant the connection.

Keep the original U12 copy and protected backups until the new installation is verified. If a save is missing or corrupt, stop and review recovery; an older packaged baseline must never silently replace it. Do not launch the preserved old build as though it contains newer installed-app edits.

**NPCDex remains local-only.** Its cloud persistence is U14–U19. No release feed, automatic installer download, cloud project, billing, public upload or signing purchase is introduced by this installer.
