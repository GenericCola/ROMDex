# U13B — Update Notifications and Installation

Authorized by PASSKEY October 15, 2026. Recommended **Sol / High**. Resume after the user's reasoning-level pause. One task at a time; U14 cloud provisioning remains separate.

- [ ] Preserve the verified 0.5.2 source, installer and save boundaries; finalize the release trust and consent contract.
- [ ] Implement signed release validation, approved private-provider reads and streamed download verification. Keep hosting unavailable until a private route is configured and proven.
- [ ] Add tray update commands and non-interrupting notices; require approval before download and installation. Update failures must remain separate from data-sync indicators.
- [ ] Implement durable checkpoint, installer handoff, restart/cancellation recovery and compatibility checks; retain Data and pending work.
- [ ] Run targeted security/failure tests, full regression tests and isolated Windows installer/update checks.
- [ ] Verify the delivered build, current-data/credential preservation and normal restart; document hosting status and recovery.
- [ ] Check off U13B only after its approved acceptance gates pass; report and stop before U14, naming its recommended model/effort.

## Hosting State

The current YouTrack account's menu does not expose Server Settings; the read-only upload-setting request returned HTTP 404. The actual upload limit and remaining storage are unverified. No global settings will be changed. The approved fallback is private GitHub Releases; account availability has been requested. Nothing has been provisioned or uploaded.

## Implementation Contract

Checks may run at launch and at most once per day, plus a manual tray command. Checks fetch only bounded signed metadata. Download requires explicit Update Now approval; installation requires a successful local checkpoint and an explicit install/restart action. Feed errors do not affect shared Save/Auto-Sync health. Signed metadata binds application, channel, Windows x64 platform, stable increasing version, expiry, exact installer byte size/hash and provider artifact identity. Publishing keys remain outside application code, Data and cloud storage, protected to the publisher's Windows account. Missing trust/provider configuration shows Unavailable and retains an authenticated manual-install route.
