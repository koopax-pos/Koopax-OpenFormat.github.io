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

function hasJunk(s) {
  const x = s.slice(0, 2000);
  return (
    (x.match(/[¥£¢¤¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾]/g) || []).length > 5 ||
    ((x.match(/[^\x00-\x7f\u05d0-\u05ea\u0590-\u05ff\u200f\u200e]/g) || []).length > 20 &&
      !hasHeb(x))
  );
}

export function decodeAuto(buf) {
  const b = new Uint8Array(buf);
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
    const t = new TextDecoder("utf-8").decode(buf);
    if (!hasJunk(t)) return { text: t, enc: "UTF-8" };
  }
  const tries = [];
  try {
    const t = new TextDecoder("utf-8").decode(buf);
    tries.push({ text: t, enc: "UTF-8", s: hasHeb(t) && !hasJunk(t) ? 3 : 0 });
  } catch (e) { /* ignore */ }
  try {
    const t = new TextDecoder("iso-8859-8-i").decode(buf);
    tries.push({ text: t, enc: "ISO-8859-8-I", s: hasHeb(t) && !hasJunk(t) ? 2 : 0 });
  } catch (e) { /* ignore */ }
  try {
    const t = new TextDecoder("iso-8859-8").decode(buf);
    tries.push({ text: t, enc: "ISO-8859-8", s: hasHeb(t) && !hasJunk(t) ? 1.5 : 0 });
  } catch (e) { /* ignore */ }
  {
    const t = decodeCp862(buf);
    tries.push({ text: t, enc: "CP-862", s: hasHeb(t) && !hasJunk(t) ? 1 : 0 });
  }
  tries.sort((a, b2) => b2.s - a.s);
  return tries[0] || { text: "", enc: "?" };
}
