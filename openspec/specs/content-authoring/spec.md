# Content Authoring Specification

## Purpose

The admin (the parent) builds the practice content: workbook PDF sources,
tasks typed from them with answer parts, hints, translations and images,
and missions that group published tasks. Every task keeps a link to where it
came from. The admin can try answers against a task before the child ever
sees it. All of this sits behind admin authentication (see admin-access).
The admin UI is English.

## Requirements

### Requirement: PDF sources

The admin SHALL be able to upload a PDF as a **source** with title,
publisher, edition, grade and subject (FR-1). Title, grade and subject SHALL
be required. Uploads SHALL be limited to PDF files of at most 50 MB
(NFR-17). Source files SHALL be stored on the local storage volume, never in
a repository (NFR-4).

#### Scenario: Upload a source

- **GIVEN** the admin is signed in
- **WHEN** they upload a 12 MB PDF with title, publisher, edition, grade `6` and subject `math`
- **THEN** the source appears in the source list with that metadata and its page count

#### Scenario: Missing required metadata

- **WHEN** the admin uploads a PDF without a title
- **THEN** the upload is refused with a message naming the missing field and no source is created

#### Scenario: Wrong type or too large

- **WHEN** the admin uploads a `.docx` file, or a PDF larger than 50 MB
- **THEN** the upload is refused with a message stating the allowed type and size, and no source is created

### Requirement: PDF viewer beside the editor

The admin SHALL be able to view an uploaded source page by page next to the
task editor and jump to a page by number (FR-2).

#### Scenario: Jump to a page

- **GIVEN** a source with 120 pages is open beside the task editor
- **WHEN** the admin enters page `57`
- **THEN** page 57 is shown while the task form keeps its current content

#### Scenario: Page out of range

- **WHEN** the admin enters page `130` for a 120-page source
- **THEN** the viewer stays on the current page and shows the valid range `1–120`

### Requirement: Task creation with source reference

The admin SHALL be able to create a task with Czech prompt text, topic,
grade, difficulty from 1 to 3, and a source reference made of source, page,
task number and an optional sub-part (FR-3). Prompt, topic, grade,
difficulty, source, page and task number SHALL be required. New tasks start
as `DRAFT`. The source and page fields SHALL stay filled in from the
previous task so consecutive tasks from one page need no re-entry (NFR-8).

#### Scenario: Create a task

- **WHEN** the admin saves a task with a prompt, topic `desetinná čísla`, grade 6, difficulty 2, source, page 57 and task number `4`, sub-part `b`
- **THEN** the task is stored as `DRAFT` with that source reference

#### Scenario: Sticky source and page

- **GIVEN** the admin just saved a task with a source on page 57
- **WHEN** they start the next task
- **THEN** the source and page 57 are already filled in

#### Scenario: Invalid difficulty or missing reference

- **WHEN** the admin saves a task with difficulty `4`, or without a page number
- **THEN** the save is refused with a message on the invalid field

### Requirement: Task images

The admin SHALL be able to attach zero or more ordered PNG or JPG images to a
task, cropped outside the app; the child sees them with the task (FR-4). Each
image SHALL be at most 5 MB (NFR-17).

#### Scenario: Attach and order images

- **WHEN** the admin attaches two PNG images and moves the second one first
- **THEN** the task preview shows both images in the new order

#### Scenario: Rejected image

- **WHEN** the admin attaches a GIF, or a JPG larger than 5 MB
- **THEN** the image is refused with a message stating the allowed types and size

### Requirement: Answer modality

Every task SHALL have the answer modality `TEXT` or `GRAPHIC` (FR-5). A
`GRAPHIC` task (construction, drawing, colouring) SHALL be storable but SHALL
never be served to the child in MVP.

#### Scenario: Graphic task is stored but not served

- **GIVEN** a `GRAPHIC` task
- **WHEN** the admin saves it
- **THEN** it is stored, and it never appears in any mission the child can open

### Requirement: Answer parts

A task SHALL have one or more answer parts, each with a label (for example
`a`, `b`, `c`) and its own answer spec using one of the types INTEGER,
DECIMAL, FRACTION, NUMBER_WITH_UNIT, CHOICE_SINGLE, CHOICE_MULTI, TEXT
(FR-6). The rules applied to each type are defined by the answer-checking
capability. A `TEXT`-modality task SHALL NOT be publishable without at least
one part.

#### Scenario: Multi-part task

- **WHEN** the admin adds parts `a` (INTEGER) and `b` (NUMBER_WITH_UNIT, unit `cm²`, unit required)
- **THEN** the task stores both parts in that order with their specs

#### Scenario: Duplicate part labels

- **WHEN** the admin gives two parts of one task the label `a`
- **THEN** the save is refused with a message on the duplicate label

### Requirement: Hints

The admin SHALL be able to add zero or more ordered hints to a task and
reorder them (FR-7). A task without hints SHALL work normally everywhere.

#### Scenario: Ordered hints

- **WHEN** the admin adds three hints and moves the third one to the top
- **THEN** the child will receive them in the new order

### Requirement: Translations

The admin SHALL be able to add a translation of the prompt, the part labels
and the hints for each supported task locale; MVP supports `uk` (FR-8).
Supported task locales SHALL come from configuration, so adding one needs
configuration and data only (NFR-9). A translation SHALL be optional and may
be partial; missing translated text falls back to the Czech text.

#### Scenario: Add a Ukrainian translation

- **WHEN** the admin enters a `uk` prompt and `uk` hints for a task
- **THEN** the preview with the translation toggle on shows the Ukrainian text next to the Czech text

#### Scenario: Unsupported locale

- **WHEN** a translation is submitted for the locale `de`, which is not configured
- **THEN** it is refused with a message listing the supported locales

### Requirement: Missions

The admin SHALL be able to create a **mission** as an ordered list of tasks
that all belong to one topic, with a default size of 10 tasks (FR-9). A task
MAY belong to more than one mission (decision OQ-15).

#### Scenario: Create a mission

- **WHEN** the admin creates a mission in topic `desetinná čísla` and adds 10 tasks of that topic in a chosen order
- **THEN** the mission stores the 10 tasks in that order as `DRAFT`

#### Scenario: Task from another topic

- **WHEN** the admin adds a task of topic `úhly` to a mission of topic `desetinná čísla`
- **THEN** it is refused with a message naming both topics

#### Scenario: Mission size other than 10

- **WHEN** the admin saves a mission with 8 tasks
- **THEN** it is stored, and the editor notes that the default size is 10

### Requirement: Answer tester and preview

The admin SHALL be able to preview a task exactly as the child sees it and
type test answers to see, per part, the checker's verdict and normalized
interpretation (FR-10). Tester answers SHALL NOT be recorded as attempts and
SHALL NOT change any XP or progress.

#### Scenario: Test an answer key

- **GIVEN** a DECIMAL part expecting `0.5`
- **WHEN** the admin types `0,50` in the tester
- **THEN** the tester shows `CORRECT` and the normalized value `0.5`
- **AND** no attempt is recorded

#### Scenario: Unparseable test answer

- **WHEN** the admin types `5,,2` in the tester
- **THEN** the tester shows `UNPARSEABLE` and the format tip the child would see

### Requirement: Task list filters

The admin SHALL be able to filter and search tasks by grade, topic, source,
page, modality and status, and search the prompt text (FR-11).

#### Scenario: Combined filters

- **WHEN** the admin filters by source, page 57 and status `DRAFT`
- **THEN** only draft tasks from page 57 of that source are listed

#### Scenario: No match

- **WHEN** the filters match no task
- **THEN** an empty list with a "No tasks match" message is shown

### Requirement: Publishing

Tasks and missions SHALL have status `DRAFT` or `PUBLISHED`, and the child
SHALL be served only published tasks inside published missions (FR-12). A
mission SHALL be publishable only when every task in it is `PUBLISHED` with
modality `TEXT`; a task in a published mission SHALL NOT return to `DRAFT`
until that mission is unpublished (FR-57). The task list SHALL offer a bulk
publish action.

#### Scenario: Draft task is not served

- **GIVEN** a published mission
- **THEN** none of the tasks the child is served from it are `DRAFT`

#### Scenario: Mission with a draft task cannot be published

- **GIVEN** a mission with 9 published tasks and 1 draft task
- **WHEN** the admin publishes the mission
- **THEN** it is refused with a message naming the draft task

#### Scenario: Mission with a graphic task cannot be published

- **GIVEN** a mission containing a published `GRAPHIC` task
- **WHEN** the admin publishes the mission
- **THEN** it is refused with a message naming the graphic task

#### Scenario: Unpublishing a task in a published mission

- **GIVEN** a published task inside a published mission
- **WHEN** the admin sets the task back to `DRAFT`
- **THEN** it is refused with a message naming the mission that must be unpublished first

### Requirement: Task provenance

For any task the admin SHALL see its source title, edition, page and task
number, and SHALL be able to open the source PDF at that page (FR-13). The
child SHALL NOT be shown the source reference in MVP (decision OQ-7).

#### Scenario: Open the source at the task's page

- **GIVEN** a task from page 57 of a source
- **WHEN** the admin chooses "Open source"
- **THEN** the PDF viewer opens that source at page 57

### Requirement: Editing content

The admin SHALL be able to edit existing sources, tasks (every field,
including answer specs, hints, translations and images) and missions
(FR-55). Editing an answer spec SHALL apply to future checks only; verdicts
already recorded stay as they are until the admin re-evaluates them from the
flag queue (decision OQ-20, see progress-stats).

#### Scenario: Fix an answer spec after attempts

- **GIVEN** a published task with recorded attempts
- **WHEN** the admin changes a part's expected value
- **THEN** the next check uses the new value and the earlier attempts keep their recorded verdicts

### Requirement: Deleting content

The admin SHALL be able to delete a source, task or mission only when no
attempt references it, directly or through its tasks; otherwise the delete
SHALL be refused and the admin can unpublish instead (FR-56). Deleting a
task SHALL remove it from any draft mission that contains it; a task in a
published mission SHALL NOT be deletable.

#### Scenario: Delete unused draft task

- **GIVEN** a draft task that was never attempted and is in no mission
- **WHEN** the admin deletes it
- **THEN** it no longer exists

#### Scenario: Delete refused when attempts exist

- **GIVEN** a task with at least one recorded attempt
- **WHEN** the admin deletes it, or the source it comes from
- **THEN** the delete is refused with a message suggesting to unpublish instead

### Requirement: Topic list from configuration

Topics SHALL come from a seeded configuration list aligned to the grade-6
thematic areas of the Czech curriculum (decisions OQ-2, OQ-21). MVP SHALL
offer no admin UI for creating or editing topics.

#### Scenario: Topic choices

- **WHEN** the admin opens the topic field of a task
- **THEN** it offers exactly the seeded topics for the task's grade

## Explicit exclusions (MVP)

- No automatic PDF extraction and no AI drafting of tasks, hints or
  translations.
- No in-app image cropping; images are cropped outside the app.
- No topic editor, no content import/export.
- No workbook content (text, images, answer keys, PDFs) in any repository
  or test fixture (NFR-4).
