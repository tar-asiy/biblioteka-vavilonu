#!/usr/bin/env node
/**
 * Generate mathematical constants (N, C, I) for the Ukrainian Library of Babel.
 * Ukrainian alphabet (33 letters) + 6 punctuation = 39 characters = base 39.
 *
 * GMP base-39 digit charset: 0-9 A-Z a-c
 *
 * This may take 10-30 minutes in WASM. Progress is logged.
 */

const { init: gmp_init } = require("gmp-wasm");
const fs = require("fs");

const ALPHA_LENGTH = 39; // Ukrainian: 33 letters + .,!?- and space
const BOOK_LENGTH = 410 * 40 * 80; // 1,312,000

// GMP base-39 digits: 0-9(10) + A-Z(26) + a-c(3) = 39
const BASE_ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabc";
const BASE_LAST = BASE_ALPHA[BASE_ALPHA.length - 1]; // 'c' = digit 38

(async () => {
  console.log(`Alphabet length: ${ALPHA_LENGTH}`);
  console.log(`Book length: ${BOOK_LENGTH} characters`);
  console.log("Initializing GMP-WASM...");
  const { binding } = await gmp_init();
  console.log("GMP ready.");

  // N = base_last repeated BOOK_LENGTH times, interpreted in base ALPHA_LENGTH
  // This equals ALPHA_LENGTH^BOOK_LENGTH - 1
  console.log("Setting N...");
  const N = binding.mpz_t();
  binding.mpz_init(N);
  const nStr = new Array(BOOK_LENGTH).fill(BASE_LAST).join("");
  binding.mpz_set_string(N, nStr, ALPHA_LENGTH);
  console.log(`N set (${BOOK_LENGTH} digits in base ${ALPHA_LENGTH}).`);

  // Generate random C of BOOK_LENGTH digits, starting with BASE_LAST
  console.log("Generating random C...");
  let randomStartNum = BASE_LAST;
  for (let i = 1; i < BOOK_LENGTH; i++) {
    randomStartNum += BASE_ALPHA[Math.floor(Math.random() * BASE_ALPHA.length)];
  }
  const C = binding.mpz_t();
  binding.mpz_init(C);
  binding.mpz_set_string(C, randomStartNum, ALPHA_LENGTH);
  console.log("C initialized.");

  // Find coprime C and its modular inverse
  console.log("Searching for coprime C (this may take a while)...");
  let attempts = 0;

  while (binding.mpz_cmp_ui(C, 0) > 0) {
    attempts++;

    // Check GCD
    const gcd = binding.mpz_t();
    binding.mpz_init(gcd);
    binding.mpz_gcd(gcd, N, C);
    const isCoprime = binding.mpz_cmp_ui(gcd, 1) === 0;
    binding.mpz_clear(gcd);

    if (isCoprime) {
      console.log(`Found coprime C after ${attempts} attempt(s). Computing modular inverse...`);

      const gcd2 = binding.mpz_t();
      binding.mpz_init(gcd2);
      const x = binding.mpz_t();
      binding.mpz_init(x);
      const y = binding.mpz_t();
      binding.mpz_init(y);

      binding.mpz_gcdext(gcd2, x, y, C, N);
      const inverseExists = binding.mpz_cmp_ui(gcd2, 1) === 0;

      if (inverseExists) {
        const I = binding.mpz_t();
        binding.mpz_init(I);
        binding.mpz_mod(I, x, N);
        if (binding.mpz_sgn(I) < 0) {
          binding.mpz_add(I, I, N);
        }

        console.log("Modular inverse found! Writing numbers file...");

        const nString = binding.mpz_to_string(N, ALPHA_LENGTH);
        const cString = binding.mpz_to_string(C, ALPHA_LENGTH);
        const iString = binding.mpz_to_string(I, ALPHA_LENGTH);

        fs.writeFileSync("numbers-ukr", `${nString}\n${cString}\n${iString}`);
        console.log(`Done! Written to numbers-ukr (${fs.statSync("numbers-ukr").size} bytes)`);

        binding.mpz_clears(gcd2, x, y, I);
        break;
      } else {
        console.log("ERROR: modular inverse does not exist (should not happen).");
        binding.mpz_clears(gcd2, x, y);
        break;
      }
    }

    if (attempts % 10 === 0) {
      console.log(`  ${attempts} attempts so far...`);
    }

    binding.mpz_sub_ui(C, C, 1);
  }

  await binding.reset();
  console.log("Finished.");
})();
