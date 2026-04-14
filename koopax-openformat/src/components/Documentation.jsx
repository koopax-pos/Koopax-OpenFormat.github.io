import React, { useState } from "react";
import { K } from "../lib/constants";

const styles = {
  hero: {
    textAlign: "center",
    marginBottom: 28,
    padding: "10px 0",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: K.ad,
    margin: "0 0 8px",
  },
  heroSub: {
    fontSize: 14,
    color: K.t2,
    margin: "0 0 16px",
    maxWidth: 600,
    marginInline: "auto",
  },
  toggleBtn: {
    padding: "5px 14px",
    background: K.al,
    color: K.ac,
    border: `1px solid ${K.ac}`,
    borderRadius: 7,
    cursor: "pointer",
    fontFamily: "'Rubik',Tahoma,sans-serif",
    fontSize: 11,
    fontWeight: 600,
  },
  section: {
    background: K.cd,
    border: `1px solid ${K.bd}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    background: K.cd,
    border: "none",
    cursor: "pointer",
    fontFamily: "'Rubik',Tahoma,sans-serif",
    color: K.tx,
    textAlign: "right",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    direction: "rtl",
  },
  sectionBody: {
    padding: "4px 24px 20px",
    fontSize: 13,
    borderTop: `1px solid ${K.bd}`,
    lineHeight: 1.8,
  },
  linkBox: {
    marginTop: 12,
    padding: "10px 16px",
    background: K.al,
    borderRadius: 8,
    display: "inline-block",
  },
  extLink: {
    color: K.ac,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 13,
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  videoCard: {
    display: "block",
    padding: "12px 16px",
    background: K.cd,
    border: `1px solid ${K.bd}`,
    borderRadius: 10,
    textDecoration: "none",
    transition: "all .2s",
  },
  backBtn: {
    background: "rgba(255,255,255,.14)",
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Rubik',Tahoma,sans-serif",
    fontSize: 11,
    fontWeight: 600,
  },
};

const SECTIONS = [
  {
    id: "about-koopax",
    title: "על קופקס (Koopax)",
    icon: "🏢",
    content: (
      <>
        <p>
          <strong>קופקס (Koopax)</strong> היא מערכת תוכנה מתקדמת לניהול עסקים,
          המשמשת כקופה רושמת ממוחשבת עם <strong>אישור רשות המסים בישראל</strong>.
        </p>
        <p>המערכת מאפשרת:</p>
        <ul>
          <li>הפקת חשבוניות מס וקבלות בהתאם לדרישות החוק</li>
          <li>ניהול מלאי בזמן אמת</li>
          <li>
            ייצוא קבצי <strong>מבנה אחיד</strong> (הוראה 131) לצורכי דיווח לרשות
            המסים
          </li>
          <li>דוחות Z יומיים וסיכומים תקופתיים</li>
          <li>ניהול לקוחות וספקים</li>
          <li>עבודה מאפליקציה בנייד ובמחשב</li>
        </ul>
        <p>
          קופקס מאושרת על ידי רשות המסים ועומדת בכל דרישות{" "}
          <strong>תקנות ניהול פנקסים</strong> ו<strong>הוראה 131</strong>{" "}
          לייצוא נתונים במבנה אחיד. התוכנה מתאימה לעסקים קטנים ובינוניים,
          חנויות, מסעדות, ונותני שירותים.
        </p>
        <div style={styles.linkBox}>
          <a
            href="https://www.koopax.co.il"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.extLink}
          >
            🌐 אתר קופקס הרשמי — www.koopax.co.il
          </a>
        </div>
      </>
    ),
  },
  {
    id: "open-format",
    title: "מבנה אחיד (פורמט אחיד)",
    icon: "📄",
    content: (
      <>
        <p>
          <strong>מבנה אחיד</strong>, המוכר גם בשם <strong>פורמט אחיד</strong>,
          הוא תקן שנקבע על ידי רשות המסים בישראל בהתאם ל
          <strong>הוראה 131</strong> של מס הכנסה. התקן מחייב עסקים לייצא נתונים
          חשבונאיים מתוכנות הנהלת חשבונות וקופות רושמות בפורמט סטנדרטי ואחיד.
        </p>
        <h4>קבצי המבנה האחיד</h4>
        <p>הפורמט כולל מספר קבצים עיקריים:</p>
        <ul>
          <li>
            <strong>INI.TXT</strong> — קובץ אתחול המכיל את פרטי העסק, תקופת
            הדיווח ופרטי התוכנה
          </li>
          <li>
            <strong>BKMVDATA.TXT</strong> — קובץ הנתונים המרכזי המכיל את כל
            המסמכים החשבונאיים (חשבוניות, קבלות, תעודות משלוח ועוד)
          </li>
        </ul>
        <h4>למה זה חשוב?</h4>
        <p>
          קובץ המבנה האחיד נדרש בביקורת מס הכנסה ומע"מ. כל תוכנה מאושרת חייבת
          לתמוך בייצוא קבצים אלו. הקבצים מאפשרים לרשות המסים לבדוק את הדיווחים
          של העסק בצורה ממוחשבת ויעילה.
        </p>
        <div style={styles.linkBox}>
          <a
            href="https://secapp.taxes.gov.il/TmbakmmsmlNew/frmShowDialog.aspx?cur=3"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.extLink}
          >
            🔗 אתר רשות המסים — בדיקת קובץ מבנה אחיד
          </a>
        </div>
      </>
    ),
  },
  {
    id: "income-tax",
    title: "מס הכנסה",
    icon: "🏛️",
    content: (
      <>
        <p>
          <strong>מס הכנסה</strong> הוא מס ישיר המוטל על הכנסותיהם של יחידים
          וחברות בישראל. המס מחושב לפי מדרגות מס פרוגרסיביות — ככל שההכנסה גבוהה
          יותר, שיעור המס גבוה יותר.
        </p>
        <h4>מי חייב בדיווח?</h4>
        <ul>
          <li>עוסקים מורשים ופטורים</li>
          <li>חברות בע"מ</li>
          <li>שכירים (המעסיק מנכה מס במקור)</li>
          <li>עצמאיים ובעלי עסקים</li>
        </ul>
        <h4>הוראה 131</h4>
        <p>
          הוראה 131 של מס הכנסה מחייבת עסקים שמנהלים ספרים בתוכנה ממוחשבת לייצא
          את הנתונים בפורמט אחיד (מבנה אחיד). זו הדרישה שעומדת מאחורי קבצי
          ה-INI וה-BKMVDATA.
        </p>
      </>
    ),
  },
  {
    id: "vat",
    title: 'מע"מ — מס ערך מוסף',
    icon: "💰",
    content: (
      <>
        <p>
          <strong>מע"מ (מס ערך מוסף)</strong> הוא מס עקיף המוטל על צריכת מוצרים
          ושירותים בישראל. שיעור המע"מ הנוכחי הוא <strong>18%</strong> ממחיר
          העסקה.
        </p>
        <h4>כיצד זה עובד?</h4>
        <ul>
          <li>
            העוסק גובה מע"מ מהלקוח ומשלם אותו לרשות המסים (<strong>מע"מ עסקאות</strong>)
          </li>
          <li>
            העוסק מקזז מע"מ ששילם לספקים (<strong>מע"מ תשומות</strong>)
          </li>
          <li>
            ההפרש בין מע"מ עסקאות למע"מ תשומות הוא הסכום שיש לשלם או לקבל בחזרה
          </li>
        </ul>
        <h4>דיווח מע"מ</h4>
        <p>
          עוסקים מורשים מדווחים למע"מ אחת לחודשיים (או אחת לחודש לעסקים גדולים).
          הדיווח מתבסס על חשבוניות המס שהופקו והתקבלו.
        </p>
      </>
    ),
  },
  {
    id: "vat-exempt",
    title: "פריטים בלי מע״מ (שיעור אפס)",
    icon: "🥬",
    content: (
      <>
        <p>
          לא כל המוצרים והשירותים חייבים במע"מ מלא. ישנם פריטים בשיעור מע"מ{" "}
          <strong>אפס (0%)</strong>, כלומר הם פטורים מתשלום מע"מ ללקוח:
        </p>
        <h4>דוגמאות נפוצות לפריטים בשיעור אפס</h4>
        <ul>
          <li>
            <strong>פירות וירקות טריים</strong> — מהסיבות הנפוצות ביותר לפריטים
            בלי מע"מ
          </li>
          <li>תוצרת חקלאית שלא עברה עיבוד</li>
          <li>ייצוא סחורות ושירותים לחו"ל</li>
          <li>שירותי תיירות לתיירי חוץ</li>
        </ul>
        <h4>משמעות בקובץ המבנה האחיד</h4>
        <p>
          בקובץ המבנה האחיד, פריטים בשיעור אפס מופיעים עם סכום מע"מ 0. חשוב
          להבדיל בין פריטים <strong>פטורים ממע"מ</strong> לבין פריטים ב
          <strong>שיעור אפס</strong> — לשניהם המע"מ הוא 0, אבל ההשלכות המשפטיות
          שונות.
        </p>
      </>
    ),
  },
  {
    id: "z-report",
    title: "דוח Z",
    icon: "📊",
    content: (
      <>
        <p>
          <strong>דוח Z</strong> הוא דוח סיכום יומי שמפיקה קופה רושמת בסוף יום
          העבודה. הדוח מסכם את כל הפעילות הכספית של אותו יום ומשמש כבסיס לדיווח
          לרשות המסים.
        </p>
        <h4>מה כולל דוח Z?</h4>
        <ul>
          <li>סה"כ מכירות ביום</li>
          <li>פירוט לפי אמצעי תשלום (מזומן, אשראי, העברה וכו')</li>
          <li>סה"כ מע"מ שנגבה</li>
          <li>מספר עסקאות</li>
          <li>ביטולים והחזרות</li>
          <li>יציאות מזומן מהקופה</li>
        </ul>
        <h4>חובה חוקית</h4>
        <p>
          על פי תקנות ניהול פנקסים, עסק המשתמש בקופה רושמת חייב להפיק דוח Z
          בסוף כל יום עבודה ולשמור אותו. דוח Z הוא מסמך חשוב בביקורת מס.
        </p>
      </>
    ),
  },
  {
    id: "tax-invoice",
    title: "חשבונית מס",
    icon: "🧾",
    content: (
      <>
        <p>
          <strong>חשבונית מס</strong> היא מסמך חשבונאי שמנפיק עוסק מורשה בעת
          מכירה או מתן שירות. החשבונית מהווה את הבסיס לדיווח על מע"מ עסקאות
          ומאפשרת ללקוח (אם הוא עוסק מורשה) לנכות מע"מ תשומות.
        </p>
        <h4>סוגי חשבוניות</h4>
        <ul>
          <li>
            <strong>חשבונית מס (305)</strong> — חשבונית סטנדרטית
          </li>
          <li>
            <strong>חשבונית מס/קבלה (320)</strong> — משמשת גם כקבלה על התשלום
          </li>
          <li>
            <strong>חשבונית מס זיכוי (330)</strong> — מונפקת בעת החזרה או זיכוי
          </li>
          <li>
            <strong>חשבונית ריכוז (310)</strong> — מסכמת מספר עסקאות
          </li>
          <li>
            <strong>חשבונית/חשבונית עסקה (300)</strong> — חשבונית עסקה רגילה
          </li>
        </ul>
        <h4>מה חייבת לכלול?</h4>
        <p>
          חשבונית מס חייבת לכלול: שם העוסק, מספר עוסק מורשה, תאריך, תיאור
          השירות/מוצר, סכום ללא מע"מ, סכום המע"מ, וסכום כולל מע"מ.
        </p>
      </>
    ),
  },
  {
    id: "receipt",
    title: "קבלה",
    icon: "📝",
    content: (
      <>
        <p>
          <strong>קבלה</strong> היא מסמך המעיד על קבלת תשלום. בניגוד לחשבונית
          מס, קבלה אינה מזכה בניכוי מע"מ תשומות. קבלה מונפקת בעת קבלת כסף
          מהלקוח.
        </p>
        <h4>סוגי קבלות</h4>
        <ul>
          <li>
            <strong>קבלה רגילה (400)</strong> — אישור על קבלת תשלום
          </li>
          <li>
            <strong>קבלה על תרומות (405)</strong> — קבלה מיוחדת לתרומות, מזכה
            בהטבת מס
          </li>
        </ul>
        <h4>ההבדל בין חשבונית לקבלה</h4>
        <p>
          <strong>חשבונית מס</strong> = מסמך על העסקה עצמה (מה נמכר, בכמה,
          ומע"מ). <strong>קבלה</strong> = מסמך על התשלום (כמה שולם ובאיזה אמצעי
          תשלום). חשבונית מס/קבלה (320) משלבת את שניהם למסמך אחד.
        </p>
      </>
    ),
  },
  {
    id: "refund",
    title: "החזר / זיכוי",
    icon: "↩️",
    content: (
      <>
        <p>
          <strong>החזר (זיכוי)</strong> הוא פעולה חשבונאית המתבצעת כאשר לקוח
          מחזיר מוצר או מקבל זיכוי על שירות. ההחזר מתועד באמצעות{" "}
          <strong>חשבונית מס זיכוי (330)</strong> או <strong>תעודת החזרה (210)</strong>.
        </p>
        <h4>סוגי החזרות</h4>
        <ul>
          <li>
            <strong>חשבונית זיכוי (330)</strong> — ביטול או זיכוי חלקי/מלא של
            חשבונית מס
          </li>
          <li>
            <strong>תעודת החזרה (210)</strong> — מתעדת החזרת סחורה פיזית
          </li>
          <li>
            <strong>זיכוי רכש (710)</strong> — זיכוי על קנייה מספק
          </li>
        </ul>
        <h4>חשוב לדעת</h4>
        <p>
          בקובץ המבנה האחיד, מסמכי זיכוי מופיעים בדרך כלל עם סכומים שליליים או
          עם סוג מסמך ייעודי. חשוב לתעד כל החזר כדי שהדיווח למס הכנסה ולמע"מ
          יהיה מדויק.
        </p>
      </>
    ),
  },
  {
    id: "delivery-note",
    title: "תעודת משלוח",
    icon: "🚚",
    content: (
      <>
        <p>
          <strong>תעודת משלוח</strong> היא מסמך המלווה סחורה בעת העברתה מהמוכר
          לקונה. היא חובה לפי תקנות ניהול פנקסים בעת הובלת סחורה.
        </p>
        <h4>סוגי תעודות משלוח</h4>
        <ul>
          <li>
            <strong>תעודת משלוח (200)</strong> — תעודה סטנדרטית
          </li>
          <li>
            <strong>תעודת משלוח סוכן (205)</strong> — תעודה של סוכן מכירות
          </li>
          <li>
            <strong>תעודת החזרה (210)</strong> — מתעדת החזרת סחורה
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "payment-methods",
    title: "אמצעי תשלום",
    icon: "💳",
    content: (
      <>
        <p>
          בקובץ המבנה האחיד מתועדים אמצעי התשלום השונים שבהם שולמה כל עסקה.
          הקודים הנפוצים:
        </p>
        <ul>
          <li>
            <strong>1 — מזומן</strong>: תשלום במזומן
          </li>
          <li>
            <strong>2 — המחאה (צ'ק)</strong>: תשלום בשיק
          </li>
          <li>
            <strong>3 — כרטיס אשראי</strong>: תשלום באשראי
          </li>
          <li>
            <strong>4 — העברה בנקאית</strong>: תשלום בהעברה
          </li>
          <li>
            <strong>5 — תווי קנייה</strong>: תשלום בתווים
          </li>
          <li>
            <strong>8 — הוראת קבע</strong>: חיוב אוטומטי
          </li>
          <li>
            <strong>9 — אחר</strong>: אמצעי תשלום אחר
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "bookkeeping",
    title: "ניהול פנקסים ותקנות",
    icon: "📚",
    content: (
      <>
        <p>
          <strong>תקנות ניהול פנקסים</strong> מחייבות כל עסק בישראל לנהל רישומים
          חשבונאיים מסודרים. התקנות מגדירות אילו מסמכים יש להפיק, כיצד לשמור
          אותם, ומתי להציגם לרשויות.
        </p>
        <h4>דרישות עיקריות</h4>
        <ul>
          <li>הפקת חשבוניות מס ותעודות משלוח לכל עסקה</li>
          <li>שמירת מסמכים למשך 7 שנים</li>
          <li>הפקת דוח Z יומי בקופות רושמות</li>
          <li>ייצוא קובץ מבנה אחיד לפי דרישה</li>
          <li>שימוש בתוכנה מאושרת על ידי רשות המסים</li>
        </ul>
      </>
    ),
  },
  {
    id: "videos",
    title: "סרטונים והסברים — רשות המסים",
    icon: "🎬",
    content: (
      <>
        <p>
          רשות המסים בישראל מפרסמת סרטוני הסבר ומדריכים בנושאים שונים. להלן
          קישורים שימושיים:
        </p>
        <div style={styles.videoGrid}>
          <VideoLink
            title="ערוץ YouTube של רשות המסים"
            desc="סרטוני הסבר, הדרכות ועדכונים"
            url="https://www.youtube.com/@Israel_Tax_Authority"
          />
          <VideoLink
            title="אתר רשות המסים — מידע לעוסקים"
            desc="מידע כללי, טפסים, והנחיות"
            url="https://www.gov.il/he/departments/topics/tax"
          />
          <VideoLink
            title="בדיקת קובץ מבנה אחיד"
            desc="כלי הבדיקה הרשמי של רשות המסים לקבצי מבנה אחיד"
            url="https://secapp.taxes.gov.il/TmbakmmsmlNew/frmShowDialog.aspx?cur=3"
          />
          <VideoLink
            title="מערכת חשבוניות ישראל"
            desc="המערכת לאישור חשבוניות אלקטרוניות"
            url="https://www.gov.il/he/departments/topics/invoices-il"
          />
          <VideoLink
            title="מדריך לעוסק החדש"
            desc="כל מה שצריך לדעת לפתיחת עסק"
            url="https://www.gov.il/he/departments/guides/opening-business"
          />
          <VideoLink
            title="דיווח מע״מ מקוון"
            desc="מערכת הדיווח המקוון של מע״מ"
            url="https://www.gov.il/he/service/vat-online-reporting"
          />
        </div>
      </>
    ),
  },
];

function VideoLink({ title, desc, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.videoCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = K.ac;
        e.currentTarget.style.background = K.al;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = K.bd;
        e.currentTarget.style.background = K.cd;
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: K.ac }}>{title}</div>
      <div style={{ fontSize: 11, color: K.t2, marginTop: 2 }}>{desc}</div>
    </a>
  );
}

export default function Documentation({ onBack }) {
  const [open, setOpen] = useState(new Set(["about-koopax"]));

  const toggle = (id) => {
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const expandAll = () => setOpen(new Set(SECTIONS.map((s) => s.id)));
  const collapseAll = () => setOpen(new Set());

  return (
    <div
      style={{
        fontFamily: "'Rubik',Tahoma,sans-serif",
        direction: "rtl",
        background: K.bg,
        minHeight: "100vh",
        color: K.tx,
        lineHeight: 1.7,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: K.hd,
          color: "#fff",
          padding: "14px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="https://online.koopax.co.il/logo.png"
              alt="Koopax"
              style={{ height: 26, filter: "brightness(0) invert(1)" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              מדריך ושאלות נפוצות
            </span>
          </div>
          <button onClick={onBack} style={styles.backBtn}>
            ← חזרה לאפליקציה
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>מדריך מושגים ושאלות נפוצות</h1>
          <p style={styles.heroSub}>
            מידע על מבנה אחיד, מס הכנסה, מע"מ, חשבוניות, קבלות, דוח Z ועוד —
            וכן על תוכנת קופקס (Koopax)
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={expandAll} style={styles.toggleBtn}>
              פתח הכל
            </button>
            <button onClick={collapseAll} style={styles.toggleBtn}>
              סגור הכל
            </button>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SECTIONS.map((sec) => {
            const isOpen = open.has(sec.id);
            return (
              <div key={sec.id} style={styles.section}>
                <button
                  onClick={() => toggle(sec.id)}
                  style={{
                    ...styles.sectionHeader,
                    borderBottomLeftRadius: isOpen ? 0 : 12,
                    borderBottomRightRadius: isOpen ? 0 : 12,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{sec.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {sec.title}
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      transition: "transform .2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    ▾
                  </span>
                </button>
                {isOpen && <div style={styles.sectionBody}>{sec.content}</div>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "28px 0 16px",
            fontSize: 11,
            color: K.t3,
          }}
        >
          נבנה על ידי{" "}
          <a
            href="https://www.koopax.co.il"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: K.ac, textDecoration: "none", fontWeight: 600 }}
          >
            קופקס
          </a>
          {" · Koopax OpenFormat Viewer"}
        </div>
      </div>
    </div>
  );
}
