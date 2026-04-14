import { useState, useCallback, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";

/* ═══ Koopax OpenFormat — נבנה על ידי קופקס ═══ */

const CP862={};for(let i=0;i<=26;i++)CP862[0x80+i]=0x05d0+i;
function decodeCp862(buf){const b=new Uint8Array(buf);let r="";for(let i=0;i<b.length;i++)r+=String.fromCharCode(CP862[b[i]]||b[i]);return r;}
function hasHeb(s){return/[\u05d0-\u05ea]/.test(s);}
function hasJunk(s){const x=s.slice(0,2000);return(x.match(/[¥£¢¤¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾]/g)||[]).length>5||((x.match(/[^\x00-\x7f\u05d0-\u05ea\u0590-\u05ff\u200f\u200e]/g)||[]).length>20&&!hasHeb(x));}
function decodeAuto(buf){
  const b=new Uint8Array(buf);
  if(b[0]===0xef&&b[1]===0xbb&&b[2]===0xbf){const t=new TextDecoder("utf-8").decode(buf);if(!hasJunk(t))return{text:t,enc:"UTF-8"};}
  const tries=[];
  try{const t=new TextDecoder("utf-8").decode(buf);tries.push({text:t,enc:"UTF-8",s:hasHeb(t)&&!hasJunk(t)?3:0});}catch(e){}
  try{const t=new TextDecoder("iso-8859-8-i").decode(buf);tries.push({text:t,enc:"ISO-8859-8-I",s:hasHeb(t)&&!hasJunk(t)?2:0});}catch(e){}
  try{const t=new TextDecoder("iso-8859-8").decode(buf);tries.push({text:t,enc:"ISO-8859-8",s:hasHeb(t)&&!hasJunk(t)?1.5:0});}catch(e){}
  {const t=decodeCp862(buf);tries.push({text:t,enc:"CP-862",s:hasHeb(t)&&!hasJunk(t)?1:0});}
  tries.sort((a,b2)=>b2.s-a.s);return tries[0]||{text:"",enc:"?"};
}

function f(l,s,n){return(l.substring(s-1,s-1+n)||"").trim();}
function pa(s,d=2){if(!s||!s.trim())return 0;s=s.trim();const sg=s[0]==="-"?-1:1;const dg=s.replace(/[^0-9]/g,"");return dg?sg*parseInt(dg,10)/Math.pow(10,d):0;}
function pu(s,d=2){if(!s||!s.trim())return 0;const dg=s.replace(/[^0-9]/g,"");return dg?parseInt(dg,10)/Math.pow(10,d):0;}
function fa(a){return new Intl.NumberFormat("he-IL",{style:"currency",currency:"ILS",minimumFractionDigits:2}).format(a);}
function fd(s){if(!s||s.length<8)return"";return`${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;}
function ft(s){if(!s||s.length<4)return"";return`${s.slice(0,2)}:${s.slice(2,4)}`;}
function ymd(s){if(!s||s.length<8)return null;return new Date(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8));}
function toY(d){return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;}

const DT={100:"הזמנה",200:"ת. משלוח",205:"ת. משלוח סוכן",210:"ת. החזרה",300:"חשבונית/ח. עסקה",305:"חשבונית מס",310:"חשבונית ריכוז",320:"חשבונית מס/קבלה",330:"חש׳ מס זיכוי",340:"חש׳ שריון",345:"חש׳ סוכן",400:"קבלה",405:"קבלה תרומות",410:"יציאה מקופה",420:"הפקדת בנק",500:"הזמנת רכש",600:"ת. משלוח רכש",610:"החזרת רכש",700:"חש׳ מס רכש",710:"זיכוי רכש",800:"יתרת פתיחה",810:"כניסה למלאי",820:"יציאה מהמלאי",830:"העברה מחסנים",840:"עדכון ספירה",900:"דוח ייצור-כניסה",910:"דוח ייצור-יציאה"};
const PM={1:"מזומן",2:"המחאה",3:"כ. אשראי",4:"העברה בנקאית",5:"תווי קנייה",6:"תלוש החלפה",7:"שטר",8:"הו׳ קבע",9:"אחר"};

function parseIni(l){return{tot:parseInt(f(l,10,15))||0,vat:f(l,25,9),swReg:f(l,57,8),swName:f(l,65,20),swVer:f(l,85,20),swMaker:f(l,114,20),swType:f(l,134,1)==="1"?"חד שנתי":"רב שנתי",biz:f(l,215,50),addr:f(l,265,50),addrN:f(l,315,10),city:f(l,325,30),zip:f(l,355,8),taxYr:f(l,363,4),sDate:f(l,367,8),eDate:f(l,375,8),pDate:f(l,383,8),pTime:f(l,391,4),cur:f(l,417,3)||"ILS",hasBr:f(l,420,1)==="1"};}
function pC(l){return{rn:parseInt(f(l,5,9))||0,vat:f(l,14,9),dt:parseInt(f(l,23,3))||0,dn:f(l,26,20),iD:f(l,46,8),iT:f(l,54,4),cn:f(l,58,50),ca:f(l,108,50),can:f(l,158,10),cc:f(l,168,30),cz:f(l,198,8),cco:f(l,206,30),ccc:f(l,236,2),cp:f(l,238,15),cv:f(l,253,9),vD:f(l,262,8),fT:pa(f(l,270,15)),fC:f(l,285,3),bD:pa(f(l,288,15)),di:pa(f(l,303,15)),aD:pa(f(l,318,15)),va:pa(f(l,333,15)),to:pa(f(l,348,15)),wh:pa(f(l,363,12)),ck:f(l,375,15),mf:f(l,390,10),xx:f(l,400,1)==="1",dD:f(l,401,8),br:f(l,409,7),op:f(l,416,9),lk:f(l,425,7)};}
function pD(l){return{rn:parseInt(f(l,5,9))||0,dt:parseInt(f(l,23,3))||0,dn:f(l,26,20),ln:parseInt(f(l,46,4))||0,bdt:parseInt(f(l,50,3))||0,bdn:f(l,53,20),tt:f(l,73,1),cat:f(l,74,20),desc:f(l,94,30),mfr:f(l,124,50),unit:f(l,204,20),qty:pa(f(l,224,17),4),pr:pa(f(l,241,15)),ld:pa(f(l,256,15)),lt:pa(f(l,271,15)),vr:pu(f(l,286,4)),dD:f(l,297,8),lk:f(l,305,7)};}
function pP(l){return{rn:parseInt(f(l,5,9))||0,dt:parseInt(f(l,23,3))||0,dn:f(l,26,20),ln:parseInt(f(l,46,4))||0,pm:parseInt(f(l,50,1))||0,bank:f(l,51,10),brn:f(l,61,10),acc:f(l,71,15),chk:f(l,86,10),pd:f(l,96,8),amt:pa(f(l,104,15)),card:f(l,120,20),ct:f(l,140,1),dD:f(l,148,8),lk:f(l,156,7)};}
function pB(l){return{rn:parseInt(f(l,5,9))||0,key:f(l,23,15),name:f(l,38,50),tc:f(l,88,15),ob:pa(f(l,278,15)),td:pa(f(l,293,15)),tcr:pa(f(l,308,15))};}
function pM(l){return{rn:parseInt(f(l,5,9))||0,cat:f(l,63,20),name:f(l,83,50),unit:f(l,173,20),ob:pa(f(l,193,12)),ti:pa(f(l,205,12)),to2:pa(f(l,217,12))};}

function validate(ini,docs){
  const w=[];
  if(!ini?.vat)w.push({t:"error",m:"חסר מספר עוסק מורשה"});
  if(!ini?.biz)w.push({t:"warn",m:"חסר שם עסק"});
  if(!docs.length)w.push({t:"warn",m:"לא נמצאו מסמכים"});
  const cx=docs.filter(d=>d.h.xx).length;if(cx)w.push({t:"info",m:`${cx} מסמכים מבוטלים`});
  const nc=docs.filter(d=>!d.h.cn||d.h.cn==="[חסר שם לקוח]").length;if(nc)w.push({t:"warn",m:`${nc} מסמכים ללא שם לקוח`});
  const zr=docs.filter(d=>d.h.to===0&&d.h.dt>=300&&d.h.dt<=330).length;if(zr)w.push({t:"warn",m:`${zr} חשבוניות עם סכום 0`});
  const ni=docs.filter(d=>!d.ds.length&&d.h.dt>=300&&d.h.dt<=400).length;if(ni)w.push({t:"warn",m:`${ni} מסמכים ללא שורות פריטים`});
  return w;
}

function processAsync(iB,bB,onP){
  return new Promise((res,rej)=>{try{
    onP({s:"מפענח קידוד...",p:5});
    const iDec=decodeAuto(iB),bDec=decodeAuto(bB);
    onP({s:"מפצל שורות...",p:10});
    const iL=iDec.text.split(/\r?\n/).filter(l=>l.length>3);
    const bL=bDec.text.split(/\r?\n/).filter(l=>l.length>3);
    const ini=iL.length?parseIni(iL[0]):null;
    const cs=[],ds2=[],ps=[],bs=[],ms=[];
    const tot=bL.length;const CH=400;let idx=0;
    function chunk(){
      const end=Math.min(idx+CH,tot);
      for(;idx<end;idx++){const l=bL[idx];const c=l.substring(0,4);
        if(c==="C100")cs.push(pC(l));else if(c==="D110")ds2.push(pD(l));else if(c==="D120")ps.push(pP(l));else if(c==="B110")bs.push(pB(l));else if(c==="M100")ms.push(pM(l));}
      onP({s:`מעבד ${idx.toLocaleString()}/${tot.toLocaleString()} רשומות...`,p:15+Math.round((idx/tot)*70)});
      if(idx<tot){setTimeout(chunk,0);return;}
      onP({s:"מקשר מסמכים...",p:90});
      setTimeout(()=>{
        const dL={},dK={},pL={},pK={};
        ds2.forEach(d=>{if(d.lk)(dL[d.lk]||=[]).push(d);(dK[`${d.dt}|${d.dn}`]||=[]).push(d);});
        ps.forEach(p=>{if(p.lk)(pL[p.lk]||=[]).push(p);(pK[`${p.dt}|${p.dn}`]||=[]).push(p);});
        const docs=cs.map(h=>({h,ds:(h.lk&&dL[h.lk])||(h.mf&&dL[h.mf])||dK[`${h.dt}|${h.dn}`]||[],ps:(h.lk&&pL[h.lk])||(h.mf&&pL[h.mf])||pK[`${h.dt}|${h.dn}`]||[]}));
        let mn=null,mx=null;
        docs.forEach(d=>{const dd=d.h.dD||d.h.iD;if(dd?.length>=8){const dt2=ymd(dd);if(dt2){if(!mn||dt2<mn)mn=dt2;if(!mx||dt2>mx)mx=dt2;}}});
        const per={s:ini?.sDate||(mn?toY(mn):""),e:ini?.eDate||(mx?toY(mx):""),y:ini?.taxYr||""};
        const wrn=validate(ini,docs);
        wrn.push({t:"info",m:`קידוד: ${iDec.enc} (INI), ${bDec.enc} (DATA)`});
        // Build items catalog (all unique items with last price)
        const itemMap={};
        docs.forEach(d=>{const docDate=d.h.dD||d.h.iD||"";
          d.ds.forEach(it=>{
            const key=it.cat||it.desc||"";
            if(!key)return;
            const existing=itemMap[key];
            if(!existing||docDate>existing.lastDate){
              itemMap[key]={name:it.desc,cat:it.cat,unit:it.unit,lastPrice:it.pr,lastDate:docDate,qty:it.qty,vr:it.vr};
            }
          });
        });
        const items=Object.values(itemMap).sort((a,b)=>(a.name||"").localeCompare(b.name||"","he"));
        onP({s:"סיום!",p:100});
        setTimeout(()=>res({ini,docs,accs:bs,inv:ms,per,wrn,items}),100);
      },0);
    }
    setTimeout(chunk,0);
  }catch(e){rej(e);}});
}

// ─── Exports ───
function expXls(d){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{"שם עסק":d.ini?.biz,"ע.מ.":d.ini?.vat,"כתובת":`${d.ini?.addr||""} ${d.ini?.city||""}`,"תקופה":`${fd(d.per?.s)} - ${fd(d.per?.e)}`,"תוכנה":d.ini?.swName}]),"פרטי עסק");
  const dr=d.docs.map(x=>({"סוג":DT[x.h.dt]||x.h.dt,"מספר":x.h.dn?.replace(/^0+/,"")||"","תאריך":fd(x.h.dD||x.h.iD),"לקוח/ספק":x.h.cn,"לפני מע״מ":x.h.aD,"מע״מ":x.h.va,"סה״כ":x.h.to,"מבוטל":x.h.xx?"כן":"","פריטים":x.ds.length}));
  const ws1=XLSX.utils.json_to_sheet(dr);ws1["!cols"]=[{wch:18},{wch:12},{wch:12},{wch:25},{wch:14},{wch:14},{wch:14},{wch:6},{wch:8}];
  XLSX.utils.book_append_sheet(wb,ws1,"מסמכים");
  const ir=[];d.docs.forEach(x=>x.ds.forEach(it=>ir.push({"סוג":DT[x.h.dt]||"","מסמך":x.h.dn?.replace(/^0+/,"")||"","תאריך":fd(x.h.dD||x.h.iD),"פריט":it.desc,"מק״ט":it.cat,"כמות":it.qty,"מחיר":it.pr,"סה״כ":it.lt})));
  if(ir.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(ir),"פריטים");
  const pr2=[];d.docs.forEach(x=>x.ps.forEach(p=>pr2.push({"מסמך":x.h.dn?.replace(/^0+/,"")||"","תאריך":fd(x.h.dD||x.h.iD),"אמצעי":PM[p.pm]||"","סכום":p.amt,"ת. תשלום":fd(p.pd),"כרטיס":p.card})));
  if(pr2.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(pr2),"תשלומים");
  if(d.accs.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d.accs.map(a=>({"מפתח":a.key,"שם":a.name,"פתיחה":a.ob,"חובה":a.td,"זכות":a.tcr,"יתרה":a.ob+a.td-a.tcr}))),"חשבונות");
  XLSX.writeFile(wb,`openformat_${d.ini?.vat||"export"}.xlsx`);
}

function expItems(d){
  const wb=XLSX.utils.book_new();
  const rows=d.items.map(it=>({"שם פריט":it.name,"מק״ט / ברקוד":it.cat,"יחידה":it.unit,"מחיר אחרון (ללא מע״מ)":it.lastPrice,"מחיר כולל מע״מ":it.vr?Math.round(it.lastPrice*(1+it.vr/100)*100)/100:it.lastPrice,"תאריך מכירה אחרון":fd(it.lastDate)}));
  const ws=XLSX.utils.json_to_sheet(rows);
  ws["!cols"]=[{wch:30},{wch:20},{wch:12},{wch:20},{wch:20},{wch:16}];
  XLSX.utils.book_append_sheet(wb,ws,"קטלוג פריטים");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{"שם עסק":d.ini?.biz,"ע.מ.":d.ini?.vat,"תקופה":`${fd(d.per?.s)} - ${fd(d.per?.e)}`,"סה״כ פריטים ייחודיים":d.items.length}]),"פרטי עסק");
  XLSX.writeFile(wb,`items_catalog_${d.ini?.vat||"export"}.xlsx`);
}

function expDoc(d){
  const i=d.ini||{};
  const h=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:David,Arial;direction:rtl;font-size:11pt}h1{color:#1b6b50;border-bottom:2px solid #1b6b50;padding-bottom:6px}h2{color:#333;margin-top:20px}table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #ccc;padding:5px 8px;text-align:right}th{background:#f0f4f2}.info{background:#f8f9fa;padding:10px;border:1px solid #eee;margin:10px 0}.footer{margin-top:30px;text-align:center;color:#999;font-size:9pt}</style></head><body>
<h1>דוח מבנה אחיד — ${i.biz||""}</h1>
<div class="info"><b>ע.מ.:</b> ${i.vat||""} | <b>כתובת:</b> ${i.addr||""} ${i.addrN||""} ${i.city||""} | <b>תקופה:</b> ${fd(d.per?.s)} — ${fd(d.per?.e)} | <b>תוכנה:</b> ${i.swName||""}</div>
<h2>מסמכים (${d.docs.length})</h2>
<table><tr><th>סוג</th><th>מספר</th><th>תאריך</th><th>לקוח/ספק</th><th>סה״כ</th></tr>
${d.docs.slice(0,500).map(x=>`<tr><td>${DT[x.h.dt]||x.h.dt}</td><td>${x.h.dn?.replace(/^0+/,"")||""}</td><td>${fd(x.h.dD||x.h.iD)}</td><td>${x.h.cn||""}</td><td>${fa(x.h.to)}</td></tr>`).join("")}
${d.docs.length>500?`<tr><td colspan="5" style="text-align:center;color:#999">...${d.docs.length-500} נוספים</td></tr>`:""}
</table>
<div class="footer">הופק באמצעות Koopax OpenFormat — נבנה על ידי קופקס | koopax.co.il</div>
</body></html>`;
  const bl=new Blob([h],{type:"application/msword"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=`openformat_${i.vat||"report"}.doc`;a.click();
}

// ─── Styles ───
const K={bg:"#f5f6f8",cd:"#fff",bd:"#e3e6eb",ac:"#1b6b50",al:"#e6f4ed",ad:"#0d4230",tx:"#1a1e26",t2:"#5c6370",t3:"#9da5b0",hd:"#0f261c",dn:"#c0392b",db:"#fdf0ef",ok:"#27ae60",ob:"#eafaf1",st:"#fafbfc",tb:"#eef0f4",tg:"#eff3f0",wn:"#e67e22",wb:"#fef9e7"};
const Bdg=({children,c=K.ac,b=K.al})=><span style={{display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:b,color:c}}>{children}</span>;
const St=({l,v,s})=><div style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:10,padding:"13px 16px",flex:"1 1 120px",minWidth:0}}><div style={{fontSize:11,color:K.t2,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l}</div><div style={{fontSize:17,fontWeight:700,color:K.ad,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</div>{s&&<div style={{fontSize:10,color:K.t3,marginTop:1}}>{s}</div>}</div>;

function DD({doc}){
  const{h,ds,ps}=doc;const tn=DT[h.dt]||h.dt;
  return<div style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:12,overflow:"hidden"}}>
    <div style={{background:K.hd,color:"#fff",padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:11,opacity:.7}}>{tn} #{h.dn?.replace(/^0+/,"")||"—"}</div><div style={{fontSize:21,fontWeight:700}}>{fa(h.to)}</div></div><div style={{textAlign:"left",fontSize:13,opacity:.85}}><div>{fd(h.dD||h.iD)}</div>{h.iT&&<div style={{fontSize:12}}>{ft(h.iT)}</div>}</div></div>
      {h.xx&&<div style={{marginTop:6}}><Bdg c="#fff" b="rgba(255,90,90,.35)">מבוטל</Bdg></div>}
    </div>
    <div style={{padding:"12px 20px",borderBottom:`1px solid ${K.tb}`,background:K.st}}>
      <div style={{fontSize:11,color:K.t2}}>לקוח/ספק</div><div style={{fontWeight:600}}>{h.cn||"—"}</div>
      {(h.ca||h.cc)&&<div style={{fontSize:12,color:K.t2}}>{[h.ca,h.can,h.cc].filter(Boolean).join(" ")}</div>}
      {h.cp&&<div style={{fontSize:12,color:K.t2}}>טל׳ {h.cp}</div>}
      {h.cv&&!/^0+$/.test(h.cv)&&<div style={{fontSize:12,color:K.t2}}>ע.מ. {h.cv}</div>}
    </div>
    <div style={{padding:"12px 20px",borderBottom:`1px solid ${K.tb}`,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      <div><div style={{fontSize:10,color:K.t3}}>לפני מע״מ</div><div style={{fontWeight:600,fontSize:14,fontVariantNumeric:"tabular-nums"}}>{fa(h.aD)}</div></div>
      <div><div style={{fontSize:10,color:K.t3}}>מע״מ</div><div style={{fontWeight:600,fontSize:14,fontVariantNumeric:"tabular-nums"}}>{fa(h.va)}</div></div>
      <div><div style={{fontSize:10,color:K.t3}}>סה״כ</div><div style={{fontWeight:700,fontSize:14,fontVariantNumeric:"tabular-nums",color:K.ad}}>{fa(h.to)}</div></div>
    </div>
    {ds.length>0&&<div style={{padding:"12px 20px",borderBottom:`1px solid ${K.tb}`}}>
      <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:K.t2}}>פריטים ({ds.length})</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:440}}>
        <thead><tr style={{borderBottom:`2px solid ${K.tb}`}}>{["#","תיאור","יחידה","כמות","מחיר","סה״כ"].map(x=><th key={x} style={{textAlign:x==="כמות"?"center":x==="מחיר"||x==="סה״כ"?"left":"right",padding:"4px 6px",fontWeight:600,color:K.t3,fontSize:10}}>{x}</th>)}</tr></thead>
        <tbody>{ds.map((d,i)=><tr key={i} style={{borderBottom:`1px solid ${K.tb}`,background:i%2?K.st:"transparent"}}><td style={{padding:"6px",color:K.t3,width:24}}>{d.ln}</td><td style={{padding:"6px",fontWeight:500}}>{d.desc||"—"}{d.cat&&<span style={{fontSize:10,color:K.t3}}> ({d.cat})</span>}</td><td style={{padding:"6px",color:K.t2}}>{d.unit||"—"}</td><td style={{padding:"6px",textAlign:"center",fontVariantNumeric:"tabular-nums"}}>{d.qty}</td><td style={{padding:"6px",textAlign:"left",fontVariantNumeric:"tabular-nums"}}>{fa(d.pr)}</td><td style={{padding:"6px",textAlign:"left",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{fa(d.lt)}</td></tr>)}</tbody>
      </table></div></div>}
    {ps.length>0&&<div style={{padding:"12px 20px"}}>
      <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:K.t2}}>תשלומים ({ps.length})</div>
      {ps.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:K.st,borderRadius:8,border:`1px solid ${K.tb}`,marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><Bdg>{PM[p.pm]||p.pm}</Bdg>{p.card&&<span style={{fontSize:11,color:K.t2}}>{p.card}</span>}{p.pd&&<span style={{fontSize:11,color:K.t3}}>{fd(p.pd)}</span>}</div>
        <div style={{fontWeight:700,fontVariantNumeric:"tabular-nums",color:K.ad,fontSize:14}}>{fa(p.amt)}</div>
      </div>)}
    </div>}
    <div style={{padding:"8px 20px",background:K.st,borderTop:`1px solid ${K.tb}`,fontSize:10,color:K.t3,display:"flex",gap:12,flexWrap:"wrap"}}>{h.op&&<span>מפעיל: {h.op}</span>}{h.br&&<span>סניף: {h.br}</span>}<span>מזהה: {h.mf||h.lk||"—"}</span></div>
  </div>;
}

// ─── MAIN ───
export default function App(){
  const[data,setData]=useState(null);
  const[err,setErr]=useState(null);
  const[prog,setProg]=useState(null);
  const[tab,setTab]=useState("documents");
  const[sel,setSel]=useState(0);
  const[q,setQ]=useState("");
  const[iF,setIF]=useState(null);
  const[bF,setBF]=useState(null);
  const[pg,setPg]=useState(0);
  const[tf,setTf]=useState("all");
  const[df,setDf]=useState("");
  const[dt2,setDt2]=useState("");
  const PS=60;
  const LOGO="https://online.koopax.co.il/logo.png";

  const go=useCallback(async()=>{
    if(!iF||!bF){setErr("יש להעלות את שני הקבצים");return;}
    setErr(null);setProg({s:"קורא קבצים...",p:0});
    try{const[a,b]=await Promise.all([iF.arrayBuffer(),bF.arrayBuffer()]);
      const r=await processAsync(a,b,setProg);setData(r);setSel(0);setTab("documents");setPg(0);setProg(null);
    }catch(e){setErr("שגיאה: "+e.message);setProg(null);}
  },[iF,bF]);

  const dts=useMemo(()=>{if(!data)return[];return[...new Set(data.docs.map(d=>d.h.dt))].sort((a,b)=>a-b);},[data]);

  const filt=useMemo(()=>{
    if(!data)return[];let r=data.docs;
    if(tf!=="all")r=r.filter(d=>d.h.dt===+tf);
    if(df){const v=df.replace(/-/g,"");r=r.filter(d=>(d.h.dD||d.h.iD||"")>=v);}
    if(dt2){const v=dt2.replace(/-/g,"");r=r.filter(d=>(d.h.dD||d.h.iD||"")<=v);}
    if(q.trim()){const s=q.trim().toLowerCase();r=r.filter(d=>(d.h.cn||"").toLowerCase().includes(s)||(DT[d.h.dt]||"").includes(s)||(d.h.dn||"").includes(s)||String(d.h.to).includes(s));}
    return r;
  },[data,tf,df,dt2,q]);

  const paged=useMemo(()=>filt.slice(0,(pg+1)*PS),[filt,pg]);
  useEffect(()=>{setSel(0);setPg(0);},[q,tf,df,dt2]);

  const yearly=useMemo(()=>{
    if(!data)return[];const m={};
    data.docs.forEach(d=>{const dd=d.h.dD||d.h.iD;if(!dd||dd.length<4)return;const y=dd.slice(0,4);if(!m[y])m[y]={y,n:0,r:0,v:0,bt:{}};m[y].n++;m[y].r+=d.h.to;m[y].v+=d.h.va;const t=d.h.dt;if(!m[y].bt[t])m[y].bt[t]={c:0,t:0};m[y].bt[t].c++;m[y].bt[t].t+=d.h.to;});
    return Object.values(m).sort((a,b)=>a.y.localeCompare(b.y));
  },[data]);

  const sts=useMemo(()=>{if(!data)return null;const d=data.docs;return{r:d.reduce((s,x)=>s+x.h.to,0),v:d.reduce((s,x)=>s+x.h.va,0),i:d.reduce((s,x)=>s+x.ds.length,0),n:d.length};},[data]);

  const fl=<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>;
  const rs={fontFamily:"'Rubik',Tahoma,sans-serif",direction:"rtl",background:K.bg,minHeight:"100vh",color:K.tx,lineHeight:1.6};

  // ─── Upload screen ───
  if(!data)return(
    <div style={{...rs,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>{fl}
      <div style={{textAlign:"center",maxWidth:480,width:"100%"}}>
        <img src={LOGO} alt="Koopax" style={{height:56,marginBottom:8}} onError={e=>{e.target.style.display="none"}}/>
        <div style={{fontSize:19,fontWeight:700,color:K.ad,marginBottom:2}}>Koopax OpenFormat</div>
        <div style={{fontSize:13,color:K.t2,marginBottom:26}}>מציג קבצי מבנה אחיד — הוראה 131 מס הכנסה</div>
        {prog?<div style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:14,padding:"26px 22px",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:8,color:K.ad}}>{prog.s}</div>
          <div style={{height:8,background:K.bd,borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",background:`linear-gradient(90deg,${K.ac},${K.ok})`,borderRadius:4,width:`${prog.p}%`,transition:"width .3s"}}/></div>
          <div style={{fontSize:12,color:K.t3}}>{prog.p}%</div>
        </div>:<>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {[{l:"INI.TXT",v:iF,s:setIF},{l:"BKMVDATA.TXT",v:bF,s:setBF}].map(({l,v,s})=>
              <label key={l} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 20px",background:v?K.ob:K.cd,border:`2px dashed ${v?K.ok:K.bd}`,borderRadius:12,cursor:"pointer"}}>
                <input type="file" accept=".txt,.TXT" style={{display:"none"}} onChange={e=>{if(e.target.files[0])s(e.target.files[0])}}/>
                <span style={{fontSize:20}}>{v?"✓":"📄"}</span>
                <div style={{textAlign:"right"}}><div style={{fontWeight:600,fontSize:13}}>{l}</div><div style={{fontSize:11,color:K.t2}}>{v?v.name:"לחץ לבחירת קובץ"}</div></div>
              </label>)}
          </div>
          <button onClick={go} disabled={!iF||!bF} style={{width:"100%",padding:"12px",fontSize:14,fontWeight:600,fontFamily:"inherit",background:(!iF||!bF)?K.t3:K.ac,color:"#fff",border:"none",borderRadius:10,cursor:(!iF||!bF)?"not-allowed":"pointer"}}>הצג נתונים</button>
        </>}
        {err&&<div style={{marginTop:12,padding:"10px 14px",background:K.db,color:K.dn,borderRadius:8,fontSize:12}}>{err}</div>}
        <div style={{marginTop:24,fontSize:11,color:K.t3,lineHeight:1.7}}>זיהוי קידוד אוטומטי (UTF-8 / ISO-8859-8 / CP-862)<br/>עיבוד אסינכרוני לקבצים גדולים · הכל בדפדפן</div>
        <div style={{marginTop:16,fontSize:10,color:K.t3,opacity:.7}}>נבנה על ידי <a href="https://www.koopax.co.il" target="_blank" rel="noopener" style={{color:K.ac,textDecoration:"none",fontWeight:600}}>קופקס</a></div>
      </div>
    </div>
  );

  // ─── Data view ───
  const ini=data.ini;const sd=filt[sel]||null;
  const tbs=[{id:"documents",l:"מסמכים",n:data.docs.length},{id:"yearly",l:"סיכום שנתי",n:yearly.length},{id:"accounts",l:"חשבונות",n:data.accs.length},{id:"inventory",l:"מלאי",n:data.inv.length}].filter(t=>t.n>0);
  const perS=data.per?.s?`${fd(data.per.s)} — ${fd(data.per.e)}`:data.per?.y||"—";

  return(
    <div style={rs}>{fl}
      {/* Top bar */}
      <div style={{background:K.hd,color:"#fff",padding:"9px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO} alt="" style={{height:26,filter:"brightness(0) invert(1)"}} onError={e=>{e.target.style.display="none"}}/>
            <span style={{fontWeight:700,fontSize:12}}>OpenFormat</span><span style={{opacity:.3}}>|</span>
            <span style={{fontSize:13}}>{ini?.biz||"—"}</span><span style={{fontSize:10,opacity:.5}}>ע.מ. {ini?.vat}</span>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {[["ייצוא Excel",()=>expXls(data)],["ייצוא Word",()=>expDoc(data)],["ייצוא קטלוג פריטים",()=>expItems(data)],["קובץ חדש",()=>{setData(null);setIF(null);setBF(null)}]].map(([t,fn])=>
              <button key={t} onClick={fn} style={{background:"rgba(255,255,255,.12)",border:"none",color:"#fff",padding:"4px 10px",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>{t}</button>)}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 16px"}}>
        {/* Warnings */}
        {data.wrn.length>0&&<div style={{padding:"10px 0 2px",display:"flex",flexDirection:"column",gap:3}}>
          {data.wrn.map((w,i)=><div key={i} style={{padding:"6px 12px",borderRadius:6,fontSize:11,background:w.t==="error"?K.db:w.t==="warn"?K.wb:K.al,color:w.t==="error"?K.dn:w.t==="warn"?K.wn:K.ac}}>
            {w.t==="error"?"❌":w.t==="warn"?"⚠️":"ℹ️"} {w.m}
          </div>)}
        </div>}

        {/* Stats */}
        <div style={{padding:"12px 0 8px",display:"flex",gap:8,flexWrap:"wrap"}}>
          <St l="מסמכים" v={sts.n.toLocaleString()}/><St l="מחזור" v={fa(sts.r)}/><St l="מע״מ" v={fa(sts.v)}/><St l="פריטים ייחודיים" v={data.items.length.toLocaleString()}/><St l="תקופה" v={perS} s={ini?.swName}/>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,borderBottom:`2px solid ${K.bd}`,marginBottom:12}}>
          {tbs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setSel(0)}} style={{padding:"8px 14px",background:"none",border:"none",borderBottom:tab===t.id?`3px solid ${K.ac}`:"3px solid transparent",fontFamily:"inherit",fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?K.ac:K.t2,cursor:"pointer",marginBottom:-2}}>{t.l} ({t.n})</button>)}
        </div>

        {/* Documents */}
        {tab==="documents"&&<>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
            <input type="text" placeholder="חיפוש..." value={q} onChange={e=>setQ(e.target.value)} style={{padding:"7px 10px",border:`1px solid ${K.bd}`,borderRadius:7,fontFamily:"inherit",fontSize:11,width:160,boxSizing:"border-box",direction:"rtl"}}/>
            <select value={tf} onChange={e=>setTf(e.target.value)} style={{padding:"7px 8px",border:`1px solid ${K.bd}`,borderRadius:7,fontFamily:"inherit",fontSize:11,background:K.cd}}>
              <option value="all">כל הסוגים</option>{dts.map(t=><option key={t} value={t}>{DT[t]||t}</option>)}
            </select>
            <span style={{fontSize:11,color:K.t2}}>מ-</span>
            <input type="date" value={df} onChange={e=>setDf(e.target.value)} style={{padding:"5px 6px",border:`1px solid ${K.bd}`,borderRadius:6,fontSize:11,fontFamily:"inherit"}}/>
            <span style={{fontSize:11,color:K.t2}}>עד</span>
            <input type="date" value={dt2} onChange={e=>setDt2(e.target.value)} style={{padding:"5px 6px",border:`1px solid ${K.bd}`,borderRadius:6,fontSize:11,fontFamily:"inherit"}}/>
            {(tf!=="all"||df||dt2||q)&&<button onClick={()=>{setTf("all");setDf("");setDt2("");setQ("")}} style={{padding:"5px 10px",background:K.db,color:K.dn,border:"none",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>נקה</button>}
            <span style={{fontSize:10,color:K.t3,marginRight:"auto"}}>{filt.length} תוצאות</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:12,alignItems:"start"}}>
            <div style={{maxHeight:"calc(100vh - 310px)",overflowY:"auto"}}>
              {!paged.length&&<div style={{textAlign:"center",padding:24,color:K.t3,fontSize:12}}>אין תוצאות</div>}
              {paged.map((d,i)=><div key={i} onClick={()=>setSel(i)} style={{background:i===sel?K.al:K.cd,border:`1px solid ${i===sel?K.ac:K.bd}`,borderRadius:9,padding:"10px 14px",cursor:"pointer",marginBottom:5,borderRight:i===sel?`4px solid ${K.ac}`:"4px solid transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:4}}>
                  <div style={{minWidth:0,overflow:"hidden"}}><div style={{fontWeight:600,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{DT[d.h.dt]||d.h.dt}</div><div style={{fontSize:10,color:K.t2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.h.cn||"—"} · {fd(d.h.dD||d.h.iD)}</div></div>
                  <div style={{textAlign:"left",flexShrink:0}}><div style={{fontWeight:700,fontSize:13,color:K.ad,fontVariantNumeric:"tabular-nums"}}>{fa(d.h.to)}</div><div style={{fontSize:9,color:K.t3}}>{d.ds.length} פריטים</div></div>
                </div>{d.h.xx&&<Bdg c={K.dn} b={K.db}>מבוטל</Bdg>}
              </div>)}
              {paged.length<filt.length&&<button onClick={()=>setPg(p=>p+1)} style={{width:"100%",padding:"8px",background:K.al,color:K.ac,border:`1px solid ${K.ac}`,borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,marginTop:3}}>עוד ({(filt.length-paged.length).toLocaleString()})</button>}
            </div>
            <div>{sd?<DD doc={sd}/>:<div style={{textAlign:"center",padding:48,color:K.t3}}>בחר מסמך</div>}</div>
          </div>
        </>}

        {/* Yearly */}
        {tab==="yearly"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          {yearly.map(y=><div key={y.y} style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{background:K.hd,color:"#fff",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:18,fontWeight:700}}>{y.y}</div>
              <div style={{display:"flex",gap:16,fontSize:13}}><span>{y.n} מסמכים</span><span>מחזור: {fa(y.r)}</span><span>מע״מ: {fa(y.v)}</span></div>
            </div>
            <div style={{padding:"12px 20px",display:"flex",flexWrap:"wrap",gap:6}}>
              {Object.entries(y.bt).sort((a,b)=>+a[0]-+b[0]).map(([t,info])=><div key={t} style={{padding:"5px 10px",background:K.tg,borderRadius:7,fontSize:11}}>
                <span style={{fontWeight:600}}>{DT[t]||t}</span><span style={{color:K.t2,margin:"0 4px"}}>×{info.c}</span><span style={{color:K.ad,fontVariantNumeric:"tabular-nums"}}>{fa(info.t)}</span>
              </div>)}
            </div>
          </div>)}
        </div>}

        {/* Accounts */}
        {tab==="accounts"&&<div style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:12,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:650}}>
            <thead><tr style={{background:K.st,borderBottom:`2px solid ${K.bd}`}}>{["מפתח","שם","קוד","פתיחה","חובה","זכות","יתרה"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:600,color:K.t2,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{data.accs.map((a,i)=>{const b=a.ob+a.td-a.tcr;return<tr key={i} style={{borderBottom:`1px solid ${K.tb}`,background:i%2?K.st:"transparent"}}><td style={{padding:"8px 10px",fontWeight:500}}>{a.key}</td><td style={{padding:"8px 10px"}}>{a.name}</td><td style={{padding:"8px 10px",color:K.t2}}>{a.tc}</td><td style={{padding:"8px 10px",textAlign:"left",fontVariantNumeric:"tabular-nums"}}>{fa(a.ob)}</td><td style={{padding:"8px 10px",textAlign:"left",fontVariantNumeric:"tabular-nums"}}>{fa(a.td)}</td><td style={{padding:"8px 10px",textAlign:"left",fontVariantNumeric:"tabular-nums"}}>{fa(a.tcr)}</td><td style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:b<0?K.dn:K.ad,fontVariantNumeric:"tabular-nums"}}>{fa(b)}</td></tr>})}</tbody>
          </table>
        </div></div>}

        {/* Inventory */}
        {tab==="inventory"&&<div style={{background:K.cd,border:`1px solid ${K.bd}`,borderRadius:12,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:550}}>
            <thead><tr style={{background:K.st,borderBottom:`2px solid ${K.bd}`}}>{["מק״ט","פריט","יחידה","פתיחה","כניסות","יציאות","יתרה"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:600,color:K.t2,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{data.inv.map((it,i)=>{const b=it.ob+it.ti+it.to2;return<tr key={i} style={{borderBottom:`1px solid ${K.tb}`,background:i%2?K.st:"transparent"}}><td style={{padding:"8px 10px"}}>{it.cat||"—"}</td><td style={{padding:"8px 10px",fontWeight:500}}>{it.name}</td><td style={{padding:"8px 10px",color:K.t2}}>{it.unit}</td><td style={{padding:"8px 10px",textAlign:"center"}}>{it.ob}</td><td style={{padding:"8px 10px",textAlign:"center",color:K.ok}}>{it.ti}</td><td style={{padding:"8px 10px",textAlign:"center",color:K.dn}}>{it.to2}</td><td style={{padding:"8px 10px",textAlign:"center",fontWeight:600}}>{b}</td></tr>})}</tbody>
          </table>
        </div></div>}

        {/* Footer */}
        <div style={{textAlign:"center",padding:"20px 0 12px",fontSize:10,color:K.t3}}>
          נבנה על ידי <a href="https://www.koopax.co.il" target="_blank" rel="noopener" style={{color:K.ac,textDecoration:"none",fontWeight:600}}>קופקס</a> · Koopax OpenFormat Viewer
        </div>
      </div>
    </div>
  );
}