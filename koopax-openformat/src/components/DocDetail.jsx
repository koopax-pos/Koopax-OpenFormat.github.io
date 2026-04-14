import React from "react";
import { DT, PM, K } from "../lib/constants";
import { fa, fd, ft } from "../lib/formatters";
import { Badge } from "./Badge";

export function DocDetail({ doc }) {
  const { h, ds, ps } = doc;
  const tn = DT[h.dt] || h.dt;

  return (
    <div style={{ background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: K.hd, color: "#fff", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{tn} #{h.dn?.replace(/^0+/, "") || "—"}</div>
            <div style={{ fontSize: 21, fontWeight: 700 }}>{fa(h.to)}</div>
          </div>
          <div style={{ textAlign: "left", fontSize: 13, opacity: 0.85 }}>
            <div>{fd(h.dD || h.iD)}</div>
            {h.iT && <div style={{ fontSize: 12 }}>{ft(h.iT)}</div>}
          </div>
        </div>
        {h.xx && (
          <div style={{ marginTop: 6 }}>
            <Badge c="#fff" b="rgba(255,90,90,.35)">מבוטל</Badge>
          </div>
        )}
      </div>

      {/* Customer info */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${K.tb}`, background: K.st }}>
        <div style={{ fontSize: 11, color: K.t2 }}>לקוח/ספק</div>
        <div style={{ fontWeight: 600 }}>{h.cn || "—"}</div>
        {(h.ca || h.cc) && (
          <div style={{ fontSize: 12, color: K.t2 }}>
            {[h.ca, h.can, h.cc].filter(Boolean).join(" ")}
          </div>
        )}
        {h.cp && <div style={{ fontSize: 12, color: K.t2 }}>טל׳ {h.cp}</div>}
        {h.cv && !/^0+$/.test(h.cv) && (
          <div style={{ fontSize: 12, color: K.t2 }}>ע.מ. {h.cv}</div>
        )}
      </div>

      {/* Totals */}
      <div style={{
        padding: "12px 20px", borderBottom: `1px solid ${K.tb}`,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 10, color: K.t3 }}>לפני מע״מ</div>
          <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{fa(h.aD)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: K.t3 }}>מע״מ</div>
          <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{fa(h.va)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: K.t3 }}>סה״כ</div>
          <div style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums", color: K.ad }}>{fa(h.to)}</div>
        </div>
      </div>

      {/* Items */}
      {ds.length > 0 && (
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${K.tb}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: K.t2 }}>
            פריטים ({ds.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${K.tb}` }}>
                  {["#", "תיאור", "יחידה", "כמות", "מחיר", "סה״כ"].map((x) => (
                    <th
                      key={x}
                      style={{
                        textAlign: x === "כמות" ? "center" : x === "מחיר" || x === "סה״כ" ? "left" : "right",
                        padding: "4px 6px", fontWeight: 600, color: K.t3, fontSize: 10,
                      }}
                    >
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ds.map((d, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${K.tb}`, background: i % 2 ? K.st : "transparent" }}>
                    <td style={{ padding: "6px", color: K.t3, width: 24 }}>{d.ln}</td>
                    <td style={{ padding: "6px", fontWeight: 500 }}>
                      {d.desc || "—"}
                      {d.cat && <span style={{ fontSize: 10, color: K.t3 }}> ({d.cat})</span>}
                    </td>
                    <td style={{ padding: "6px", color: K.t2 }}>{d.unit || "—"}</td>
                    <td style={{ padding: "6px", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{d.qty}</td>
                    <td style={{ padding: "6px", textAlign: "left", fontVariantNumeric: "tabular-nums" }}>{fa(d.pr)}</td>
                    <td style={{ padding: "6px", textAlign: "left", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fa(d.lt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments */}
      {ps.length > 0 && (
        <div style={{ padding: "12px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: K.t2 }}>
            תשלומים ({ps.length})
          </div>
          {ps.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", background: K.st, borderRadius: 8,
                border: `1px solid ${K.tb}`, marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Badge>{PM[p.pm] || p.pm}</Badge>
                {p.card && <span style={{ fontSize: 11, color: K.t2 }}>{p.card}</span>}
                {p.pd && <span style={{ fontSize: 11, color: K.t3 }}>{fd(p.pd)}</span>}
              </div>
              <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: K.ad, fontSize: 14 }}>
                {fa(p.amt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "8px 20px", background: K.st, borderTop: `1px solid ${K.tb}`,
        fontSize: 10, color: K.t3, display: "flex", gap: 12, flexWrap: "wrap",
      }}>
        {h.op && <span>מפעיל: {h.op}</span>}
        {h.br && <span>סניף: {h.br}</span>}
        <span>מזהה: {h.mf || h.lk || "—"}</span>
      </div>
    </div>
  );
}
