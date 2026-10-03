# Answer Checking Specification

## Purpose

The deterministic checker decides whether the child's answer to each answer
part is correct. Given a part's answer spec and the raw input, it returns a
per-part verdict (`CORRECT`, `WRONG` or `UNPARSEABLE`) and the normalized
interpretation of the input. It is pure: the same spec and input always give
the same result, and checking never changes stored data. MVP has no AI
checking of any kind.

## Requirements

### Requirement: Verdicts and normalized interpretation

The checker SHALL return, for every answer part, exactly one verdict from
`CORRECT`, `WRONG`, `UNPARSEABLE`, together with the normalized
interpretation of the raw input (for example `1 000` → `1000`). The same
answer spec and raw input SHALL always produce the same verdict and
normalized value. This contract is what the answer tester (content
authoring) and the attempt flow (practice flow) consume.

#### Scenario: Deterministic result

- **GIVEN** an INTEGER part whose expected value is `1000`
- **WHEN** the input `1 000` is checked twice
- **THEN** both results are `CORRECT` with normalized value `1000`

#### Scenario: Wrong but readable input

- **GIVEN** an INTEGER part whose expected value is `42`
- **WHEN** the input `41` is checked
- **THEN** the verdict is `WRONG` and the normalized value is `41`

### Requirement: Integer input

For INTEGER parts the checker SHALL ignore leading and trailing whitespace,
a leading `+`, and thousands separators written as a space, a no-break space
(U+00A0) or a thin space (U+2009) (FR-14).

#### Scenario: Separators and sign are ignored

- **GIVEN** an INTEGER part whose expected value is `12500`
- **WHEN** any of the inputs `12500`, ` 12500 `, `+12500`, `12 500`, `12 500`, `12 500` is checked
- **THEN** the verdict is `CORRECT` with normalized value `12500`

#### Scenario: Negative integers

- **GIVEN** an INTEGER part whose expected value is `-7`
- **WHEN** the input `-7` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Letters are unparseable

- **GIVEN** an INTEGER part
- **WHEN** the input `12a` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Decimal input

For DECIMAL parts the checker SHALL treat a decimal comma and a decimal dot
as equivalent and compare numerically, so trailing zeros and a missing
leading zero do not matter (FR-15). When the part requires an exact form
(for example "round to 2 decimal places"), the input SHALL also have exactly
the required number of decimal places.

#### Scenario: Comma, dot and trailing zeros are equivalent

- **GIVEN** a DECIMAL part whose expected value is `0.5` with no exact-form rule
- **WHEN** any of the inputs `0,5`, `0.5`, `0,50`, `,5`, `.5` is checked
- **THEN** the verdict is `CORRECT` with normalized value `0.5`

#### Scenario: Exact form required

- **GIVEN** a DECIMAL part whose expected value is `0.5` and that requires exactly 2 decimal places
- **WHEN** the input `0,50` is checked
- **THEN** the verdict is `CORRECT`
- **WHEN** the input `0,5` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Thousands separators in decimals

- **GIVEN** a DECIMAL part whose expected value is `1250.75`
- **WHEN** the input `1 250,75` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Malformed decimal is unparseable

- **GIVEN** a DECIMAL part
- **WHEN** any of the inputs `5,,2`, `5,2,1`, `5.2.1`, `,` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Fraction input

For FRACTION parts the checker SHALL accept `a/b` input and mixed numbers
written as `w a/b` (FR-16). When the part allows equivalent forms, any
input with the same value SHALL be correct, including an equivalent fraction
or a decimal. When the part sets `requireLowestTerms`, a fraction that is
not in lowest terms SHALL be `WRONG`.

#### Scenario: Equivalent forms allowed

- **GIVEN** a FRACTION part whose expected value is `1/2` and that allows equivalent forms
- **WHEN** any of the inputs `1/2`, `2/4`, `0,5`, `0.5` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Lowest terms required

- **GIVEN** a FRACTION part whose expected value is `1/2` with `requireLowestTerms`
- **WHEN** the input `2/4` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Mixed number

- **GIVEN** a FRACTION part whose expected value is `3/2` and that allows equivalent forms
- **WHEN** the input `1 1/2` is checked
- **THEN** the verdict is `CORRECT` with normalized value `3/2`

#### Scenario: Zero denominator is unparseable

- **GIVEN** a FRACTION part
- **WHEN** the input `3/0` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Numbers with units

For NUMBER_WITH_UNIT parts the checker SHALL normalize the unit so that
`cm2`, `cm²` and `cm^2` are the same unit and spacing between number and
unit is ignored (FR-17). A per-part flag SHALL decide whether the unit is
required. The checker SHALL NOT convert between units: a value in a
different unit is `WRONG` even when it is physically equal.

#### Scenario: Unit spellings are equivalent

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** any of the inputs `24 cm2`, `24cm²`, `24 cm^2`, `24 cm²` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Required unit missing

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** the input `24` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Optional unit omitted

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit optional
- **WHEN** the input `24` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: No unit conversion

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `2 dm²`
- **WHEN** the input `200 cm²` is checked
- **THEN** the verdict is `WRONG`

### Requirement: Multiple choice

For CHOICE_SINGLE parts the checker SHALL accept exactly one selected
option. For CHOICE_MULTI parts the answer SHALL be correct only when the
set of selected options equals the expected set exactly; order does not
matter (FR-18).

#### Scenario: Single choice

- **GIVEN** a CHOICE_SINGLE part whose correct option is `B`
- **WHEN** option `B` is submitted
- **THEN** the verdict is `CORRECT`
- **WHEN** option `C` is submitted
- **THEN** the verdict is `WRONG`

#### Scenario: Multi-select needs the exact set

- **GIVEN** a CHOICE_MULTI part whose correct options are `A` and `C`
- **WHEN** the selection `{C, A}` is submitted
- **THEN** the verdict is `CORRECT`
- **WHEN** the selection `{A}` or `{A, B, C}` is submitted
- **THEN** the verdict is `WRONG`

#### Scenario: Unknown option is unparseable

- **GIVEN** a CHOICE_SINGLE part with options `A`–`D`
- **WHEN** the option `E` is submitted
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Short text

For TEXT parts the checker SHALL compare case-insensitively after trimming
whitespace at both ends and collapsing inner runs of whitespace to one space
(FR-19). By default the comparison SHALL also ignore diacritics; a per-part
option SHALL make it diacritics-strict.

#### Scenario: Default comparison

- **GIVEN** a TEXT part whose expected answer is `Žirafa` with default options
- **WHEN** any of the inputs `žirafa`, ` ZIRAFA `, `zirafa` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Diacritics-strict part

- **GIVEN** a TEXT part whose expected answer is `Žirafa` and that is diacritics-strict
- **WHEN** the input `zirafa` is checked
- **THEN** the verdict is `WRONG`
- **WHEN** the input `ŽIRAFA` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Empty text

- **GIVEN** a TEXT part
- **WHEN** the input is empty or only whitespace
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Accepted alternatives

An answer part SHALL be able to list several accepted answers; input that
matches any one of them under that part's rules SHALL be `CORRECT` (FR-20).

#### Scenario: Any alternative matches

- **GIVEN** a TEXT part whose accepted answers are `pravý úhel` and `pravý`
- **WHEN** the input `prava` is checked
- **THEN** the verdict is `WRONG`
- **WHEN** the input `pravy` is checked
- **THEN** the verdict is `CORRECT`

### Requirement: Numeric tolerance

A numeric part (INTEGER, DECIMAL, FRACTION, NUMBER_WITH_UNIT) SHALL accept an
optional absolute tolerance; when none is set, comparison SHALL be exact
(FR-21). A value within the tolerance, boundaries included, is `CORRECT`.

#### Scenario: Exact by default

- **GIVEN** a DECIMAL part whose expected value is `3.14` with no tolerance
- **WHEN** the input `3,141` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Within tolerance

- **GIVEN** a DECIMAL part whose expected value is `3.14` with tolerance `0.01`
- **WHEN** the inputs `3,13`, `3,15` and `3,145` are checked
- **THEN** each verdict is `CORRECT`
- **WHEN** the input `3,16` is checked
- **THEN** the verdict is `WRONG`

### Requirement: Unparseable input never costs an attempt

When any part of a submission is `UNPARSEABLE`, the response SHALL carry a
friendly Czech format message for that part, and the submission SHALL NOT
consume an attempt (FR-22). The whole submission is refused, even if other
parts parse; nothing is stored as an attempt (decision OQ-12).

#### Scenario: Format tip instead of a lost attempt

- **GIVEN** a task with one DECIMAL part and 2 attempts left
- **WHEN** the child submits `5,,2`
- **THEN** the part shows a format tip (for example "Tohle číslo neumím přečíst. Zkus třeba 5,2.")
- **AND** the child still has 2 attempts left
- **AND** no attempt is recorded

#### Scenario: One unparseable part refuses the whole submission

- **GIVEN** a task with parts a (INTEGER) and b (DECIMAL) and 2 attempts left
- **WHEN** the child submits a = `12` and b = `3,,4`
- **THEN** no part is graded, part b shows a format tip, and the child still has 2 attempts left

### Requirement: Golden table

The checker's behavior SHALL be pinned by a versioned golden table of at
least 150 input → verdict cases kept in the backend repository, covering
every answer type and every rule in this specification, including the
unparseable cases (FR-23). All cases are self-authored (NFR-4).

#### Scenario: Golden table size and coverage

- **WHEN** the backend test suite runs
- **THEN** it executes at least 150 golden cases, at least one per requirement in this specification, and every case passes

## Explicit exclusions (MVP)

- No unit conversion (FR-17), no algebraic expressions, no answers with
  more than one number in a single part.
- No AI or fuzzy matching of any kind; `GRAPHIC` answers are never checked
  (they are never served).
- The checker does not know about attempts, XP or hints; those belong to
  the practice flow and gamification capabilities.
