/* ═══ Koopax OpenFormat — ייצוא ═══ */

import * as XLSX from "xlsx";
import { DT, PM } from "./constants";
import { fa, fd } from "./formatters";

export function expXls(d) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([{
      "שם עסק": d.ini?.biz, "ע.מ.": d.ini?.vat,
      "כתובת": `${d.ini?.addr || ""} ${d.ini?.city || ""}`,
      "תקופה": `${fd(d.per?.s)} - ${fd(d.per?.e)}`,
      "תוכנה": d.ini?.swName,
    }]),
    "פרטי עסק",
  );
  const dr = d.docs.map((x) => ({
    "סוג": DT[x.h.dt] || x.h.dt, "מספר": x.h.dn?.replace(/^0+/, "") || "",
    "תאריך": fd(x.h.dD || x.h.iD), "לקוח/ספק": x.h.cn,
    "לפני מע״מ": x.h.aD, "מע״מ": x.h.va, "סה״כ": x.h.to,
    "מבוטל": x.h.xx ? "כן" : "", "פריטים": x.ds.length,
  }));
  const ws1 = XLSX.utils.json_to_sheet(dr);
  ws1["!cols"] = [
    { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 25 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 6 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "מסמכים");
  const ir = [];
  d.docs.forEach((x) =>
    x.ds.forEach((it) =>
      ir.push({
        "סוג": DT[x.h.dt] || "", "מסמך": x.h.dn?.replace(/^0+/, "") || "",
        "תאריך": fd(x.h.dD || x.h.iD), "פריט": it.desc, "מק״ט": it.cat,
        "כמות": it.qty, "מחיר": it.pr, "סה״כ": it.lt,
      }),
    ),
  );
  if (ir.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ir), "פריטים");
  const pr2 = [];
  d.docs.forEach((x) =>
    x.ps.forEach((p) =>
      pr2.push({
        "מסמך": x.h.dn?.replace(/^0+/, "") || "", "תאריך": fd(x.h.dD || x.h.iD),
        "אמצעי": PM[p.pm] || "", "סכום": p.amt, "ת. תשלום": fd(p.pd), "כרטיס": p.card,
      }),
    ),
  );
  if (pr2.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pr2), "תשלומים");
  if (d.accs.length)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        d.accs.map((a) => ({
          "מפתח": a.key, "שם": a.name, "פתיחה": a.ob,
          "חובה": a.td, "זכות": a.tcr, "יתרה": a.ob + a.td - a.tcr,
        })),
      ),
      "חשבונות",
    );
  XLSX.writeFile(wb, `openformat_${d.ini?.vat || "export"}.xlsx`);
}

export function expItems(d) {
  const wb = XLSX.utils.book_new();
  const rows = d.items.map((it) => ({
    "שם פריט": it.name, "מק״ט / ברקוד": it.cat, "יחידה": it.unit,
    "מחיר אחרון (ללא מע״מ)": it.lastPrice,
    "מחיר כולל מע״מ": it.vr
      ? Math.round(it.lastPrice * (1 + it.vr / 100) * 100) / 100
      : it.lastPrice,
    "תאריך מכירה אחרון": fd(it.lastDate),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, "קטלוג פריטים");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([{
      "שם עסק": d.ini?.biz, "ע.מ.": d.ini?.vat,
      "תקופה": `${fd(d.per?.s)} - ${fd(d.per?.e)}`,
      "סה״כ פריטים ייחודיים": d.items.length,
    }]),
    "פרטי עסק",
  );
  XLSX.writeFile(wb, `items_catalog_${d.ini?.vat || "export"}.xlsx`);
}

export function expDoc(d) {
  const i = d.ini || {};
  const h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:David,Arial;direction:rtl;font-size:11pt}h1{color:#1b6b50;border-bottom:2px solid #1b6b50;padding-bottom:6px}h2{color:#333;margin-top:20px}table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #ccc;padding:5px 8px;text-align:right}th{background:#f0f4f2}.info{background:#f8f9fa;padding:10px;border:1px solid #eee;margin:10px 0}.footer{margin-top:30px;text-align:center;color:#999;font-size:9pt}</style></head><body>
<h1>דוח מבנה אחיד — ${i.biz || ""}</h1>
<div class="info"><b>ע.מ.:</b> ${i.vat || ""} | <b>כתובת:</b> ${i.addr || ""} ${i.addrN || ""} ${i.city || ""} | <b>תקופה:</b> ${fd(d.per?.s)} — ${fd(d.per?.e)} | <b>תוכנה:</b> ${i.swName || ""}</div>
<h2>מסמכים (${d.docs.length})</h2>
<table><tr><th>סוג</th><th>מספר</th><th>תאריך</th><th>לקוח/ספק</th><th>סה״כ</th></tr>
${d.docs
    .slice(0, 500)
    .map(
      (x) =>
        `<tr><td>${DT[x.h.dt] || x.h.dt}</td><td>${x.h.dn?.replace(/^0+/, "") || ""}</td><td>${fd(x.h.dD || x.h.iD)}</td><td>${x.h.cn || ""}</td><td>${fa(x.h.to)}</td></tr>`,
    )
    .join("")}
${d.docs.length > 500 ? `<tr><td colspan="5" style="text-align:center;color:#999">...${d.docs.length - 500} נוספים</td></tr>` : ""}
</table>
<div class="footer">הופק באמצעות Koopax OpenFormat — נבנה על ידי קופקס | koopax.co.il</div>
</body></html>`;
  const bl = new Blob([h], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(bl);
  a.download = `openformat_${i.vat || "report"}.doc`;
  a.click();
}
