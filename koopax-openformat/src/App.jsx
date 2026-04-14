import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DT, K } from "./lib/constants";
import { fa, fd } from "./lib/formatters";
import { processAsync } from "./lib/processing";
import { expXls, expItems, expDoc } from "./lib/exports";
import { Badge } from "./components/Badge";
import { StatCard } from "./components/StatCard";
import { DocDetail } from "./components/DocDetail";

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

  const go = useCallback(async () => {
    if (!iF || !bF) { setErr("יש להעלות את שני הקבצים"); return; }
    setErr(null); setProg({ s: "קורא קבצים...", p: 0 });
    try {
      const [a, b] = await Promise.all([iF.arrayBuffer(), bF.arrayBuffer()]);
      const r = await processAsync(a, b, setProg);
      setData(r); setSel(0); setTab("documents"); setPg(0); setProg(null);
    } catch (e) { setErr("שגיאה: " + e.message); setProg(null); }
  }, [iF, bF]);

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
    <link
      href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  );
  const rs = {
    fontFamily: "'Rubik',Tahoma,sans-serif", direction: "rtl",
    background: K.bg, minHeight: "100vh", color: K.tx, lineHeight: 1.6,
  };

  // ─── Upload screen ───
  if (!data) return (
    <div style={{ ...rs, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      {fl}
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
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
          זיהוי קידוד אוטומטי (UTF-8 / ISO-8859-8 / CP-862)<br />עיבוד אסינכרוני לקבצים גדולים · הכל בדפדפן
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: K.t3, opacity: 0.7 }}>
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
    { id: "yearly", l: "סיכום שנתי", n: yearly.length },
    { id: "accounts", l: "חשבונות", n: data.accs.length },
    { id: "inventory", l: "מלאי", n: data.inv.length },
  ].filter((t) => t.n > 0);
  const perS = data.per?.s ? `${fd(data.per.s)} — ${fd(data.per.e)}` : data.per?.y || "—";

  return (
    <div style={rs}>
      {fl}

      {/* Top bar */}
      <div style={{ background: K.hd, color: "#fff", padding: "9px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="" style={{ height: 26, filter: "brightness(0) invert(1)" }} onError={(e) => { e.target.style.display = "none"; }} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>OpenFormat</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ fontSize: 13 }}>{ini?.biz || "—"}</span>
            <span style={{ fontSize: 10, opacity: 0.5 }}>ע.מ. {ini?.vat}</span>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              ["ייצוא Excel", () => expXls(data)],
              ["ייצוא Word", () => expDoc(data)],
              ["ייצוא קטלוג פריטים", () => expItems(data)],
              ["קובץ חדש", () => { setData(null); setIF(null); setBF(null); }],
            ].map(([t, fn]) => (
              <button key={t} onClick={fn} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
                {t}
              </button>
            ))}
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
          <StatCard l="תקופה" v={perS} s={ini?.swName} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: `2px solid ${K.bd}`, marginBottom: 12 }}>
          {tbs.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSel(0); }} style={{ padding: "8px 14px", background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${K.ac}` : "3px solid transparent", fontFamily: "inherit", fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? K.ac : K.t2, cursor: "pointer", marginBottom: -2 }}>
              {t.l} ({t.n})
            </button>
          ))}
        </div>

        {/* Documents */}
        {tab === "documents" && (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
              <input type="text" placeholder="חיפוש..." value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: "7px 10px", border: `1px solid ${K.bd}`, borderRadius: 7, fontFamily: "inherit", fontSize: 11, width: 160, boxSizing: "border-box", direction: "rtl" }} />
              <select value={tf} onChange={(e) => setTf(e.target.value)} style={{ padding: "7px 8px", border: `1px solid ${K.bd}`, borderRadius: 7, fontFamily: "inherit", fontSize: 11, background: K.cd }}>
                <option value="all">כל הסוגים</option>
                {dts.map((t) => <option key={t} value={t}>{DT[t] || t}</option>)}
              </select>
              <span style={{ fontSize: 11, color: K.t2 }}>מ-</span>
              <input type="date" value={df} onChange={(e) => setDf(e.target.value)} style={{ padding: "5px 6px", border: `1px solid ${K.bd}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit" }} />
              <span style={{ fontSize: 11, color: K.t2 }}>עד</span>
              <input type="date" value={dt2} onChange={(e) => setDt2(e.target.value)} style={{ padding: "5px 6px", border: `1px solid ${K.bd}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit" }} />
              {(tf !== "all" || df || dt2 || q) && (
                <button onClick={() => { setTf("all"); setDf(""); setDt2(""); setQ(""); }} style={{ padding: "5px 10px", background: K.db, color: K.dn, border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
                  נקה
                </button>
              )}
              <span style={{ fontSize: 10, color: K.t3, marginRight: "auto" }}>{filt.length} תוצאות</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12, alignItems: "start" }}>
              <div style={{ maxHeight: "calc(100vh - 310px)", overflowY: "auto" }}>
                {!paged.length && <div style={{ textAlign: "center", padding: 24, color: K.t3, fontSize: 12 }}>אין תוצאות</div>}
                {paged.map((d, i) => (
                  <div key={i} onClick={() => setSel(i)} style={{ background: i === sel ? K.al : K.cd, border: `1px solid ${i === sel ? K.ac : K.bd}`, borderRadius: 9, padding: "10px 14px", cursor: "pointer", marginBottom: 5, borderRight: i === sel ? `4px solid ${K.ac}` : "4px solid transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{DT[d.h.dt] || d.h.dt}</div>
                        <div style={{ fontSize: 10, color: K.t2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.h.cn || "—"} · {fd(d.h.dD || d.h.iD)}</div>
                      </div>
                      <div style={{ textAlign: "left", flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: K.ad, fontVariantNumeric: "tabular-nums" }}>{fa(d.h.to)}</div>
                        <div style={{ fontSize: 9, color: K.t3 }}>{d.ds.length} פריטים</div>
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
              <div>
                {sd ? <DocDetail doc={sd} /> : <div style={{ textAlign: "center", padding: 48, color: K.t3 }}>בחר מסמך</div>}
              </div>
            </div>
          </>
        )}

        {/* Yearly */}
        {tab === "yearly" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {yearly.map((y) => (
              <div key={y.y} style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: K.hd, color: "#fff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{y.y}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                    <span>{y.n} מסמכים</span><span>מחזור: {fa(y.r)}</span><span>מע״מ: {fa(y.v)}</span>
                  </div>
                </div>
                <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(y.bt).sort((a, b) => +a[0] - +b[0]).map(([t, info]) => (
                    <div key={t} style={{ padding: "5px 10px", background: K.tg, borderRadius: 7, fontSize: 11 }}>
                      <span style={{ fontWeight: 600 }}>{DT[t] || t}</span>
                      <span style={{ color: K.t2, margin: "0 4px" }}>\u00D7{info.c}</span>
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
        <div style={{ textAlign: "center", padding: "20px 0 12px", fontSize: 10, color: K.t3 }}>
          נבנה על ידי{" "}
          <a href="https://www.koopax.co.il" target="_blank" rel="noopener" style={{ color: K.ac, textDecoration: "none", fontWeight: 600 }}>קופקס</a>
          {" · Koopax OpenFormat Viewer"}
        </div>
      </div>
    </div>
  );
}
