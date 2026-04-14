import React, { useState, useMemo, useRef } from "react";
import { DT, PM, K } from "../lib/constants";
import { fa, fd } from "../lib/formatters";
import { WhatsAppImageBtn } from "./WhatsAppShare";

const PERIOD_TYPES = [
  { id: "daily", l: "יומי" },
  { id: "monthly", l: "חודשי" },
  { id: "yearly", l: "שנתי" },
];

const PAY_LABELS = {
  1: "מזומן",
  2: "שיק",
  3: "כרטיס אשראי",
  4: "העברה בנקאית",
  5: "כרטיס מתנה",
  6: "תלוש החלפה",
  7: "שטר",
  8: "הוראת קבע",
  9: "ביט",
};

const PAY_ORDER = [1, 3, 2, 5, 9, 4, 8, 7, 6];

function buildMonthOptions(docs) {
  const set = new Set();
  docs.forEach((d) => {
    const dd = d.h.dD || d.h.iD;
    if (dd?.length >= 6) set.add(dd.slice(0, 6));
  });
  return [...set].sort().map((ym) => ({
    value: ym,
    label: `${ym.slice(4, 6)}/${ym.slice(0, 4)}`,
  }));
}

function buildYearOptions(docs) {
  const set = new Set();
  docs.forEach((d) => {
    const dd = d.h.dD || d.h.iD;
    if (dd?.length >= 4) set.add(dd.slice(0, 4));
  });
  return [...set].sort();
}

function buildDayOptions(docs) {
  const set = new Set();
  docs.forEach((d) => {
    const dd = d.h.dD || d.h.iD;
    if (dd?.length >= 8) set.add(dd.slice(0, 8));
  });
  return [...set].sort().map((ymd) => ({
    value: ymd,
    label: fd(ymd),
  }));
}

function filterByPeriod(docs, periodType, periodValue) {
  if (!periodValue) return [];
  return docs.filter((d) => {
    const dd = d.h.dD || d.h.iD || "";
    if (periodType === "daily") return dd.slice(0, 8) === periodValue;
    if (periodType === "monthly") return dd.slice(0, 6) === periodValue;
    if (periodType === "yearly") return dd.slice(0, 4) === periodValue;
    return false;
  });
}

function computeZData(filtered, allDocs, ini) {
  const payments = {};
  PAY_ORDER.forEach((pm) => {
    payments[pm] = { count: 0, amount: 0 };
  });

  let totalCount = 0;
  let totalAmount = 0;

  filtered.forEach((d) => {
    d.ps.forEach((p) => {
      const pm = p.pm || 9;
      if (!payments[pm]) payments[pm] = { count: 0, amount: 0 };
      payments[pm].count++;
      payments[pm].amount += p.amt;
      totalCount++;
      totalAmount += p.amt;
    });
    if (!d.ps.length) {
      const pm = 1;
      payments[pm].count++;
      payments[pm].amount += d.h.to;
      totalCount++;
      totalAmount += d.h.to;
    }
  });

  const creditTotal = payments[3] || { count: 0, amount: 0 };

  const onAccount = {
    deliveryNotes: { count: 0, amount: 0 },
    onAccountInvoices: { count: 0, amount: 0 },
  };
  filtered.forEach((d) => {
    if (d.h.dt === 200 || d.h.dt === 205) {
      onAccount.deliveryNotes.count++;
      onAccount.deliveryNotes.amount += d.h.to;
    }
  });

  let vatTotal = 0;
  let beforeVat = 0;
  let vatExempt = 0;
  let salesTotal = 0;

  filtered.forEach((d) => {
    vatTotal += d.h.va;
    beforeVat += d.h.aD;
    if (d.h.va === 0 && d.h.to !== 0) {
      vatExempt += d.h.to;
    }
    salesTotal += d.h.to;
  });

  if (beforeVat + vatTotal + vatExempt !== salesTotal && salesTotal !== 0) {
    beforeVat = salesTotal - vatTotal - vatExempt;
  }

  let cumulative = 0;
  const maxDate = filtered.reduce((mx, d) => {
    const dd = d.h.dD || d.h.iD || "";
    return dd > mx ? dd : mx;
  }, "");
  allDocs.forEach((d) => {
    const dd = d.h.dD || d.h.iD || "";
    if (dd <= maxDate) cumulative += d.h.to;
  });

  const depts = {};
  filtered.forEach((d) => {
    d.ds.forEach((it) => {
      const dept = it.cat || it.desc || "כללי";
      if (!depts[dept]) depts[dept] = { name: dept, qty: 0, total: 0 };
      depts[dept].qty += Math.abs(it.qty);
      depts[dept].total += it.lt;
    });
  });
  const deptList = Object.values(depts).sort((a, b) => b.total - a.total);

  return {
    payments,
    totalCount,
    totalAmount,
    creditTotal,
    onAccount,
    vatTotal,
    beforeVat,
    vatExempt,
    salesTotal,
    transactionCount: filtered.length,
    cumulative,
    deptList,
  };
}

async function exportZToExcel(zData, filtered, ini, periodType, periodLabel) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const bizRows = [
    { "": "שם העסק", "ערך": ini?.biz || "—" },
    { "": "ח.פ.", "ערך": ini?.vat || "" },
    { "": "כתובת", "ערך": [ini?.addr, ini?.addrN, ini?.city].filter(Boolean).join(" ") },
    { "": "" },
    { "": "כותרת", "ערך": "דו״ח Z" },
    { "": "סוג דוח", "ערך": PERIOD_TYPES.find((p) => p.id === periodType)?.l || "" },
    { "": "תקופה", "ערך": periodLabel },
    {
      "": "תאריך הפקה",
      "ערך": new Date().toLocaleString("he-IL"),
    },
    { "": "מספר מסמכים", "ערך": filtered.length },
  ];
  const wsBiz = XLSX.utils.json_to_sheet(bizRows);
  wsBiz["!cols"] = [{ wch: 20 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsBiz, "פרטי דוח");

  const recRows = [];
  PAY_ORDER.forEach((pm) => {
    const p = zData.payments[pm];
    if (p && (p.count > 0 || pm === 1 || pm === 3)) {
      recRows.push({ "סוג תשלום": PAY_LABELS[pm], "כמות": p.count, "סכום": p.amount });
    }
  });
  if (zData.creditTotal.count > 0) {
    recRows.push({
      "סוג תשלום": "סך הכל תקבולים באשראי",
      "כמות": zData.creditTotal.count,
      "סכום": zData.creditTotal.amount,
    });
  }
  recRows.push({
    "סוג תשלום": "סך הכל",
    "כמות": zData.totalCount,
    "סכום": zData.totalAmount,
  });
  const wsRec = XLSX.utils.json_to_sheet(recRows);
  wsRec["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsRec, "תקבולים");

  const onAccRows = [
    {
      "סוג": "תעודות משלוח",
      "כמות": zData.onAccount.deliveryNotes.count,
      "סכום": zData.onAccount.deliveryNotes.amount,
    },
    {
      "סוג": "חשבוניות בהקפה",
      "כמות": zData.onAccount.onAccountInvoices.count,
      "סכום": zData.onAccount.onAccountInvoices.amount,
    },
    {
      "סוג": "סך הכל תשלומים בהקפה",
      "כמות": zData.onAccount.deliveryNotes.count + zData.onAccount.onAccountInvoices.count,
      "סכום": zData.onAccount.deliveryNotes.amount + zData.onAccount.onAccountInvoices.amount,
    },
  ];
  const wsOnAcc = XLSX.utils.json_to_sheet(onAccRows);
  wsOnAcc["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsOnAcc, "הקפות");

  const salesRows = [
    { "פירוט": "תקבולים החייבים במע״מ (ללא מע״מ)", "סכום": zData.beforeVat },
    { "פירוט": "מע״מ (18.0%)", "סכום": zData.vatTotal },
    { "פירוט": "תקבולים הפטורים ממע״מ", "סכום": zData.vatExempt },
    { "פירוט": "סה״כ מכירות", "סכום": zData.salesTotal },
  ];
  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  wsSales["!cols"] = [{ wch: 36 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSales, "מכירות");

  const sumRows = [
    { "פירוט": "מספר עסקאות", "סכום / כמות": zData.transactionCount },
    { "פירוט": "מצטבר כללי", "סכום / כמות": zData.cumulative },
  ];
  const wsSum = XLSX.utils.json_to_sheet(sumRows);
  wsSum["!cols"] = [{ wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSum, "כללי וסיכום");

  if (zData.deptList.length > 0) {
    const deptRows = zData.deptList.map((dep) => ({
      "שם מחלקה": dep.name,
      "כמות מכירות": Math.round(dep.qty * 10) / 10,
      "סה״כ": dep.total,
    }));
    deptRows.push({
      "שם מחלקה": "סך הכל",
      "כמות מכירות": Math.round(zData.deptList.reduce((s, d) => s + d.qty, 0) * 10) / 10,
      "סה״כ": zData.deptList.reduce((s, d) => s + d.total, 0),
    });
    const wsDept = XLSX.utils.json_to_sheet(deptRows);
    wsDept["!cols"] = [{ wch: 25 }, { wch: 14 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsDept, "מחלקות");
  }

  const safePeriod = periodLabel.replace(/\//g, "-");
  XLSX.writeFile(wb, `z_report_${safePeriod}_${ini?.vat || "export"}.xlsx`);
}

const S = {
  section: {
    background: K.cd,
    border: `1px solid ${K.bd}`,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },
  sectionHead: {
    background: K.hd,
    color: "#fff",
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    padding: "8px 14px",
    textAlign: "right",
    fontWeight: 600,
    color: K.t2,
    fontSize: 10,
    borderBottom: `2px solid ${K.bd}`,
    background: K.st,
  },
  td: {
    padding: "7px 14px",
    borderBottom: `1px solid ${K.tb}`,
    fontVariantNumeric: "tabular-nums",
  },
  totalRow: {
    fontWeight: 700,
    background: K.al,
    color: K.ad,
  },
  subTotal: {
    fontWeight: 600,
    background: K.st,
  },
};

function ReportTable({ headers, rows, totalRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={S.table}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  ...S.th,
                  textAlign: i === 0 ? "right" : "left",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={r.isSubTotal ? S.subTotal : r.isTotal ? S.totalRow : {}}>
              {r.cells.map((c, j) => (
                <td
                  key={j}
                  style={{
                    ...S.td,
                    textAlign: j === 0 ? "right" : "left",
                    fontWeight: r.isTotal || r.isSubTotal ? 700 : 400,
                    color: r.isTotal ? K.ad : "inherit",
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children, num }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        {num && <span style={{ opacity: 0.6, marginLeft: 6 }}>חלק {num}:</span>}
        {title}
      </div>
      {children}
    </div>
  );
}

export function ZReport({ docs, ini }) {
  const [periodType, setPeriodType] = useState("monthly");
  const [periodValue, setPeriodValue] = useState("");
  const reportRef = useRef(null);

  const monthOptions = useMemo(() => buildMonthOptions(docs), [docs]);
  const yearOptions = useMemo(() => buildYearOptions(docs), [docs]);
  const dayOptions = useMemo(() => buildDayOptions(docs), [docs]);

  const filtered = useMemo(
    () => filterByPeriod(docs, periodType, periodValue),
    [docs, periodType, periodValue],
  );

  const zData = useMemo(
    () => (filtered.length ? computeZData(filtered, docs, ini) : null),
    [filtered, docs, ini],
  );

  const now = new Date();
  const reportDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const reportTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  let periodLabel = "";
  if (periodType === "monthly" && periodValue) {
    periodLabel = `${periodValue.slice(4, 6)}/${periodValue.slice(0, 4)}`;
  } else if (periodType === "yearly" && periodValue) {
    periodLabel = periodValue;
  } else if (periodType === "daily" && periodValue) {
    periodLabel = fd(periodValue);
  }

  return (
    <div>
      {/* Period selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
          padding: "12px 16px",
          background: K.cd,
          border: `1px solid ${K.bd}`,
          borderRadius: 10,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: K.t2 }}>סוג דוח:</span>
        {PERIOD_TYPES.map((pt) => (
          <button
            key={pt.id}
            onClick={() => {
              setPeriodType(pt.id);
              setPeriodValue("");
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              border: periodType === pt.id ? `2px solid ${K.ac}` : `1px solid ${K.bd}`,
              background: periodType === pt.id ? K.al : K.cd,
              color: periodType === pt.id ? K.ac : K.t2,
              fontWeight: periodType === pt.id ? 700 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
            }}
          >
            {pt.l}
          </button>
        ))}

        <span style={{ width: 1, height: 24, background: K.bd, margin: "0 4px" }} />

        <span style={{ fontSize: 12, fontWeight: 600, color: K.t2 }}>תקופה:</span>
        {periodType === "monthly" && (
          <select
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
            style={{
              padding: "6px 10px",
              border: `1px solid ${K.bd}`,
              borderRadius: 7,
              fontFamily: "inherit",
              fontSize: 12,
              background: K.cd,
              minWidth: 120,
            }}
          >
            <option value="">בחר חודש</option>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        )}
        {periodType === "yearly" && (
          <select
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
            style={{
              padding: "6px 10px",
              border: `1px solid ${K.bd}`,
              borderRadius: 7,
              fontFamily: "inherit",
              fontSize: 12,
              background: K.cd,
              minWidth: 120,
            }}
          >
            <option value="">בחר שנה</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {periodType === "daily" && (
          <select
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
            style={{
              padding: "6px 10px",
              border: `1px solid ${K.bd}`,
              borderRadius: 7,
              fontFamily: "inherit",
              fontSize: 12,
              background: K.cd,
              minWidth: 120,
            }}
          >
            <option value="">בחר יום</option>
            {dayOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        )}

        {periodValue && (
          <span
            style={{
              fontSize: 11,
              color: K.t3,
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {filtered.length} מסמכים בתקופה
            {zData && (
              <WhatsAppImageBtn
                targetRef={reportRef}
                fileName={`z_report_${periodLabel.replace(/\//g, "-")}_${ini?.vat || "export"}.png`}
                label="שתף דוח Z"
                size="small"
              />
            )}
          </span>
        )}
        {zData && (
          <button
            onClick={() => {
              void exportZToExcel(zData, filtered, ini, periodType, periodLabel);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              border: `1px solid ${K.ac}`,
              background: K.ac,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ייצוא Excel
          </button>
        )}
      </div>

      {!periodValue && (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: K.t3,
            fontSize: 14,
          }}
        >
          בחר תקופה להצגת דוח Z
        </div>
      )}

      {periodValue && !filtered.length && (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: K.t3,
            fontSize: 14,
          }}
        >
          אין נתונים לתקופה הנבחרת
        </div>
      )}

      {zData && (
        <div>
          <div style={{ marginBottom: 12, textAlign: "center" }} data-hide-capture>
            <WhatsAppImageBtn
              targetRef={reportRef}
              fileName={`z_report_${periodLabel.replace(/\//g, "-")}_${ini?.vat || "export"}.png`}
              label="שתף דוח Z בוואצאפ (תמונה)"
            />
          </div>
          <div ref={reportRef} style={{ background: "#ffffff", padding: 8 }}>
          {/* Report header */}
          <div
            style={{
              ...S.section,
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: K.ad,
                marginBottom: 2,
              }}
            >
              {ini?.biz || "—"}
            </div>
            {ini?.addr && (
              <div style={{ fontSize: 12, color: K.t2 }}>
                {[ini.addr, ini.addrN, ini.city].filter(Boolean).join(" ")}
              </div>
            )}
            {ini?.vat && (
              <div style={{ fontSize: 11, color: K.t3, marginBottom: 10 }}>
                ח.פ. {ini.vat}
              </div>
            )}
            <div
              style={{
                display: "inline-block",
                padding: "6px 20px",
                background: K.hd,
                color: "#fff",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              דו״ח Z — {PERIOD_TYPES.find((p) => p.id === periodType)?.l}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                fontSize: 12,
                color: K.t2,
                flexWrap: "wrap",
              }}
            >
              <span>תקופה: {periodLabel}</span>
              <span>
                תאריך הפקה: {reportDateStr} {reportTimeStr}
              </span>
              <span>מסמכים: {filtered.length}</span>
            </div>
          </div>

          {/* Section 1: Total receipts */}
          <Section num="1" title="דוח כלל תקבולים (חיובים + זיכויים)">
            <ReportTable
              headers={["סוג תשלום", "כמות", "סכום"]}
              rows={[
                ...PAY_ORDER.filter(
                  (pm) => zData.payments[pm]?.count > 0,
                ).map((pm) => ({
                  cells: [
                    PAY_LABELS[pm],
                    zData.payments[pm].count.toLocaleString(),
                    fa(zData.payments[pm].amount),
                  ],
                })),
                ...(zData.creditTotal.count > 0
                  ? [
                      {
                        isSubTotal: true,
                        cells: [
                          "סך הכל תקבולים באשראי",
                          zData.creditTotal.count.toLocaleString(),
                          fa(zData.creditTotal.amount),
                        ],
                      },
                    ]
                  : []),
                {
                  isTotal: true,
                  cells: [
                    "סך הכל",
                    zData.totalCount.toLocaleString(),
                    fa(zData.totalAmount),
                  ],
                },
              ]}
            />
          </Section>

          {/* Section 2: On-account payments */}
          <Section num="2" title="דוח תשלומים בהקפה">
            <ReportTable
              headers={["סוג", "כמות", "סכום"]}
              rows={[
                {
                  cells: [
                    "תעודות משלוח",
                    zData.onAccount.deliveryNotes.count.toLocaleString(),
                    fa(zData.onAccount.deliveryNotes.amount),
                  ],
                },
                {
                  cells: [
                    "חשבוניות בהקפה",
                    zData.onAccount.onAccountInvoices.count.toLocaleString(),
                    fa(zData.onAccount.onAccountInvoices.amount),
                  ],
                },
                {
                  isTotal: true,
                  cells: [
                    "סך הכל תשלומים בהקפה",
                    (
                      zData.onAccount.deliveryNotes.count +
                      zData.onAccount.onAccountInvoices.count
                    ).toLocaleString(),
                    fa(
                      zData.onAccount.deliveryNotes.amount +
                        zData.onAccount.onAccountInvoices.amount,
                    ),
                  ],
                },
              ]}
            />
          </Section>

          {/* Section 3: Sales */}
          <Section num="3" title="מכירות">
            <ReportTable
              headers={["פירוט", "סכום"]}
              rows={[
                {
                  cells: [
                    "תקבולים החייבים במע״מ (ללא מע״מ)",
                    fa(zData.beforeVat),
                  ],
                },
                {
                  cells: ["מע״מ (18.0%)", fa(zData.vatTotal)],
                },
                {
                  cells: ["תקבולים הפטורים ממע״מ", fa(zData.vatExempt)],
                },
                {
                  isTotal: true,
                  cells: ["סה״כ מכירות", fa(zData.salesTotal)],
                },
              ]}
            />
          </Section>

          {/* Section 4: General summary */}
          <Section num="4" title="כללי וסיכום">
            <ReportTable
              headers={["פירוט", "סכום / כמות"]}
              rows={[
                {
                  cells: [
                    "מספר עסקאות",
                    zData.transactionCount.toLocaleString(),
                  ],
                },
                {
                  isTotal: true,
                  cells: ["מצטבר כללי", fa(zData.cumulative)],
                },
              ]}
            />
          </Section>

          {/* Section 5: Departments */}
          {zData.deptList.length > 0 && (
            <Section num="5" title="סיכום מחלקות">
              <ReportTable
                headers={["שם מחלקה", "כמות מכירות", "סה״כ"]}
                rows={[
                  ...zData.deptList.map((dep) => ({
                    cells: [
                      dep.name,
                      dep.qty.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      }),
                      fa(dep.total),
                    ],
                  })),
                  {
                    isTotal: true,
                    cells: [
                      "סך הכל",
                      zData.deptList
                        .reduce((s, d) => s + d.qty, 0)
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        }),
                      fa(zData.deptList.reduce((s, d) => s + d.total, 0)),
                    ],
                  },
                ]}
              />
            </Section>
          )}
          <div style={{ textAlign: "center", padding: "10px 0 6px", fontSize: 10, color: K.t3, borderTop: `1px solid ${K.bd}`, marginTop: 4 }}>
            📊 Koopax OpenFormat · koopax.co.il
          </div>
          </div>{/* close ref wrapper */}
        </div>
      )}
    </div>
  );
}
