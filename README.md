# SaralPath — Plain-Language Lesson Reader

A free, static tool that turns hard textbook English into simple words — with
the Hindi meaning of every hard word beside it. For Hindi-medium learners who
can follow a lesson but get stuck on the words. No server, no tracking, no
data leaves the page — plain HTML/CSS/JS, zero dependencies, works offline
once loaded.

**Live demo:** https://devilking7x.github.io/saralpath/
**Built for:** AccessED Hacks (Devpost) — the "Understand" door: translation
and plain-language explanations. Solo entry by Mohd Raja (devilking7x).

## What it does

1. **Simplify a paragraph** — paste textbook English; SaralPath swaps known
   hard words for simple ones (keeping verb agreement: *generates → makes*),
   splits over-long sentences, and shows the result with a word list:
   every replaced word with its simple English word and Roman Hindi meaning.
2. **Measured before/after scores** — Flesch Reading Ease and Flesch-Kincaid
   Grade, computed live before and after simplifying.
3. **93-word glossary** — common academic words from school science, civics
   and maths textbooks, each with a simple word and a Hindi meaning; look any
   word up directly.
4. **Three sample lessons** — photosynthesis, fundamental rights, compound
   interest — simplified live with their measured scores.
5. **Large-text toggle** — one click for bigger, easier-to-read text.

## Measured results (from the test suite, not estimates)

| Lesson | Reading ease before → after | Grade before → after | Words replaced |
|---|---|---|---|
| Photosynthesis | 18.0 → 40.3 (+22.3) | 16.7 → 13.6 | 10 |
| Fundamental Rights | 34.6 → 42.8 (+8.2) | 13.2 → 12.1 | 3 |
| Compound Interest | 44.5 → 60.3 (+15.8) | 11.0 → 8.0 | 5 |

Average reading-ease gain across the three lessons: **+15.4 points**.
Recompute live in DevTools: `SaralPath.evaluateSamples()`.

## Before / after (the learning story)

**Before:** a Class 9 student opens her science chapter and reads:
"Photosynthesis is the fundamental process by which green plants transform
sunlight, water, and carbon dioxide into glucose and oxygen." She knows
"plants" and "sunlight" — but "fundamental", "transform" and "carbon dioxide"
stop her. She re-reads the sentence three times and still cannot say what it
means.

**After:** she pastes the paragraph into SaralPath and reads: "Photosynthesis
is the basic way by which green plants change sunlight, water, and carbon
dioxide into glucose and oxygen." The hard words are listed beside it with
their Hindi meanings. She can now explain the sentence in her own words.
What still needs work: she still has to learn the science terms themselves —
SaralPath simplifies the English around them; it does not teach the concepts.

## Honest limits

- This is a **rule-based simplifier, not AI**: a 93-word hand-built glossary
  plus a sentence splitter. It does not understand the text. Grammar is
  sometimes imperfect — the simple words are the point.
- It simplifies the English **around** science terms; it does not explain the
  science itself.
- Flesch scores are standard arithmetic on word and syllable counts — a
  useful before/after measure, not a guarantee that a particular learner will
  understand a particular paragraph.

## Tests

```sh
npm test        # node --test tests/core.test.js (10 tests)
npm run smoke   # Playwright smoke checks in Firefox (11 checks)
```
