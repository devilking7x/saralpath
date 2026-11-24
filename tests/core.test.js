'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../app.js');

// --- glossary --------------------------------------------------------------
test('glossary: 93 words, every entry has a simple word and a Hindi meaning', () => {
  const words = Object.keys(S.GLOSSARY);
  assert.equal(words.length, 93);
  for (const w of words) {
    const [simple, hi] = S.GLOSSARY[w];
    assert.ok(simple && simple.length >= 2, w + ' bad simple form');
    assert.ok(hi && hi.length >= 2, w + ' bad Hindi meaning');
    assert.ok(!simple.includes(w), w + ' maps to itself');
  }
});

test('glossary lookup: exact, plural and -ing/-ed forms', () => {
  assert.deepEqual(S.glossaryLookup('fundamental'), { word: 'fundamental', simple: 'basic', hi: 'buniyadi' });
  assert.equal(S.glossaryLookup('fundamentals').simple, 'basic');
  assert.equal(S.glossaryLookup('generates').simple, 'make');
  assert.equal(S.glossaryLookup('transforming').simple, 'change');
  assert.equal(S.glossaryLookup('results').simple, 'outcome');
  assert.equal(S.glossaryLookup('photosynthesis'), null);
  assert.equal(S.glossaryLookup('the'), null);
});

// --- syllables + readability -----------------------------------------------
test('syllables: standard counts', () => {
  assert.equal(S.countSyllables('cat'), 1);
  assert.equal(S.countSyllables('banana'), 3);
  assert.equal(S.countSyllables('photosynthesis'), 5);
  assert.equal(S.countSyllables('education'), 4);
  assert.equal(S.countSyllables('the'), 1);
});

test('readability: known Flesch values', () => {
  const r = S.readability('The cat sat on the mat. The dog ran fast.');
  assert.equal(r.words, 10);
  assert.equal(r.sentences, 2);
  assert.ok(r.ease > 90, 'simple text should score above 90, got ' + r.ease);
  assert.ok(r.grade < 3, 'simple text grade below 3, got ' + r.grade);
});

// --- simplify ---------------------------------------------------------------
test('simplify: replaces hard words and keeps meaning', () => {
  const r = S.simplify('Photosynthesis is a fundamental process.');
  assert.match(r.simplified, /basic way/);
  assert.ok(r.replaced.some((x) => x.from === 'fundamental'));
  assert.ok(r.easeGain > 0, 'ease should improve, got ' + r.easeGain);
});

test('simplify: verb agreement is kept (generates -> makes)', () => {
  const r = S.simplify('It generates oxygen and transforms light.');
  assert.match(r.simplified, /makes oxygen/);
  assert.match(r.simplified, /changes light/);
});

test('simplify: capitalisation is kept at sentence starts', () => {
  const r = S.simplify('Consequently, the process is essential.');
  assert.match(r.simplified, /^So, /);
});

test('simplify: empty and odd input never throws', () => {
  assert.equal(S.simplify('').simplified, '');
  assert.equal(S.simplify('   ').simplified, '');
  assert.equal(S.simplify('123 456').simplified, '123 456');
  const r = S.simplify('Hi.');
  assert.equal(r.simplified, 'Hi.');
});

// --- measured sample lessons (the numbers the draft quotes) -----------------
test('samples: all three lessons get easier, grade drops', () => {
  const results = S.evaluateSamples();
  assert.equal(results.length, 3);
  for (const r of results) {
    console.log(`${r.id}: ease ${r.beforeEase} -> ${r.afterEase} (+${r.easeGain}), grade ${r.beforeGrade} -> ${r.afterGrade}, ${r.uniqueReplaced} words replaced`);
    assert.ok(r.easeGain >= 8, r.id + ' ease gain ' + r.easeGain + ' below 8');
    assert.ok(r.gradeDrop >= 1, r.id + ' grade drop ' + r.gradeDrop + ' below 1');
    assert.ok(r.uniqueReplaced >= 3, r.id + ' too few replacements');
  }
});

test('samples: exact measured numbers for the draft', () => {
  const byId = {};
  for (const r of S.evaluateSamples()) byId[r.id] = r;
  assert.equal(byId.photosynthesis.beforeEase, 18);
  assert.equal(byId.photosynthesis.afterEase, 40.3);
  assert.equal(byId.photosynthesis.easeGain, 22.3);
  assert.equal(byId.rights.beforeEase, 34.6);
  assert.equal(byId.rights.afterEase, 42.8);
  assert.equal(byId.interest.beforeEase, 44.5);
  assert.equal(byId.interest.afterEase, 60.3);
  const avg = (byId.photosynthesis.easeGain + byId.rights.easeGain + byId.interest.easeGain) / 3;
  assert.ok(avg >= 14, 'average ease gain ' + avg.toFixed(1) + ' below 14');
});
