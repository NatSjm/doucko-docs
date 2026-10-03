# Answer Checking Specification

## Purpose

The deterministic checker decides whether the child's answer to each answer
part is correct. Given a part's answer spec and the raw input, it returns a
per-part verdict (`CORRECT`, `WRONG` or `UNPARSEABLE`), the normalized
interpretation of the input and, for unreadable input, a Czech format tip.
The checker itself is a pure function: it knows nothing about attempts, XP or
stored data, and MVP has no AI or fuzzy checking of any kind. This capability
also owns one rule of the child submission endpoint, the refusal of
unreadable submissions (FR-22, decision OQ-12). That rule is stated as an
endpoint requirement, separate from the pure checker; everything else about
attempts belongs to practice-flow.

Notation: in scenarios, `<U+XXXX>` stands for that single Unicode character
(for example `<U+00A0>` is a no-break space), and inputs are listed in
backticks without quotes. Rules marked *(spec decision)* go beyond the
literal FR text. They are binding interpretations made here so that every
verdict can be decided.

## Requirements

### Requirement: Verdicts and normalized interpretation

The checker SHALL return, for every answer part, exactly one verdict from
`CORRECT`, `WRONG`, `UNPARSEABLE`, together with the normalized
interpretation of the raw input (for example `1 000` → `1000`), or no
normalized value when the verdict is `UNPARSEABLE`. The same answer spec and
raw input SHALL always produce the same verdict, normalized value and format
tip. Input that the rules of the part's type can read SHALL be `CORRECT` or
`WRONG`, never `UNPARSEABLE`. `UNPARSEABLE` is reserved for input that those
rules cannot read (FR-14, FR-15, FR-16, FR-17, FR-18, FR-19). Normalized
numbers SHALL be written with a dot as the decimal separator, with no
grouping separators, no leading `+`, no trailing fractional zeros, and `-`
for negative values.

#### Scenario: Deterministic result

- **GIVEN** an INTEGER part whose expected value is `1000`
- **WHEN** the input `1 000` is checked twice
- **THEN** both results are `CORRECT` with normalized value `1000`

#### Scenario: Wrong but readable input

- **GIVEN** an INTEGER part whose expected value is `42`
- **WHEN** the input `41` is checked
- **THEN** the verdict is `WRONG` and the normalized value is `41`

### Requirement: Numeric notation

Every number the checker reads (INTEGER and DECIMAL inputs, the number in a
NUMBER_WITH_UNIT input, and the decimal or whole-number form in a FRACTION
input) SHALL follow one notation (FR-14, FR-15):

- Leading and trailing whitespace is ignored.
- An optional single sign stands directly before the first digit or the
  decimal separator, with no space after it. `+` is ignored. A hyphen-minus
  `-` (U+002D), a minus sign `−` (U+2212) and an en dash `–` (U+2013) all
  mean minus *(spec decision)*. Any other sign character (for example an em
  dash U+2014), two signs, a sign followed by a space, or a trailing sign
  makes the input `UNPARSEABLE`.
- Digits are ASCII `0`–`9` only.
- The integer digits are written either without separators or in groups:
  the first group has 1 to 3 digits, each further group has exactly 3 digits,
  and exactly one separator character stands between two groups. Allowed
  separator characters are a space (U+0020), a no-break space (U+00A0) and a
  thin space (U+2009), in any mix. Any other grouping, such as `1 2 3`,
  `12 50`, `1 0000` or two spaces in a row, makes the input `UNPARSEABLE`
  *(spec decision)*.
- An optional decimal separator, `,` or `.`, is followed by one or more
  digits with no separators. Integer digits may be omitted before it (`,5`).
  A separator with no digits after it (`5,`) is `UNPARSEABLE` *(spec
  decision)*.
- Leading zeros do not change the value. Zero of either sign is the value
  `0`, normalized as `0`.

#### Scenario: Correct digit grouping is accepted

- **GIVEN** an INTEGER part whose expected value is `1000000`
- **WHEN** any of the inputs `1000000`, `1 000 000`, `1<U+00A0>000<U+2009>000` is checked
- **THEN** the verdict is `CORRECT` with normalized value `1000000`

#### Scenario: Irregular digit grouping is unparseable

- **GIVEN** INTEGER parts whose expected values are `123`, `1250` and `10000`
- **WHEN** the input `1 2 3` is checked against the first, `12 50` against the second, and `1 0000` or `10  000` (two spaces) against the third
- **THEN** each verdict is `UNPARSEABLE`

#### Scenario: No separators in fractional digits

- **GIVEN** a DECIMAL part
- **WHEN** the input `0,123 456` is checked
- **THEN** the verdict is `UNPARSEABLE`

#### Scenario: Minus sign variants

- **GIVEN** a DECIMAL part whose expected value is `-0.5`
- **WHEN** any of the inputs `-0,5`, `<U+2212>0,5`, `<U+2013>0,5`, `-,5`, `-0.50` is checked
- **THEN** the verdict is `CORRECT` with normalized value `-0.5`

#### Scenario: Plus sign with a missing leading zero

- **GIVEN** a DECIMAL part whose expected value is `0.5`
- **WHEN** the input `+,5` is checked
- **THEN** the verdict is `CORRECT` with normalized value `0.5`

#### Scenario: Negative zero is zero

- **GIVEN** an INTEGER part whose expected value is `0`
- **WHEN** any of the inputs `-0`, `+0`, `0`, `-0,0` is checked
- **THEN** the verdict is `CORRECT` with normalized value `0`

#### Scenario: Malformed signs are unparseable

- **GIVEN** an INTEGER part
- **WHEN** any of the inputs `--5`, `+-5`, `- 5`, `5-`, `<U+2014>5` is checked
- **THEN** the verdict is `UNPARSEABLE`

#### Scenario: Trailing decimal separator is unparseable

- **GIVEN** a DECIMAL part
- **WHEN** the input `5,` or `5.` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Input length and exact arithmetic

The checker SHALL treat any free-text input (every type except CHOICE_SINGLE
and CHOICE_MULTI) that is longer than 100 Unicode code points after trimming
leading and trailing whitespace as `UNPARSEABLE`, with a format tip and no
normalized value *(spec decision)*. Within that limit the checker SHALL
compare numbers with exact decimal and rational arithmetic. It SHALL NOT use
binary floating point, and SHALL NOT limit values to 64-bit integer or
double range. A number is equal to the expected value only when it is
mathematically equal, and tolerance boundaries are computed exactly (FR-14,
FR-15, FR-16, FR-21).

#### Scenario: Very long text answer

- **GIVEN** a TEXT part
- **WHEN** an input of 10,000 letters `a` is checked
- **THEN** the verdict is `UNPARSEABLE` with a format tip and no normalized value

#### Scenario: Very long number

- **GIVEN** an INTEGER part whose expected value is `1`
- **WHEN** an input of 500 digits `9` is checked
- **THEN** the verdict is `UNPARSEABLE` with a format tip and no normalized value

#### Scenario: Length limit boundary

- **GIVEN** an INTEGER part whose expected value is `1`
- **WHEN** an input of `1` followed by 99 zeros (100 code points) is checked, and then an input of `1` followed by 100 zeros (101 code points)
- **THEN** the first verdict is `WRONG` with normalized value equal to that 100-digit number, and the second is `UNPARSEABLE`

#### Scenario: Numbers beyond 64-bit range are compared exactly

- **GIVEN** an INTEGER part whose expected value is `99999999999999999999`
- **WHEN** the inputs `99 999 999 999 999 999 999` and `100000000000000000000` are checked
- **THEN** the first verdict is `CORRECT` and the second is `WRONG` with normalized value `100000000000000000000`

#### Scenario: No floating-point rounding

- **GIVEN** a DECIMAL part whose expected value is `0.1` with no tolerance
- **WHEN** the input `0,10000000000000000000000001` is checked
- **THEN** the verdict is `WRONG`

### Requirement: Integer input

For INTEGER parts the checker SHALL read the input with the numeric notation
rules. Leading and trailing whitespace, a leading `+` and space, no-break
space or thin space thousands separators are ignored (FR-14). A readable
number with a fractional part SHALL be compared numerically. It is `WRONG`
when it differs from the expected value and `CORRECT` when it is equal, never
`UNPARSEABLE` *(spec decision)*. A dot is always a decimal separator, so
`12.500` means 12.5. Fraction notation (`24/2`) and any other character SHALL
make the input `UNPARSEABLE`.

#### Scenario: Separators and sign are ignored

- **GIVEN** an INTEGER part whose expected value is `12500`
- **WHEN** any of the inputs `12500`, `  12500  `, `+12500`, `12 500` (U+0020), `12<U+00A0>500`, `12<U+2009>500` is checked
- **THEN** the verdict is `CORRECT` with normalized value `12500`

#### Scenario: Negative integers

- **GIVEN** an INTEGER part whose expected value is `-7`
- **WHEN** the input `-7` or `<U+2212>7` is checked
- **THEN** the verdict is `CORRECT` with normalized value `-7`

#### Scenario: Readable non-integer is wrong, not unparseable

- **GIVEN** an INTEGER part whose expected value is `12`
- **WHEN** the input `12,5` is checked
- **THEN** the verdict is `WRONG` with normalized value `12.5`

#### Scenario: Integer written with a zero fraction

- **GIVEN** an INTEGER part whose expected value is `12`
- **WHEN** the input `12,0` is checked
- **THEN** the verdict is `CORRECT` with normalized value `12`

#### Scenario: Dot is never a thousands separator

- **GIVEN** an INTEGER part whose expected value is `12500`
- **WHEN** the input `12.500` is checked
- **THEN** the verdict is `WRONG` with normalized value `12.5`

#### Scenario: Malformed integer is unparseable

- **GIVEN** an INTEGER part
- **WHEN** any of the inputs `12a`, `++5`, `5-`, `abc`, `24/2` is checked
- **THEN** the verdict is `UNPARSEABLE` and no normalized value is returned

#### Scenario: Empty numeric input is unparseable

- **GIVEN** an INTEGER part
- **WHEN** the input is empty or contains only whitespace
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Decimal input

For DECIMAL parts the checker SHALL treat a decimal comma and a decimal dot
as equivalent and compare numerically, so trailing zeros and a missing
leading zero do not matter (FR-15). Thousands separators follow the numeric
notation rules, and a dot or comma is never a thousands separator. When the
part requires an exact form (`exactDecimals`, for example "round to 2
decimal places"), the input SHALL also have exactly that many digits after
the decimal separator, otherwise the verdict is `WRONG`. Input without a
separator has 0 decimal places. Fraction notation SHALL make a DECIMAL input
`UNPARSEABLE`.

#### Scenario: Comma, dot and trailing zeros are equivalent

- **GIVEN** a DECIMAL part whose expected value is `0.5` with no exact-form rule
- **WHEN** any of the inputs `0,5`, `0.5`, `0,50`, `,5`, `.5` is checked
- **THEN** the verdict is `CORRECT` with normalized value `0.5`

#### Scenario: Exact form satisfied

- **GIVEN** a DECIMAL part whose expected value is `0.5` and that requires exactly 2 decimal places
- **WHEN** the input `0,50` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Exact form violated

- **GIVEN** a DECIMAL part whose expected value is `0.5` and that requires exactly 2 decimal places
- **WHEN** the input `0,5` or `0,500` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Locale thousands separators in decimals

- **GIVEN** a DECIMAL part whose expected value is `1250.75`
- **WHEN** any of the inputs `1 250,75`, `1<U+00A0>250,75`, `1<U+2009>250.75`, `1250.75` is checked
- **THEN** the verdict is `CORRECT` with normalized value `1250.75`

#### Scenario: Malformed decimal is unparseable

- **GIVEN** a DECIMAL part
- **WHEN** any of the inputs `5,,2`, `5,2,1`, `5.2.1`, `1.250,75`, `,`, `0, 5`, `1/2` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Fraction input

For FRACTION parts the checker SHALL accept three notations (FR-16):

- a plain fraction `N/D`,
- a mixed number `W N/D`,
- a number in the numeric notation (integer or decimal).

Spaces, no-break spaces and thin spaces around the slash are ignored. A
numerator or denominator is ASCII digits only, with no grouping separator,
decimal separator or sign *(spec decision)*. The denominator SHALL be at
least 1. An optional sign stands before the whole input and applies to the
whole value (`-1 1/2` = −3/2). A sign after the slash is `UNPARSEABLE`. In a
mixed number, the whole part `W` follows the integer notation (grouping
allowed) and is followed by one or more space-like characters. The fraction
part is the digits directly before the slash, so `12 500/3` reads as whole
part `12` with fraction `500/3`, and `1 000 1/2` reads as `1000 1/2`. The
fraction part of a mixed number SHALL be proper (1 ≤ N < D), otherwise the
input is `UNPARSEABLE` *(spec decision)*. The normalized value of a fraction
or mixed number is the improper fraction with the input's terms (`2/4` →
`2/4`, `1 1/2` → `3/2`). The normalized value of a decimal is the decimal.

When the part allows equivalent forms (`allowEquivalent`, the default), any
input with the same value SHALL be `CORRECT`. When the part also sets
`requireLowestTerms`, a fraction or mixed number whose N and D share a
common factor SHALL be `WRONG`, while decimal input is judged only by value
*(spec decision)*. When the part does not allow equivalent forms, the input
SHALL be `CORRECT` only when it is written in the same notation with the
same numbers and sign as an accepted answer. A mixed number then matches
only a mixed number with the same W, N and D, and a plain fraction matches
only the same N and D *(spec decision)*.

#### Scenario: Equivalent forms allowed

- **GIVEN** a FRACTION part whose expected value is `1/2` and that allows equivalent forms
- **WHEN** any of the inputs `1/2`, `1 / 2`, `1<U+00A0>/<U+00A0>2`, `2/4`, `0,5`, `0.5` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Equivalent forms not allowed

- **GIVEN** a FRACTION part whose expected value is `1/2` and that does not allow equivalent forms
- **WHEN** the input `0,5` or `2/4` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Mixed number against an improper fraction when equivalents are not allowed

- **GIVEN** a FRACTION part whose accepted answer is `3/2` and that does not allow equivalent forms
- **WHEN** the input `1 1/2` is checked
- **THEN** the verdict is `WRONG` with normalized value `3/2`

#### Scenario: Mixed number required in the same form

- **GIVEN** a FRACTION part whose accepted answer is `1 1/2` and that does not allow equivalent forms
- **WHEN** the inputs `1 1/2` and `3/2` are checked
- **THEN** the first verdict is `CORRECT` and the second is `WRONG`

#### Scenario: Lowest terms required

- **GIVEN** a FRACTION part whose expected value is `1/2`, that allows equivalent forms and sets `requireLowestTerms`
- **WHEN** the inputs `2/4`, `1/2` and `0,5` are checked
- **THEN** `2/4` is `WRONG`, and `1/2` and `0,5` are `CORRECT`

#### Scenario: Mixed number

- **GIVEN** a FRACTION part whose expected value is `3/2` and that allows equivalent forms
- **WHEN** the input `1 1/2` or `1 1 / 2` is checked
- **THEN** the verdict is `CORRECT` with normalized value `3/2`

#### Scenario: Grouped whole part in a mixed number

- **GIVEN** a FRACTION part whose expected value is `2001/2` and that allows equivalent forms
- **WHEN** the input `1 000 1/2` is checked
- **THEN** the verdict is `CORRECT` with normalized value `2001/2`

#### Scenario: Ambiguous mixed number is unparseable

- **GIVEN** a FRACTION part
- **WHEN** the input `12 500/3` or `1 3/2` is checked
- **THEN** the verdict is `UNPARSEABLE`, because the fraction part of a mixed number is not proper

#### Scenario: Negative fractions

- **GIVEN** a FRACTION part whose expected value is `-1/2` and that allows equivalent forms
- **WHEN** any of the inputs `-1/2`, `<U+2212>1/2`, `-2/4`, `-0,5` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Negative mixed number

- **GIVEN** a FRACTION part whose expected value is `-3/2` and that allows equivalent forms
- **WHEN** the input `-1 1/2` is checked
- **THEN** the verdict is `CORRECT` with normalized value `-3/2`

#### Scenario: Malformed fraction is unparseable

- **GIVEN** a FRACTION part
- **WHEN** any of the inputs `3/0`, `1//2`, `1/`, `/2`, `1/2/3`, `1/-2`, `1,5/2`, `1 000/3` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Numbers with units

For NUMBER_WITH_UNIT parts the input SHALL be a number in the numeric
notation (fraction notation is `UNPARSEABLE`), optional whitespace, and
then an optional unit (FR-17). The unit SHALL start with a letter or `°` and
SHALL contain no whitespace. A remainder that does not start with a letter
or `°`, or that contains whitespace, makes the input `UNPARSEABLE` *(spec
decision)*. Units SHALL be compared after this normalization:

- Letter case is ignored *(spec decision)*, so `CM2`, `cm2` and `Cm²` are
  the same unit and `ml`, `mL` and `ML` are the same unit.
- An exponent at the end of the unit is the same whether written as a
  superscript digit (`²`, `³`, …, `⁹`), as `^n`, or as a plain digit
  directly after a letter. So `cm2` = `cm²` = `cm^2` and `m3` = `m³` = `m^3`.

The unit is compared as a normalized string with the part's unit; there is
no unit registry. A readable number with any other unit, including
unrecognized text (`24 xyz`) or a different exponent (`cm³` when `cm²` is
asked for), SHALL be `WRONG`. A per-part flag decides whether the unit is
required. When the unit is optional and omitted, only the number is
compared. When a unit is given it SHALL match. The checker SHALL NOT convert
between units: a value in a different unit is `WRONG` even when it is
physically equal. The normalized value is the normalized number, a space,
and the part's unit spelling when the unit matches, or otherwise the input's
unit with its exponent written as a superscript.

#### Scenario: Unit spellings are equivalent

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** any of the inputs `24 cm2`, `24cm²`, `24 cm^2`, `24<U+00A0>cm²`, `24 CM2` is checked
- **THEN** the verdict is `CORRECT` with normalized value `24 cm²`

#### Scenario: Unit case is ignored

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `250 ml`
- **WHEN** the input `250 mL` or `250 ML` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Unknown or different unit is wrong

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** the inputs `24 xyz`, `24 cm³` and `24 cm` are checked
- **THEN** each verdict is `WRONG`, with normalized values `24 xyz`, `24 cm³` and `24 cm`

#### Scenario: Required unit missing

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** the input `24` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Optional unit omitted

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit optional
- **WHEN** the input `24` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Optional unit given but different

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit optional
- **WHEN** the input `24 mm²` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: No unit conversion

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `2 dm²`
- **WHEN** the input `200 cm²` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Decimal comma and negative number with a unit

- **GIVEN** NUMBER_WITH_UNIT parts whose expected answers are `2.5 m` and `-5 °C`
- **WHEN** the input `2,5 m` is checked against the first and `<U+2212>5 °C` against the second
- **THEN** both verdicts are `CORRECT`

#### Scenario: Malformed unit input is unparseable

- **GIVEN** a NUMBER_WITH_UNIT part
- **WHEN** any of the inputs `cm²`, `5,,2 cm`, `24 cm 2`, `24 2cm`, `1/2 m` is checked
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Multiple choice

For CHOICE_SINGLE and CHOICE_MULTI parts the input SHALL be a selection of
option keys. A key matches an option only when it is exactly equal to one of
the part's option keys, including case. Repeated keys in a selection collapse
to one, so `{A, A, C}` is the selection `{A, C}` *(spec decision)*. A
selection that is empty or contains a key the part does not offer SHALL be
`UNPARSEABLE` *(spec decision)*. For CHOICE_SINGLE, a selection of more than
one distinct key SHALL be `UNPARSEABLE` *(spec decision)*. Otherwise the
selection is `CORRECT` when its key is one of the accepted keys and `WRONG`
when it is not. For CHOICE_MULTI the selection SHALL be `CORRECT` only when
its set of distinct keys equals the accepted set exactly, regardless of order
(FR-18). The normalized value lists the distinct selected keys in the
part's option display order, separated by `,` (for example `A,C`).

#### Scenario: Single choice correct

- **GIVEN** a CHOICE_SINGLE part whose correct option is `B`
- **WHEN** option `B` is submitted
- **THEN** the verdict is `CORRECT` with normalized value `B`

#### Scenario: Single choice wrong

- **GIVEN** a CHOICE_SINGLE part whose correct option is `B`
- **WHEN** option `C` is submitted
- **THEN** the verdict is `WRONG`

#### Scenario: Single choice with several options selected

- **GIVEN** a CHOICE_SINGLE part with options `A`–`D` whose correct option is `B`
- **WHEN** the selection `{B, C}` is submitted
- **THEN** the verdict is `UNPARSEABLE`

#### Scenario: Single choice with a repeated key

- **GIVEN** a CHOICE_SINGLE part with options `A`–`D` whose correct option is `B`
- **WHEN** the selection `{B, B}` is submitted
- **THEN** the verdict is `CORRECT` with normalized value `B`

#### Scenario: Empty or unknown single selection is unparseable

- **GIVEN** a CHOICE_SINGLE part with options `A`–`D`
- **WHEN** no option, the option `E` or the option `b` is submitted
- **THEN** the verdict is `UNPARSEABLE`

#### Scenario: Multi-select exact set in any order

- **GIVEN** a CHOICE_MULTI part with options `A`–`D` whose correct options are `A` and `C`
- **WHEN** the selection `{C, A}` is submitted
- **THEN** the verdict is `CORRECT` with normalized value `A,C`

#### Scenario: Multi-select with repeated keys

- **GIVEN** a CHOICE_MULTI part with options `A`–`D` whose correct options are `A` and `C`
- **WHEN** the selection `{A, A, C}` is submitted
- **THEN** the verdict is `CORRECT` with normalized value `A,C`

#### Scenario: Multi-select subset or superset is wrong

- **GIVEN** a CHOICE_MULTI part with options `A`–`D` whose correct options are `A` and `C`
- **WHEN** the selection `{A}` or `{A, B, C}` is submitted
- **THEN** the verdict is `WRONG`

#### Scenario: Empty or unknown multi selection is unparseable

- **GIVEN** a CHOICE_MULTI part with options `A`–`D` whose correct options are `A` and `C`
- **WHEN** the empty selection `{}` or the selection `{A, E}` is submitted
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Short text

For TEXT parts the checker SHALL compare after these steps (FR-19):

1. Normalize the input and the accepted answer to Unicode NFC.
2. Trim whitespace at both ends.
3. Collapse every inner run of whitespace to one space.
4. Compare case-insensitively.

By default the comparison SHALL also ignore diacritics, meaning combining
marks are removed after canonical decomposition. A per-part option SHALL
make the comparison diacritics-strict (decision OQ-8), and a
diacritics-strict part stays case-insensitive. Punctuation and all other
characters are compared as they are *(spec decision)*.

#### Scenario: Default comparison ignores case, outer whitespace and diacritics

- **GIVEN** a TEXT part whose expected answer is `Žirafa` with default options
- **WHEN** any of the inputs `žirafa`, `  ZIRAFA  `, `zirafa` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Inner whitespace is collapsed

- **GIVEN** a TEXT part whose expected answer is `pravý úhel` with default options
- **WHEN** the input `pravy   uhel` or `pravý<U+00A0>úhel` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Decomposed diacritics match on a strict part

- **GIVEN** a TEXT part whose expected answer is `Žirafa` and that is diacritics-strict
- **WHEN** the input `Z<U+030C>irafa` (Z followed by a combining caron) is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Diacritics-strict part rejects missing diacritics

- **GIVEN** a TEXT part whose expected answer is `Žirafa` and that is diacritics-strict
- **WHEN** the input `zirafa` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Diacritics-strict part is still case-insensitive

- **GIVEN** a TEXT part whose expected answer is `Žirafa` and that is diacritics-strict
- **WHEN** the input `ŽIRAFA` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Punctuation is not ignored

- **GIVEN** a TEXT part whose expected answer is `pravý` with default options
- **WHEN** the input `pravý.` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Empty text is unparseable

- **GIVEN** a TEXT part
- **WHEN** the input is empty or contains only whitespace
- **THEN** the verdict is `UNPARSEABLE`

### Requirement: Accepted alternatives

An answer part SHALL be able to list several accepted answers. Input that
matches any one of them under that part's rules, including its tolerance,
SHALL be `CORRECT`, and input that matches none of them SHALL be `WRONG`
(FR-20). For CHOICE_SINGLE every accepted key is an alternative. For
CHOICE_MULTI the accepted keys form the one expected set.

#### Scenario: Any alternative matches

- **GIVEN** a TEXT part whose accepted answers are `pravý úhel` and `pravý`
- **WHEN** the input `pravy` or `Pravý úhel` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: No alternative matches

- **GIVEN** a TEXT part whose accepted answers are `pravý úhel` and `pravý`
- **WHEN** the input `prava` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Numeric alternatives

- **GIVEN** an INTEGER part whose accepted answers are `4` and `-4`
- **WHEN** the input `-4` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Single choice with two accepted keys

- **GIVEN** a CHOICE_SINGLE part with options `A`–`D` whose accepted keys are `A` and `D`
- **WHEN** option `D` is submitted
- **THEN** the verdict is `CORRECT`

### Requirement: Numeric tolerance

A numeric part (INTEGER, DECIMAL, FRACTION, NUMBER_WITH_UNIT) SHALL accept an
optional absolute tolerance, and when none is set (or it is `0`) comparison
SHALL be exact (FR-21). The tolerance SHALL apply to every accepted
alternative: the input is `CORRECT` when the distance to at least one
accepted value is at most the tolerance, boundaries included. The distance
is computed exactly as described in "Input length and exact arithmetic". The
tolerance SHALL NOT relax any form rule:

- the unit rule;
- the `exactDecimals` rule, where the input needs the required decimal
  places AND must lie within the tolerance;
- the `requireLowestTerms` rule.

On a FRACTION part that does not allow equivalent forms, the tolerance is
ignored, because only the same notation with the same numbers is `CORRECT`
*(spec decision)*. On a FRACTION part that allows equivalent forms, the
input is compared by its exact value: fractions, mixed numbers and decimals
alike.

#### Scenario: Exact by default

- **GIVEN** a DECIMAL part whose expected value is `3.14` with no tolerance
- **WHEN** the input `3,141` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Within tolerance, boundaries included exactly

- **GIVEN** a DECIMAL part whose expected value is `3.14` with tolerance `0.01`
- **WHEN** each of the inputs `3,13`, `3,15` and `3,145` is checked
- **THEN** each verdict is `CORRECT` (`3,15` lies exactly on the boundary and is not lost to floating-point rounding)

#### Scenario: Outside tolerance

- **GIVEN** a DECIMAL part whose expected value is `3.14` with tolerance `0.01`
- **WHEN** the input `3,16` or `3,1500000001` is checked
- **THEN** the verdict is `WRONG`

#### Scenario: Tolerance applies to each alternative

- **GIVEN** a DECIMAL part whose accepted answers are `2.5` and `-2.5` with tolerance `0.1`
- **WHEN** the input `-2,45` is checked
- **THEN** the verdict is `CORRECT`

#### Scenario: Tolerance on a fraction that allows equivalent forms

- **GIVEN** a FRACTION part whose expected value is `1/3`, that allows equivalent forms, with tolerance `0.01`
- **WHEN** the inputs `0,33`, `33/100` and `0,32` are checked
- **THEN** `0,33` and `33/100` are `CORRECT` and `0,32` is `WRONG`

#### Scenario: Tolerance ignored when equivalent forms are not allowed

- **GIVEN** a FRACTION part whose expected value is `1/2`, that does not allow equivalent forms, with tolerance `0.01`
- **WHEN** the inputs `0,49`, `49/100`, `0,5` and `1/2` are checked
- **THEN** `0,49`, `49/100` and `0,5` are `WRONG` and `1/2` is `CORRECT`

#### Scenario: Tolerance does not waive the exact form

- **GIVEN** a DECIMAL part whose expected value is `3.14` with tolerance `0.01` that requires exactly 2 decimal places
- **WHEN** the inputs `3,15` and `3,140` are checked
- **THEN** `3,15` is `CORRECT` and `3,140` is `WRONG`

#### Scenario: Tolerance does not waive the unit

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `12.5 cm` with the unit required and tolerance `0.1`
- **WHEN** the input `12,5 mm` is checked
- **THEN** the verdict is `WRONG`

### Requirement: Format tip for unreadable input

For every `UNPARSEABLE` part the checker SHALL return a format tip, and for
every `CORRECT` or `WRONG` part it SHALL return no tip (FR-22). Every tip
SHALL satisfy all of these rules, which are checked mechanically:

1. It is Czech and at most 120 characters long.
2. It contains none of these forbidden words, matched as whole words,
   case-insensitively and with or without diacritics: `chyba`, `chyby`,
   `chybně`, `chybná`, `chybný`, `chybné`, `špatně`, `špatná`, `špatný`,
   `špatné`, `nesprávně`, `nesprávná`, `nesprávný`, `nesprávné`, `hloupě`,
   `hloupý`, `blbě`.
3. For INTEGER, DECIMAL, FRACTION and NUMBER_WITH_UNIT parts, it ends with
   `třeba <example>.`. When `<example>` (the text between the last
   `třeba ` and the final `.`) is checked against the same part, the verdict
   is `WRONG`. So the example is readable for the part's type (including the
   part's unit) and never reveals an accepted answer.
4. For TEXT parts it contains the word `Napiš`, and for CHOICE_SINGLE and
   CHOICE_MULTI parts it contains the word `Vyber`.

#### Scenario: Tip for an unreadable decimal

- **GIVEN** a DECIMAL part whose expected value is `3.7`
- **WHEN** the input `5,,2` is checked
- **THEN** the verdict is `UNPARSEABLE` and the tip satisfies rules 1–3, for example "Tohle číslo neumím přečíst. Zkus třeba 5,2."

#### Scenario: Tip example never reveals the answer

- **GIVEN** a DECIMAL part whose expected value is `5.2`
- **WHEN** the input `5,,2` is checked
- **THEN** the tip's example, checked against the part, is `WRONG` (so it is not `5,2`, `5.2` or `5,20`)

#### Scenario: Tip for a unit part uses the part's unit

- **GIVEN** a NUMBER_WITH_UNIT part whose expected answer is `24 cm²` with the unit required
- **WHEN** the input `24 cm 2` is checked
- **THEN** the tip ends with `třeba <example>.`, where `<example>` is a number followed by a unit that normalizes to `cm²`, and checking `<example>` against the part gives `WRONG`

#### Scenario: Tips for text and choice parts

- **GIVEN** a TEXT part and a CHOICE_SINGLE part with options `A`–`D`
- **WHEN** an empty input is checked against the TEXT part and the selection `{A, B}` against the CHOICE_SINGLE part
- **THEN** the TEXT tip contains `Napiš`, the CHOICE_SINGLE tip contains `Vyber`, and both satisfy rules 1 and 2

#### Scenario: Every golden-table tip follows the rules

- **GIVEN** the golden table
- **WHEN** every case with verdict `UNPARSEABLE` is checked
- **THEN** every returned tip satisfies rules 1–4, and no `CORRECT` or `WRONG` case returns a tip

### Requirement: Unreadable submissions are refused at the submission endpoint

This requirement covers the child submission endpoint (`POST
/api/child/missions/{missionId}/tasks/{taskId}/attempts`), not the pure
checker. When the checker returns `UNPARSEABLE` for any submitted part, the
endpoint SHALL refuse the whole submission even if other parts parse
(decision OQ-12). In that case:

- no part is graded and no attempt is consumed or stored (FR-22);
- the response is HTTP 200 with `status: UNPARSEABLE`, `attemptNo: null`,
  an unchanged `attemptsLeft`, `xpAwarded: 0` and an unchanged `taskState`;
- `parts` lists only the unreadable parts, each with verdict
  `UNPARSEABLE` and its `formatTip` *(spec decision)*.

How the task screen keeps locked parts and typed text belongs to
practice-flow. XP neutrality belongs to gamification, and the absence from
the attempt log belongs to progress-stats.

#### Scenario: Format tip instead of a lost attempt

- **GIVEN** a task with one DECIMAL part whose expected value is `3.7` and 2 attempts left
- **WHEN** the child submits `5,,2`
- **THEN** the response has `status: UNPARSEABLE`, `attemptsLeft: 2`, `xpAwarded: 0`, and one part with verdict `UNPARSEABLE` and a `formatTip` such as "Tohle číslo neumím přečíst. Zkus třeba 5,2."
- **AND** a following submission of `3,7` is graded as attempt 1

#### Scenario: One unparseable part refuses the whole submission

- **GIVEN** a task with parts a (INTEGER, expected `12`) and b (DECIMAL) and 2 attempts left
- **WHEN** the child submits a = `12` and b = `3,,4`
- **THEN** the response status is `UNPARSEABLE`, `parts` contains only b with verdict `UNPARSEABLE` and a `formatTip`, no part carries a `CORRECT` or `WRONG` verdict, and `attemptsLeft` is 2

#### Scenario: Unparseable on the second attempt

- **GIVEN** a task with one INTEGER part whose first attempt was `WRONG`, so 1 attempt is left
- **WHEN** the child submits `12a`
- **THEN** the response has `status: UNPARSEABLE`, `attemptsLeft: 1`, a `formatTip` on the part, and no `revealedAnswers`

#### Scenario: Oversized input refused without cost

- **GIVEN** a task with one TEXT part and 2 attempts left
- **WHEN** the child submits a text of 10,000 letters `a`
- **THEN** the response has `status: UNPARSEABLE`, `attemptsLeft: 2`, and a `formatTip` on the part

### Requirement: Who can trigger a check

The checker SHALL be reachable only through three endpoints. The first is the
child submission endpoint, which needs no credentials because MVP has
exactly one child profile and no child login (practice-flow, child-profile).
Its request carries no profile identifier, so there is no "wrong profile"
case. The second is the admin answer tester (`POST
/api/admin/tasks/{taskId}/check`), which SHALL require a valid admin session.
A tester request without one SHALL be refused before any checking, with no
verdicts in the response. The third is the admin re-evaluation of a
reported attempt (`POST /api/admin/reports/{reportId}/reevaluate`), which
re-checks that attempt's stored raw input with the task's current answer
spec; it also requires a valid admin session, and its effects on outcome and
XP belong to progress-stats. Session, CSRF and 403 rules are owned by
admin-access, and tester behavior by content-authoring.

#### Scenario: Answer tester without an admin session

- **GIVEN** an existing task and a request with no admin session cookie
- **WHEN** it posts answers to the answer tester endpoint for that task
- **THEN** the response is HTTP 401 with an `application/problem+json` body and contains no verdict, normalized value or format tip

#### Scenario: Re-evaluation without an admin session

- **GIVEN** an open report with an attached attempt and a request with no admin session cookie
- **WHEN** it posts to the re-evaluation endpoint for that report
- **THEN** the response is HTTP 401 with an `application/problem+json` body and the attempt is not re-checked

#### Scenario: Child submission needs no credentials

- **GIVEN** a published task in a started mission and a request with no cookies or credentials
- **WHEN** it posts a readable answer to the child submission endpoint
- **THEN** the answer is checked and graded for the single child profile

### Requirement: Checker share of the round-trip budget

The checker SHALL make no network, database, file or AI calls while checking
(NFR-5). It SHALL decide one answer part in under 5 ms at p95 on the home
laptop for inputs up to the 100-code-point limit, so that it uses only a
small part of the 300 ms p95 answer-check round trip *(spec decision: a
derived budget)*. The end-to-end round trip itself is specified and measured
in practice-flow. NFR-5 is assigned to both capabilities in the Phase 2
capability split (`docs/qa/workflow-args/spec-pipeline-phase2.json`).

#### Scenario: Per-part checking time

- **GIVEN** the backend test suite running on the home laptop, with the checker invoked directly and no database or network available to it
- **WHEN** every golden case is checked 100 times and each check is timed
- **THEN** every check completes without error and the 95th percentile is below 5 ms

### Requirement: Golden table

The checker's behavior SHALL be pinned by a versioned golden table of at
least 150 cases kept in the backend repository (FR-23). Each case consists
of an answer spec and a raw input, with the expected verdict, the expected
normalized value (or none) and the requirement it belongs to. The table SHALL
cover these verdict-producing requirements, with at least 5 cases each:

- Verdicts and normalized interpretation
- Numeric notation
- Input length and exact arithmetic
- Integer input
- Decimal input
- Fraction input
- Numbers with units
- Multiple choice
- Short text
- Accepted alternatives
- Numeric tolerance
- Format tip for unreadable input

Every input named in a scenario of those requirements SHALL be a golden case
with that scenario's verdict. This includes the locale-formatted cases
(decimal comma, no-break and thin-space thousands, U+2212 minus). The
remaining requirements (submission endpoint, who can trigger a check,
round-trip budget, and this one) are verified by API, end-to-end and timing
tests, not by golden cases. All cases are self-authored, never copied from a
workbook (NFR-4).

#### Scenario: Golden table size and coverage

- **GIVEN** the backend repository at any commit
- **WHEN** the backend test suite runs
- **THEN** it executes at least 150 golden cases and every case passes
- **AND** each of the 12 listed requirements has at least 5 cases
- **AND** every input named in a scenario of those requirements is present with that scenario's verdict

#### Scenario: A verdict regression fails the build

- **GIVEN** a change to the checker that turns the golden case `INTEGER 1000 / "1<U+00A0>000"` from `CORRECT` into `UNPARSEABLE`
- **WHEN** the backend test suite runs
- **THEN** the suite fails and names the failing case

## Explicit exclusions (MVP)

- No unit conversion (FR-17), no unit registry, no algebraic expressions,
  no answers with more than one number in a single part, and no percent,
  scientific (`1e3`) or non-ASCII-digit notation. Such input is
  `UNPARSEABLE` or, for an unknown unit after a readable number, `WRONG`.
- A dot or comma is never a thousands separator (`1.250,75` is
  `UNPARSEABLE`, and `12.500` is 12.5).
- No AI, spelling-tolerant or fuzzy matching of any kind.
- `GRAPHIC` tasks are stored but never served to the child, so their
  answers are never checked in MVP.
- The pure checker does not know about attempts, XP, hints or answer
  reveal. Attempt counting, locking of correct parts, reveal and the
  round-trip measurement belong to practice-flow, and XP to gamification.
  The only attempt-related rule here is the refusal of unreadable
  submissions at the submission endpoint.
- Child authentication and profile selection do not exist in MVP
  (practice-flow, child-profile). Admin session, CSRF and HTTP 403 handling
  for the answer tester belong to admin-access, and the tester screen and its
  per-part results to content-authoring. The tester reports each part's
  verdict independently and does not apply the whole-submission refusal.
- Malformed request shapes (unknown part keys, wrong JSON types) are HTTP
  400 and request bodies over 16 KB are HTTP 413 at the API; they belong to
  practice-flow and the API contract. They are not checker verdicts.
- Editing an answer spec does not re-check past attempts. Re-evaluation
  belongs to the flag queue in the progress-stats capability.
