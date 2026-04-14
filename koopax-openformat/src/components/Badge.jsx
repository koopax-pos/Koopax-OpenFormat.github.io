import React from "react";
import { K } from "../lib/constants";

export function Badge({ children, c = K.ac, b = K.al }) {
  return (
    <span
      style={{
        display: "inline-block", padding: "2px 10px", borderRadius: 20,
        fontSize: 11, fontWeight: 600, background: b, color: c,
      }}
    >
      {children}
    </span>
  );
}
