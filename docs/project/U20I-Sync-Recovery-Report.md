# U20I — Native Content Sync Recovery

**Status:** Complete in installed 0.5.14; U20I queue delivery and final remote/native checks passed. No U21 work started.

## Observed Problem

The installed 0.5.12 reader allowed 120 seconds for a full content-history cycle. An isolated read-only audit of the real NPCD history completed successfully in 122,416 ms with 884 requests and 14,508,419 response bytes. Network interruptions caught while checking individual publications were also being recorded as content-review findings. This could stall the durable queue even though the uploaded publications and content were valid. Automatic retry did recover on the observed run, but the timing margin was inadequate.

## Correction

0.5.13 gives a content cycle a bounded ten-minute window, within the existing maximum. Interrupted connections, timed-out/aborted requests and HTTP failures leave the accepted view intact and report a retryable connection failure. They do not manufacture publication conflicts. Existing request, transfer, cache, ownership, integrity, missing-history and conflict bounds remain enforced. Immutable operation identities, pending drafts and the approved native transition are retained.

## Verification

- 87 focused reader/editor/transport/catalog-storage tests passed, including interrupted published readback across restart, no duplicate uploads, preserved publication identity, timeout recovery, and genuine conflict/integrity protection.
- The earlier U20I full regression run passed 596 tests. Its unchanged native UI reviews remain applicable; this correction changes no layout or interaction controls.
- Final r2 passed exact package/source auditing (243 source files and one retained reference asset), 182 syntax checks and 17 bundled-runtime checks. The corrected live-history reader completed in 139,356 ms with 911 requests, 15,135,262 response bytes, no review findings and no production writes.
- Complete Data backup/restoration, credential preservation, installation, approved-transition delivery and final native/remote readback must pass before U20I is checked off.

No production data was overwritten or queue operations cancelled to bypass delivery. The isolated diagnostic wrote only its own cache copy.

## Packaging Checkpoint

**Recovery update:** Unique source from obsolete generated builds was backed up and verified in private GitHub commit `c60cbf9e6438206c109189e839cc1393e7db9a57`. The user deleted the collected build output, restoring sufficient disk space. Final candidate r2 built successfully and passed exact package/source auditing, 182 syntax checks and 17 packaged-runtime checks. Its live-history read is being verified before upgrade.

The final source correction passes all 87 focused tests. The first candidate was correctly rejected by the source audit because the final timeout classification correction landed after its copy was built. That candidate was never published or installed. Its replacement stopped during copying with `ENOSPC`; the C: drive had approximately 106 MB free. Superseded unpublished package folders have been identified for cleanup. Automatic approval review rejected deletion commands despite a narrowly granted folder permission, so the user has been asked to remove only those disposable build folders in File Explorer. Final packaging, publication and upgrade remain pending. The installed 0.5.12 application and its queue remain unchanged.

## Installed Correction

0.5.13 is published privately and installed. All 121 Data files (189,878,773 bytes) were preserved exactly during installation, and 318 application hashes were verified. All 51 prior operations, immutable objects, original draft and all three saved credentials remain intact; credentials unlock without entry. The initial installed snapshot still contained 27 pending operations and nine cached interruption warnings from 0.5.12. The corrected reader must refresh and drain these before final completion.

## Final Result

The final replacement package, bundled runtime, live-history read, complete Data backup/restoration, private publication, installation and credential checks passed. The user freed disk space after verified source backup and collection of obsolete build output. All prior queued edits and the approved transition are committed. See [Completion Report](U20I-Completion-Report.md).
