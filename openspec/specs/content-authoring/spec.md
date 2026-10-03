# Content Authoring Specification

## Purpose

The admin (the parent) builds all practice content: workbook PDF sources,
tasks typed from those PDFs (answer parts, hints, translations, images), and
missions that group published tasks. Every task keeps a link to the page it
came from, and the admin can try answers against a task before the child
sees it. All authoring sits behind admin authentication (see admin-access)
and the admin UI is English.

## Derived decisions

The requirements below implement FR-1..FR-13 and FR-55..FR-57. Where this
spec adds a rule that no FR, NFR or OQ decision states, the rule cites one of
the derived decisions listed here. Entries marked **narrows** or **deviates**
restrict or depart from an FR's literal wording. The product owner accepted
CA-D1..CA-D21 on 2026-10-03 (`docs/requirements.md` §6.6). CA-D22 is pending
approval at checkpoint 2 (§6.7). Changing any of them needs a recorded
decision.

| Id | Decision | Derived from / justification |
|---|---|---|
| CA-D1 | A file's type is decided by its content, not by its name or declared content type. | NFR-17: "anything else is rejected". A renamed file is "anything else". |
| CA-D2 | A PDF whose page count cannot be read (encrypted, truncated, unparseable, 0 pages) is refused. | FR-1 lists the page count. FR-3 range-checks pages against it. |
| CA-D3 | **Narrows FR-55:** a source's PDF file cannot be replaced; only its metadata is editable. A new file means a new source. | Existing tasks reference pages of the old file. A replacement could move or remove those pages without anyone noticing (FR-13). |
| CA-D4 | **Narrows FR-56:** a source cannot be deleted while any task references it, even if no attempt references that task. | FR-3 makes the source reference mandatory, so deleting the source would orphan its tasks. The alternative, deleting the tasks along with it, silently loses authored work. |
| CA-D5 | Deleting a source also removes its file from the storage volume. | NFR-17 and NFR-4 (no stray workbook copies). |
| CA-D6 | A task in a published mission cannot be deleted. | Protects the FR-57 invariant and FR-12. FR-56 already offers "unpublish instead". |
| CA-D7 | An empty mission cannot be published, and the last task cannot be removed from a published mission. | Without this, FR-57's "every task" would hold vacuously, and HQ would show "0/0" (practice-flow). |
| CA-D8 | A task in a published mission cannot change its modality to `GRAPHIC`. | FR-57 names only the return to `DRAFT`, but a modality change breaks the same invariant. Also FR-5. |
| CA-D9 | Only a `PUBLISHED` `TEXT` task can be added to a published mission. | Keeps the FR-57 invariant true while a mission is edited (FR-55). |
| CA-D10 | A mission's topic can change only while the mission is empty. A task's topic or grade cannot change while the task is in any mission. | Keeps the FR-9 rule (all tasks in a mission belong to its topic) true while editing (FR-55). |
| CA-D11 | Part labels are unique within a task. | FR-6 and practice-flow: the child sees one input per label, so a repeated label would be ambiguous. |
| CA-D12 | A task appears at most once in one mission. | practice-flow counts resolved tasks as x/N. A repeated task would be counted twice. |
| CA-D13 | **Deviates from FR-6:** a `GRAPHIC` task may have zero answer parts. Every `TEXT` task has 1..n parts. | FR-5: no answer spec type can express a graphic answer, and graphic tasks are never checked or served in MVP. |
| CA-D14 | A part is saved only when it is complete (see "Answer parts"). A half-filled part is never stored. | FR-6: "each part has … its own answer spec". A part without a valid spec has none. |
| CA-D15 | Length and count limits (see "Field limits"). | Bounded input is a precondition for objectively testable oversized-input errors. The values were chosen generously for grade-6 workbook tasks. |
| CA-D16 | Allowed grades and subjects come from configuration. MVP configures grade `6` and subject `math` only. A task's grade equals its source's grade, and its topic belongs to that grade. | The product targets one grade-6 pupil's math. More grades and subjects are FR-54 (Future). Topics are seeded per grade (OQ-2, OQ-21). |
| CA-D17 | A mission has a topic and a position within that topic, and no name. Positions are unique within a topic. | practice-flow orders missions by position within each topic. FR-9 defines no name. |
| CA-D18 | The FR-9 default size of 10 is a target shown in the mission editor. It never blocks saving or publishing. | FR-9 says "default", not "fixed". |
| CA-D19 | Task search is a case- and diacritics-insensitive substring match on the Czech prompt. An empty or whitespace-only query does not filter. | FR-11. The admin types on an English keyboard, so `obdelnik` must find `obdélník`. |
| CA-D20 | Expected values are parsed with the checker's input grammar (answer-checking). Numeric expected values have an absolute value below 10^12 and at most 6 decimal places. | answer-checking (integer, decimal, fraction and unit input): admin and child notation then agree, so a dot decimal is accepted and a dot or comma is never a thousands separator. The bounds make overflow testable. |
| CA-D21 | Each code repo carries a fixture provenance manifest, and a check fails on any unlisted fixture file. | NFR-4 needs an executable mechanism, not a human review. |
| CA-D22 | *(Pending product-owner approval at checkpoint 2, `docs/requirements.md` §6.7.)* **Narrows FR-56:** a problem report or an opened-hint record blocks deletion the same way an attempt does. | practice-flow stores both without an attempt (a report filed before any attempt, every opened hint). progress-stats shows the task of each report and counts every opened hint. Deleting the task would orphan or silently drop that history. |

## Requirements

### Requirement: Authoring requires an admin session

Every authoring read and write in this spec SHALL be an admin operation
under `/api/admin/**`: upload, create, edit, delete, publish, unpublish,
preview and the answer tester. Their authentication, the 401/403 responses
and the rule that child-facing operations cannot change content are owned by
admin-access (NFR-1); this spec does not restate them.

#### Scenario: Every authoring operation is an admin operation

- **WHEN** the operations of `api/openapi.yaml` that upload, create, edit, delete, publish, unpublish, preview or test content are listed
- **THEN** every one of them has a path under `/api/admin/**` and declares the admin session security scheme

### Requirement: Field limits

Authoring input SHALL obey the following limits (derived decision CA-D15).
Lengths are counted in Unicode code points after trimming leading and
trailing whitespace. A required text that is empty after trimming counts as
missing. A value over a limit SHALL be refused with an inline message that
names the limit, and nothing SHALL be stored.

| Field | Limit |
|---|---|
| Source title, publisher | 200 characters |
| Source edition | 50 characters |
| Task prompt (Czech or translated) | 4000 characters |
| Hint (Czech or translated) | 1000 characters |
| Task number | 20 characters |
| Sub-part, part label (Czech or translated) | 10 characters |
| Choice option text | 200 characters |
| TEXT expected answer | 100 code points (the child's input limit, practice-flow and answer-checking) |
| Task search query | 200 characters |
| Images per task | 0–10 |
| Hints per task | 0–10 |
| Answer parts per task | 1–10 (`GRAPHIC`: 0–10, see CA-D13) |
| Accepted answers per part | 1–10 |
| Options per choice part | 2–10 |
| Tasks per mission | 0–50 (publishing needs at least 1) |

Topics are chosen from the seeded list by id. There is no free-text topic
field.

#### Scenario: Overlong prompt

- **GIVEN** the task form is otherwise valid
- **WHEN** the admin saves it with a 4001-character prompt
- **THEN** the save is refused with an inline message on the prompt field stating the 4000-character limit, and no task is stored

#### Scenario: Prompt at the limit

- **GIVEN** the task form is otherwise valid
- **WHEN** the admin saves it with a prompt of exactly 4000 characters
- **THEN** the task is stored with the full prompt

#### Scenario: Overlong hint, translation, task number and metadata

- **GIVEN** a valid task and a valid source
- **WHEN** the admin saves a 1001-character hint, a 4001-character `uk` prompt, a 21-character task number, or a source title of 201 characters
- **THEN** each save is refused with an inline message on that field naming its limit, and the stored task and source are unchanged

#### Scenario: Too many images, hints or parts

- **GIVEN** a task with 10 images, 10 hints and 10 parts
- **WHEN** the admin attaches an 11th image, adds an 11th hint or adds an 11th part and saves
- **THEN** each is refused with a message stating the maximum of 10, and the task still has 10 images, 10 hints and 10 parts

#### Scenario: Too many tasks in a mission

- **GIVEN** a mission with 50 tasks
- **WHEN** the admin adds a 51st task
- **THEN** it is refused with a message stating the maximum of 50, and the mission still has 50 tasks

### Requirement: Upload a PDF source

The admin SHALL be able to upload a PDF as a **source** with title,
publisher, edition, grade and subject (FR-1). Title, grade and subject SHALL
be required. Publisher and edition are optional (decision OQ-31). Grade and subject SHALL be
one of the configured values. MVP configures grade `6` and subject `math`
only (derived decision CA-D16). After upload, the source SHALL be listed with
its metadata and page count.

#### Scenario: Upload a source

- **GIVEN** the admin is signed in
- **WHEN** they upload a 12 MB, 120-page PDF with title `Matematika 6 – pracovní sešit`, publisher `Testovací nakladatelství`, edition `1`, grade `6` and subject `math`
- **THEN** the source list shows that source with title `Matematika 6 – pracovní sešit`, publisher `Testovací nakladatelství`, edition `1`, grade `6`, subject `math` and page count `120`

#### Scenario: Optional metadata omitted

- **GIVEN** the admin is signed in
- **WHEN** they upload a valid PDF with title, grade `6` and subject `math` but no publisher and no edition
- **THEN** the source is created and the list shows empty publisher and edition

#### Scenario: Missing required metadata

- **GIVEN** the admin is signed in
- **WHEN** they upload a valid PDF without a title, or with a title of only spaces
- **THEN** the upload is refused with an inline message on the title field and no source is created

#### Scenario: Invalid grade or subject

- **GIVEN** the configured grades are `6` and the configured subjects are `math`
- **WHEN** the admin uploads a valid PDF with grade `7`, `abc`, `6,0` or `99999999999`, or with subject `physics`
- **THEN** the upload is refused with an inline message on that field listing the allowed values, and no source is created and no file is stored

### Requirement: Upload limits and storage

Source uploads SHALL accept only PDF files of at most 50 MB. Task images
SHALL accept only PNG or JPG files of at most 5 MB each (NFR-17). The file
content SHALL decide the type, not the file name (derived decision CA-D1). A
PDF whose page count cannot be read SHALL be refused (derived decision
CA-D2). Anything else SHALL be rejected with a clear message stating the
allowed types and size, and nothing SHALL be stored. Accepted files SHALL be
stored on the local storage volume, at a path outside every repository
working tree (NFR-17, NFR-4).

#### Scenario: Wrong file type for a source

- **GIVEN** the admin is signed in
- **WHEN** they upload a `.docx` file as a source
- **THEN** the upload is refused with the message that only PDF files up to 50 MB are allowed, and no source is created

#### Scenario: Oversized PDF

- **GIVEN** the admin is signed in
- **WHEN** they upload a 51 MB PDF
- **THEN** the upload is refused with the message that only PDF files up to 50 MB are allowed, and no source is created

#### Scenario: Renamed file is not a PDF

- **GIVEN** the admin is signed in
- **WHEN** they upload a PNG image renamed to `sesit.pdf`
- **THEN** the upload is refused as not a PDF and no source is created

#### Scenario: Damaged or protected PDF

- **GIVEN** the admin is signed in
- **WHEN** they upload a file that starts with the PDF signature but is password-encrypted, is truncated to its first half, or has an unreadable page tree
- **THEN** the upload is refused with the message "The PDF could not be read. It may be damaged or password-protected.", no source is created, and no file is left on the storage volume

#### Scenario: Rejected image

- **GIVEN** a task open in the editor
- **WHEN** the admin attaches a GIF, or a JPG of 6 MB
- **THEN** the image is refused with the message that only PNG or JPG files up to 5 MB are allowed, and the task's images are unchanged

#### Scenario: Files are stored outside every repository

- **GIVEN** a source PDF and a task image were uploaded, and the docs, backend and frontend repositories are checked out on the same machine
- **WHEN** the absolute storage paths of both files are compared with the absolute root directories of the three repositories
- **THEN** both files exist at their storage paths, and neither path lies inside any of the three repository roots

### Requirement: PDF viewer beside the editor

The admin SHALL be able to view an uploaded source page by page next to the
task editor and jump to a page by number (FR-2). The page number SHALL be a
whole number from 1 to the source's page count.

#### Scenario: Page through a source

- **GIVEN** a 120-page source open beside the task editor on page 10
- **WHEN** the admin chooses next page
- **THEN** page 11 is shown

#### Scenario: Jump to a page

- **GIVEN** a 120-page source open beside a half-filled task form
- **WHEN** the admin enters page `57`
- **THEN** page 57 is shown and the task form keeps its content

#### Scenario: Page out of range or not a whole number

- **GIVEN** a 120-page source open on page 10
- **WHEN** the admin enters page `130`, `0`, `abc`, `5,5` or `99999999999`
- **THEN** the viewer stays on page 10 and shows the valid range `1–120`

### Requirement: Create a task with a source reference

The admin SHALL be able to create a task with Czech prompt text, topic,
grade, difficulty from 1 to 3, and a source reference made of source, page,
task number and an optional sub-part (FR-3). Prompt, topic, grade,
difficulty, source, page and task number SHALL be required. Page and
difficulty SHALL be whole numbers written without a decimal part, and the
page SHALL lie within the source's page count. The grade SHALL be a
configured grade and SHALL equal the source's grade, and the topic SHALL be
a seeded topic of that grade (derived decision CA-D16). A new task SHALL
start as `DRAFT`. Difficulty is stored only and is never shown to the child.

#### Scenario: Create a task

- **GIVEN** the admin is signed in and a 120-page grade-6 source exists
- **WHEN** they save a task with a prompt, topic `Desetinná čísla`, grade 6, difficulty 2, that source, page 57, task number `4` and sub-part `b`
- **THEN** the task is stored as `DRAFT` with that source reference

#### Scenario: Invalid difficulty

- **GIVEN** the task form is filled in
- **WHEN** the admin saves it with difficulty `4`, `0`, `abc`, `2,0` or `99999999999`
- **THEN** the save is refused with an inline message that difficulty must be a whole number from 1 to 3, and nothing is stored

#### Scenario: Missing, out-of-range or malformed page

- **GIVEN** the task form references a 120-page source
- **WHEN** the admin saves it without a page, or with page `121`, `0`, `abc`, `2,0` or `99999999999`
- **THEN** the save is refused with an inline message on the page field showing the range `1–120`, and nothing is stored

#### Scenario: Invalid grade

- **GIVEN** the configured grades are `6`
- **WHEN** a task is saved with grade `7`, `abc` or `6,5`
- **THEN** the save is refused with an inline message on the grade field listing the allowed grades, and nothing is stored

#### Scenario: Grade differs from the source

- **GIVEN** a source of grade 6, and a configuration that also allows grade 7
- **WHEN** a task referencing that source is saved with grade 7
- **THEN** the save is refused with a message that the task grade must match the source grade (6), and nothing is stored

#### Scenario: Topic of another grade

- **GIVEN** a configuration with grades 6 and 7, each with its own seeded topics
- **WHEN** a grade-6 task is saved with a topic seeded for grade 7
- **THEN** the save is refused with a message that the topic does not belong to grade 6, and nothing is stored

### Requirement: Fast keyboard-first task entry

The task form SHALL be fully usable from the keyboard. The source and page
fields SHALL stay filled in from the previously saved task, so the admin can
enter a typical single-part task in at most 60 seconds (NFR-8). NFR-8 is
proven by a timed recording.

#### Scenario: Sticky source and page

- **GIVEN** the admin just saved a task from page 57 of a source
- **WHEN** they start the next task
- **THEN** the source and page 57 are already filled in and focus is in the prompt field

#### Scenario: Timed entry of a single-part task

- **GIVEN** the PDF open beside an empty task form with sticky source and page
- **WHEN** the admin enters a single-part INTEGER task (prompt, topic, task number, expected value) and saves it using the keyboard only
- **THEN** the recording shows the task saved within 60 seconds of the first keystroke

### Requirement: Task images

The admin SHALL be able to attach zero or more ordered PNG or JPG images to a
task, up to 10, cropped outside the app. The child sees them with the task
in that order (FR-4). Size and type limits are those of "Upload limits and
storage".

#### Scenario: Attach and reorder images

- **GIVEN** a task with no images
- **WHEN** the admin attaches two PNG images and moves the second one first
- **THEN** the task preview shows both images in the new order

#### Scenario: Task without images

- **GIVEN** a task with no images
- **WHEN** the admin previews it
- **THEN** the prompt and answer fields are shown with no empty image area

### Requirement: Answer modality

Every task SHALL have the answer modality `TEXT` or `GRAPHIC` (FR-5). A
`GRAPHIC` task (construction, drawing, colouring) SHALL be storable and
findable by the admin.

#### Scenario: Modality is required

- **GIVEN** the task form is filled in
- **WHEN** the admin saves it without choosing a modality
- **THEN** the save is refused with an inline message on the modality field

#### Scenario: Graphic task is stored

- **GIVEN** the admin is signed in
- **WHEN** they save a task with modality `GRAPHIC`
- **THEN** it is stored and listed when filtering by modality `GRAPHIC`

### Requirement: Graphic tasks are never served in MVP

A `GRAPHIC` task SHALL never be served to the child in MVP, whatever its
status and whatever mission contains it (FR-5). It SHALL never be part of a
published mission (see "Mission publishing rules").

#### Scenario: Published graphic task requested by id

- **GIVEN** a `PUBLISHED` task G with modality `GRAPHIC`
- **WHEN** the child-facing API is asked for G by its id
- **THEN** the response is HTTP 404 with an `application/problem+json` body that contains no prompt, part or image of G

#### Scenario: Graphic task inside a draft mission

- **GIVEN** a `DRAFT` mission M containing the `PUBLISHED` `GRAPHIC` task G
- **WHEN** the child-facing API is asked for G by its id, and for M by its id
- **THEN** both requests are answered with HTTP 404, and HQ lists neither M nor G

### Requirement: Answer parts

A `TEXT` task SHALL have 1 to 10 answer parts at every save, whatever its
status (FR-6). A `GRAPHIC` task SHALL have 0 to 10 answer parts, which is a
recorded deviation from FR-6 (derived decision CA-D13). Each part SHALL have
a label and its own answer spec of type INTEGER, DECIMAL, FRACTION,
NUMBER_WITH_UNIT, CHOICE_SINGLE, CHOICE_MULTI or TEXT (FR-6). Labels SHALL
be unique within a task (derived decision CA-D11). Parts SHALL keep the
order the admin gives them. The checking rules for each type are defined by
answer-checking.

A part is **complete** when all of the following hold:

1. It has a non-empty label.
2. It has a type.
3. Its spec has every field its type requires, with a valid value (see
   "Answer spec authoring").

A part that is not complete SHALL NOT be saved. The whole task save SHALL
be refused with an inline message on each incomplete field (derived
decision CA-D14).

#### Scenario: Multi-part task

- **GIVEN** a task in the editor
- **WHEN** the admin adds part `a` (INTEGER, expected `12`) and part `b` (NUMBER_WITH_UNIT, expected `24 cm²`, unit required)
- **THEN** the task stores both parts in that order with their specs

#### Scenario: Text task without parts cannot be saved

- **GIVEN** a `TEXT` task form, in `DRAFT`, with every other field valid and no answer parts
- **WHEN** the admin saves it
- **THEN** the save is refused with a message that a text task needs at least one answer part, and nothing is stored

#### Scenario: Graphic task without parts

- **GIVEN** a `GRAPHIC` task form with every other field valid and no answer parts
- **WHEN** the admin saves it
- **THEN** it is stored with zero parts

#### Scenario: Switching a partless graphic task to text

- **GIVEN** a stored `GRAPHIC` task with zero parts
- **WHEN** the admin changes its modality to `TEXT` and saves without adding a part
- **THEN** the save is refused with a message that a text task needs at least one answer part, and the task stays `GRAPHIC`

#### Scenario: Half-filled part

- **GIVEN** a `TEXT` task with a complete part `a`
- **WHEN** the admin adds part `b` with type DECIMAL and no expected value, or with an expected value and no type, and saves
- **THEN** the save is refused with an inline message on part `b`'s missing field, and the stored task still has only part `a`

#### Scenario: Missing part label

- **GIVEN** a task in the editor
- **WHEN** the admin saves a part with an empty label
- **THEN** the save is refused with an inline message on that part's label

#### Scenario: Duplicate part labels

- **GIVEN** a task with part `a`
- **WHEN** the admin adds a second part also labelled `a`
- **THEN** the save is refused with an inline message on the duplicate label

### Requirement: Answer spec authoring

Each answer spec type SHALL be authored and validated as follows (FR-6,
answer-checking). Expected values SHALL be parsed with the same input grammar
the checker uses for the child's answers (derived decision CA-D20). That
grammar accepts:

- a decimal comma or a decimal dot (`0,5` and `0.5` are both accepted in
  the English admin UI);
- space, no-break-space or thin-space thousands separators.

A dot or comma SHALL never be a thousands separator. Numeric values SHALL
have an absolute value below 10^12 and at most 6 decimal places. Accepted
answers SHALL be stored in the notation the admin entered, because the
checker compares notation when a part does not allow equivalent forms
(answer-checking, "Fraction input"): `1 1/2` and `3/2` stay distinct. The
editor SHALL show each value's normalized interpretation next to it. Every part SHALL have 1 to 10 accepted answers (answer-checking), each
validated by the part's type. An invalid value SHALL be refused with an
inline message on that value, and nothing SHALL be stored.

| Type | Admin enters | Refused |
|---|---|---|
| INTEGER | one or more whole numbers | a value with a fractional part, such as `12,5` (message suggests DECIMAL); anything unparseable |
| DECIMAL | one or more numbers; optional exact number of decimal places 0–6 | unparseable input; more than 6 decimal places; an expected value that has fewer decimal places than the exact form requires |
| FRACTION | one or more `a/b` or mixed `w a/b` values; flags "equivalent forms allowed" and `requireLowestTerms` | a zero denominator; a malformed fraction; an expected value not in lowest terms while `requireLowestTerms` is set |
| NUMBER_WITH_UNIT | one or more number + unit values, all in the same unit after normalization (answer-checking); flag "unit required". That common unit is the part's unit, shown next to the child's input | a value with no unit (even when the unit is optional); a unit with no number; an unparseable number; values in different units, such as `24 cm²` and `2400 mm²` (no unit conversion, FR-17) |
| CHOICE_SINGLE | 2–10 option texts, lettered `A`, `B`, `C` … in order, and one or more options marked correct; each correct option is an accepted alternative and the child picks exactly one (FR-20) | fewer than 2 options; an empty option text; two options with the same text (compared trimmed and case-insensitively); no correct option |
| CHOICE_MULTI | 2–10 option texts lettered as above; one or more options marked correct | fewer than 2 options; empty or duplicate option texts; no correct option |
| TEXT | one or more expected texts of 1–100 code points; flag "diacritics-strict" | an empty or whitespace-only expected text; a text over 100 code points |

An optional numeric tolerance (answer-checking) SHALL be a number ≥ 0 and is offered
only for INTEGER, DECIMAL, FRACTION and NUMBER_WITH_UNIT parts.

#### Scenario: Expected value in Czech notation

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the expected value `1 250,75` with a no-break space
- **THEN** the part is saved with the expected value `1 250,75` as entered, and the editor shows its normalized interpretation `1250.75`

#### Scenario: Expected value with a decimal dot

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the expected value `0.5`
- **THEN** the part is saved with the expected value `0.5`

#### Scenario: Dot as thousands separator is refused

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the expected value `1.250,75` or `1,250.75`
- **THEN** the save is refused with an inline message on that expected value suggesting `1 250,75`

#### Scenario: Unreadable expected value

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the expected value `5,,2`, `abc` or `5.2.1`
- **THEN** the save is refused with an inline message on that part's expected value

#### Scenario: Overflowing or over-precise numeric value

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the expected value `1000000000000`, `99999999999999999999` or `0,1234567`
- **THEN** the save is refused with an inline message stating the allowed range and precision, and nothing is stored

#### Scenario: Integer part with a fractional value

- **GIVEN** an INTEGER part in the editor
- **WHEN** the admin enters the expected value `12,5`
- **THEN** the save is refused with an inline message that the value is not a whole number and that DECIMAL fits it

#### Scenario: Exact form contradicts the expected value

- **GIVEN** a DECIMAL part requiring exactly 2 decimal places
- **WHEN** the admin enters the expected value `0,5`
- **THEN** the save is refused with an inline message that the expected value must have 2 decimal places (`0,50`)

#### Scenario: Invalid fraction

- **GIVEN** a FRACTION part in the editor
- **WHEN** the admin enters the expected value `3/0` or `1//2`
- **THEN** the save is refused with an inline message on that expected value

#### Scenario: Lowest terms contradicts the expected value

- **GIVEN** a FRACTION part with `requireLowestTerms` set
- **WHEN** the admin enters the expected value `2/4`
- **THEN** the save is refused with an inline message that the expected value is not in lowest terms (`1/2`)

#### Scenario: Valid mixed-number fraction

- **GIVEN** a FRACTION part in the editor
- **WHEN** the admin enters the expected value `1 1/2`
- **THEN** the part is saved with the expected value `1 1/2`, and the editor shows its normalized interpretation `3/2`

#### Scenario: Number with unit missing its unit or number

- **GIVEN** a NUMBER_WITH_UNIT part with "unit required" off
- **WHEN** the admin enters the expected value `24` or `cm²`
- **THEN** the save is refused with an inline message that the expected value needs both a number and a unit

#### Scenario: Unit spelling is shown normalized

- **GIVEN** a NUMBER_WITH_UNIT part in the editor
- **WHEN** the admin enters the expected value `24 cm2`
- **THEN** the part is saved with the expected value `24 cm2` as entered, and the editor shows its normalized interpretation `24 cm²`

#### Scenario: Single-choice options and answer

- **GIVEN** a CHOICE_SINGLE part in the editor
- **WHEN** the admin enters the options `3`, `4`, `5` and marks the second option correct
- **THEN** the part is saved with options `A` = `3`, `B` = `4`, `C` = `5` and correct option `B`

#### Scenario: Invalid single-choice spec

- **GIVEN** a CHOICE_SINGLE part in the editor
- **WHEN** the admin saves it with one option only, with no option marked correct, or with options `4` and ` 4 `
- **THEN** each save is refused with an inline message naming the problem (too few options, no correct option, duplicate option), and nothing is stored

#### Scenario: Single-choice spec with two correct options

- **GIVEN** a CHOICE_SINGLE part in the editor
- **WHEN** the admin enters four options and marks `A` and `D` correct
- **THEN** the part is saved with accepted keys `A` and `D`, and the child still picks exactly one option (answer-checking, "Accepted alternatives")

#### Scenario: Multi-choice spec

- **GIVEN** a CHOICE_MULTI part in the editor
- **WHEN** the admin enters four options and marks `A` and `C` correct
- **THEN** the part is saved with correct options `A` and `C`
- **AND** saving the same part with no option marked correct is refused with an inline message

#### Scenario: Text expected answer

- **GIVEN** a TEXT part in the editor
- **WHEN** the admin enters the expected answers `pravý úhel` and `pravý`
- **THEN** the part is saved with both accepted answers
- **AND** an expected answer of exactly 100 code points is saved
- **AND** saving an expected answer of only spaces, or of 101 code points, is refused with an inline message on that answer

#### Scenario: Negative tolerance

- **GIVEN** a DECIMAL part in the editor
- **WHEN** the admin enters the tolerance `-0,1` or `abc`
- **THEN** the save is refused with an inline message that tolerance must be a number of at least 0

### Requirement: Hints

The admin SHALL be able to add zero or more ordered hints to a task, up to
10, and reorder them (FR-7). A task without hints SHALL be publishable and
work normally everywhere. An empty or whitespace-only hint SHALL be refused.

#### Scenario: Ordered hints

- **GIVEN** a task with three hints
- **WHEN** the admin moves the third hint to the top and saves
- **THEN** the preview offers the hints in the new order

#### Scenario: Task without hints

- **GIVEN** a complete `TEXT` task with no hints
- **WHEN** the admin publishes it and previews it
- **THEN** publishing succeeds and the preview shows no hint control

#### Scenario: Empty hint

- **GIVEN** a task in the editor
- **WHEN** the admin saves a hint that contains only spaces
- **THEN** the save is refused with an inline message on that hint

### Requirement: Translations

The admin SHALL be able to add a translation of the prompt, the part labels
and the hints for each supported task locale. MVP supports `uk` (FR-8).
Supported task locales SHALL come from configuration, so adding one needs
only configuration and data (NFR-9). A translation SHALL be optional and may
be partial. A missing translated text falls back to the Czech text.
Translated texts SHALL obey the same length limits as their Czech
counterparts (see "Field limits").

#### Scenario: Add a Ukrainian translation

- **GIVEN** a task with a Czech prompt and two hints
- **WHEN** the admin enters a `uk` prompt and `uk` hints and turns the translation toggle on in the preview
- **THEN** the preview shows the Ukrainian text next to the Czech text

#### Scenario: Partial translation

- **GIVEN** a task whose `uk` translation has a prompt but no hints
- **WHEN** the admin previews it with the translation toggle on and opens a hint
- **THEN** the Ukrainian prompt is shown and the hint is shown in Czech

#### Scenario: Unsupported locale

- **GIVEN** only `uk` is configured as a task locale
- **WHEN** a translation for the locale `de` is submitted
- **THEN** it is refused with a message listing the supported locales and nothing is stored

#### Scenario: New locale by configuration only

- **GIVEN** the backend and frontend builds of the same version
- **WHEN** a second task locale is added to configuration and the stack restarts
- **THEN** the translation editor offers that locale without any code change

### Requirement: Externalized admin strings

All admin UI strings of the authoring screens (source list, task editor,
mission editor, preview and answer tester) SHALL be externalized, and the
admin UI SHALL be English (NFR-9, decision OQ-6). Externalization of the
other admin screens (sign-in, stats, flag queue) and of the child UI is
owned by the capability plan (`docs/mvp-capability-plan.md`).

#### Scenario: No hard-coded admin strings

- **GIVEN** a test message catalog in which every value is prefixed with `⟦`
- **WHEN** the source list, task editor, mission editor and preview are rendered with it
- **THEN** every visible admin label, button and message starts with `⟦` (task content entered by the admin excepted)

### Requirement: Missions

The admin SHALL be able to create a **mission**: an ordered list of tasks
that all belong to the mission's topic (FR-9). A mission SHALL have a
required topic and a required position within that topic. The position is a
whole number from 1 to 999, unique among the missions of that topic, and it
sets the HQ order. A mission has no name in MVP (derived decision CA-D17).

The default size of 10 tasks (FR-9) SHALL be a target, not a limit. The
mission editor SHALL show a task counter in the form `<n>/10 tasks`, and any
count from 0 to 50 SHALL be savable (derived decision CA-D18).

A task MAY belong to more than one mission (decision OQ-15). XP for it is
still awarded once, as defined by gamification. A task SHALL appear at most
once in one mission (derived decision CA-D12). A new mission SHALL start as
`DRAFT`.

#### Scenario: Create a mission

- **GIVEN** 12 tasks of topic `Desetinná čísla`
- **WHEN** the admin creates a mission in that topic at position 1 and adds 10 of them in a chosen order
- **THEN** the mission is stored as `DRAFT` with those 10 tasks in that order, and the counter shows `10/10 tasks`

#### Scenario: Mission size other than 10

- **GIVEN** a new mission
- **WHEN** the admin saves it with 8 tasks, and then with 12 tasks
- **THEN** both saves succeed, and the counter shows `8/10 tasks` and then `12/10 tasks`, with no error or blocking message

#### Scenario: Missing or duplicate position

- **GIVEN** topic `Desetinná čísla` already has a mission at position 1
- **WHEN** the admin saves a new mission in that topic with no position, position `1`, `0`, `abc` or `1,5`
- **THEN** the save is refused with an inline message on the position field, and no mission is created

#### Scenario: Task shared by two missions

- **GIVEN** a task already in mission A
- **WHEN** the admin adds it to mission B of the same topic
- **THEN** it is stored in both missions

#### Scenario: Task from another topic

- **GIVEN** a mission of topic `Desetinná čísla`
- **WHEN** the admin adds a task of topic `Úhly`
- **THEN** it is refused with a message naming both topics

#### Scenario: Same task twice

- **GIVEN** a mission that contains task T
- **WHEN** the admin adds task T again
- **THEN** it is refused and the mission is unchanged

### Requirement: Preview and answer tester

The admin SHALL be able to preview a task exactly as the child sees it
(FR-10). The preview covers Czech copy, images, parts, hints and the
translation toggle, and shows no source reference. Its task area SHALL be
rendered by the same task view the child's task screen uses (practice-flow
"Task screen"), fed with the same task data shape. The tester panel sits
outside that task area. In the tester the admin types test answers and
sees, per part, the checker's verdict and normalized interpretation
(FR-10). Tester answers SHALL NOT be recorded as attempts and SHALL NOT
change any XP, progress or statistics.

#### Scenario: Preview matches the child task screen

- **GIVEN** a published task in a published mission with two parts, one image, two hints and a `uk` translation
- **WHEN** an e2e test opens the admin preview of that task and the child task screen of that task at the same viewport (1280×720) and theme, and captures the task area of each
- **THEN** the accessible text content of the two task areas is identical (prompt, part labels, inputs, hint control, translation toggle, image order)
- **AND** a Playwright screenshot comparison of the two task areas differs in at most 1 % of pixels

#### Scenario: Preview of a draft task

- **GIVEN** a `DRAFT` task that no child request can return
- **WHEN** the admin opens its preview
- **THEN** the preview renders the task area as the child would see it once the task is published

#### Scenario: Test a correct answer in Czech notation

- **GIVEN** a DECIMAL part expecting `0.5`
- **WHEN** the admin types `0,50` in the tester
- **THEN** the tester shows `CORRECT` with the normalized value `0.5`
- **AND** the attempt log and the child's XP are unchanged

#### Scenario: Test a wrong answer

- **GIVEN** an INTEGER part expecting `12500`
- **WHEN** the admin types `12 400` in the tester
- **THEN** the tester shows `WRONG` with the normalized value `12400`

#### Scenario: Unparseable test answer

- **GIVEN** a DECIMAL part
- **WHEN** the admin types `5,,2` in the tester
- **THEN** the tester shows `UNPARSEABLE` and the same Czech format tip the child would see ("Tohle číslo neumím přečíst. Zkus třeba 5,2.")

#### Scenario: Preview hides the source reference

- **GIVEN** a task with a source reference
- **WHEN** the admin opens its preview
- **THEN** the preview shows no source title, page or task number

### Requirement: Task list filters and search

The admin SHALL be able to filter tasks by grade, topic, source, page,
modality and status, in any combination, and search the prompt text (FR-11).
Search SHALL match a query as a substring of the Czech prompt, ignoring
letter case and diacritics on both sides (derived decision CA-D19). Leading
and trailing whitespace of the query is ignored. An empty or whitespace-only
query SHALL apply no text filter. A query over 200 characters SHALL be
refused with an inline message.

#### Scenario: Combined filters

- **GIVEN** tasks on several pages of two sources
- **WHEN** the admin filters by one source, page 57 and status `DRAFT`
- **THEN** exactly the draft tasks from page 57 of that source are listed

#### Scenario: Text search

- **GIVEN** a task whose prompt contains `obvod obdélníku`
- **WHEN** the admin searches for `obdélník`
- **THEN** that task is listed

#### Scenario: Search ignores case and diacritics

- **GIVEN** a task whose prompt contains `obvod obdélníku`, and a task whose prompt does not contain that word in any spelling
- **WHEN** the admin searches for `obdelnik`, and then for `OBDÉLNÍK`
- **THEN** each search lists the first task and not the second

#### Scenario: Empty query

- **GIVEN** 25 tasks of which 5 are `DRAFT`, with the status filter set to `DRAFT`
- **WHEN** the admin searches for an empty query, or for a query of only spaces
- **THEN** exactly the 5 draft tasks are listed and no error is shown

#### Scenario: No match

- **GIVEN** no task of modality `GRAPHIC` exists
- **WHEN** the admin filters by modality `GRAPHIC`
- **THEN** an empty list with a "No tasks match" message is shown

### Requirement: Draft and published status

Tasks and missions SHALL have status `DRAFT` or `PUBLISHED`. The child SHALL
be served only `PUBLISHED` tasks inside `PUBLISHED` missions (FR-12).

#### Scenario: Draft mission is not served

- **GIVEN** a `DRAFT` mission whose tasks are all `PUBLISHED`
- **WHEN** the child opens HQ
- **THEN** the mission is not listed and its tasks cannot be requested

#### Scenario: Published task outside any published mission

- **GIVEN** a `PUBLISHED` task that belongs to no published mission
- **WHEN** the child requests it by id
- **THEN** it is refused as not found

### Requirement: Bulk publish from the task list

The task list SHALL offer a bulk publish action: the admin selects 1 to 100
tasks and publishes them in one step (FR-12, decision OQ-32). Each selected
task SHALL be handled independently and the result SHALL list every task with
whether it is now `PUBLISHED` and, if not, why. A task that is already
`PUBLISHED` SHALL stay unchanged and be reported as published. A task id that
does not exist SHALL be reported as not published, without affecting the
others. There SHALL be no bulk unpublish, because unpublishing is limited by
the mission publishing rules (FR-57).

#### Scenario: Publish several drafts at once

- **GIVEN** three `DRAFT` tasks and one `PUBLISHED` task
- **WHEN** the admin selects all four in the task list and chooses "Publish"
- **THEN** all four are `PUBLISHED` and the result lists each of them as published

#### Scenario: One unknown id does not block the rest

- **GIVEN** two `DRAFT` tasks and a task id that does not exist
- **WHEN** a bulk publish request names all three
- **THEN** the two tasks are `PUBLISHED`, and the result reports the unknown id as not published with the reason "not found"

#### Scenario: Selection limits

- **WHEN** a bulk publish request names no task, or 101 tasks
- **THEN** it is refused with HTTP 400 and no task changes status

### Requirement: Mission publishing rules

A mission SHALL be publishable only when every task in it is `PUBLISHED`
with modality `TEXT` (FR-57). A task in a published mission SHALL NOT
return to `DRAFT` until that mission is unpublished (FR-57).

The invariant "every task in a published mission is `PUBLISHED` and `TEXT`,
and the mission is not empty" SHALL hold after every edit. The edit rules
that keep it, each refused with a message naming the mission to unpublish
first, are these:

- An empty mission SHALL NOT be publishable, and the last task SHALL NOT be
  removed from a published mission (derived decision CA-D7).
- A task in a published mission SHALL NOT change its modality to `GRAPHIC`
  (derived decision CA-D8).
- Only a `PUBLISHED` `TEXT` task of the mission's topic SHALL be added to a
  published mission (derived decision CA-D9).
- A mission's topic SHALL change only while the mission has no tasks. A
  task's topic or grade SHALL NOT change while the task belongs to any
  mission (derived decision CA-D10).

Reordering the tasks of a published mission, and removing a task from it
while at least one task remains, SHALL be allowed.

#### Scenario: Mission with a draft task

- **GIVEN** a mission with 9 published tasks and 1 draft task
- **WHEN** the admin publishes the mission
- **THEN** it is refused with a message naming the draft task, and the mission stays `DRAFT`

#### Scenario: Mission with a graphic task

- **GIVEN** a mission containing a `PUBLISHED` `GRAPHIC` task
- **WHEN** the admin publishes the mission
- **THEN** it is refused with a message naming the graphic task

#### Scenario: Empty mission cannot be published

- **GIVEN** a `DRAFT` mission with no tasks
- **WHEN** the admin publishes it
- **THEN** it is refused with a message that a mission needs at least one task, and the mission stays `DRAFT`

#### Scenario: Publish a valid mission

- **GIVEN** a mission of 10 `PUBLISHED` `TEXT` tasks
- **WHEN** the admin publishes it
- **THEN** it becomes `PUBLISHED` and the child sees it on HQ

#### Scenario: Task in a published mission cannot return to draft

- **GIVEN** a published task inside a published mission
- **WHEN** the admin sets the task back to `DRAFT`
- **THEN** it is refused with a message naming the mission to unpublish first

#### Scenario: Task in a published mission cannot become graphic

- **GIVEN** a published `TEXT` task inside a published mission
- **WHEN** the admin changes its modality to `GRAPHIC`
- **THEN** the save is refused with a message naming the mission

#### Scenario: Unpublish the mission first

- **GIVEN** the mission from the previous scenario is unpublished
- **WHEN** the admin sets the task back to `DRAFT`
- **THEN** the task becomes `DRAFT`

#### Scenario: Adding a draft or graphic task to a published mission

- **GIVEN** a published mission M of topic `Desetinná čísla`, a `DRAFT` `TEXT` task D and a `PUBLISHED` `GRAPHIC` task G, both of that topic
- **WHEN** the admin adds D to M, and then adds G to M
- **THEN** both edits are refused with a message naming the task and stating that only published text tasks can join a published mission, and M's task list is unchanged

#### Scenario: Adding a valid task to a published mission

- **GIVEN** a published mission M of topic `Desetinná čísla` with 9 tasks, and a `PUBLISHED` `TEXT` task P of that topic not in M
- **WHEN** the admin adds P to M
- **THEN** M stays `PUBLISHED` and lists 10 tasks including P

#### Scenario: Adding a task of another topic to a published mission

- **GIVEN** a published mission M of topic `Desetinná čísla`
- **WHEN** the admin adds a `PUBLISHED` `TEXT` task of topic `Úhly`
- **THEN** it is refused with a message naming both topics, and M is unchanged

#### Scenario: Removing the last task of a published mission

- **GIVEN** a published mission with exactly one task
- **WHEN** the admin removes that task from the mission
- **THEN** the edit is refused with a message to unpublish the mission first, and the mission still has its task

#### Scenario: Removing a task that is not the last

- **GIVEN** a published mission with 10 tasks
- **WHEN** the admin removes one task
- **THEN** the mission stays `PUBLISHED` with the other 9 tasks in their previous order

#### Scenario: Changing the topic of a non-empty mission

- **GIVEN** a `DRAFT` or `PUBLISHED` mission of topic `Desetinná čísla` with at least one task
- **WHEN** the admin changes the mission's topic to `Úhly`
- **THEN** the save is refused with a message that the topic can only change while the mission is empty, and the mission keeps topic `Desetinná čísla`

#### Scenario: Changing the topic of an empty mission

- **GIVEN** a `DRAFT` mission of topic `Desetinná čísla` with no tasks
- **WHEN** the admin changes its topic to `Úhly`
- **THEN** the mission is stored with topic `Úhly`

#### Scenario: Changing the topic of a task in a mission

- **GIVEN** a task of topic `Desetinná čísla` that belongs to a draft mission A and a published mission B
- **WHEN** the admin changes the task's topic to `Úhly`
- **THEN** the save is refused with a message naming missions A and B, and the task keeps topic `Desetinná čísla`

### Requirement: Task provenance

For any task the admin SHALL see its source title, edition, page, task
number and sub-part, and SHALL be able to open the source PDF at that page
(FR-13). The child SHALL NOT be shown the source reference in MVP (decision
OQ-7).

#### Scenario: Open the source at the task's page

- **GIVEN** a task from page 57 of a source
- **WHEN** the admin chooses "Open source" on the task
- **THEN** the PDF viewer opens that source at page 57

#### Scenario: Source reference never reaches the child

- **GIVEN** a published task in a published mission
- **WHEN** the child's task response is inspected
- **THEN** it contains no source title, edition, page or task number

### Requirement: Edit existing content

The admin SHALL be able to edit existing sources, tasks and missions
(FR-55):

- Sources: title, publisher, edition, grade and subject.
- Tasks: every field, including answer specs, hints, translations and
  images.
- Missions: topic, position, task list and task order.

Edits SHALL obey the same validation and publishing rules as creation. A
refused edit SHALL leave the stored item unchanged. A source's grade SHALL
NOT change while any task references the source (derived decision CA-D16).
A source's PDF file SHALL NOT be replaceable (derived decision CA-D3, which
narrows FR-55). To use a new file, the admin uploads a new source.

#### Scenario: Edit every task field

- **GIVEN** a `DRAFT` task with one part, one hint, a `uk` prompt and one image
- **WHEN** the admin changes its prompt, adds a part, rewrites the hint, edits the `uk` prompt and replaces the image
- **THEN** the preview shows all the changes

#### Scenario: Edit source metadata

- **GIVEN** a source with edition `1`
- **WHEN** the admin changes the edition to `2`
- **THEN** every task from that source shows edition `2` in its provenance

#### Scenario: Invalid source edit

- **GIVEN** a stored source
- **WHEN** the admin clears its title, or sets its subject to `physics`
- **THEN** the save is refused with an inline message on that field, and the stored source is unchanged

#### Scenario: Source grade locked while referenced

- **GIVEN** a grade-6 source referenced by one task, and a configuration that also allows grade 7
- **WHEN** the admin changes the source's grade to 7
- **THEN** the save is refused with a message that 1 task references the source, and the source stays grade 6

#### Scenario: Source file cannot be replaced

- **GIVEN** a stored source
- **WHEN** the admin opens its edit form, and when an API request tries to send a new file for that existing source
- **THEN** the form offers no file field, and the request is refused with HTTP 400, 405 or 415 while the stored file stays byte-identical

#### Scenario: Invalid edit is refused

- **GIVEN** a stored task
- **WHEN** the admin edits its difficulty to `0`
- **THEN** the save is refused and the stored task is unchanged

#### Scenario: Reorder a mission

- **GIVEN** a mission with tasks T1, T2, T3
- **WHEN** the admin moves T3 to the first place and saves
- **THEN** the mission lists T3, T1, T2

### Requirement: Editing an answer spec after attempts

Editing an answer spec of an already attempted task SHALL be allowed and SHALL
apply to future checks only. Verdicts already recorded SHALL stay as they
are until the admin re-evaluates them from the flag queue. Re-evaluation
only ever adds XP (decision OQ-20; see progress-stats and gamification).

#### Scenario: Fix an answer key after attempts

- **GIVEN** a published task with a recorded `WRONG` attempt for input `24`
- **WHEN** the admin changes the expected value from `25` to `24`
- **THEN** the next check of `24` is `CORRECT`, and the earlier attempt still shows `WRONG`

### Requirement: Delete only unused content

The admin SHALL be able to delete a source, task or mission only when no
attempt references it, directly or through its tasks. Otherwise the delete
SHALL be refused with a message offering to unpublish instead (FR-56).

Further delete rules derived from other requirements:

- A source SHALL NOT be deletable while any task references it (derived
  decision CA-D4, which narrows FR-56).
- A problem report or an opened-hint record SHALL block deletion of its
  task, and of any mission containing that task, as an attempt does
  (derived decision CA-D22, which narrows FR-56; pending approval at
  checkpoint 2, `docs/requirements.md` §6.7).
- A task in a published mission SHALL NOT be deletable (derived decision
  CA-D6).
- Deleting a source SHALL remove its file from the storage volume (derived
  decision CA-D5).

Deleting a mission SHALL never delete its tasks. Deleting a task SHALL
remove it from the draft missions that contain it.

#### Scenario: Delete an unused draft task

- **GIVEN** a draft task that was never attempted and belongs to one draft mission
- **WHEN** the admin deletes it
- **THEN** the task no longer exists and the draft mission no longer lists it

#### Scenario: Task with attempts cannot be deleted

- **GIVEN** a task with at least one recorded attempt
- **WHEN** the admin deletes it
- **THEN** the delete is refused with a message offering to unpublish instead, and the task is unchanged

#### Scenario: Reported or hinted task cannot be deleted

- **GIVEN** a task in an unpublished mission with no attempt, but with one problem report, and another such task with one opened hint and no attempt
- **WHEN** the admin deletes either task
- **THEN** the delete is refused with a message offering to unpublish instead, and the task, the report and the hint record are unchanged

#### Scenario: Task in a published mission cannot be deleted

- **GIVEN** a `PUBLISHED` task that was never attempted and belongs to the published mission M
- **WHEN** the admin deletes the task
- **THEN** the delete is refused with a message naming M to unpublish first, and the task and M's task list are unchanged

#### Scenario: Mission with attempted tasks cannot be deleted

- **GIVEN** a mission one of whose tasks has a recorded attempt
- **WHEN** the admin deletes the mission
- **THEN** the delete is refused with a message offering to unpublish instead

#### Scenario: Delete an unused mission keeps its tasks

- **GIVEN** a draft mission whose tasks were never attempted
- **WHEN** the admin deletes the mission
- **THEN** the mission no longer exists and all its tasks still exist

#### Scenario: Source with tasks cannot be deleted

- **GIVEN** a source referenced by 3 tasks, none attempted
- **WHEN** the admin deletes the source
- **THEN** the delete is refused with a message that 3 tasks reference it

#### Scenario: Delete an unused source

- **GIVEN** a source that no task references
- **WHEN** the admin deletes it
- **THEN** it disappears from the source list and its PDF is removed from the storage volume

### Requirement: Topics come from configuration

Topics SHALL come from a seeded configuration list, per grade, aligned to
the grade-6 thematic areas of the Czech curriculum (RVP ZV), not to workbook
chapters. The workbook location is carried by the source reference
(decisions OQ-2, OQ-21). MVP SHALL offer no admin UI or API for creating,
renaming or deleting topics.

#### Scenario: Topic choices

- **GIVEN** the seeded topic list for grade 6
- **WHEN** the admin opens the topic field of a grade-6 task
- **THEN** it offers exactly the seeded topics for grade 6

#### Scenario: Unknown topic is refused

- **GIVEN** the seeded topic list
- **WHEN** a task is saved with a topic id that is not seeded
- **THEN** the save is refused and nothing is stored

### Requirement: No workbook content in repositories

No workbook content (text, images, answer keys or PDFs) SHALL be committed
to any repository. Test fixtures and demo content for authoring SHALL be
self-authored (NFR-4). The pre-commit hook SHALL refuse PDFs and
runtime-data paths. The backend and frontend repositories SHALL each carry a
fixture provenance manifest, and an executable check SHALL verify it
(derived decision CA-D21). The manifest lists every fixture file with its
author and the origin `self-authored`. The check exits non-zero for any
fixture file that is missing from the manifest or has another origin.

#### Scenario: Committing a PDF is refused

- **GIVEN** a PDF file staged in any of the three repositories
- **WHEN** `git commit` runs
- **THEN** the pre-commit hook refuses the commit and names the file

#### Scenario: Every fixture has a self-authored provenance entry

- **GIVEN** the authoring test fixtures in the backend or frontend repository
- **WHEN** that repository's fixture provenance check runs
- **THEN** it exits 0 only if every fixture file is listed in the manifest with origin `self-authored` and a named author

#### Scenario: Unlisted fixture fails the check

- **GIVEN** a new fixture file added without a manifest entry
- **WHEN** the fixture provenance check runs
- **THEN** it exits non-zero and names the unlisted file

## Explicit exclusions (MVP)

- `GRAPHIC` tasks are stored and listed for the admin but never served to
  the child. There is no graphic answer input, and a `GRAPHIC` task may have
  no answer parts (CA-D13).
- A source's PDF file cannot be replaced; to use a new file, upload a new
  source (CA-D3).
- Missions have no name; they are identified by topic and position (CA-D17).
- No automatic PDF text or image extraction, and no AI drafting of tasks,
  hints or translations.
- No in-app image cropping; images are cropped outside the app.
- No topic editor (UI or API), no content import or export, and no bulk
  operation other than bulk publish (OQ-32).
- Difficulty is stored only; it does not affect selection, XP or display.
- The source reference is never shown to the child.
- No task locales other than `uk`, no grade other than `6` and no subject
  other than `math` are configured in MVP.
- No workbook content (text, images, answer keys, PDFs) in any repository
  or test fixture (NFR-4).
