import { DT, PM } from "./constants";
import { fa, fd, ft } from "./formatters";

const SEP = "─────────────";
const FOOTER = "\n\n📊 Koopax OpenFormat\nhttps://www.koopax.co.il";

export function shareDoc(doc, ini) {
  const { h, ds, ps } = doc;
  const tn = DT[h.dt] || h.dt;
  const lines = [
    `📄 *${tn} #${(h.dn || "").replace(/^0+/, "") || "—"}*`,
    SEP,
    `👤 ${h.cn || "—"}`,
    `📅 ${fd(h.dD || h.iD)}${h.iT ? " " + ft(h.iT) : ""}`,
    "",
    `💰 לפני מע״מ: ${fa(h.aD)}`,
    `📊 מע״מ: ${fa(h.va)}`,
    `*💵 סה״כ: ${fa(h.to)}*`,
  ];

  if (h.xx) lines.push("\n❌ *מסמך מבוטל*");

  if (ds.length > 0 && ds.length <= 8) {
    lines.push("", `📦 *פריטים (${ds.length}):*`);
    ds.forEach((d) => {
      lines.push(`  • ${d.desc || "—"} × ${d.qty} — ${fa(d.lt)}`);
    });
  } else if (ds.length > 8) {
    lines.push("", `📦 ${ds.length} פריטים`);
  }

  if (ps.length > 0) {
    lines.push("", `💳 *תשלומים:*`);
    ps.forEach((p) => {
      lines.push(`  • ${PM[p.pm] || "אחר"}: ${fa(p.amt)}${p.pd ? " (" + fd(p.pd) + ")" : ""}`);
    });
  }

  if (ini?.biz) {
    lines.push("", `🏢 ${ini.biz}${ini.vat ? " (ע.מ. " + ini.vat + ")" : ""}`);
  }

  lines.push(FOOTER);
  return lines.join("\n");
}

export function shareDocQuick(doc) {
  const { h } = doc;
  const tn = DT[h.dt] || h.dt;
  const num = (h.dn || "").replace(/^0+/, "") || "—";
  const customer = h.cn || "לקוח מזדמן";
  const date = fd(h.dD || h.iD);
  const lines = [
    `*${tn} #${num}*`,
    `${customer} · ${date}`,
    `*סה״כ: ${fa(h.to)}*`,
  ];
  if (h.xx) lines.push("❌ מסמך מבוטל");
  lines.push("", "Koopax OpenFormat", "https://www.koopax.co.il");
  return lines.join("\n");
}

export function shareZReport(zData, ini, periodType, periodLabel) {
  const ptLabels = { daily: "יומי", monthly: "חודשי", yearly: "שנתי" };
  const lines = [
    `📊 *דו״ח Z — ${ptLabels[periodType] || periodType}*`,
    SEP,
  ];

  if (ini?.biz) {
    lines.push(`🏢 ${ini.biz}${ini.vat ? " (ע.מ. " + ini.vat + ")" : ""}`);
  }
  lines.push(`📅 תקופה: ${periodLabel}`, "");

  lines.push("*💰 תקבולים:*");
  const PAY_LABELS = {
    1: "מזומן", 2: "שיק", 3: "כ. אשראי", 4: "העברה",
    5: "תווי קנייה", 6: "תלוש החלפה", 7: "שטר", 8: "הו׳ קבע", 9: "אחר",
  };
  const PAY_ORDER = [1, 3, 2, 5, 9, 4, 8, 7, 6];
  PAY_ORDER.forEach((pm) => {
    const p = zData.payments[pm];
    if (p && p.count > 0) {
      lines.push(`  • ${PAY_LABELS[pm]}: ${fa(p.amount)} (${p.count})`);
    }
  });
  lines.push(`*💵 סה״כ: ${fa(zData.totalAmount)}*`, "");

  lines.push("*🧾 מכירות:*");
  lines.push(`  חייב מע״מ: ${fa(zData.beforeVat)}`);
  lines.push(`  מע״מ: ${fa(zData.vatTotal)}`);
  if (zData.vatExempt) lines.push(`  פטור: ${fa(zData.vatExempt)}`);
  lines.push(`  *סה״כ: ${fa(zData.salesTotal)}*`, "");

  lines.push(`📋 ${zData.transactionCount} עסקאות`);
  lines.push(`📈 מצטבר: ${fa(zData.cumulative)}`);

  lines.push(FOOTER);
  return lines.join("\n");
}

export function shareYearly(year, ini) {
  const lines = [
    `📊 *סיכום שנתי — ${year.y}*`,
    SEP,
  ];

  if (ini?.biz) {
    lines.push(`🏢 ${ini.biz}`);
  }
  lines.push("");
  lines.push(`📄 מסמכים: ${year.n.toLocaleString()}`);
  lines.push(`💰 מחזור: ${fa(year.r)}`);
  lines.push(`📊 מע״מ: ${fa(year.v)}`);
  lines.push("");

  const entries = Object.entries(year.bt).sort((a, b) => +a[0] - +b[0]);
  if (entries.length > 0) {
    lines.push("*פירוט לפי סוג:*");
    entries.forEach(([t, info]) => {
      lines.push(`  • ${DT[t] || t}: ${fa(info.t)} (${info.c})`);
    });
  }

  lines.push(FOOTER);
  return lines.join("\n");
}

export function shareStats(sts, ini, perS) {
  const lines = [
    `📊 *סיכום נתונים — מבנה אחיד*`,
    SEP,
  ];
  if (ini?.biz) {
    lines.push(`🏢 *${ini.biz}*${ini.vat ? " (ע.מ. " + ini.vat + ")" : ""}`);
  }
  lines.push(
    `📅 תקופה: ${perS}`,
    "",
    `📄 מסמכים: ${sts.n.toLocaleString()}`,
    `💰 מחזור: ${fa(sts.r)}`,
    `📊 מע״מ: ${fa(sts.v)}`,
    `📦 פריטים ייחודיים: ${sts.i.toLocaleString()}`,
  );

  lines.push(FOOTER);
  return lines.join("\n");
}

export function shareAccounts(accs, ini) {
  const lines = [
    `📋 *דוח חשבונות*`,
    SEP,
  ];
  if (ini?.biz) lines.push(`🏢 ${ini.biz}`, "");
  lines.push(`סה״כ ${accs.length} חשבונות`, "");

  const top = accs
    .map((a) => ({ ...a, bal: a.ob + a.td - a.tcr }))
    .sort((a, b) => Math.abs(b.bal) - Math.abs(a.bal))
    .slice(0, 10);

  if (top.length > 0) {
    lines.push("*10 חשבונות מובילים:*");
    top.forEach((a) => {
      lines.push(`  • ${a.name}: ${fa(a.bal)}`);
    });
  }

  lines.push(FOOTER);
  return lines.join("\n");
}

export function shareInventory(inv, ini) {
  const lines = [
    `📦 *דוח מלאי*`,
    SEP,
  ];
  if (ini?.biz) lines.push(`🏢 ${ini.biz}`, "");
  lines.push(`סה״כ ${inv.length} פריטים במלאי`, "");

  const top = inv
    .map((it) => ({ ...it, bal: it.ob + it.ti + it.to2 }))
    .sort((a, b) => Math.abs(b.bal) - Math.abs(a.bal))
    .slice(0, 10);

  if (top.length > 0) {
    lines.push("*פריטים עיקריים:*");
    top.forEach((it) => {
      lines.push(`  • ${it.name}: יתרה ${it.bal}${it.unit ? " " + it.unit : ""}`);
    });
  }

  lines.push(FOOTER);
  return lines.join("\n");
}

export function openWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
