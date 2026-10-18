# U20I — Native Content Sync Recovery

**Status:** Correction under verification; U20I remains open. No U21 work started.

## Observed Problem

The installed 0.5.12 reader allowed 120 seconds for a full content-history cycle. An isolated read-only audit of the real NPCD history completed successfully in 122,416 ms with 884 requests and 14,508,419 response bytes. Network interruptions caught while checking individual publications were also being recorded as content-review findings. This could stall the durable queue even though the uploaded publications and content were valid. Automatic retry did recover on the observed run, but the timing margin was inadequate.

## Correction

0.5.13 gives a content cycle a bounded ten-minute window, within the existing maximum. Interrupted connections, timed-out/aborted requests and HTTP failures leave the accepted view intact and report a retryable connection failure. They do not manufacture publication conflicts. Existing request, transfer, cache, ownership, integrity, missing-history and conflict bounds remain enforced. Immutable operation identities, pending drafts and the approved native transition are retained.

## Verification

- 87 focused reader/editor/transport/catalog-storage tests passed, including interrupted published readback across restart, no duplicate uploads, preserved publication identity, timeout recovery, and genuine conflict/integrity protection.
- The earlier U20I full regression run passed 596 tests. Its unchanged native UI reviews remain applicable; this correction changes no layout or interaction controls.
- Package/source audit, bundled-runtime checks and fresh read-only live-history verification are pending for the final candidate.
- Complete Data backup/restoration, credential preservation, installation, approved-transition delivery and final native/remote readback must pass before U20I is checked off.

No production data was overwritten or queue operations cancelled to bypass delivery. The isolated diagnostic wrote only its own cache copy.

## Packaging Checkpoint

The final source correction passes all 87 focused tests. The first candidate was correctly rejected by the source audit because the final timeout classification correction landed after its copy was built. That candidate was never published or installed. Its replacement stopped during copying with `ENOSPC`; the C: drive had approximately 106 MB free. Superseded unpublished package folders have been identified for cleanup. Automatic approval review rejected deletion commands despite a narrowly granted folder permission, so the user has been asked to remove only those disposable build folders in File Explorer. Final packaging, publication and upgrade remain pending. The installed 0.5.12 application and its queue remain unchanged.
