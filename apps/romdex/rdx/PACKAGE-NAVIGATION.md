# Map Package Links and Progress

U22 adds these controls in source. Installed 0.5.15 awaits a later packaged release.

In ROMDex, select a task and find **Linked Map Packages** in Details. **Open Map** opens its exact NPCDex map; **View Package** opens the fixed version and its item/group progress. This works for queued new tasks too; the links retain their identity when YouTrack confirms the final task ID.

In NPCDex, choose **Tray 2 Settings → Map Package Delivery**. Each package offers **Open Map**, **Open Task in ROMDex**, and an external **Open Task in YouTrack** link once the task is published. **View Version and Item Progress** shows the source revision, exact JSON hash, selected entries, dependency groups and verified upload counts. **Open Target in NPCDex** selects the particular NPC/entity and dialogue point. A missing, archived or changed target requires review; the app does not guess from a similar name.

Links preserve the package's original selection and version. Newer drafts remain separate. Cross-document links checkpoint the current view before opening the managed map. Finish or cancel an active editor when prompted. Following a link never imports, publishes or dispatches work.

Delivery progress is **Staged**, **Attached**, or **Needs Review**. FINAL decisions, notes and flags remain **Context Only**. Implementation and human testing are separate facts: **Not Reported** and **Not Verified** until later authenticated reconciliation/testing features establish them. Task completion and portable-file claims do not prove those facts, and this view cannot mark a task complete.
