import{_ as L}from"./index-B-qJphve.js";import v from"fs";import n from"path";import{fileURLToPath as j}from"url";const E=j(import.meta.url),S=n.dirname(E);let c=n.join(S,"..");const _=async()=>{try{const{app:t}=await L(async()=>{const{app:s}=await import("electron");return{app:s}},[],import.meta.url);t&&t.getAppPath&&(c=t.getAppPath())}catch{c=n.join(S,"..")}};_().catch(()=>{c=n.join(S,"..")});const f=new Map,G=t=>{if(f.has(t))return f.get(t);try{const s=[n.join(c,"build","assets",t),n.join(c,"assets",t),n.join(c,"src","assets","images",t),n.join(c,"assets","images",t)];let i=null;for(const l of s)if(v.existsSync(l)){i=l;break}if(!i){const l=n.join(c,"build","assets");if(v.existsSync(l)){const y=v.readdirSync(l),u=n.parse(t).name,g=y.find(h=>h.startsWith(u+"-")&&h.includes("."));g&&(i=n.join(l,g))}}if(!i)return console.warn(`Image not found: ${t}. Tried paths:`,s),f.set(t,""),"";const r=v.readFileSync(i),a=n.extname(i).toLowerCase();let o="image/jpeg";switch(a){case".png":o="image/png";break;case".jpg":case".jpeg":o="image/jpeg";break;case".gif":o="image/gif";break;case".webp":o="image/webp";break;case".svg":o="image/svg+xml";break}const m=r.toString("base64"),b=`data:${o};base64,${m}`;return console.log(`Successfully loaded image: ${t} from ${i}`),f.set(t,b),b}catch(s){return console.error(`Error converting image to base64: ${t}`,s),f.set(t,""),""}},B=()=>G("billHeader.png"),M=t=>{var A,T,N,R,D,F;const s=e=>!e&&e!==0?"":parseFloat(e).toFixed(2),i=e=>e?new Date(e).toLocaleDateString("en-IN"):"",r=(e,x="")=>e||x;let a=[],o=[];if(Array.isArray(t.nos))a=t.nos;else if(typeof t.nos=="string")try{a=JSON.parse(t.nos)}catch{a=[""]}else a=[""];if(Array.isArray(t.particulars))o=t.particulars;else if(typeof t.particulars=="string")try{o=JSON.parse(t.particulars)}catch{o=[""]}else o=[""];const m=parseFloat(t.freight||0),b=parseFloat(t.hamali||0),l=parseFloat(t.aoc||0),y=parseFloat(t.doorDelivery||0),u=parseFloat(t.collection||0),g=parseFloat(t.serviceCharge||0),h=parseFloat(t.extraLoading||0),k=m+b+l+y+u+g+h,$=B(),w=`
    <svg width="600" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="80" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <text x="20" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#c5677b">
        SHREE DATTAGURU ROAD LINES
      </text>
      <text x="20" y="50" font-family="Arial, sans-serif" font-size="12" fill="#666">
        Transport Services
      </text>
      <text x="20" y="70" font-family="Arial, sans-serif" font-size="10" fill="#999">
        Connecting India with Reliable Logistics Solutions
      </text>
    </svg>
  `;let p;if($)p=$;else try{typeof btoa<"u"?p=`data:image/svg+xml;base64,${btoa(w)}`:typeof Buffer<"u"?p=`data:image/svg+xml;base64,${Buffer.from(w).toString("base64")}`:p=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(w)}`}catch{p=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(w)}`}const C=()=>{let e="";const x=Math.max(a.length,o.length,1);for(let d=0;d<x;d++)a[d],o[d],e+=`
        <tr style="height: 50px;">
          <td>${d+1}</td>
          <td>${r(t.lorryReceiptNumber)}</td>
          <td>${r(t.fromLocation)}</td>
          <td>${r(t.toLocation)}</td>
          <td>${r(t.invoiceNumber)}</td>
          <td>${s(m)}</td>
          <td>${s(b+l+y+u+g+h)}</td>
          <td>${s(k)}</td>
        </tr>
      `;const I=Math.max(0,10-x);for(let d=0;d<I;d++)e+=`
        <tr style="border: none;">
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
        </tr>
      `;return e};return`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shree Dattaguru Road Lines Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .invoice {
      width: 800px;
      border: 1px solid black;
      padding: 20px;
      margin: 0 auto;
    }
    .header-section {
      text-align: center;
      margin-bottom: 20px;
    }
    .header-image {
      max-width: 300px ;
      height: auto;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid black;
      padding: 4px;
      text-align: center;
      vertical-align: middle;
      font-size: 13px;
    }
    .no-border {
      border: none;
    }
    .text-left {
      text-align: left;
    }
    .text-right {
      text-align: right;
    }
    .remarks-box {
      border: 1px solid black;
      height: 50px;
      padding: 5px;
    }
    .company-info {
      font-size: 12px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header Section -->
    <div class="header-section">
      <img src="${p}" alt="Shree Dattaguru Road Lines" class="header-image">
      <div class="company-info">
        <strong>Transport Contractors & Fleet Owners</strong><br>
        <strong>GPlot No. W - 4, Camlin Naka, MIDC, Tarapur.</strong>
      </div>
    </div>

    <!-- Top Section -->
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td colspan="5" style="height: 50px; text-align: left; border-left: 1px solid black; border-top: 1px solid black; border-bottom: none; border-right: 1px solid black;">
          To,<br><br>
          <b>M/s ${r((A=t.consignee)==null?void 0:A.consigneeName)}</b><br>
          ${r((T=t.consignee)==null?void 0:T.address)}<br>
          ${r((N=t.consignee)==null?void 0:N.city)} - ${r((R=t.consignee)==null?void 0:R.pinCode)}<br>
          ${r((D=t.consignee)==null?void 0:D.state)}<br>
          GSTIN: ${r((F=t.consignee)==null?void 0:F.gstin)}
        </td>
        <td style="border-right: 1px solid black; text-align: left; width: 200px; border-top: 1px solid black; border-bottom: none;">
          Bill No. : <strong>${r(t.invoiceNumber)}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="5" class="no-border" style="border-left: 1px solid black; border-bottom: none; border-right: none;"></td>
        <td style="border-right: 1px solid black; text-align: left; width: 220px; border-bottom: none;">
          Date : <strong>${i(t.date)}</strong>
        </td>
      </tr>
    </table>

    <!-- Main Table Header -->
    <table style="height: 500px; border: 1px solid black;">
      <tr style="height: 50px;">
        <th rowspan="2" style="width: 30px;">Sr.</th>
        <th rowspan="2" style="width: 60px;">L.R. No.</th>
        <th colspan="2">Particulars of Goods Transported</th>
        <th rowspan="2" style="width: 80px;">Inv. No.</th>
        <th rowspan="2" style="width: 50px;">Rate</th>
        <th rowspan="2" style="width: 80px;">Other Charges</th>
        <th rowspan="2" style="width: 80px;">Freight Amt.</th>
      </tr>
      <tr style="height: 50px;">
        <th>From</th>
        <th>To</th>
      </tr>
      <!-- Goods Rows -->
      ${C()}
    </table>

    <!-- Amount & Total Section -->
    <table>
      <tr>
        <td colspan="5" style="border-right: none; text-align: left;"><b>Amount Rs. ${s(k)}</b></td>
        <td style="width: 80px; text-align: left;"><strong>Total</strong></td>
        <td style="width: 80px;"><strong>${s(k)}</strong></td>
      </tr>
    </table>

    <!-- Remark Section -->
    <table>
      <tr>
        <td colspan="3" style="text-align: left; border-right: none; height: 50px; vertical-align: top;">
          <b>Remark</b><br>
          ${r(t.remarks)}
        </td>
        <td style="border-left: none; height: 50px;"></td>
      </tr>
    </table>

    <!-- Final Section -->
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <!-- PAN No. and GSTIN cell -->
        <td style="width: 15%; text-align: left; vertical-align: top;">
          <b>PAN No. AGTPV0112D</b><br>
          <b>GSTIN : 27AGTPV0112D1ZG</b>
        </td>
        <!-- Service Tax Payable By Table -->
        <td style="width: 25%; border: 1px solid black; padding: 0; vertical-align: top;">
          <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
            <tr>
              <td rowspan="2" style="border: 1px solid black; padding: 4px; text-align: center; vertical-align: middle;">
                Service Tax<br>Payable by
              </td>
              <td style="border: 1px solid black; padding: 4px; text-align: center;">
                Consignor
              </td>
              <td style="border: 1px solid black; padding: 4px;">
                <!-- blank cell -->
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 4px; text-align: center;">
                Consignee
              </td>
              <td style="border: 1px solid black; padding: 4px;">
                <!-- blank cell -->
              </td>
            </tr>
          </table>
        </td>
        <!-- E. & O.E. -->
        <td style="width: 5%; text-align: center; vertical-align: middle;">
          E. & O.E.
        </td>
        <!-- Signature -->
        <td style="width: 10%; text-align: left; vertical-align: middle;">
          For<br>
          <b>Shree Dattaguru Road Lines</b>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`};export{M as default};
