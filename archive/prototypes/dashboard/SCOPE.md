# Scope to agree before development

## Intended product

A dashboard with ClickUp-style organization and YouTrack as the source of truth for real tasks. The interface should retain NPCDex’s visual theme and be usable without knowing how to code.

## Decisions pending

1. Organization first, personal dashboard first, or both?
2. Pokémon project first, or multiple projects?
3. Sample data, live read-only data, or live editing for the first version?
4. Which hierarchy levels are necessary: spaces, folders, lists, tasks, subtasks?
5. Which features come first: custom fields, priorities, saved views, comments, documents, dependencies, calendar, or time tracking?

## Proposed mapping, subject to agreement

| Dashboard concept | Proposed YouTrack representation |
| --- | --- |
| Task | Issue |
| Status, priority, assignee | Existing project custom fields |
| Project | YouTrack project |
| List | Saved issue query, or a chosen grouping field |
| Folder / space | Dashboard navigation configuration grouping projects and lists |
| Subtask | Issue relationship |

Spaces, folders, and lists are interface concepts here. Their final mapping must be checked against the actual YouTrack project schema before implementation; creating redundant task records should be avoided.

## Connection architecture

Keep the frontend plain HTML/CSS/JS. Place YouTrack access behind a separate adapter. A hosted app should use a small server component to hold credentials and enforce user permissions; credentials should not be shipped in frontend files. The currently connected YouTrack chat tools do not automatically give a standalone browser page API access.

Live integration remains unimplemented until the scope and connection method are settled. No credentials are needed for this local prototype.
