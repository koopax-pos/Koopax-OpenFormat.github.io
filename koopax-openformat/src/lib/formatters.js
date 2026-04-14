/* ═══ Koopax OpenFormat — עיצוב ופורמט ═══ */

export function fa(a) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", minimumFractionDigits: 2,
  }).format(a);
}

export function fd(s) {
  if (!s || s.length < 8) return "";
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
}

export function ft(s) {
  if (!s || s.length < 4) return "";
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

export function ymd(s) {
  if (!s || s.length < 8) return null;
  return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
}

export function toY(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
