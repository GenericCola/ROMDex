# ROMDex — Application Updates

Open **Check for Updates** from ROMDex's Windows tray menu. When a release is available, review its version and notes, then choose **Update Now** to download it. Downloaded installers are checked against the release signature, exact byte size and SHA-256. Choose **Install and Restart** when ready; finish or cancel open edit forms first. **Later** leaves the current version running. **Cancel Download** stops an active transfer.

Automatic checks run at launch and at most daily. They fetch only signed metadata; no installer downloads or installs without your approval. Update checks are separate from project Auto-Sync and do not change its indicator lights. Close keeps ROMDex in the tray; Quit exits normally.

Private installers are hosted at **GenericCola/ROMDex** on GitHub. In **Private Download Access**, enter a fine-grained token limited to this repository with **Contents: Read**. ROMDex protects it with Windows encryption. Publishing uses separate Windows Git authentication; the private release-signing key stays outside the application, Data and repository. No Actions workflow, paid service or public distribution is enabled.

If online delivery is unavailable, choose **Choose Signed Manual Update** and select the signed release JSON and matching MSI. A missing/untrusted signature, older release or incompatible save schema is rejected. Manual file selection prepares the verified installer; installation still requires confirmation.

Before installing, ROMDex checkpoints local edits, NPCDex saves, pending operations and files; pauses its data service; verifies the installer again; then uses an independent Windows helper. The helper waits until the app and save service close before invoking MSI. Data remains inside the application folder and is retained. The app reopens after setup. Failed/cancelled installation retains local work and reports the result for review; it never automatically retries installation.

Update records, verified installers and checkpoint copies live under **Data/thegobindsingh-PMON/updates**. Back up the **whole Data folder**, including **Data/Runtime**, because Windows-protected remembered credentials depend on its encryption state. Do not delete pending operations or restore older seed data to recover an update. If Windows cannot complete installation, retain Data and use the previous verified installer only after checking version/schema compatibility.

Private test installers remain unsigned for Windows publisher identification. The application's pinned release-signature verification is separate from Windows code signing. NPCDex cloud persistence remains a later phase.
