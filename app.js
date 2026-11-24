'use strict';
// SaralPath — plain-language lesson simplifier for Hindi-medium learners.
// Core logic: pure functions, no DOM. Works in Node (require) and in the
// browser (window.SaralPath). Zero dependencies.
//
// The tool is RULE-BASED, not AI: a hand-built glossary of difficult
// academic English words (each with a simple English word and a Roman Hindi
// meaning), a long-sentence splitter, and the standard Flesch Reading Ease /
// Flesch-Kincaid Grade formulas so the before/after difference is measured,
// not claimed.

// word -> [simple English, Roman Hindi meaning]
const GLOSSARY = {
  abundant: ['plenty', 'bahut zyada'],
  accelerate: ['speed up', 'tez karna'],
  accomplish: ['finish', 'poora karna'],
  acquire: ['get', 'paana'],
  adequate: ['enough', 'kaafi'],
  advocate: ['support', 'samarthan karna'],
  allocate: ['share out', 'baantna'],
  anticipate: ['expect', 'ummid karna'],
  apparent: ['clear', 'saaf dikhai dene wala'],
  approximately: ['about', 'lagbhag'],
  attempt: ['try', 'koshish karna'],
  assist: ['help', 'madad karna'],
  benefit: ['advantage', 'faayda'],
  capable: ['able', 'saksham'],
  cease: ['stop', 'rukna'],
  circumstance: ['situation', 'halat'],
  commence: ['begin', 'shuru karna'],
  comprehend: ['understand', 'samajhna'],
  consequently: ['so', 'isliye'],
  considerable: ['large', 'kaafi bada'],
  construct: ['build', 'banana'],
  crucial: ['very important', 'bahut zaroori'],
  demonstrate: ['show', 'dikhana'],
  despite: ['even though', 'ke bawjood'],
  determine: ['find out', 'pata lagana'],
  diminish: ['become smaller', 'kam hona'],
  discover: ['find', 'khojna'],
  distribute: ['give out', 'baantna'],
  efficient: ['works well', 'kushal'],
  eliminate: ['remove', 'hatana'],
  employ: ['use', 'istemaalo karna'],
  encounter: ['meet', 'saamna karna'],
  enormous: ['very big', 'bahut bada'],
  ensure: ['make sure', 'pakka karna'],
  essential: ['needed', 'zaroori'],
  establish: ['set up', 'sthaapit karna'],
  evaluate: ['check', 'jaanchna'],
  evidence: ['proof', 'saboot'],
  facilitate: ['help', 'madad karna'],
  frequent: ['often', 'aksar'],
  fundamental: ['basic', 'buniyadi'],
  furthermore: ['also', 'is ke alawa'],
  generate: ['make', 'banana'],
  however: ['but', 'lekin'],
  illustrate: ['show with an example', 'udaaharan se samjhana'],
  immense: ['huge', 'vishaal'],
  implement: ['put into action', 'laagu karna'],
  important: ['matters a lot', 'mahatvapurna'],
  inevitable: ['cannot be avoided', 'atal'],
  influence: ['effect', 'prabhaav'],
  initial: ['first', 'pehla'],
  inquire: ['ask', 'poochna'],
  investigate: ['look into', 'jaanch karna'],
  maintain: ['keep', 'banaye rakhna'],
  method: ['way', 'tareeka'],
  numerous: ['many', 'kai'],
  obtain: ['get', 'paana'],
  observe: ['watch', 'dekhna'],
  occur: ['happen', 'hona'],
  participate: ['take part', 'hissa lena'],
  permanent: ['lasting', 'sthaayi'],
  possess: ['have', 'rakhna'],
  predict: ['say what will happen', 'bhavishyavani karna'],
  previous: ['earlier', 'pehla'],
  primarily: ['mainly', 'mukhya roop se'],
  purchase: ['buy', 'khareedna'],
  purpose: ['reason', 'uddeshya'],
  rapid: ['fast', 'tez'],
  remain: ['stay', 'rehna'],
  require: ['need', 'zaroorat hona'],
  research: ['study', 'shodh'],
  resemble: ['look like', 'jaisa dikhna'],
  resource: ['something useful', 'sansaadhan'],
  result: ['outcome', 'parinaam'],
  seek: ['look for', 'talaashna'],
  significant: ['important', 'mahatvapurna'],
  similar: ['alike', 'ek jaisa'],
  solution: ['answer', 'hal'],
  sufficient: ['enough', 'paryaapt'],
  suggest: ['advise', 'sujhaav dena'],
  therefore: ['so', 'isliye'],
  theory: ['idea', 'siddhant'],
  transform: ['change', 'badalna'],
  typical: ['usual', 'aam taur par'],
  unique: ['one of a kind', 'anokha'],
  utilize: ['use', 'istemaalo karna'],
  various: ['different kinds', 'alag-alag'],
  vary: ['change', 'badalna'],
  vehicle: ['car or bus', 'gaadi'],
  vital: ['very important', 'atyant mahatvapurna'],
  widespread: ['common everywhere', 'vyaapak'],
  preserve: ['protect', 'bachana'],
  process: ['way', 'tareeka'],
};

function countSyllables(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = 'aeiouy'.includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith('e') && count > 1) count--;
  if (w.endsWith('ed') && count > 1) count--;
  return Math.max(1, count);
}

function splitSentences(text) {
  const parts = String(text).split(/(?<=[.!?])\s+/);
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenizeWords(text) {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function countWords(text) {
  return tokenizeWords(text).filter((w) => /[A-Za-z]/.test(w)).length;
}

// Standard Flesch Reading Ease (higher = easier) and Flesch-Kincaid Grade.
function readability(text) {
  const sentences = splitSentences(text);
  const words = tokenizeWords(text).filter((w) => /[A-Za-z]/.test(w));
  const nWords = Math.max(1, words.length);
  const nSent = Math.max(1, sentences.length);
  let syllables = 0;
  for (const w of words) syllables += countSyllables(w);
  const wps = nWords / nSent;
  const spw = syllables / nWords;
  const ease = 206.835 - 1.015 * wps - 84.6 * spw;
  const grade = 0.39 * wps + 11.8 * spw - 15.59;
  return {
    words: nWords,
    sentences: nSent,
    syllables,
    wordsPerSentence: +wps.toFixed(2),
    ease: +ease.toFixed(1),
    grade: +grade.toFixed(1),
  };
}

function lookup(word) {
  const w = word.toLowerCase();
  if (GLOSSARY[w]) return { simple: GLOSSARY[w][0], hi: GLOSSARY[w][1], stem: w, suffix: '' };
  const suffixes = ['ing', 'ed', 'es', 's'];
  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length > suf.length + 2) {
      const stem = w.slice(0, -suf.length);
      if (GLOSSARY[stem]) return { simple: GLOSSARY[stem][0], hi: GLOSSARY[stem][1], stem, suffix: suf };
      const stemE = stem + 'e';
      if (GLOSSARY[stemE]) return { simple: GLOSSARY[stemE][0], hi: GLOSSARY[stemE][1], stem: stemE, suffix: suf };
    }
  }
  return null;
}

// Keep verb/noun agreement when a suffix was stripped: "generates" -> "makes",
// "transformed" -> "changed", "results" -> "outcomes". Single-word replacements only.
function inflect(simple, suffix) {
  if (!suffix || simple.includes(' ')) return simple;
  if (suffix === 's' || suffix === 'es') {
    return /(s|x|z|ch|sh)$/.test(simple) ? simple + 'es' : simple + 's';
  }
  if (suffix === 'ed') return simple.endsWith('e') ? simple + 'd' : simple + 'ed';
  if (suffix === 'ing') return simple.endsWith('e') ? simple.slice(0, -1) + 'ing' : simple + 'ing';
  return simple;
}

function capFirst(s, wasCapitalized) {
  if (!wasCapitalized) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Replace glossary words in one sentence; returns { text, replaced: [{from, to, hi}] }.
function simplifySentence(sentence) {
  const replaced = [];
  const out = sentence.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (match) => {
    const hit = lookup(match);
    if (!hit) return match;
    const wasCap = match[0] === match[0].toUpperCase();
    const simple = capFirst(inflect(hit.simple, hit.suffix), wasCap);
    replaced.push({ from: match.toLowerCase(), to: hit.simple, hi: hit.hi });
    return simple;
  });
  return { text: out, replaced };
}

// Split sentences longer than maxWords at the first comma / semicolon after
// word 10 — but never where the remainder would be a fragment: never split
// before a relative pronoun or subordinating conjunction (which, that,
// because, where, ...). (Splitting at "and"/"but" also leaves fragments, so
// we do not split there — a long sentence simply stays long.)
const NO_SPLIT_NEXT = new Set([
  'which', 'that', 'who', 'whose', 'whom', 'because', 'although', 'though',
  'while', 'if', 'when', 'since', 'as', 'so', 'and', 'but', 'or', 'nor',
  'not', 'where', 'whereas', 'unless', 'until',
]);
function splitLongSentence(sentence, maxWords) {
  const words = sentence.split(/\s+/);
  if (words.length <= maxWords) return [sentence];
  let splitAt = -1;
  for (let i = 10; i < words.length - 3; i++) {
    if ((words[i].endsWith(',') || words[i].endsWith(';'))
      && !NO_SPLIT_NEXT.has(words[i + 1].toLowerCase().replace(/[^a-z]/g, ''))) {
      splitAt = i;
      break;
    }
  }
  if (splitAt === -1) return [sentence];
  const first = words.slice(0, splitAt + 1).join(' ');
  const rest = words.slice(splitAt + 1).join(' ');
  const firstClean = first.replace(/[;,]$/, '') + '.';
  const restCap = rest.charAt(0).toUpperCase() + rest.slice(1);
  return [firstClean, restCap];
}

// Full pipeline: simplify a whole text.
// Returns { original, simplified, before, after, replaced, replacedCount, hardWords }.
function simplify(text) {
  const before = readability(text);
  const allReplaced = [];
  const outSentences = [];
  for (const s of splitSentences(text)) {
    const parts = splitLongSentence(s, 22);
    for (const p of parts) {
      const r = simplifySentence(p);
      outSentences.push(r.text);
      allReplaced.push(...r.replaced);
    }
  }
  const simplified = outSentences.join(' ');
  const after = readability(simplified);
  const unique = [];
  const seen = new Set();
  for (const r of allReplaced) {
    if (!seen.has(r.from)) { seen.add(r.from); unique.push(r); }
  }
  return {
    original: text,
    simplified,
    before,
    after,
    replaced: unique,
    replacedCount: allReplaced.length,
    easeGain: +(after.ease - before.ease).toFixed(1),
    gradeDrop: +(before.grade - after.grade).toFixed(1),
  };
}

function glossaryLookup(word) {
  const hit = lookup(word);
  if (!hit) return null;
  return { word: word.toLowerCase(), simple: hit.simple, hi: hit.hi };
}

const SAMPLES = [
  {
    id: 'photosynthesis',
    title: 'Science — Photosynthesis',
    text: 'Photosynthesis is the fundamental process by which green plants transform sunlight, water, and carbon dioxide into glucose and oxygen. Consequently, this process is essential for life on Earth, because it generates the oxygen we breathe and produces the food that sustains nearly every living organism. Furthermore, plants accomplish this transformation inside tiny structures called chloroplasts, where a green pigment known as chlorophyll captures sunlight and utilizes its energy to facilitate chemical reactions.',
  },
  {
    id: 'rights',
    title: 'Civics — Fundamental Rights',
    text: 'The Constitution of India guarantees fundamental rights to all citizens. These rights are essential because they protect individuals from arbitrary actions by the state and ensure that every person can live with dignity. For instance, the right to equality prohibits discrimination on the basis of religion, caste, gender, or place of birth. Moreover, citizens can approach the courts directly if any fundamental right is violated, which makes these rights enforceable in practice, not merely promises on paper.',
  },
  {
    id: 'interest',
    title: 'Maths — Compound Interest',
    text: 'A sum of 10,000 rupees is invested at an annual interest rate of 8 percent, compounded annually. Determine the amount accumulated after 3 years. To solve this problem, utilize the compound interest formula A = P(1 + r/100)^n, where P represents the principal, r denotes the rate, and n signifies the number of years. Therefore, substitute the given values and evaluate the expression to obtain the final amount.',
  },
];

function evaluateSamples() {
  return SAMPLES.map((s) => {
    const r = simplify(s.text);
    return {
      id: s.id,
      title: s.title,
      beforeEase: r.before.ease,
      afterEase: r.after.ease,
      easeGain: r.easeGain,
      beforeGrade: r.before.grade,
      afterGrade: r.after.grade,
      gradeDrop: r.gradeDrop,
      replacedCount: r.replacedCount,
      uniqueReplaced: r.replaced.length,
      words: r.before.words,
    };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GLOSSARY, SAMPLES,
    countSyllables, splitSentences, readability, lookup, simplifySentence,
    splitLongSentence, simplify, glossaryLookup, evaluateSamples,
  };
}
if (typeof window !== 'undefined') {
  window.SaralPath = {
    GLOSSARY, SAMPLES,
    readability, simplify, glossaryLookup, evaluateSamples,
  };
}
