/* ═══ Koopax OpenFormat — עיבוד וולידציה ═══ */

import { decodeAuto } from "./encoding";
import { parseIni, pC, pD, pP, pB, pM } from "./parsers";
import { ymd, toY } from "./formatters";

export function validate(ini, docs) {
  const w = [];
  if (!ini?.vat) w.push({ t: "error", m: "חסר מספר עוסק מורשה" });
  if (!ini?.biz) w.push({ t: "warn", m: "חסר שם עסק" });
  if (!docs.length) w.push({ t: "warn", m: "לא נמצאו מסמכים" });
  const nc = docs.filter((d) => !d.h.cn || d.h.cn === "[חסר שם לקוח]").length;
  if (nc) w.push({ t: "warn", m: `${nc} מסמכים ללא שם לקוח` });
  const zr = docs.filter((d) => d.h.to === 0 && d.h.dt >= 300 && d.h.dt <= 330).length;
  if (zr) w.push({ t: "warn", m: `${zr} חשבוניות עם סכום 0` });
  const ni = docs.filter((d) => !d.ds.length && d.h.dt >= 300 && d.h.dt <= 400).length;
  if (ni) w.push({ t: "warn", m: `${ni} מסמכים ללא שורות פריטים` });
  return w;
}

export function processAsync(iB, bB, onP) {
  return new Promise((res, rej) => {
    try {
      onP({ s: "מפענח קידוד...", p: 5 });
      const iDec = decodeAuto(iB);
      const bDec = decodeAuto(bB);
      onP({ s: `קידוד: INI=${iDec.enc} · BKMVDATA=${bDec.enc}`, p: 10 });
      const iL = iDec.text.split(/\r?\n/).filter((l) => l.length > 3);
      const bL = bDec.text.split(/\r?\n/).filter((l) => l.length > 3);
      const ini = iL.length ? parseIni(iL[0]) : null;
      const cs = [], ds2 = [], ps = [], bs = [], ms = [];
      const tot = bL.length;
      const CH = 400;
      let idx = 0;

      function chunk() {
        const end = Math.min(idx + CH, tot);
        for (; idx < end; idx++) {
          const l = bL[idx];
          const c = l.substring(0, 4);
          if (c === "C100") cs.push(pC(l));
          else if (c === "D110") ds2.push(pD(l));
          else if (c === "D120") ps.push(pP(l));
          else if (c === "B110") bs.push(pB(l));
          else if (c === "M100") ms.push(pM(l));
        }
        onP({
          s: `מעבד ${idx.toLocaleString()}/${tot.toLocaleString()} רשומות...`,
          p: 15 + Math.round((idx / tot) * 70),
        });
        if (idx < tot) { setTimeout(chunk, 0); return; }

        onP({ s: "מקשר מסמכים...", p: 90 });
        setTimeout(() => {
          const dL = {}, dK = {}, pL = {}, pK = {};
          ds2.forEach((d) => {
            if (d.lk) (dL[d.lk] ||= []).push(d);
            (dK[`${d.dt}|${d.dn}`] ||= []).push(d);
          });
          ps.forEach((p) => {
            if (p.lk) (pL[p.lk] ||= []).push(p);
            (pK[`${p.dt}|${p.dn}`] ||= []).push(p);
          });
          const docs = cs.map((h) => ({
            h,
            ds: (h.lk && dL[h.lk]) || (h.mf && dL[h.mf]) || dK[`${h.dt}|${h.dn}`] || [],
            ps: (h.lk && pL[h.lk]) || (h.mf && pL[h.mf]) || pK[`${h.dt}|${h.dn}`] || [],
          }));
          let mn = null, mx = null;
          docs.forEach((d) => {
            const dd = d.h.dD || d.h.iD;
            if (dd?.length >= 8) {
              const dt2 = ymd(dd);
              if (dt2) {
                if (!mn || dt2 < mn) mn = dt2;
                if (!mx || dt2 > mx) mx = dt2;
              }
            }
          });
          const per = {
            s: (ini?.sDate?.length >= 8 ? ini.sDate : null) || (mn ? toY(mn) : ""),
            e: (ini?.eDate?.length >= 8 ? ini.eDate : null) || (mx ? toY(mx) : ""),
            y: ini?.taxYr || "",
          };
          const wrn = validate(ini, docs);

          const itemMap = {};
          docs.forEach((d) => {
            const docDate = d.h.dD || d.h.iD || "";
            d.ds.forEach((it) => {
              const key = it.cat || it.desc || "";
              if (!key) return;
              const existing = itemMap[key];
              if (!existing || docDate > existing.lastDate) {
                itemMap[key] = {
                  name: it.desc, cat: it.cat, unit: it.unit,
                  lastPrice: it.pr, lastDate: docDate, qty: it.qty, vr: it.vr,
                };
              }
            });
          });
          const items = Object.values(itemMap).sort((a, b) =>
            (a.name || "").localeCompare(b.name || "", "he"),
          );
          onP({ s: "סיום!", p: 100 });
          const enc = { ini: iDec.enc, bkmv: bDec.enc };
          setTimeout(() => res({ ini, docs, accs: bs, inv: ms, per, wrn, items, enc }), 100);
        }, 0);
      }
      setTimeout(chunk, 0);
    } catch (e) {
      rej(e);
    }
  });
}
