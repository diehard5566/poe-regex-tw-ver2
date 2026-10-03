// Adapted from veiset/poe.re @ 5d07d01eb53f26267f733df404566488e71150f3.
// SelectedOptionRegex.ts, GenerateNumberRegex.ts, PriceRange.ts, GeneratePriceRangeRegex.ts.
// Only TypeScript annotations/imports and unused numeric helpers were removed.
export function generateNumberRegex(number, optimize) {
  const numbers = number.match(/\d/g);

  if (numbers === null) {
    return "";
  }

  const quant = optimize ? Math.floor(Number(numbers.join("")) / 10) * 10 : Number(numbers.join(""));

  if (isNaN(quant) || quant === 0) {
    if (optimize && numbers.length === 1) {
      return ".";
    }

    return "";
  }

  if (quant >= 100) {
    return threeDigitMin(quant);
  }

  if (quant > 9) {
    const str = quant.toString();
    const d0 = str[0];
    const d1 = str[1];

    if (str[1] === "0") {
      return `([${d0}-9].|\\d..)`;
    } else if (str[0] === "9") {
      return `(${d0}[${d1}-9]|\\d..)`;
    } else {
      return `(${d0}[${d1}-9]|[${Number(d0) + 1}-9].|\\d..)`;
    }
  }

  if (quant <= 9) {
    return `([${quant}-9]|\\d..?)`;
  }

  return number;
}

// Matches an affix's actual rolled value bounded to "(min-max)", anchored on "("
// Falls back to an open-ended ">= min" match when the bounds don't fit a 2-digit range
export function generateBoundedValueRegex(min, max, round10) {
  const ranged = generateNumberRangeRegex(min, max, round10);
  const number = ranged !== "" ? ranged : generateNumberRegex(min, round10);

  return `${number.replace(/\./g, "\\d")}\\(`;
}

// Generates the shortest regex matching an inclusive [min, max] integer range.
// NOTE: only handles 1- and 2-digit numbers (0-99); 3-digit input is not supported.
export function generateNumberRangeRegex(min, max, round10) {
  const minDigits = min.match(/\d/g);
  const maxDigits = max.match(/\d/g);

  if (minDigits === null || maxDigits === null) {
    return "";
  }

  if (minDigits.length > 2 || maxDigits.length > 2) {
    return "";
  }

  let lo = Number(minDigits.join(""));
  let hi = Number(maxDigits.join(""));

  if (round10) {
    lo = Math.floor(lo / 10) * 10;
    hi = Math.floor(hi / 10) * 10;
  }

  if (isNaN(lo) || isNaN(hi) || lo < 0 || hi > 99 || hi < lo) {
    return "";
  }

  const parts = [];

  if (lo <= 9) {
    parts.push(singleDigitPart(lo, Math.min(hi, 9)));
  }

  if (hi >= 10) {
    parts.push(...twoDigitParts(Math.max(lo, 10), hi));
  }

  return parts.length > 1 ? `(${parts.join("|")})` : parts[0];
}

function singleDigitPart(lo, hi) {
  if (lo === hi) return `${lo}`;
  return lo === 0 && hi === 9 ? "." : `[${lo}-${hi}]`;
}

function twoDigitParts(lo, hi) {
  const a = Math.floor(lo / 10);
  const b = lo % 10;
  const c = Math.floor(hi / 10);
  const d = hi % 10;

  if (a === c) {
    if (b === d) return [`${a}${b}`];
    return [b === 0 && d === 9 ? `${a}.` : `${a}[${b}-${d}]`];
  }

  const parts = [];

  if (b !== 0) {
    parts.push(b === 9 ? `${a}9` : `${a}[${b}-9]`);
  }

  const fullLo = b === 0 ? a : a + 1;
  const fullHi = d === 9 ? c : c - 1;

  if (fullLo <= fullHi) {
    parts.push(fullLo === fullHi ? `${fullLo}.` : `[${fullLo}-${fullHi}].`);
  }

  if (d !== 9) {
    parts.push(d === 0 ? `${c}0` : `${c}[0-${d}]`);
  }

  return parts;
}

function threeDigitMin(n) {
  const str = n.toString();
  const d0 = str[0];
  const d1 = str[1];
  const d2 = str[2];
  const D0 = Number(d0);
  const D1 = Number(d1);

  if (d1 === "0" && d2 === "0") {
    return D0 === 9 ? `${d0}..` : `[${d0}-9]..`;
  }

  let head;

  if (d2 === "0") {
    head = d1 === "9" ? `${d0}9.` : `${d0}[${d1}-9].`;
  } else if (d1 === "0") {
    head = `${d0}(0[${d2}-9]|[1-9].)`;
  } else if (d1 === "9" && d2 === "9") {
    head = `${d0}99`;
  } else if (d1 === "9") {
    head = `${d0}9[${d2}-9]`;
  } else {
    head = `${d0}(${d1}[${d2}-9]|[${D1 + 1}-9].)`;
  }

  return D0 === 9 ? head : `(${head}|[${D0 + 1}-9]..)`;
}

export function numericRegexPosition(option) {
  const numberIndex = option.name.indexOf("#");

  if (numberIndex === -1) return undefined;

  try {
    const match = new RegExp(option.regex, "i").exec(option.name.replaceAll("#", "0"));

    if (!match || match.index === undefined) return undefined;

    const matchEnd = match.index + match[0].length;

    if (matchEnd <= numberIndex) return "before";
    if (match.index > numberIndex) return "after";
  } catch {
    // Do not offer a numeric filter if the game regex cannot be safely positioned in JavaScript.
  }

  return undefined;
}
export function selectedOptionRegex(option, round10) {
  const position = numericRegexPosition(option);

  if (option.value === null || !position || !option.ranges[0]) return option.regex;

  const valueRegex = generateBoundedValueRegex(option.value.toString(), option.ranges[0][1].toString(), round10);

  return position === "before" ? `${option.regex}.*${valueRegex}` : `${valueRegex}.*${option.regex}`;
}
export const PRICE_RANGE_MIN = 0;
export const PRICE_RANGE_MAX = 999;
export function normalizePriceRange(minValue, maxValue) {
  const rawMin = minValue.trim() === "" ? PRICE_RANGE_MIN : Number(minValue);
  const rawMax = maxValue.trim() === "" ? PRICE_RANGE_MAX : Number(maxValue);

  if (!Number.isInteger(rawMin) || !Number.isInteger(rawMax)) return undefined;
  return {
    min: Math.max(PRICE_RANGE_MIN, Math.min(PRICE_RANGE_MAX, Math.min(rawMin, rawMax))),
    max: Math.max(PRICE_RANGE_MIN, Math.min(PRICE_RANGE_MAX, Math.max(rawMin, rawMax))),
  };
}
export function generatePriceRangeRegex(min, max, currency) {
  const range = normalizePriceRange(min, max);

  if (!range) return "";

  const {
    min: lo,
    max: hi,
  } = range;
  const broadRange = compactBroadPriceRange(lo, hi);

  if (broadRange) return `"${broadRange} ${currency}"`;

  const alternatives = [];

  for (let digits = 1; digits <= 3; digits += 1) {
    const floor = digits === 1 ? 0 : 10 ** (digits - 1);
    const ceiling = 10 ** digits - 1;
    const from = Math.max(lo, floor);
    const to = Math.min(hi, ceiling);

    if (from <= to) alternatives.push(...sameWidthRange(String(from), String(to)));
  }

  const number = alternatives.length === 1 ? alternatives[0] : `(${alternatives.join("|")})`;

  return `"${number} ${currency}"`;
}

function compactBroadPriceRange(lo, hi) {
  if (lo === 0 && hi === 9) return "\\d";
  if (lo === 0 && hi === 99) return "[1-9]?\\d";
  if (lo === 1 && hi === 99) return "[1-9]\\d?";
  if (lo === 0 && hi === 999) return "(0|[1-9]\\d{0,2})";
  if (lo === 1 && hi === 999) return "[1-9]\\d{0,2}";
  return "";
}

function sameWidthRange(from, to) {
  if (from === to) return [from];

  let common = 0;

  while (from[common] === to[common]) common += 1;

  const prefix = from.slice(0, common);
  const start = Number(from[common]);
  const end = Number(to[common]);
  const suffixLength = from.length - common - 1;
  const parts = [];
  const startSuffix = from.slice(common + 1);
  const partialStart = startSuffix.split("").some(digit => digit !== "0");

  if (partialStart) {
    for (const suffix of sameWidthRange(startSuffix, "9".repeat(suffixLength))) {
      parts.push(`${prefix}${start}${suffix}`);
    }
  }

  const endSuffix = to.slice(common + 1);
  const partialEnd = endSuffix.split("").some(digit => digit !== "9");
  const fullStart = start + (partialStart ? 1 : 0);
  const fullEnd = end - (partialEnd ? 1 : 0);

  if (fullStart <= fullEnd) {
    const digit = fullStart === fullEnd ? String(fullStart) : fullStart === 0 && fullEnd === 9 ? "\\d" : `[${fullStart}-${fullEnd}]`;

    parts.push(`${prefix}${digit}${"\\d".repeat(suffixLength)}`);
  }

  if (partialEnd) {
    for (const suffix of sameWidthRange("0".repeat(suffixLength), endSuffix)) {
      parts.push(`${prefix}${end}${suffix}`);
    }
  }

  return parts;
}
