import React, { useState } from "react";
import { K } from "../lib/constants";

const WA_GREEN = "#25D366";
const WA_DARK = "#128C7E";

export function WhatsAppBtn({ text, label, style: extraStyle, size = "normal" }) {
  const [hov, setHov] = useState(false);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const isSmall = size === "small";
  const isTiny = size === "tiny";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="שתף בוואצאפ"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isTiny ? 3 : isSmall ? 4 : 6,
        padding: isTiny ? "3px 7px" : isSmall ? "4px 10px" : "6px 14px",
        background: hov ? WA_DARK : WA_GREEN,
        color: "#fff",
        borderRadius: isTiny ? 5 : isSmall ? 6 : 8,
        textDecoration: "none",
        fontSize: isTiny ? 10 : isSmall ? 11 : 12,
        fontWeight: 600,
        fontFamily: "'Rubik',Tahoma,sans-serif",
        cursor: "pointer",
        transition: "background .2s, transform .15s",
        transform: hov ? "scale(1.04)" : "scale(1)",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
    >
      <WaIcon size={isTiny ? 12 : isSmall ? 14 : 16} />
      {label !== false && <span>{label || "שתף"}</span>}
    </a>
  );
}

export function WhatsAppImageBtn({ targetRef, fileName, label, style: extraStyle, size = "normal" }) {
  const [hov, setHov] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSmall = size === "small";
  const isTiny = size === "tiny";

  const handleShare = async () => {
    if (!targetRef?.current || busy) return;
    setBusy(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const el = targetRef.current;
      const btns = el.querySelectorAll("[data-hide-capture]");
      btns.forEach((b) => (b.style.display = "none"));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      btns.forEach((b) => (b.style.display = ""));

      const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 1.0));
      const file = new File([blob], fileName || "z-report.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Share failed:", e);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={busy}
      title="שתף תמונת דוח בוואצאפ"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isTiny ? 3 : isSmall ? 4 : 6,
        padding: isTiny ? "3px 7px" : isSmall ? "4px 10px" : "6px 14px",
        background: busy ? K.t3 : hov ? WA_DARK : WA_GREEN,
        color: "#fff",
        border: "none",
        borderRadius: isTiny ? 5 : isSmall ? 6 : 8,
        fontSize: isTiny ? 10 : isSmall ? 11 : 12,
        fontWeight: 600,
        fontFamily: "'Rubik',Tahoma,sans-serif",
        cursor: busy ? "wait" : "pointer",
        transition: "background .2s, transform .15s",
        transform: hov && !busy ? "scale(1.04)" : "scale(1)",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
    >
      <WaIcon size={isTiny ? 12 : isSmall ? 14 : 16} />
      {label !== false && <span>{busy ? "מכין תמונה..." : (label || "שתף תמונת דוח")}</span>}
    </button>
  );
}

export function WhatsAppIcon({ onClick, title, size = 16 }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onClick={onClick}
      title={title || "שתף בוואצאפ"}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + 8,
        height: size + 8,
        borderRadius: "50%",
        background: hov ? WA_DARK : WA_GREEN,
        transition: "background .2s, transform .15s",
        transform: hov ? "scale(1.1)" : "scale(1)",
      }}
    >
      <WaIcon size={size} />
    </span>
  );
}

function WaIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      style={{ display: "block" }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
