import React from "react";
import { K } from "../lib/constants";

export function StatCard({ l, v, s }) {
  return (
    <div
      style={{
        background: K.cd, border: `1px solid ${K.bd}`, borderRadius: 10,
        padding: "13px 16px", flex: "1 1 120px", minWidth: 0,
      }}
    >
      <div style={{
        fontSize: 11, color: K.t2, marginBottom: 2,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {l}
      </div>
      <div style={{
        fontSize: 17, fontWeight: 700, color: K.ad, fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {v}
      </div>
      {s && <div style={{ fontSize: 10, color: K.t3, marginTop: 1 }}>{s}</div>}
    </div>
  );
}
