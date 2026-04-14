/* ═══ Koopax OpenFormat — זיהוי וקידוד ═══ */

const CP862 = {};
for (let i = 0; i <= 26; i++) CP862[0x80 + i] = 0x05d0 + i;

function decodeCp862(buf) {
  const b = new Uint8Array(buf);
  let r = "";
  for (let i = 0; i < b.length; i++) r += String.fromCharCode(CP862[b[i]] || b[i]);
  return r;
}

function hasHeb(s) {
  return /[\u05d0-\u05ea]/.test(s);
}

function hebScore(s) {
  const sample = s.slice(0, 5000);
  const nonTrivial = sample.replace(/[\x00-\x20\x7f|,.\-:;/\\0-9\r\n\t"'()\[\]{}+= ]/g, "");
  if (!nonTrivial.length) return 0;
  const heb = (nonTrivial.match(/[\u05d0-\u05ea]/g) || []).length;
  return heb / nonTrivial.length;
}

function hasJunk(s) {
  const x = s.slice(0, 2000);
  return (
    (x.match(/[¥£¢¤¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾]/g) || []).length > 5 ||
    ((x.match(/[^\x00-\x7f\u05d0-\u05ea\u0590-\u05ff\u200f\u200e]/g) || []).length > 20 &&
      !hasHeb(x))
  );
}

function textToLatin1Bytes(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0xff) return null;
    bytes[i] = code;
  }
  return bytes;
}

function tryDoubleEncodingFix(text, targetEnc) {
  const bytes = textToLatin1Bytes(text);
  if (!bytes) return null;
  try {
    let decoded;
    if (targetEnc === "cp862") {
      decoded = decodeCp862(bytes.buffer);
    } else {
      decoded = new TextDecoder(targetEnc).decode(bytes);
    }
    const hs = hebScore(decoded);
    return hs > 0.12 ? decoded : null;
  } catch (e) {
    return null;
  }
}

export function decodeAuto(buf) {
  const b = new Uint8Array(buf);

  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
    const t = new TextDecoder("utf-8").decode(buf);
    if (hasHeb(t) && !hasJunk(t)) return { text: t, enc: "UTF-8" };
  }

  const tries = [];

  const directEncodings = [
    ["utf-8",         "UTF-8",         3],
    ["windows-1255",  "Windows-1255",  2.5],
    ["iso-8859-8-i",  "ISO-8859-8-I",  2],
    ["iso-8859-8",    "ISO-8859-8",    1.5],
  ];

  for (const [enc, label, base] of directEncodings) {
    try {
      const t = new TextDecoder(enc).decode(buf);
      const hs = hebScore(t);
      const good = hasHeb(t) && !hasJunk(t);
      tries.push({ text: t, enc: label, s: good ? base + hs : 0 });
    } catch (e) { /* ignore */ }
  }

  {
    const t = decodeCp862(buf);
    const hs = hebScore(t);
    const good = hasHeb(t) && !hasJunk(t);
    tries.push({ text: t, enc: "CP-862", s: good ? 1 + hs : 0 });
  }

  tries.sort((a, c) => c.s - a.s);
  if (tries[0]?.s > 1) return tries[0];

  const fixTargets = [
    ["utf-8",         "UTF-8",         4],
    ["windows-1255",  "Windows-1255",  3.5],
    ["iso-8859-8-i",  "ISO-8859-8-I",  3],
    ["iso-8859-8",    "ISO-8859-8",    2.5],
    ["cp862",         "CP-862",        2],
  ];

  for (const primary of tries) {
    if (primary.s > 0.5 || !primary.text) continue;
    for (const [targetEnc, targetLabel, base] of fixTargets) {
      if (targetEnc === primary.enc?.toLowerCase?.()) continue;
      const fixed = tryDoubleEncodingFix(primary.text, targetEnc);
      if (fixed) {
        const hs = hebScore(fixed);
        tries.push({
          text: fixed,
          enc: `${targetLabel} (תוקן מ-${primary.enc})`,
          s: base + hs,
        });
      }
    }
  }

  tries.sort((a, c) => c.s - a.s);
  return tries[0] || { text: "", enc: "?" };
}
