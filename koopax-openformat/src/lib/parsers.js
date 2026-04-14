/* ═══ Koopax OpenFormat — פענוח רשומות ═══ */

function f(l, s, n) {
  return (l.substring(s - 1, s - 1 + n) || "").trim();
}

function pa(s, d = 2) {
  if (!s || !s.trim()) return 0;
  s = s.trim();
  const sg = s[0] === "-" ? -1 : 1;
  const dg = s.replace(/[^0-9]/g, "");
  return dg ? sg * parseInt(dg, 10) / Math.pow(10, d) : 0;
}

function pu(s, d = 2) {
  if (!s || !s.trim()) return 0;
  const dg = s.replace(/[^0-9]/g, "");
  return dg ? parseInt(dg, 10) / Math.pow(10, d) : 0;
}

export function parseIni(l) {
  return {
    tot: parseInt(f(l, 10, 15)) || 0, vat: f(l, 25, 9), swReg: f(l, 57, 8),
    swName: f(l, 65, 20), swVer: f(l, 85, 20), swMaker: f(l, 114, 20),
    swType: f(l, 134, 1) === "1" ? "חד שנתי" : "רב שנתי",
    biz: f(l, 215, 50), addr: f(l, 265, 50), addrN: f(l, 315, 10),
    city: f(l, 325, 30), zip: f(l, 355, 8), taxYr: f(l, 363, 4),
    sDate: f(l, 367, 8), eDate: f(l, 375, 8), pDate: f(l, 383, 8),
    pTime: f(l, 391, 4), cur: f(l, 417, 3) || "ILS", hasBr: f(l, 420, 1) === "1",
  };
}

export function pC(l) {
  return {
    rn: parseInt(f(l, 5, 9)) || 0, vat: f(l, 14, 9), dt: parseInt(f(l, 23, 3)) || 0,
    dn: f(l, 26, 20), iD: f(l, 46, 8), iT: f(l, 54, 4), cn: f(l, 58, 50),
    ca: f(l, 108, 50), can: f(l, 158, 10), cc: f(l, 168, 30), cz: f(l, 198, 8),
    cco: f(l, 206, 30), ccc: f(l, 236, 2), cp: f(l, 238, 15), cv: f(l, 253, 9),
    vD: f(l, 262, 8), fT: pa(f(l, 270, 15)), fC: f(l, 285, 3),
    bD: pa(f(l, 288, 15)), di: pa(f(l, 303, 15)), aD: pa(f(l, 318, 15)),
    va: pa(f(l, 333, 15)), to: pa(f(l, 348, 15)), wh: pa(f(l, 363, 12)),
    ck: f(l, 375, 15), mf: f(l, 390, 10), xx: f(l, 400, 1) === "1",
    dD: f(l, 401, 8), br: f(l, 409, 7), op: f(l, 416, 9), lk: f(l, 425, 7),
  };
}

export function pD(l) {
  return {
    rn: parseInt(f(l, 5, 9)) || 0, dt: parseInt(f(l, 23, 3)) || 0,
    dn: f(l, 26, 20), ln: parseInt(f(l, 46, 4)) || 0, bdt: parseInt(f(l, 50, 3)) || 0,
    bdn: f(l, 53, 20), tt: f(l, 73, 1), cat: f(l, 74, 20), desc: f(l, 94, 30),
    mfr: f(l, 124, 50), unit: f(l, 204, 20), qty: pa(f(l, 224, 17), 4),
    pr: pa(f(l, 241, 15)), ld: pa(f(l, 256, 15)), lt: pa(f(l, 271, 15)),
    vr: pu(f(l, 286, 4)), dD: f(l, 297, 8), lk: f(l, 305, 7),
  };
}

export function pP(l) {
  return {
    rn: parseInt(f(l, 5, 9)) || 0, dt: parseInt(f(l, 23, 3)) || 0,
    dn: f(l, 26, 20), ln: parseInt(f(l, 46, 4)) || 0, pm: parseInt(f(l, 50, 1)) || 0,
    bank: f(l, 51, 10), brn: f(l, 61, 10), acc: f(l, 71, 15), chk: f(l, 86, 10),
    pd: f(l, 96, 8), amt: pa(f(l, 104, 15)), card: f(l, 120, 20), ct: f(l, 140, 1),
    dD: f(l, 148, 8), lk: f(l, 156, 7),
  };
}

export function pB(l) {
  return {
    rn: parseInt(f(l, 5, 9)) || 0, key: f(l, 23, 15), name: f(l, 38, 50),
    tc: f(l, 88, 15), ob: pa(f(l, 278, 15)), td: pa(f(l, 293, 15)),
    tcr: pa(f(l, 308, 15)),
  };
}

export function pM(l) {
  return {
    rn: parseInt(f(l, 5, 9)) || 0, cat: f(l, 63, 20), name: f(l, 83, 50),
    unit: f(l, 173, 20), ob: pa(f(l, 193, 12)), ti: pa(f(l, 205, 12)),
    to2: pa(f(l, 217, 12)),
  };
}
