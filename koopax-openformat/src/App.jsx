import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DT, K } from "./lib/constants";
import { fa, fd } from "./lib/formatters";
import { processAsync } from "./lib/processing";
import { expXls, expItems, expDoc } from "./lib/exports";
import { Badge } from "./components/Badge";
import { StatCard } from "./components/StatCard";
import { DocDetail } from "./components/DocDetail";
import { ZReport } from "./components/ZReport";
import { WhatsAppBtn } from "./components/WhatsAppShare";
import { shareDocQuick, shareStats, shareYearly, shareAccounts, shareInventory } from "./lib/whatsapp";
import Documentation from "./components/Documentation";

/* ═══ Koopax OpenFormat — נבנה על ידי קופקס ═══ */

const LOGO = "https://online.koopax.co.il/logo.png";
const PS = 60;

export default function App() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [prog, setProg] = useState(null);
  const [tab, setTab] = useState("documents");
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState("");
  const [iF, setIF] = useState(null);
  const [bF, setBF] = useState(null);
  const [pg, setPg] = useState(0);
  const [tf, setTf] = useState("all");
  const [df, setDf] = useState("");
  const [dt2, setDt2] = useState("");
  const [exporting, setExporting] = useState(null);
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [showDetail, setShowDetail] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const go = useCallback(async () => {
    if (!iF || !bF) { setErr("יש להעלות את שני הקבצים"); return; }
    setErr(null); setProg({ s: "קורא קבצים...", p: 0 });
    try {
      const [a, b] = await Promise.all([iF.arrayBuffer(), bF.arrayBuffer()]);
      const r = await processAsync(a, b, setProg);
      setData(r); setSel(0); setTab("documents"); setPg(0); setProg(null);
    } catch (e) { setErr("שגיאה: " + e.message); setProg(null); }
  }, [iF, bF]);

  const doExport = useCallback((label, fn) => {
    setExporting(label);
    requestAnimationFrame(() => {
      setTimeout(() => {
        try { fn(); } catch (e) { alert("שגיאה בייצוא: " + e.message); }
        setExporting(null);
      }, 100);
    });
  }, []);

  const dts = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.docs.map((d) => d.h.dt))].sort((a, b) => a - b);
  }, [data]);

  const filt = useMemo(() => {
    if (!data) return [];
    let r = data.docs;
    if (tf !== "all") r = r.filter((d) => d.h.dt === +tf);
    if (df) { const v = df.replace(/-/g, ""); r = r.filter((d) => (d.h.dD || d.h.iD || "") >= v); }
    if (dt2) { const v = dt2.replace(/-/g, ""); r = r.filter((d) => (d.h.dD || d.h.iD || "") <= v); }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((d) =>
        (d.h.cn || "").toLowerCase().includes(s) ||
        (DT[d.h.dt] || "").includes(s) ||
        (d.h.dn || "").includes(s) ||
        String(d.h.to).includes(s),
      );
    }
    return r;
  }, [data, tf, df, dt2, q]);

  const paged = useMemo(() => filt.slice(0, (pg + 1) * PS), [filt, pg]);
  useEffect(() => { setSel(0); setPg(0); }, [q, tf, df, dt2]);

  const yearly = useMemo(() => {
    if (!data) return [];
    const m = {};
    data.docs.forEach((d) => {
      const dd = d.h.dD || d.h.iD;
      if (!dd || dd.length < 4) return;
      const y = dd.slice(0, 4);
      if (!m[y]) m[y] = { y, n: 0, r: 0, v: 0, bt: {} };
      m[y].n++; m[y].r += d.h.to; m[y].v += d.h.va;
      const t = d.h.dt;
      if (!m[y].bt[t]) m[y].bt[t] = { c: 0, t: 0 };
      m[y].bt[t].c++; m[y].bt[t].t += d.h.to;
    });
    return Object.values(m).sort((a, b) => a.y.localeCompare(b.y));
  }, [data]);

  const sts = useMemo(() => {
    if (!data) return null;
    const d = data.docs;
    return {
      r: d.reduce((s, x) => s + x.h.to, 0),
      v: d.reduce((s, x) => s + x.h.va, 0),
      i: d.reduce((s, x) => s + x.ds.length, 0),
      n: d.length,
    };
  }, [data]);

  const fl = (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
@keyframes kspin{to{transform:rotate(360deg)}}
*{-webkit-tap-highlight-color:transparent}
@media(max-width:767px){
  ::-webkit-scrollbar{height:3px}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:3px}
}
      `}</style>
    </>
  );
  const rs = {
    fontFamily: "'Rubik',Tahoma,sans-serif", direction: "rtl",
    background: K.bg, minHeight: "100vh", color: K.tx, lineHeight: 1.6,
  };

  if (showDocs) return <Documentation onBack={() => setShowDocs(false)} />;

  // ─── Upload screen ───
  if (!data) return (
    <div style={{ ...rs, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mob ? 16 : 32 }}>
      {fl}
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%", padding: mob ? "0 8px" : 0, boxSizing: "border-box" }}>
        <img src={LOGO} alt="Koopax" style={{ height: 56, marginBottom: 8 }} onError={(e) => { e.target.style.display = "none"; }} />
        <div style={{ fontSize: 19, fontWeight: 700, color: K.ad, marginBottom: 2 }}>Koopax OpenFormat</div>
        <div style={{ fontSize: 13, color: K.t2, marginBottom: 26 }}>מציג קבצי מבנה אחיד — הוראה 131 מס הכנסה</div>
        {prog ? (
          <div style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 14, padding: "26px 22px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: K.ad }}>{prog.s}</div>
            <div style={{ height: 8, background: K.bd, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg,${K.ac},${K.ok})`, borderRadius: 4, width: `${prog.p}%`, transition: "width .3s" }} />
            </div>
            <div style={{ fontSize: 12, color: K.t3 }}>{prog.p}%</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[{ l: "INI.TXT", v: iF, s: setIF }, { l: "BKMVDATA.TXT", v: bF, s: setBF }].map(({ l, v, s }) => (
                <label key={l} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 20px", background: v ? K.ob : K.cd, border: `2px dashed ${v ? K.ok : K.bd}`, borderRadius: 12, cursor: "pointer" }}>
                  <input type="file" accept=".txt,.TXT" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) s(e.target.files[0]); }} />
                  <span style={{ fontSize: 20 }}>{v ? "\u2713" : "\uD83D\uDCC4"}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{l}</div>
                    <div style={{ fontSize: 11, color: K.t2 }}>{v ? v.name : "לחץ לבחירת קובץ"}</div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={go} disabled={!iF || !bF} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", background: (!iF || !bF) ? K.t3 : K.ac, color: "#fff", border: "none", borderRadius: 10, cursor: (!iF || !bF) ? "not-allowed" : "pointer" }}>
              הצג נתונים
            </button>
          </>
        )}
        {err && <div style={{ marginTop: 12, padding: "10px 14px", background: K.db, color: K.dn, borderRadius: 8, fontSize: 12 }}>{err}</div>}
        <div style={{ marginTop: 24, fontSize: 11, color: K.t3, lineHeight: 1.7 }}>
          זיהוי קידוד אוטומטי (UTF-8 / Windows-1255 / ISO-8859-8 / CP-862)<br />תיקון אוטומטי של קידוד כפול (mojibake) · עיבוד אסינכרוני · הכל בדפדפן
        </div>

        {/* About section */}
        <div style={{ marginTop: 22, background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, padding: "16px 18px", textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: K.ad, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span>ℹ️</span> מה זה Koopax OpenFormat?
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <div style={{ background: K.al, borderRadius: 8, padding: "9px 12px", borderRight: `3px solid ${K.ac}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: K.ac, marginBottom: 3 }}>📋 חובה חוקית — מבנה אחיד</div>
              <div style={{ fontSize: 11, color: K.tx, lineHeight: 1.7 }}>
                לפי <strong>הוראה 131 של מס הכנסה</strong>, כל קופה רושמת ממוחשבת או תוכנת ניהול ספרים מחויבת להפיק דוח בפורמט אחיד וסטנדרטי — קבצי <strong>INI.TXT</strong> ו-<strong>BKMVDATA.TXT</strong>. כלי זה קורא ומציג קבצים אלו.
              </div>
            </div>

            <div style={{ background: "#fff8f0", borderRadius: 8, padding: "9px 12px", borderRight: "3px solid #f59e0b" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 3 }}>⚠️ מגבלת רשות המסים</div>
              <div style={{ fontSize: 11, color: K.tx, lineHeight: 1.7 }}>
                הסימולטור הרשמי של <strong>רשות המסים</strong> מוגבל לקבצים עד <strong>4MB בלבד</strong>. עסקים עם כמות עסקאות גדולה לא יכולים לטעון את הקבצים שם — ולכן נבנה כלי זה.
              </div>
            </div>

            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "9px 12px", borderRight: "3px solid #22c55e" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 3 }}>🔒 שמירת עסקאות לאורך שנים</div>
              <div style={{ fontSize: 11, color: K.tx, lineHeight: 1.7 }}>
                הכלי נבנה <strong>למטרת הציבור</strong> ומאפשר לעסקים לצפות ולשמור עסקאות לתקופה של <strong>יותר מ-7 שנים</strong> — ללא תלות בתוכנה מסחרית. הכל עובד בדפדפן, ללא שרתים וללא העלאת נתונים לענן.
              </div>
            </div>
          </div>

          <a
            href="https://github.com/koopax-pos/Koopax-OpenFormat.github.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#fff", background: "#24292f", padding: "6px 12px", borderRadius: 7, textDecoration: "none" }}
          >
            <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
            קוד פתוח ב-GitHub
          </a>
        </div>

        <button onClick={() => setShowDocs(true)} style={{ marginTop: 16, width: "100%", padding: "11px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: K.al, color: K.ac, border: `1px solid ${K.ac}`, borderRadius: 10, cursor: "pointer" }}>
          📖 מדריך מושגים ושאלות נפוצות
        </button>

        <div style={{ marginTop: 14, fontSize: 10, color: K.t3, opacity: 0.7 }}>
          נבנה על ידי{" "}
          <a href="https://www.koopax.co.il" target="_blank" rel="noopener" style={{ color: K.ac, textDecoration: "none", fontWeight: 600 }}>קופקס</a>
        </div>
      </div>
    </div>
  );

  // ─── Data view ───
  const ini = data.ini;
  const sd = filt[sel] || null;
  const tbs = [
    { id: "documents", l: "מסמכים", n: data.docs.length },
    { id: "zreport", l: "דוח Z", n: data.docs.length },
    { id: "yearly", l: "סיכום שנתי", n: yearly.length },
    { id: "accounts", l: "חשבונות", n: data.accs.length },
    { id: "inventory", l: "מלאי", n: data.inv.length },
  ].filter((t) => t.n > 0);
  const perS = (() => {
    const sF = fd(data.per?.s);
    const eF = fd(data.per?.e);
    if (sF && eF) return `${sF} — ${eF}`;
    if (eF) return `עד ${eF}`;
    if (sF) return `מ-${sF}`;
    return data.per?.y || "—";
  })();
  const perYears = (() => {
    const sy = data.per?.s?.length >= 4 ? data.per.s.slice(0, 4) : null;
    const ey = data.per?.e?.length >= 4 ? data.per.e.slice(0, 4) : null;
    if (sy && ey) return sy === ey ? `שנת ${sy}` : `שנים ${sy}–${ey}`;
    return data.per?.y ? `שנת ${data.per.y}` : "";
  })();

  return (
    <div style={rs}>
      {fl}

      {/* Top bar */}
      <div style={{ background: K.hd, color: "#fff", padding: mob ? "8px 0" : "9px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: mob ? "column" : "row", justifyContent: "space-between", alignItems: mob ? "stretch" : "center", gap: mob ? 8 : 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: mob ? "center" : "flex-start" }}>
            <img src={LOGO} alt="" style={{ height: 26, filter: "brightness(0) invert(1)" }} onError={(e) => { e.target.style.display = "none"; }} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>OpenFormat</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ fontSize: mob ? 12 : 13 }}>{ini?.biz || "—"}</span>
            <span style={{ fontSize: 10, opacity: 0.5 }}>ע.מ. {ini?.vat}</span>
            {perYears && <><span style={{ opacity: 0.3 }}>|</span><span style={{ fontSize: 11, opacity: 0.8 }}>{perYears}</span></>}
            {data.enc && <><span style={{ opacity: 0.3 }}>|</span><span style={{ fontSize: 9, opacity: 0.5 }} title={`INI: ${data.enc.ini}\nBKMVDATA: ${data.enc.bkmv}`}>קידוד: {data.enc.ini}</span></>}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: mob ? "center" : "flex-end" }}>
            {[
              ["ייצוא Excel", () => doExport("מייצא לאקסל...", () => expXls(data))],
              ["ייצוא Word", () => doExport("מייצא לוורד...", () => expDoc(data))],
              ["ייצוא קטלוג פריטים", () => doExport("מייצא קטלוג פריטים...", () => expItems(data))],
              ["\uD83C\uDFE0 העלה קובץ חדש", () => { setData(null); setIF(null); setBF(null); }],
              ["📖 מדריך", () => setShowDocs(true)],
              ["ℹ️ אודות", () => setShowAbout(true)],
            ].map(([t, fn]) => (
              <button key={t} onClick={fn} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
                {t}
              </button>
            ))}
            {sts && <WhatsAppBtn text={shareStats(sts, ini, perS)} label="שתף" size="small" style={{ background: "#25D366" }} />}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        {/* Warnings */}
        {data.wrn.length > 0 && (
          <div style={{ padding: "10px 0 2px", display: "flex", flexDirection: "column", gap: 3 }}>
            {data.wrn.map((w, i) => (
              <div key={i} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, background: w.t === "error" ? K.db : w.t === "warn" ? K.wb : K.al, color: w.t === "error" ? K.dn : w.t === "warn" ? K.wn : K.ac }}>
                {w.t === "error" ? "\u274C" : w.t === "warn" ? "\u26A0\uFE0F" : "\u2139\uFE0F"} {w.m}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ padding: "12px 0 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatCard l="מסמכים" v={sts.n.toLocaleString()} />
          <StatCard l="מחזור" v={fa(sts.r)} />
          <StatCard l="מע״מ" v={fa(sts.v)} />
          <StatCard l="פריטים ייחודיים" v={data.items.length.toLocaleString()} />
          <StatCard l={`תקופה${perYears ? ` (${perYears})` : ""}`} v={perS} s={ini?.swName} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: `2px solid ${K.bd}`, marginBottom: 12, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {tbs.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSel(0); }} style={{ padding: mob ? "8px 10px" : "8px 14px", background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${K.ac}` : "3px solid transparent", fontFamily: "inherit", fontSize: mob ? 11 : 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? K.ac : K.t2, cursor: "pointer", marginBottom: -2, whiteSpace: "nowrap", flexShrink: 0 }}>
              {t.l} ({t.n})
            </button>
          ))}
        </div>

        {/* Documents */}
        {tab === "documents" && (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
              <input type="text" placeholder="חיפוש..." value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: "7px 10px", border: `1px solid ${K.bd}`, borderRadius: 7, fontFamily: "inherit", fontSize: 11, width: mob ? "100%" : 160, boxSizing: "border-box", direction: "rtl" }} />
              <select value={tf} onChange={(e) => setTf(e.target.value)} style={{ padding: "7px 8px", border: `1px solid ${K.bd}`, borderRadius: 7, fontFamily: "inherit", fontSize: 11, background: K.cd, flex: mob ? "1 1 auto" : "0 0 auto" }}>
                <option value="all">כל הסוגים</option>
                {dts.map((t) => <option key={t} value={t}>{DT[t] || t}</option>)}
              </select>
              <span style={{ fontSize: 11, color: K.t2 }}>מ-</span>
              <input type="date" value={df} onChange={(e) => setDf(e.target.value)} style={{ padding: "5px 6px", border: `1px solid ${K.bd}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit", flex: mob ? "1 1 0" : "0 0 auto" }} />
              <span style={{ fontSize: 11, color: K.t2 }}>עד</span>
              <input type="date" value={dt2} onChange={(e) => setDt2(e.target.value)} style={{ padding: "5px 6px", border: `1px solid ${K.bd}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit", flex: mob ? "1 1 0" : "0 0 auto" }} />
              {(tf !== "all" || df || dt2 || q) && (
                <button onClick={() => { setTf("all"); setDf(""); setDt2(""); setQ(""); }} style={{ padding: "5px 10px", background: K.db, color: K.dn, border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
                  נקה
                </button>
              )}
              <span style={{ fontSize: 10, color: K.t3, marginRight: "auto" }}>{filt.length} תוצאות</span>
            </div>
            <div style={mob ? {} : { display: "grid", gridTemplateColumns: "300px 1fr", gap: 12, alignItems: "start" }}>
              {mob && showDetail && sd ? (
                <div>
                  <button onClick={() => setShowDetail(false)} style={{ padding: "8px 14px", background: K.al, color: K.ac, border: `1px solid ${K.ac}`, borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, marginBottom: 10, width: "100%" }}>
                    &#8592; חזרה לרשימה
                  </button>
                  <DocDetail doc={sd} ini={ini} mob />
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: mob ? "none" : "calc(100vh - 310px)", overflowY: mob ? "visible" : "auto" }}>
                    {!paged.length && <div style={{ textAlign: "center", padding: 24, color: K.t3, fontSize: 12 }}>אין תוצאות</div>}
                    {paged.map((d, i) => (
                      <div key={i} onClick={() => { setSel(i); if (mob) setShowDetail(true); }} style={{ background: i === sel ? K.al : K.cd, border: `1px solid ${i === sel ? K.ac : K.bd}`, borderRadius: 9, padding: "10px 14px", cursor: "pointer", marginBottom: 5, borderRight: i === sel ? `4px solid ${K.ac}` : "4px solid transparent" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                          <div style={{ minWidth: 0, overflow: "hidden" }}>
                            <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{DT[d.h.dt] || d.h.dt}</div>
                            <div style={{ fontSize: 10, color: K.t2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.h.cn || "—"} · {fd(d.h.dD || d.h.iD)}</div>
                          </div>
                          <div style={{ textAlign: "left", flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: K.ad, fontVariantNumeric: "tabular-nums" }}>{fa(d.h.to)}</div>
                              <div style={{ fontSize: 9, color: K.t3 }}>{d.ds.length} פריטים</div>
                            </div>
                            {i === sel && (
                              <span onClick={(e) => e.stopPropagation()}>
                                <WhatsAppBtn text={shareDocQuick(d)} label={false} size="tiny" style={{ marginTop: 2, width: 22, height: 22, padding: 0, justifyContent: "center" }} />
                              </span>
                            )}
                          </div>
                        </div>
                        {d.h.xx && <Badge c={K.dn} b={K.db}>מבוטל</Badge>}
                      </div>
                    ))}
                    {paged.length < filt.length && (
                      <button onClick={() => setPg((p) => p + 1)} style={{ width: "100%", padding: "8px", background: K.al, color: K.ac, border: `1px solid ${K.ac}`, borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, marginTop: 3 }}>
                        עוד ({(filt.length - paged.length).toLocaleString()})
                      </button>
                    )}
                  </div>
                  {!mob && (
                    <div>
                      {sd ? <DocDetail doc={sd} ini={ini} /> : <div style={{ textAlign: "center", padding: 48, color: K.t3 }}>בחר מסמך</div>}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Z Report */}
        {tab === "zreport" && (
          <ZReport docs={data.docs} ini={ini} />
        )}

        {/* Yearly */}
        {tab === "yearly" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {yearly.map((y) => (
              <div key={y.y} style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: K.hd, color: "#fff", padding: mob ? "10px 14px" : "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700 }}>{y.y}</div>
                  <div style={{ display: "flex", gap: mob ? 8 : 16, fontSize: mob ? 11 : 13, alignItems: "center", flexWrap: "wrap" }}>
                    <span>{y.n} מסמכים</span><span>מחזור: {fa(y.r)}</span><span>מע״מ: {fa(y.v)}</span>
                    <WhatsAppBtn text={shareYearly(y, ini)} label={false} size="tiny" />
                  </div>
                </div>
                <div style={{ padding: mob ? "10px 14px" : "12px 20px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(y.bt).sort((a, b) => +a[0] - +b[0]).map(([t, info]) => (
                    <div key={t} style={{ padding: "5px 10px", background: K.tg, borderRadius: 7, fontSize: 11 }}>
                      <span style={{ fontWeight: 600 }}>{DT[t] || t}</span>
                      <span style={{ color: K.t2, margin: "0 4px" }}>({info.c})</span>
                      <span style={{ color: K.ad, fontVariantNumeric: "tabular-nums" }}>{fa(info.t)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accounts */}
        {tab === "accounts" && (
          <div style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${K.tb}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: K.t2 }}>{data.accs.length} חשבונות</span>
              <WhatsAppBtn text={shareAccounts(data.accs, ini)} label="שתף דוח חשבונות" size="small" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 650 }}>
                <thead>
                  <tr style={{ background: K.st, borderBottom: `2px solid ${K.bd}` }}>
                    {["מפתח", "שם", "קוד", "פתיחה", "חובה", "זכות", "יתרה"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: K.t2, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.accs.map((a, i) => {
                    const b = a.ob + a.td - a.tcr;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${K.tb}`, background: i % 2 ? K.st : "transparent" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 500 }}>{a.key}</td>
                        <td style={{ padding: "8px 10px" }}>{a.name}</td>
                        <td style={{ padding: "8px 10px", color: K.t2 }}>{a.tc}</td>
                        <td style={{ padding: "8px 10px", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{fa(a.ob)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{fa(a.td)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{fa(a.tcr)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: b < 0 ? K.dn : K.ad, fontVariantNumeric: "tabular-nums" }}>{fa(b)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory */}
        {tab === "inventory" && (
          <div style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${K.tb}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: K.t2 }}>{data.inv.length} פריטים במלאי</span>
              <WhatsAppBtn text={shareInventory(data.inv, ini)} label="שתף דוח מלאי" size="small" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 550 }}>
                <thead>
                  <tr style={{ background: K.st, borderBottom: `2px solid ${K.bd}` }}>
                    {["מק״ט", "פריט", "יחידה", "פתיחה", "כניסות", "יציאות", "יתרה"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: K.t2, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.inv.map((it, i) => {
                    const b = it.ob + it.ti + it.to2;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${K.tb}`, background: i % 2 ? K.st : "transparent" }}>
                        <td style={{ padding: "8px 10px" }}>{it.cat || "—"}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 500 }}>{it.name}</td>
                        <td style={{ padding: "8px 10px", color: K.t2 }}>{it.unit}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.ob}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: K.ok }}>{it.ti}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: K.dn }}>{it.to2}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{b}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        {/* About modal */}
        {showAbout && (
          <div onClick={() => setShowAbout(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 16, padding: mob ? "20px 16px" : "28px 32px", maxWidth: 540, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", direction: "rtl", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: K.ad }}>אודות Koopax OpenFormat</div>
                <button onClick={() => setShowAbout(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: K.t2, lineHeight: 1 }}>✕</button>
              </div>

              <div style={{ fontSize: 12, color: K.tx, lineHeight: 1.9, marginBottom: 16 }}>
                <strong>Koopax OpenFormat</strong> הוא כלי חינמי ופתוח לציבור, המאפשר לכל אדם לקרוא, לצפות ולנתח קבצי <strong>מבנה אחיד</strong> (הוראה 131 מס הכנסה) ישירות בדפדפן — ללא התקנה וללא העלאת נתונים לשרת.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div style={{ background: K.al, borderRadius: 10, padding: "12px 14px", borderRight: `3px solid ${K.ac}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: K.ac, marginBottom: 4 }}>📋 חובה חוקית — מבנה אחיד</div>
                  <div style={{ fontSize: 12, color: K.tx, lineHeight: 1.75 }}>
                    לפי <strong>הוראה 131 של מס הכנסה</strong>, כל קופה רושמת ממוחשבת (POS) וכל תוכנת ניהול ספרים מחויבת בחוק להפיק דוח בפורמט סטנדרטי ואחיד. הפורמט כולל שני קבצים: <strong>INI.TXT</strong> (פרטי העסק) ו-<strong>BKMVDATA.TXT</strong> (כל העסקאות). כלי זה קורא ומציג קבצים אלו.
                  </div>
                </div>

                <div style={{ background: "#fff8f0", borderRadius: 10, padding: "12px 14px", borderRight: "3px solid #f59e0b" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", marginBottom: 4 }}>⚠️ מגבלת 4MB בסימולטור רשות המסים</div>
                  <div style={{ fontSize: 12, color: K.tx, lineHeight: 1.75 }}>
                    הסימולטור הרשמי של <strong>רשות המסים</strong> מוגבל לקבצים של <strong>עד 4MB בלבד</strong>. עסקים עם היקף עסקאות גדול — כגון מסעדות וחנויות עם מאות אלפי שורות — לא יכולים לטעון את הקבצים שם. כלי זה נבנה כדי לפתור בדיוק את הבעיה הזו.
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", borderRight: "3px solid #22c55e" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>🔒 שמירה לטווח ארוך — מעל 7 שנים</div>
                  <div style={{ fontSize: 12, color: K.tx, lineHeight: 1.75 }}>
                    הכלי נבנה <strong>למטרת הציבור</strong>, על מנת לאפשר לעסקים לשמור ולצפות בעסקאות <strong>לתקופה של יותר מ-7 שנים</strong>, גם לאחר שהתוכנה המקורית הוחלפה. כל העיבוד מתבצע <strong>בדפדפן בלבד</strong> — הנתונים אינם נשלחים לשום שרת.
                  </div>
                </div>

                <div style={{ background: K.tg || "#f8f8f8", borderRadius: 10, padding: "12px 14px", borderRight: `3px solid ${K.t2}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: K.t2, marginBottom: 4 }}>🏪 על קופקס</div>
                  <div style={{ fontSize: 12, color: K.tx, lineHeight: 1.75 }}>
                    <strong>קופקס (Koopax)</strong> היא מערכת קופה רושמת ממוחשבת (POS) וניהול עסק — בעיקר למסעדות, חנויות ובתי קפה — הכוללת ניהול מכירות, דוחות, מלאי וסנכרון נתונים בין מכשירים. כלי זה מוצע לציבור בחינם ובקוד פתוח.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href="https://github.com/koopax-pos/Koopax-OpenFormat.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#fff", background: "#24292f", padding: "8px 14px", borderRadius: 8, textDecoration: "none" }}
                >
                  <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                  קוד פתוח ב-GitHub
                </a>
                <a
                  href="https://www.koopax.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: K.ac, background: K.al, border: `1px solid ${K.ac}`, padding: "8px 14px", borderRadius: 8, textDecoration: "none" }}
                >
                  אתר קופקס
                </a>
              </div>
            </div>
          </div>
        )}

        {exporting && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: K.cd, padding: "32px 44px", borderRadius: 16, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${K.bd}`, borderTopColor: K.ac, borderRadius: "50%", animation: "kspin 1s linear infinite", margin: "0 auto 14px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: K.ad }}>{exporting}</div>
              <div style={{ fontSize: 12, color: K.t2, marginTop: 6 }}>אנא המתן...</div>
            </div>
          </div>
        )}
        <div style={{ textAlign: "center", padding: "20px 0 12px", fontSize: 10, color: K.t3 }}>
          נבנה על ידי{" "}
          <a href="https://www.koopax.co.il" target="_blank" rel="noopener" style={{ color: K.ac, textDecoration: "none", fontWeight: 600 }}>קופקס</a>
          {" · Koopax OpenFormat Viewer"}
        </div>
      </div>
    </div>
  );
}
