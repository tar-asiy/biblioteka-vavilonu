#!/usr/bin/env node
/**
 * Build script: assembles a standalone HTML file for the Library of Babel.
 * Run: node build-standalone.js
 * Output: babel.html
 */

const fs = require('fs');
const path = require('path');

// --- Helpers ---
function toBase64DataUri(filePath, mime) {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// --- Read assets ---
console.log('Reading numbers...');
const numbersRaw = fs.readFileSync(path.join(__dirname, 'numbers-ukr'), 'utf8');
const [N_STR, C_STR, I_STR] = numbersRaw.split('\n');

console.log('Encoding font...');
const fontDataUri = toBase64DataUri(
  path.join(__dirname, 'src/public/font/CloisterBlack.ttf'),
  'font/ttf'
);

console.log('Encoding images...');
const images = {
  librarian: toBase64DataUri(path.join(__dirname, 'src/public/image/librarian-5.png'), 'image/png'),
  mucha: toBase64DataUri(path.join(__dirname, 'src/public/image/mucha-2.png'), 'image/png'),
  shelves: toBase64DataUri(path.join(__dirname, 'src/public/image/shelves.png'), 'image/png'),
  study: toBase64DataUri(path.join(__dirname, 'src/public/image/study-2.png'), 'image/png'),
  faviconBlack: toBase64DataUri(path.join(__dirname, 'src/public/image/favicon-black.png'), 'image/png'),
  faviconWhite: toBase64DataUri(path.join(__dirname, 'src/public/image/favicon-white.png'), 'image/png'),
};

console.log('Reading words list...');
const wordsTxt = fs.readFileSync(path.join(__dirname, 'src/public/words-ukr.txt'), 'utf8');

console.log('Reading gmp-wasm...');
const gmpWasmJs = fs.readFileSync(
  path.join(__dirname, 'node_modules/gmp-wasm/dist/index.umd.min.js'),
  'utf8'
);

// --- Build HTML ---
console.log('Assembling HTML...');

const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Бібліотека Вавилону</title>
<link rel="icon" href="${images.faviconBlack}" type="image/png" media="(prefers-color-scheme: light)">
<link rel="icon" href="${images.faviconWhite}" type="image/png" media="(prefers-color-scheme: dark)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap">
<style>
@font-face {
  font-family: "CloisterBlack";
  src: url("${fontDataUri}") format("truetype");
}

:root {
  --colour-bg: floralwhite;
  --colour-fg: #111;
  --colour-grey: #545454;
  --colour-light-grey: #888;
  --colour-border: #e3dad0;
  --colour-border-dark: #cac3ba;
  --font-mono: "Source Code Pro", monospace;
  --font-serif: "Lora", serif;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  max-width: 738px; margin: 0 auto; padding: 20px;
  background-color: var(--colour-bg); color: var(--colour-fg);
  font-family: var(--font-serif); font-size: 14px; line-height: 1.4;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}

a { color: var(--colour-fg); font-weight: bold; }
a:hover { color: darkred; cursor: pointer; }

nav { display: flex; align-items: flex-start; justify-content: space-between; grid-gap: 10px; margin-bottom: 40px; }
nav h1 { font-size: 14px; }
nav .Links { display: flex; align-items: center; }
nav .Links a { display: inline-block; }
nav .Links > * + * { margin-left: 10px; }

footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid var(--colour-border); }
footer p, footer a { color: var(--colour-grey); }
footer .epigraph { margin-top: 5px; text-align: right; color: var(--colour-light-grey); }

.BodyStyle { position: relative; text-align: justify; hyphens: auto; }
.BodyStyle > * + * { margin-top: 16px; }
.BodyStyle h2, .BodyStyle h3, .BodyStyle h4, .BodyStyle h5 { font-size: 14px; }
.BodyStyle ul, .BodyStyle ol { padding-left: 1.5em; }

.BodyStyle p.initial, .ProseStyle p.initial { text-indent: 0; }
.BodyStyle p.initial > span:first-child, .ProseStyle p.initial > span:first-child {
  font-weight: bold; font-variant: small-caps; margin-left: -4px;
}
.BodyStyle p.initial:first-letter, .ProseStyle p.initial:first-letter {
  float: left; font-family: "CloisterBlack", "Times New Roman", serif;
  font-size: 44px; font-weight: normal; line-height: 28px;
  color: darkred; margin-top: 5px; margin-right: 4px;
}

.ProseStyle { max-width: 60ch; margin: 0 auto; line-height: 1.5; }
.ProseStyle h2 { font-size: 16px; text-align: center; }
.ProseStyle h3 { font-size: 14px; text-align: center; margin-bottom: 15px; }
.ProseStyle h4 { font-size: 14px; text-align: center; }
.ProseStyle p { text-align: justify; text-indent: 2em; }
.ProseStyle .Footnotes { text-indent: 0; border-top: 1px solid var(--colour-border); padding-top: 20px; margin-top: 20px; }
.ProseStyle .Footnotes ol { margin-left: 1em; }
.ProseStyle .Footnotes ol li + li { margin-top: 5px; }

.PageInfo { display: flex; align-items: flex-start; justify-content: space-between; grid-gap: 10px; margin-bottom: 20px; }
.PageInfo pre { white-space: break-spaces; }

.PageActions {
  display: grid; grid-template-columns: repeat(1, 1fr); grid-gap: 5px;
  border: 1px solid var(--colour-border); border-radius: 2px; padding: 10px; margin-bottom: 20px;
}
@media screen and (min-width: 730px) { .PageActions { grid-template-columns: repeat(2, 1fr); } }
.PageActions button { font-weight: normal; }

.PageContentWrapper { max-width: 100%; overflow-x: auto; overflow-y: hidden; }
.PageContent { display: grid; grid-template-columns: 26px 672px; overflow-x: auto; }
.PageContent .Lines {
  color: var(--colour-light-grey); user-select: none; display: inline-block;
  position: sticky; left: 0; background-color: var(--colour-bg);
  font-family: var(--font-mono); font-size: 14px; line-height: 1.2; z-index: 1;
}
.PageContent .Lines span { display: block; }
.PageContent pre { font-family: var(--font-mono); font-size: 14px; line-height: 1.2; position: relative; overflow: hidden; }
.PageContent strong { background-color: yellow; }

.PageNavigation { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; }
.PageNavigation a { width: 80px; }
.PageNavigation a:last-child { text-align: right; }
.PageNavigation .PageSelector { display: flex; align-items: center; }
.PageNavigation .PageSelector select {
  appearance: none; color: var(--colour-fg); background-color: var(--colour-bg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' style='fill: grey;'%3E%3Cpath d='M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: 100% 50%;
  margin-left: 5px; font-family: var(--font-mono);
  border: 1px solid var(--colour-border-dark); border-radius: 2px; padding: 2px 16px 2px 5px;
}

button {
  appearance: none; width: 100%; padding: 5px 10px;
  font-family: var(--font-serif); font-size: 14px; font-weight: bold; text-decoration: underline;
  border: 1px solid var(--colour-border-dark); border-radius: 2px;
  background-color: #efe5dd; color: var(--colour-fg); cursor: pointer;
}
button:not([disabled]):hover { color: darkred; }
button[disabled] { text-decoration: none; cursor: not-allowed; opacity: 0.5; }

.SearchGrid { display: grid; grid-template-columns: 1fr; grid-gap: 30px; }
@media screen and (min-width: 730px) { .SearchGrid { grid-template-columns: 1fr 1.1fr; grid-gap: 20px; } }
.SearchGrid img { width: 100%; max-width: 400px; border-radius: 4px; margin: 0 auto; }
@media screen and (min-width: 730px) { .SearchGrid img { max-width: 100%; margin: 0; } }

.SearchForm textarea, .BrowseForm textarea {
  appearance: none; display: block; width: 100%; max-width: 100%; min-width: 100%;
  padding: 10px; font-family: var(--font-mono); font-size: 14px;
  border: 1px solid var(--colour-border-dark); border-radius: 2px; margin-bottom: 10px;
}
.SearchForm .ModeSelection label { margin-right: 10px; display: inline-flex; align-items: center; }
.SearchForm .ModeSelection input { margin-right: 5px; }
.SearchForm button, .BrowseForm button {
  box-shadow: 0 1px 0 rgba(0,0,0,0.25); padding: 10px; margin-top: 10px; transition: all 75ms ease-in-out;
}
.SearchForm button:hover, .BrowseForm button:hover { box-shadow: 0 0 0 rgba(0,0,0,0.25); transform: translateY(1px); }

.BrowseForm { margin-bottom: 20px; }
.BrowseForm label > *:last-child { margin-top: 5px; }
.BrowseForm label span { color: var(--colour-light-grey); }
.BrowseForm .Numbers { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 10px; }
.BrowseForm .Numbers input {
  appearance: none; display: block; width: 100%; padding: 10px;
  font-family: var(--font-mono); font-size: 14px;
  border: 1px solid var(--colour-border-dark); border-radius: 2px;
}

.Librarian {
  width: 100%; max-width: 400px; margin-bottom: 30px; border-radius: 4px;
  display: block; margin-left: auto; margin-right: auto;
}
@media screen and (min-width: 590px) { .Librarian { width: 285px; float: right; margin-left: 15px; margin-bottom: 15px; } }

.Banner { width: 100%; margin-bottom: 30px; border-radius: 4px; display: block; }
.nobreak { white-space: nowrap; }
.super { font-size: 12px; vertical-align: top; display: inline-block; margin-top: -2px; text-indent: 0; }

@keyframes highlight { from { opacity: 0; transform: scale(1.5); } to { opacity: 1; transform: scale(1); } }
.Highlight {
  position: absolute; height: calc(14px * 1.2);
  background-color: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.3);
  border-radius: 2px; opacity: 0; animation: highlight 200ms forwards;
}

.Divider { position: relative; display: flex; align-items: center; justify-content: center; margin: 30px auto; }
.Divider > p { display: inline-block; background-color: var(--colour-bg); color: var(--colour-light-grey); padding: 0 10px; }
.Divider::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background-color: var(--colour-border); z-index: -1; }

.InfoBox { border: 1px solid var(--colour-border); border-radius: 2px; padding: 10px; font-size: 13px; background-color: rgba(0,0,0,0.025); }

#loading-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: var(--colour-bg); display: flex; align-items: center; justify-content: center;
  font-family: var(--font-serif); font-size: 16px; z-index: 9999;
}
</style>
</head>
<body>

<div id="loading-overlay">Бібліотека прокидається...</div>

<nav style="display:none" id="main-nav">
  <h1><a onclick="navigate('home')">Бібліотека Вавилону</a></h1>
  <div class="Links">
    <a onclick="navigate('search')">Пошук</a>
    <a onclick="navigate('browse')">Огляд</a>
    <a onclick="navigate('random')">Навмання</a>
    <a onclick="navigate('about')">Про бібліотеку</a>
  </div>
</nav>

<main id="app"></main>

<footer style="display:none" id="main-footer">
  <p>За мотивами оповідання <a href="https://uk.wikipedia.org/wiki/%D0%92%D0%B0%D0%B2%D0%B8%D0%BB%D0%BE%D0%BD%D1%81%D1%8C%D0%BA%D0%B0_%D0%B1%D1%96%D0%B1%D0%BB%D1%96%D0%BE%D1%82%D0%B5%D0%BA%D0%B0" target="_blank">Х. Л. Борхеса</a> &middot; <a href="https://github.com/tdjsnelling/babel" target="_blank">Код</a>: T. Snelling &middot; <a href="https://github.com/tar-asiy/biblioteka-vavilonu" target="_blank">Локалізація</a>: Т. Саламанюк</p>
  <p class="epigraph">Цим мистецтвом ти зможеш споглядати варіацію 33 літер...</p>
</footer>

<!-- gmp-wasm library (self-contained with embedded WASM) -->
<script>var exports=undefined,module=undefined,define=undefined;${gmpWasmJs}</script>

<script>
// ============================================================
// CONSTANTS
// ============================================================
const ALPHA = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя.,!?- ";
const WALLS = 4;
const SHELVES = 5;
const BOOKS = 32;
const PAGES = 410;
const LINES = 40;
const CHARS = 80;
const PAGE_LENGTH = LINES * CHARS;
const BOOK_LENGTH = PAGE_LENGTH * PAGES;

// GMP base-39 digit charset: 0-9 (0-9), A-Z (10-35), a-c (36-38)
const GMP_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabc";

function toGmpDigit(n) { return GMP_DIGITS[n]; }
function fromGmpDigit(ch) { return GMP_DIGITS.indexOf(ch); }

const NUM_MAP = {};
const CHAR_MAP = {};
ALPHA.split("").forEach((char, index) => {
  const key = toGmpDigit(index);
  NUM_MAP[key] = char;
  CHAR_MAP[char] = key;
});

// ============================================================
// NUMBERS (mathematical constants for the library)
// ============================================================
const N_STR = ${JSON.stringify(N_STR)};
const C_STR = ${JSON.stringify(C_STR)};
const I_STR = ${JSON.stringify(I_STR)};

// ============================================================
// IMAGE DATA
// ============================================================
const IMAGES = {
  librarian: "${images.librarian}",
  mucha: "${images.mucha}",
  shelves: "${images.shelves}",
  study: "${images.study}",
};

// ============================================================
// WORDS LIST (for highlighting English words)
// ============================================================
const WORDS_LIST = ${JSON.stringify(wordsTxt.split('\n').filter(w => w.trim().length > 1))};

// ============================================================
// BABEL CORE (ported from babel.ts)
// ============================================================
let gmpBinding = null;
let gmpN = null;
let gmpC = null;
let gmpI = null;

async function initBabel() {
  const { binding } = await gmp.init();
  gmpBinding = binding;

  gmpN = binding.mpz_t();
  binding.mpz_init(gmpN);
  binding.mpz_set_string(gmpN, N_STR, ALPHA.length);

  gmpC = binding.mpz_t();
  binding.mpz_init(gmpC);
  binding.mpz_set_string(gmpC, C_STR, ALPHA.length);

  gmpI = binding.mpz_t();
  binding.mpz_init(gmpI);
  binding.mpz_set_string(gmpI, I_STR, ALPHA.length);
}

function getSeqNumberFromIdentifier(identifier) {
  const b = gmpBinding;
  const [room, wall, shelf, book, page] = identifier.split(".");

  const intRoom = b.mpz_t();
  b.mpz_init(intRoom);
  b.mpz_set_string(intRoom, room, 32);

  const parsedWall = Number(wall);
  const parsedShelf = Number(shelf);
  const parsedBook = Number(book);
  const parsedPage = Number(page);

  const pBooks = parsedBook;
  const pShelves = (parsedShelf - 1) * BOOKS;
  const pWalls = (parsedWall - 1) * SHELVES * BOOKS;

  const pRooms = b.mpz_t();
  b.mpz_init(pRooms);
  b.mpz_sub_ui(pRooms, intRoom, 1);
  b.mpz_mul_ui(pRooms, pRooms, WALLS * SHELVES * BOOKS);

  const seqNumber = b.mpz_t();
  b.mpz_init(seqNumber);
  b.mpz_add_ui(seqNumber, pRooms, pWalls + pShelves + pBooks);

  b.mpz_clears(intRoom, pRooms);
  return { seqNumber, page: parsedPage };
}

function getIdentifierFromSeqNumber(seqNumber, page) {
  const b = gmpBinding;

  const sn = b.mpz_t();
  b.mpz_init(sn);
  b.mpz_set(sn, seqNumber);
  b.mpz_sub_ui(sn, sn, 1);

  if (b.mpz_sgn(sn) === -1) {
    b.mpz_clear(sn);
    return "1.1.1.1." + page;
  }

  const room = b.mpz_t();
  b.mpz_init(room);
  b.mpz_tdiv_q_ui(room, sn, WALLS * SHELVES * BOOKS);
  b.mpz_add_ui(room, room, 1);
  b.mpz_mod_ui(sn, sn, WALLS * SHELVES * BOOKS);

  const wall = b.mpz_t();
  b.mpz_init(wall);
  b.mpz_tdiv_q_ui(wall, sn, SHELVES * BOOKS);
  b.mpz_add_ui(wall, wall, 1);
  b.mpz_mod_ui(sn, sn, SHELVES * BOOKS);

  const shelf = b.mpz_t();
  b.mpz_init(shelf);
  b.mpz_tdiv_q_ui(shelf, sn, BOOKS);
  b.mpz_add_ui(shelf, shelf, 1);
  b.mpz_mod_ui(sn, sn, BOOKS);
  b.mpz_add_ui(sn, sn, 1);

  const roomStr = b.mpz_to_string(room, 32);
  const wallStr = b.mpz_to_string(wall, 10);
  const shelfStr = b.mpz_to_string(shelf, 10);
  const bookStr = b.mpz_to_string(sn, 10);

  b.mpz_clears(room, wall, shelf, sn);
  return [roomStr, wallStr, shelfStr, bookStr, page].join(".");
}

function generateContent(identifier) {
  const b = gmpBinding;
  const { seqNumber, page } = getSeqNumberFromIdentifier(identifier);

  const result = b.mpz_t();
  b.mpz_init(result);
  b.mpz_mul(result, gmpC, seqNumber);
  b.mpz_mod(result, result, gmpN);

  let hash = b.mpz_to_string(result, ALPHA.length);
  b.mpz_clear(result);

  const paddingRequired = BOOK_LENGTH - hash.length;
  if (paddingRequired > 0) {
    hash = "0".repeat(paddingRequired) + hash;
  }

  const start = (page - 1) * PAGE_LENGTH;
  const end = start + PAGE_LENGTH;
  const contentArr = new Array(end - start);
  for (let i = 0; i < contentArr.length; i++) {
    contentArr[i] = NUM_MAP[hash[start + i]];
  }
  const content = contentArr.join("");

  const [room, wall, shelf, book] = identifier.split(".");
  let roomShort;
  if (room.length > 16) {
    roomShort = room.slice(0, 8) + "..." + room.slice(-8);
  } else {
    roomShort = room;
  }

  // Next page
  let nextPage = page;
  const nextSn = b.mpz_t();
  b.mpz_init(nextSn);
  b.mpz_set(nextSn, seqNumber);
  if (nextPage === PAGES) {
    b.mpz_add_ui(nextSn, nextSn, 1);
    nextPage = 1;
  } else {
    nextPage++;
  }
  const nextIdentifier = getIdentifierFromSeqNumber(nextSn, nextPage);
  b.mpz_clear(nextSn);

  // Prev page
  let prevPage = page;
  const prevSn = b.mpz_t();
  b.mpz_init(prevSn);
  b.mpz_set(prevSn, seqNumber);
  if (prevPage === 1) {
    b.mpz_sub_ui(prevSn, prevSn, 1);
    prevPage = PAGES;
  } else {
    prevPage--;
  }
  const prevIdentifier = getIdentifierFromSeqNumber(prevSn, prevPage);
  b.mpz_clear(prevSn);

  b.mpz_clear(seqNumber);

  return { content, roomShort, room, wall, shelf, book, page: page.toString(), nextIdentifier, prevIdentifier };
}

function lookupContent(content, page) {
  const b = gmpBinding;
  const hash = new Array(BOOK_LENGTH).fill(CHAR_MAP[" "]);
  for (let i = 0; i < content.length; i++) {
    hash[i] = CHAR_MAP[content[i]];
  }

  const seqNumber = b.mpz_t();
  b.mpz_init(seqNumber);
  b.mpz_set_string(seqNumber, hash.join(""), ALPHA.length);
  b.mpz_mul(seqNumber, seqNumber, gmpI);
  b.mpz_mod(seqNumber, seqNumber, gmpN);

  const identifier = getIdentifierFromSeqNumber(seqNumber, page);
  b.mpz_clear(seqNumber);
  return identifier;
}

function getRandomIdentifier() {
  const b = gmpBinding;
  const randState = 0;
  b.gmp_randinit_default(randState);
  b.gmp_randseed_ui(randState, Date.now());

  const randomSeqNumber = b.mpz_t();
  b.mpz_init(randomSeqNumber);

  const uniqueBooks = b.mpz_t();
  b.mpz_init(uniqueBooks);
  b.mpz_set_ui(uniqueBooks, ALPHA.length);
  b.mpz_pow_ui(uniqueBooks, uniqueBooks, BOOK_LENGTH);
  b.mpz_urandomm(randomSeqNumber, randState, uniqueBooks);
  b.mpz_add_ui(randomSeqNumber, randomSeqNumber, 1);

  const randomPage = Math.floor(Math.random() * PAGES + 1);
  const identifier = getIdentifierFromSeqNumber(randomSeqNumber, randomPage);

  b.mpz_clears(randomSeqNumber, uniqueBooks);
  return identifier;
}

// ============================================================
// SEARCH LOGIC (ported from search.ts)
// ============================================================
const allowed = new Set(ALPHA);
const randAlphaChar = () => ALPHA[(Math.random() * ALPHA.length) | 0];

function getEmptyPageBookContent(content) {
  const randomPage = Math.floor(Math.random() * PAGES);
  const startChar = randomPage * LINES * CHARS;
  const lines = content.split("\\n");

  let page = "";
  for (let li = 0; li < LINES; li++) {
    const line = lines[li] || "";
    let out = "";
    for (let i = 0; i < line.length + (CHARS - (line.length % CHARS)); i++) {
      const c = line[i] || " ";
      out += allowed.has(c) ? c : " ";
    }
    page += out;
  }
  page = page.slice(0, LINES * CHARS);

  const bookArr = new Array(PAGES * LINES * CHARS);
  for (let i = 0; i < bookArr.length; i++) bookArr[i] = randAlphaChar();
  for (let i = 0; i < page.length; i++) bookArr[startChar + i] = page[i];

  return { book: bookArr.join(""), page: randomPage + 1 };
}

function getEmptyBookContent(content) {
  const lines = content.split("\\n");
  let book = "";
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li] || "";
    let out = "";
    for (let i = 0; i < line.length + (CHARS - (line.length % CHARS)); i++) {
      const c = line[i] || " ";
      out += allowed.has(c) ? c : " ";
    }
    book += out;
  }
  book = book.slice(0, PAGES * LINES * CHARS);
  const bookArr = new Array(PAGES * LINES * CHARS).fill(" ");
  for (let i = 0; i < book.length; i++) bookArr[i] = book[i];
  return bookArr.join("");
}

function getRandomCharsBookContent(content) {
  const noLineBreaks = content.replace(/\\r/g, "").replace(/\\n/g, "");
  const randomStartPosition = Math.floor(
    Math.random() * (PAGES * LINES * CHARS - noLineBreaks.length + 1) + noLineBreaks.length
  ) - noLineBreaks.length;

  const bookArr = new Array(PAGES * LINES * CHARS);
  for (let i = 0; i < bookArr.length; i++) bookArr[i] = randAlphaChar();
  for (let i = 0; i < noLineBreaks.length; i++) bookArr[randomStartPosition + i] = noLineBreaks[i];

  const start = randomStartPosition;
  const length = noLineBreaks.length;
  const startLine = Math.floor(start / CHARS);
  const startCol = start % CHARS;
  const endPos = start + length;
  const endLine = Math.floor(endPos / CHARS);
  const endCol = endPos % CHARS;

  return { book: bookArr.join(""), highlight: { startLine, startCol, endLine, endCol } };
}

// ============================================================
// SPA NAVIGATION & VIEWS
// ============================================================
const app = document.getElementById('app');

// Current state for page view (to enable page selector)
let currentPageState = null;

function navigate(view, data) {
  if (view === 'random') {
    showLoading();
    setTimeout(() => {
      const id = getRandomIdentifier();
      showPage(id);
    }, 10);
    return;
  }
  if (view === 'home') showHome();
  else if (view === 'search') showSearch();
  else if (view === 'browse') showBrowse();
  else if (view === 'about') showAbout();
  else if (view === 'story') showStory();
  else if (view === 'page') showPage(data);
  window.scrollTo(0, 0);
}

function showLoading() {
  app.innerHTML = '<div class="BodyStyle"><p>Обчислюю...</p></div>';
}

// -------------------- HOME --------------------
function showHome() {
  app.innerHTML = \`
    <div class="BodyStyle">
      <img class="Librarian" src="\${IMAGES.librarian}" alt="Бібліотекар">
      <p class="initial">
        <span>Все</span>світ (який інші називають Бібліотекою) складається з невизначеної, можливо нескінченної кількості шестикутних зал.
        <a href="https://en.wikipedia.org/wiki/The_Library_of_Babel" target="_blank">Бібліотека Вавилону</a>
        — оповідання <a href="https://uk.wikipedia.org/wiki/%D0%A5%D0%BE%D1%80%D1%85%D0%B5_%D0%9B%D1%83%D1%97%D1%81_%D0%91%D0%BE%D1%80%D1%85%D0%B5%D1%81" target="_blank">Хорхе Луїса Борхеса</a>,
        вперше опубліковане 1941 року.
      </p>
      <p>Бібліотека складається з нескінченної кількості шестикутних кімнат. Кожна кімната має чотири стіни з книжковими полицями — по п'ять полиць на кожній стіні, по тридцять дві книги на кожній полиці. Кожна книга має чотириста десять сторінок по сорок рядків, кожен рядок — по вісімдесят символів.</p>
      <p>Серед символів — тридцять три літери українського алфавіту, кома, крапка, знак оклику, знак питання, дефіс і пробіл — тридцять дев'ять символів загалом. Бібліотека містить <em>кожну можливу комбінацію</em> цих символів. Жодні дві книги не повторюються — бібліотека є "тотальною — досконалою, повною і цілісною".</p>
      <p>Все, що будь-коли було або буде написано цими тридцятьма дев'ятьма символами, існує десь у бібліотеці. Це нагадує архів, що містить усі можливі заклинання, пророцтва і літописи — тільки більшість із них — беззмістовний хаос літер, серед якого ховаються справжні скарби.</p>
      <p>Ця програма — відтворення бібліотеки, яку можна досліджувати. Це єдине <em>повне</em> відтворення Бібліотеки Вавилону — воно містить кожну унікальну книгу, а не лише кожну унікальну сторінку.</p>
      <p>Можеш почати з <a onclick="navigate('page', '1.1.1.1.1')">першої сторінки</a>, з <a onclick="navigate('random')">випадкової сторінки</a>, або <a onclick="navigate('search')">пошуком тексту</a>.</p>
      <p>Спробуй знайти своє ім'я, дату народження, або рядок з улюбленої книги. Пошукай абзац з роману, який ще не написаний. Десь у нескінченних шестикутних залах уже існує опис кожної твоєї пригоди — минулої і майбутньої.</p>
      <p>Подробиці про те, як це працює — на сторінці <a onclick="navigate('about')">Про бібліотеку</a>.</p>
    </div>
  \`;
}

// -------------------- SEARCH --------------------
function showSearch() {
  app.innerHTML = \`
    <div style="margin-bottom: 20px;">
      <div class="SearchGrid">
        <img src="\${IMAGES.mucha}" alt="Бібліотекар за книгою">
        <div class="BodyStyle">
          <p class="initial">
            <span>Будь</span>-який текст, що ти можеш придумати, вже давно записано чорнилом десь у глибинах шестикутних галерей нескінченної бібліотеки. Залишилось лише знайти...
          </p>
          <p><em>"...детальну історію майбутнього..."</em></p>
          <p><em>"...автобіографії архангелів..."</em></p>
          <p><em>"...вірний каталог Бібліотеки..."</em></p>
          <p><em>"...справжню історію твоєї загибелі..."</em></p>
          <p><em>"...переклад кожної книги кожною мовою..."</em></p>
          <p><em>"...загублені книги Тацита..."</em></p>
        </div>
      </div>
    </div>
    <form class="SearchForm" id="search-form">
      <textarea name="content" rows="10" required placeholder="Введи до 1 312 000 символів: а-я (українські літери), кома, крапка, знак оклику, знак питання, дефіс або пробіл."></textarea>
      <div class="ModeSelection">
        <label><input type="radio" name="mode" value="empty" checked> На порожній сторінці</label>
        <label><input type="radio" name="mode" value="emptybook"> У порожній книзі</label>
        <label><input type="radio" name="mode" value="chars"> Серед випадкових символів</label>
        <button type="submit">Шукати</button>
      </div>
    </form>
  \`;

  const form = document.getElementById('search-form');
  const textarea = form.querySelector('textarea');

  textarea.oninput = (e) => {
    const { value, selectionEnd } = e.currentTarget;
    const sanitized = value.toLowerCase().replaceAll(/[^абвгґдеєжзиіїйклмнопрстуфхцчшщьюя.,!?\\- \\r\\n]/g, "");
    e.currentTarget.value = sanitized;
    const delta = value.length - sanitized.length;
    if (delta !== 0) {
      const pos = Math.max(0, Math.min(sanitized.length, selectionEnd - delta));
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = pos;
    }
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Шукаю...";

    const formData = new FormData(form);
    const content = formData.get("content").toLowerCase();
    const mode = formData.get("mode");
    const contentNoNewlines = content.replace(/\\r/g, "").replace(/\\n/g, "");

    setTimeout(() => {
      let book = "";
      let highlight = null;
      let page = 1;

      if (mode === "empty") {
        const r = getEmptyPageBookContent(content);
        book = r.book;
        page = r.page;
      } else if (mode === "emptybook") {
        book = getEmptyBookContent(content);
      } else if (mode === "chars") {
        const r = getRandomCharsBookContent(content);
        book = r.book;
        highlight = r.highlight;
        page = Math.ceil((highlight.startLine + 1) / LINES);
        const newStartLine = highlight.startLine - (page - 1) * LINES;
        const newEndLine = highlight.endLine - (page - 1) * LINES;
        highlight = { startLine: newStartLine, startCol: highlight.startCol, endLine: newEndLine, endCol: highlight.endCol };
      }

      const identifier = lookupContent(book, page);
      btn.disabled = false;
      btn.innerText = "Шукати";
      showPage(identifier, highlight);
    }, 10);
  };
}

// -------------------- BROWSE --------------------
function showBrowse() {
  app.innerHTML = \`
    <img class="Banner" src="\${IMAGES.shelves}" alt="Полиці з книгами">
    <form id="browse-form" class="BrowseForm">
      <label>
        <p>Кімната</p>
        <textarea name="room" rows="2" required placeholder="Введи ідентифікатор кімнати — алфавітно-цифровий рядок із символів 0-9 та a-v."></textarea>
      </label>
      <div class="Numbers">
        <label><p>Стіна <span>1-4</span></p><input name="wall" type="number" min="1" max="4" value="1" required></label>
        <label><p>Полиця <span>1-5</span></p><input name="shelf" type="number" min="1" max="5" value="1" required></label>
        <label><p>Книга <span>1-32</span></p><input name="book" type="number" min="1" max="32" value="1" required></label>
        <label><p>Сторінка <span>1-410</span></p><input name="page" type="number" min="1" max="410" value="1" required></label>
      </div>
      <button type="submit">Перейти</button>
    </form>
  \`;

  const form = document.getElementById('browse-form');
  const roomInput = form.querySelector('[name="room"]');

  roomInput.oninput = (e) => {
    const { value, selectionEnd } = e.currentTarget;
    const sanitized = value.replaceAll(/[^0-9a-v]/g, "");
    e.currentTarget.value = sanitized;
    const delta = value.length - sanitized.length;
    if (delta !== 0) {
      const pos = Math.max(0, Math.min(sanitized.length, selectionEnd - delta));
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = pos;
    }
  };

  const constrainInput = (e) => {
    if (e.target.value === "") return;
    const min = parseInt(e.target.min);
    const max = parseInt(e.target.max);
    if (e.target.value < min) e.target.value = min;
    if (e.target.value > max) e.target.value = max;
  };
  form.querySelector('[name="wall"]').oninput = constrainInput;
  form.querySelector('[name="shelf"]').oninput = constrainInput;
  form.querySelector('[name="book"]').oninput = constrainInput;
  form.querySelector('[name="page"]').oninput = constrainInput;

  form.onsubmit = (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Завантажую...";
    const fd = new FormData(form);
    const identifier = [fd.get("room"), fd.get("wall"), fd.get("shelf"), fd.get("book"), fd.get("page")].join(".");
    setTimeout(() => {
      showPage(identifier);
      btn.disabled = false;
      btn.innerText = "Перейти";
    }, 10);
  };
}

// -------------------- PAGE --------------------
function showPage(identifier, highlight) {
  showLoading();
  setTimeout(() => {
    try {
      const data = generateContent(identifier);
      currentPageState = data;
      const lines = data.content.match(new RegExp(".{" + CHARS + "}", "g"));
      const idString = "Кімната " + data.roomShort + " / Стіна " + data.wall + " / Полиця " + data.shelf + " / Книга " + data.book + " / Сторінка " + data.page;

      let lineNumbersHtml = "";
      for (let i = 1; i <= lines.length; i++) {
        lineNumbersHtml += "<span>" + (i < 10 ? "0" + i : i) + "</span>";
      }

      let pageSelectOptions = "";
      for (let p = 1; p <= PAGES; p++) {
        const selected = p === parseInt(data.page) ? " selected" : "";
        pageSelectOptions += '<option value="' + p + '"' + selected + '>' + p + '</option>';
      }

      app.innerHTML = \`
        <div class="PageInfo">
          <pre>\${idString}</pre>
        </div>
        <div class="PageActions">
          <button onclick="doHighlightWords()">Підсвітити українські слова</button>
          <button onclick="copyPageText()">Скопіювати текст сторінки</button>
        </div>
        <div class="PageContentWrapper">
          <div class="PageContent">
            <div class="Lines">\${lineNumbersHtml}</div>
            <pre id="page-pre">\${lines.join("\\n")}</pre>
          </div>
        </div>
        <div class="PageNavigation">
          <a onclick="navigate('page', '\${data.prevIdentifier}')">&larr; Попередня</a>
          <div class="PageSelector">
            <p>Сторінка</p>
            <select id="page-select">\${pageSelectOptions}</select>
          </div>
          <a onclick="navigate('page', '\${data.nextIdentifier}')">Наступна &rarr;</a>
        </div>
      \`;

      // Page selector
      document.getElementById('page-select').onchange = (e) => {
        const newId = [data.room, data.wall, data.shelf, data.book, e.target.value].join(".");
        navigate('page', newId);
      };

      // Apply highlight if needed
      if (highlight) {
        applyHighlight(highlight);
      }
    } catch (err) {
      app.innerHTML = '<div class="BodyStyle"><p>Помилка: ' + err.message + '</p><p><a onclick="navigate(\\'home\\')">Повернутися на головну</a></p></div>';
    }
  }, 10);
}

function applyHighlight(hl) {
  const content = document.getElementById('page-pre');
  if (!content) return;
  const lines = content.innerText.split("\\n");
  const startingLine = lines[hl.startLine].split("");
  startingLine.splice(hl.startCol, 0, "<strong>");
  lines[hl.startLine] = startingLine.join("");
  const endingLine = lines[hl.endLine].split("");
  endingLine.splice(hl.endCol + (hl.startLine === hl.endLine ? 8 : 0), 0, "</strong>");
  lines[hl.endLine] = endingLine.join("");
  content.innerHTML = lines.join("\\n");
}

function copyPageText() {
  const pre = document.getElementById('page-pre');
  if (pre) {
    navigator.clipboard.writeText(pre.innerText).then(() => {
      const btn = document.querySelectorAll('.PageActions button')[1];
      btn.innerText = "Скопійовано!";
      setTimeout(() => btn.innerText = "Скопіювати текст сторінки", 2000);
    });
  }
}

function doHighlightWords() {
  const contentEl = document.getElementById('page-pre');
  if (!contentEl) return;

  contentEl.querySelectorAll('.Highlight').forEach(el => el.remove());

  const content = contentEl.innerText.replaceAll("\\n", "");
  let params = [];

  for (const word of WORDS_LIST) {
    const trimmed = word.trim();
    if (trimmed.length > 1) {
      const regex = new RegExp(trimmed, "g");
      const matches = content.matchAll(regex);
      for (const match of matches) {
        params.push([match.index, trimmed, match[0]]);
      }
    }
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const rowHeight = 14 * (isSafari ? 1.145 : 1.2);

  for (let i = 0; i < params.length; i++) {
    const [index, word, fullMatch] = params[i];
    const fullMatchTrimmed = fullMatch.trimStart();
    const startingSpaces = fullMatch.length - fullMatchTrimmed.length;
    const pos = index + startingSpaces;

    const startRow = Math.floor(pos / CHARS);
    const startCol = pos % CHARS;
    const endPos = pos + word.length - 1;
    const endRow = Math.floor(endPos / CHARS);
    const endCol = endPos % CHARS;

    const el = document.createElement("div");
    el.className = "Highlight";
    el.style.animationDelay = (10 * i) + "ms";
    el.style.top = (startRow * rowHeight) + "px";
    el.style.left = startCol + "ch";

    if (startRow === endRow) {
      el.style.width = (endCol - startCol + 1) + "ch";
    } else {
      el.style.width = (CHARS - startCol) + "ch";
    }
    contentEl.appendChild(el);
  }
}

// -------------------- ABOUT --------------------
function showAbout() {
  app.innerHTML = \`
    <div class="BodyStyle">
      <img class="Banner" src="\${IMAGES.study}" alt="Бібліотекар біля полиць">

      <h2>Що таке Бібліотека Вавилону?</h2>
      <p class="initial">
        <span>Бібліотека</span> Вавилону — це вигадана бібліотека, що містить кожну можливу унікальну книгу з 1 312 000 символів. Кожна книга має 410 сторінок по 40 рядків по 80 символів. 410 &times; 40 &times; 80 = 1 312 000. Оскільки кожна книга складається з комбінації тих самих 39 символів українського алфавіту, загальна кількість унікальних книг становить <span class="nobreak">39<span class="super">1 312 000</span></span>. Для порівняння, кількість атомів у спостережуваному всесвіті оцінюється приблизно в <span class="nobreak">10<span class="super">80</span></span>.
      </p>
      <p>Вона містить кожну книгу, яку будь-коли було написано, і кожну книгу, яку ще буде написано. Як Книга Заклинань, що містить кожне можливе закляття — навіть ті, що ніхто ніколи не вимовить.</p>

      <h2>Як це працює?</h2>
      <p>Книги не <em>зберігаються</em> — вони <em>генеруються</em> математичною функцією. Коли ти відкриваєш сторінку, спрацьовує обчислення, що перетворює порядковий номер книги на її вміст. Наступного разу, коли хтось відкриє ту саму сторінку, функція спрацює знову і видасть той самий результат — подібно до того, як 2 &times; 5 завжди дорівнює 10.</p>
      <ol>
        <li>Кожна книга отримує числовий індекс. Перша книга на першій полиці — це книга 1, перша книга на другій полиці — 33, і так далі, аж до останньої книги у всій бібліотеці — з індексом <span class="nobreak">39<span class="super">1 312 000</span></span>.</li>
        <li>Це (зазвичай величезне) число проходить через математичну функцію і перетворюється на інше унікальне число з 1 312 000 цифр у системі числення з основою 39.</li>
        <li>Кожна цифра результату відображається на відповідний символ з українського алфавіту з 39 символів, утворюючи вміст книги.</li>
      </ol>
      <p>Ключова властивість: математична функція <strong>оборотна</strong> — можна задати вміст книги і обчислити, в якій саме книзі він знаходиться. Саме так працює пошук.</p>

      <p>Адреса кожної сторінки має формат <span style="font-family: var(--font-mono); background: rgba(0,0,0,0.075); padding: 0 3px; border-radius: 2px;">кімната.стіна.полиця.книга.сторінка</span>, наприклад <span style="font-family: var(--font-mono); background: rgba(0,0,0,0.075); padding: 0 3px; border-radius: 2px;">1.2.3.4.5</span>.</p>

      <h2>Хіба це не підробка?</h2>
      <p>Якби бібліотека просто зберігала сторінки, це вимагало б неосяжного обсягу пам'яті. Одна книга займає 1 312 000 байт. Помножте на <span class="nobreak">39<span class="super">1 312 000</span></span> унікальних книг — число, для запису якого не вистачить усіх атомів всесвіту. Натомість книги генеруються "на льоту" за їхнім індексом, і один і той самий індекс завжди породжує ту саму книгу.</p>

      <h2>Чому ця версія особлива?</h2>
      <p>Це єдина реалізація Бібліотеки, що містить кожну унікальну <em>книгу</em>, а не лише кожну унікальну <em>сторінку</em>. Ти можеш шукати текст довший за одну сторінку.</p>

      <p>Прочитай <a onclick="navigate('story')">оригінальне оповідання Борхеса</a>, щоб зануритися в атмосферу бібліотеки.</p>
    </div>
  \`;
}

// -------------------- STORY (Borges' text) --------------------
function showStory() {
  app.innerHTML = \`
    <div class="ProseStyle">
      <h2>The Library of Babel</h2>
      <h3>By Jorge Luis Borges</h3>
      <h4>By this art you may contemplate the variation of the 23 letters....</h4>
      <p style="text-align:right;margin-bottom:15px;"><em>Anatomy of Melancholy, Pt. 2, Sec. II, Mem. IV</em></p>

      <p class="initial"><span>The</span> universe (which others call the Library) is composed of an indefinite, perhaps infinite number of hexagonal galleries. In the center of each gallery is a ventilation shaft, bounded by a low railing. From any hexagon one can see the floors above and below—one after another, endlessly. The arrangement of the galleries is always the same: Twenty bookshelves, five to each side, line four of the hexagon's six sides; the height of the bookshelves, floor to ceiling, is hardly greater than the height of a normal librarian. One of the hexagon's free sides opens onto a narrow sort of vestibule, which in turn opens onto another gallery, identical to the first—identical in fact to all. To the left and right of the vestibule are two tiny compartments. One is for sleeping, upright; the other, for satisfying one's physical necessities. Through this space, too, there passes a spiral staircase, which winds upward and downward into the remotest distance. In the vestibule there is a mirror, which faithfully duplicates appearances. Men often infer from this mirror that the Library is not infinite—if it were, what need would there be for that illusory replication? I prefer to dream that burnished surfaces are a figuration and promise of the infinite... Light is provided by certain spherical fruits that bear the name "bulbs." There are two of these bulbs in each hexagon, set crosswise. The light they give is insufficient, and unceasing.</p>

      <p>Like all the men of the Library, in my younger days I traveled; I have journeyed in quest of a book, perhaps the catalog of catalogs. Now that my eyes can hardly make out what I myself have written, I am preparing to die, a few leagues from the hexagon where I was born. When I am dead, compassionate hands will throw me over the railing; my tomb will be the unfathomable air, my body will sink for ages, and will decay and dissolve in the wind engendered by my fall, which shall be infinite. I declare that the Library is endless. Idealists argue that the hexagonal rooms are the necessary shape of absolute space, or at least of our perception of space. They argue that a triangular or pentagonal chamber is inconceivable. (Mystics claim that their ecstasies reveal to them a circular chamber containing an enormous circular book with a continuous spine that goes completely around the walls. But their testimony is suspect, their words obscure. That cyclical book is God.) Let it suffice for the moment that I repeat the classic dictum: <em>The Library is a sphere whose exact center is any hexagon and whose circumference is unattainable.</em></p>

      <p>Each wall of each hexagon is furnished with five bookshelves; each bookshelf holds thirty-two books identical in format; each book contains four hundred ten pages; each page, forty lines; each line, approximately eighty black letters. There are also letters on the front cover of each book; those letters neither indicate nor prefigure what the pages inside will say. I am aware that that lack of correspondence once struck men as mysterious. Before summarizing the solution of the mystery (whose discovery, in spite of its tragic consequences, is perhaps the most important event in all history), I wish to recall a few axioms.</p>

      <p>First: <em>The Library has existed ab aeternitate</em>. That truth, whose immediate corollary is the future eternity of the world, no rational mind can doubt. Man, the imperfect librarian, may be the work of chance or of malevolent demiurges; the universe, with its elegant appointments—its bookshelves, its enigmatic books, its indefatigable staircases for the traveler, and its water closets for the seated librarian—can only be the handiwork of a god. In order to grasp the distance that separates the human and the divine, one has only to compare these crude trembling symbols which my fallible hand scrawls on the cover of a book with the organic letters inside—neat, delicate, deep black, and inimitably symmetrical.</p>

      <p>Second: <em>There are twenty-five orthographic symbols</em>.<sup><a href="#fn1">1</a></sup> That discovery enabled mankind, three hundred years ago, to formulate a general theory of the Library and thereby satisfactorily solve the riddle that no conjecture had been able to divine—the formless and chaotic nature of virtually all books. One book, which my father once saw in a hexagon in circuit 15-94, consisted of the letters M C V perversely repeated from the first line to the last. Another (much consulted in this zone) is a mere labyrinth of letters whose penultimate page contains the phrase <em>O Time thy pyramids</em>. This much is known: For every rational line or forthright statement there are leagues of senseless cacophony, verbal nonsense, and incoherency. (I know of one semibarbarous zone whose librarians repudiate the "vain and superstitious habit" of trying to find sense in books, equating such a quest with attempting to find meaning in dreams or in the chaotic lines of the palm of one's hand... They will acknowledge that the inventors of writing imitated the twenty-five natural symbols, but contend that that adoption was fortuitous, coincidental, and that books in themselves have no meaning. That argument, as we shall see, is not entirely fallacious.)</p>

      <p>For many years it was believed that those impenetrable books were in ancient or far-distant languages. It is true that the most ancient peoples, the first librarians, employed a language quite different from the one we speak today; it is true that a few miles to the right, our language devolves into dialect and that ninety floors above, it becomes incomprehensible. All of that, I repeat, is true—but four hundred ten pages of unvarying M C V's cannot belong to any language, however dialectal or primitive it may be. Some have suggested that each letter influences the next, and that the value of M C V on page 71, line 3, is not the value of the same series on another line of another page, but that vague thesis has not met with any great acceptance. Others have mentioned the possibility of codes; that conjecture has been universally accepted, though not in the sense in which its originators formulated it.</p>

      <p>Some five hundred years ago, the chief of one of the upper hexagons<sup><a href="#fn2">2</a></sup> came across a book as jumbled as all the others, but containing almost two pages of homogeneous lines. He showed his find to a traveling decipherer, who told him that the lines were written in Portuguese; others said it was Yiddish. Within the century experts had determined what the language actually was: a Samoyed-Lithuanian dialect of Guarani, with inflections from classical Arabic. The content was also determined: the rudiments of combinatory analysis, illustrated with examples of endlessly repeating variations. Those examples allowed a librarian of genius to discover the fundamental law of the Library. This philosopher observed that all books, however different from one another they might be, consist of identical elements: the space, the period, the comma, and the twenty-two letters of the alphabet. He also posited a fact which all travelers have since confirmed: <em>In all the Library, there are no two identical books</em>. From those incontrovertible premises, the librarian deduced that the Library is "total"—perfect, complete, and whole—and that its bookshelves contain all possible combinations of the twenty-two orthographic symbols (a number which, though unimaginably vast, is not infinite)—that is, all that is able to be expressed, in every language. <em>All</em>—the detailed history of the future, the autobiographies of the archangels, the faithful catalog of the Library, thousands and thousands of false catalogs, the proof of the falsity of those false catalogs, a proof of the falsity of the <em>true</em> catalog, the gnostic gospel of Basilides, the commentary upon that gospel, the commentary on the commentary on that gospel, the true story of your death, the translation of every book into every language, the interpolations of every book into all books, the treatise Bede could have written (but did not) on the mythology of the Saxon people, the lost books of Tacitus.</p>

      <p>When it was announced that the Library contained all books, the first reaction was unbounded joy. All men felt themselves the possessors of an intact and secret treasure. There was no personal problem, no world problem, whose eloquent solution did not exist—somewhere in some hexagon. The universe was justified; the universe suddenly became congruent with the unlimited width and breadth of humankind's hope. At that period there was much talk of The Vindications—books of <em>apologiae</em> and prophecies that would vindicate for all time the actions of every person in the universe and that held wondrous arcana for men's futures. Thousands of greedy individuals abandoned their sweet native hexagons and rushed downstairs, upstairs, spurred by the vain desire to find their Vindication. These pilgrims squabbled in the narrow corridors, muttered dark imprecations, strangled one another on the divine staircases, threw deceiving volumes down ventilation shafts, were themselves hurled to their deaths by men of distant regions. Others went insane... The Vindications do exist (I have seen two of them, which refer to persons in the future, persons perhaps not imaginary), but those who went in quest of them failed to recall that the chance of a man's finding his own Vindication, or some perfidious version of his own, can be calculated to be zero.</p>

      <p>At that same period there was also hope that the fundamental mysteries of mankind—the origin of the Library and of time—might be revealed. In all likelihood those profound mysteries can indeed be explained in words; if the language of the philosophers is not sufficient, then the multiform Library must surely have produced the extraordinary language that is required, together with the words and grammar of that language. For four centuries, men have been scouring the hexagons... There are official searchers, the "inquisitors." I have seen them about their tasks: they arrive exhausted at some hexagon, they talk about a staircase that nearly killed them—rungs were missing—they speak with the librarian about galleries and staircases, and, once in a while, they take up the nearest book and leaf through it, searching for disgraceful or dishonorable words. Clearly, no one expects to discover anything.</p>

      <p>That unbridled hopefulness was succeeded, naturally enough, by a similarly disproportionate depression. The certainty that some bookshelf in some hexagon contained precious books, yet that those precious books were forever out of reach, was almost unbearable. One blasphemous sect proposed that the searches be discontinued and that all men shuffle letters and symbols until those canonical books, through some improbable stroke of chance, had been constructed. The authorities were forced to issue strict orders. The sect disappeared, but in my childhood I have seen old men who for long periods would hide in the latrines with metal disks and a forbidden dice cup, feebly mimicking the divine disorder.</p>

      <p>Others, going about it in the opposite way, thought the first thing to do was eliminate all worthless books. They would invade the hexagons, show credentials that were not always false, leaf disgustedly through a volume, and condemn entire walls of books. It is to their hygienic, ascetic rage that we lay the senseless loss of millions of volumes. Their name is execrated today, but those who grieve over the "treasures" destroyed in that frenzy overlook two widely acknowledged facts: One, that the Library is so huge that any reduction by human hands must be infinitesimal. And two, that each book is unique and irreplaceable, but (since the Library is total) there are always several hundred thousand imperfect facsimiles—books that differ by no more than a single letter, or a comma. Despite general opinion, I daresay that the consequences of the depredations committed by the Purifiers have been exaggerated by the horror those same fanatics inspired. They were spurred on by the holy zeal to reach—someday, through unrelenting effort—the books of the Crimson Hexagon—books smaller than natural books, books omnipotent, illustrated, and magical.</p>

      <p>We also have knowledge of another superstition from that period: belief in what was termed the Book-Man. On some shelf in some hexagon, it was argued, there must exist a book that is the cipher and perfect compendium <em>of all other books</em>, and some librarian must have examined that book; this librarian is analogous to a god. In the language of this zone there are still vestiges of the sect that worshiped that distant librarian. Many have gone in search of Him. For a hundred years, men beat every possible path—and every path in vain. How was one to locate the idolized secret hexagon that sheltered Him? Someone proposed searching by regression: To locate book A, first consult book B, which tells where book A can be found; to locate book B, first consult book C, and so on, to infinity... It is in ventures such as these that I have squandered and spent my years. I cannot think it unlikely that there is such a total book<sup><a href="#fn3">3</a></sup> on some shelf in the universe. I pray to the unknown gods that some man—even a single man, tens of centuries ago—has perused and read that book. If the honor and wisdom and joy of such a reading are not to be my own, then let them be for others. Let heaven exist, though my own place be in hell. Let me be tortured and battered and annihilated, but let there be one instant, one creature, wherein thy enormous Library may find its justification.</p>

      <p>Infidels claim that the rule in the Library is not "sense;" but "non-sense;" and that "rationality" (even humble, pure coherence) is an almost miraculous exception. They speak, I know, of "the feverish Library, whose random volumes constantly threaten to transmogrify into others, so that they affirm all things, deny all things, and confound and confuse all things, like some mad and hallucinating deity." Those words, which not only proclaim disorder but exemplify it as well, prove, as all can see, the infidels' deplorable taste and desperate ignorance. For while the Library contains all verbal structures, all the variations allowed by the twenty-five orthographic symbols, it includes not a single absolute piece of nonsense. It would be pointless to observe that the finest volume of all the many hexagons that I myself administer is titled <em>Combed Thunder</em>, while another is titled <em>The Plaster Cramp</em>, and another, <em>Axaxaxas mlo</em>. Those phrases, at first apparently incoherent, are undoubtedly susceptible to cryptographic or allegorical "reading"; that reading, that justification of the words' order and existence, is itself verbal and, <em>ex hypothesi</em>, already contained somewhere in the Library. There is no combination of characters one can make—<em>dhcmrlchtdj</em>, for example—that the divine Library has not foreseen and that in one or more of its secret tongues does not hide a terrible significance. There is no syllable one can speak that is not filled with tenderness and terror, that is not, in one of those languages, the mighty name of a god. To speak is to commit tautologies. This pointless, verbose epistle already exists in one of the thirty volumes of the five bookshelves in one of the countless hexagons—as does its refutation. (A number <em>n</em> of the possible languages employ the same vocabulary; in some of them, the <em>symbol</em> "library" possesses the correct definition "everlasting, ubiquitous system of hexagonal galleries," while a library—the thing—is a loaf of bread or a pyramid or something else, and the six words that define it themselves have other definitions. You who read me—are you certain you understand my language?)</p>

      <p>Methodical composition distracts me from the present condition of humanity. The certainty that everything has already been written annuls us, or renders us phantasmal. I know districts in which the young people prostrate themselves before books and like savages kiss their pages, though they cannot read a letter. Epidemics, heretical discords, pilgrimages that inevitably degenerate into brigandage have decimated the population. I believe I mentioned the suicides, which are more and more frequent every year. I am perhaps misled by old age and fear, but I suspect that the human species—the <em>only</em> species—teeters at the verge of extinction, yet that the Library—enlightened, solitary, infinite, perfectly unmoving, armed with precious volumes, pointless, incorruptible, and secret—will endure.</p>

      <p>I have just written the word "infinite." I have not included that adjective out of mere rhetorical habit; I hereby state that it is not illogical to think that the world is infinite. Those who believe it to have limits hypothesize that in some remote place or places the corridors and staircases and hexagons may, inconceivably, end—which is absurd. And yet those who picture the world as unlimited forget that the number of possible books is <em>not</em>. I will be bold enough to suggest this solution to the ancient problem: <em>The Library is unlimited but periodic</em>. If an eternal traveler should journey in any direction, he would find after untold centuries that the same volumes are repeated in the same disorder—which, repeated, becomes order: the Order. My solitude is cheered by that elegant hope.<sup><a href="#fn4">4</a></sup></p>

      <div class="Footnotes">
        <ol>
          <li id="fn1">The original manuscript has neither numbers nor capital letters; punctuation is limited to the comma and the period. Those two marks, the space, and the twenty-two letters of the alphabet are the twenty-five sufficient symbols that our unknown author is referring to. [Ed. note.]</li>
          <li id="fn2">In earlier times, there was one man for every three hexagons. Suicide and diseases of the lung have played havoc with that proportion. An unspeakably melancholy memory: I have sometimes traveled for nights on end, down corridors and polished staircases, without coming across a single librarian.</li>
          <li id="fn3">I repeat: In order for a book to exist, it is sufficient that it be possible. Only the impossible is excluded. For example, no book is also a staircase, though there are no doubt books that discuss and deny and prove that possibility, and others whose structure corresponds to that of a staircase.</li>
          <li id="fn4">Letizia Alvarez de Toledo has observed that the vast Library is pointless; strictly speaking, all that is required is a <em>single volume</em>, of the common size, printed in nine- or ten-point type, that would consist of an infinite number of infinitely thin pages. (In the early seventeenth century, Cavalieri stated that every solid body is the superposition of an infinite number of planes.) Using that silken <em>vademecum</em> would not be easy: each apparent page would open into other similar pages; the inconceivable middle page would have no "back."</li>
        </ol>
      </div>
    </div>
  \`;
}

// ============================================================
// INIT
// ============================================================
(async function() {
  try {
    await initBabel();
    document.getElementById('loading-overlay').style.display = 'none';
    document.getElementById('main-nav').style.display = '';
    document.getElementById('main-footer').style.display = '';
    showHome();
  } catch (err) {
    document.getElementById('loading-overlay').innerHTML =
      '<div style="text-align:center"><p>Помилка ініціалізації: ' + err.message + '</p><p>Спробуй оновити сторінку.</p></div>';
  }
})();
</script>
</body>
</html>`;

// --- Write output ---
const outputPath = path.join(__dirname, 'babel.html');
fs.writeFileSync(outputPath, html, 'utf8');
const stats = fs.statSync(outputPath);
console.log(`Done! Output: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
