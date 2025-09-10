/**
 * HTML template for Invoice Print/Download
 * This template generates invoices from lorry receipt data
 * 
 * Expected data structure:
 * {
 *   invoiceNumber: "INV-TPR-001",
 *   lorryReceiptNumber: "TPR-001",
 *   date: "2025-01-20",
 *   consignor: { consignorName: "...", address: "...", city: "...", state: "...", pinCode: "...", gstin: "...", pan: "..." },
 *   consignee: { consigneeName: "...", address: "...", city: "...", state: "...", pinCode: "...", gstin: "...", pan: "..." },
 *   truckNumber: "...",
 *   fromLocation: "...",
 *   toLocation: "...",
 *   freight: 1500,
 *   hamali: 100,
 *   aoc: 50,
 *   doorDelivery: 0,
 *   collection: 0,
 *   serviceCharge: 20,
 *   extraLoading: 0,
 *   totalAmount: 1670,
 *   nos: ["50"],
 *   particulars: ["Cotton Bales"],
 *   actualWeight: 2500,
 *   chargeableWeight: 2500,
 *   deliveryAt: "Mumbai",
 *   remarks: "Handle with care"
 * }
 */

import { getBillHeaderDattaGuruAsBase64 } from './imageUtils.js';

const invoiceTemplate = (data) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return parseFloat(amount).toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // Helper function to safely get values
  const getValue = (value, defaultValue = '') => {
    return value || defaultValue;
  };

  // Parse JSON arrays for nos and particulars
  let nosArray = [];
  let particularsArray = [];

  if (Array.isArray(data.nos)) {
    nosArray = data.nos;
  } else if (typeof data.nos === 'string') {
    try {
      nosArray = JSON.parse(data.nos);
    } catch (e) {
      nosArray = [''];
    }
  } else {
    nosArray = [''];
  }

  if (Array.isArray(data.particulars)) {
    particularsArray = data.particulars;
  } else if (typeof data.particulars === 'string') {
    try {
      particularsArray = JSON.parse(data.particulars);
    } catch (e) {
      particularsArray = [''];
    }
  } else {
    particularsArray = [''];
  }

  // Calculate total amount
  const freight = parseFloat(data.freight || 0);
  const hamali = parseFloat(data.hamali || 0);
  const aoc = parseFloat(data.aoc || 0);
  const doorDelivery = parseFloat(data.doorDelivery || 0);
  const detention = parseFloat(data.detention || 0);
  const collection = parseFloat(data.collection || 0);
  const serviceCharge = parseFloat(data.serviceCharge || 0);
  const extraLoading = parseFloat(data.extraLoading || 0);

  const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + serviceCharge + extraLoading;

  // Get the actual company header image as base64
  const billHeaderBase64 = getBillHeaderDattaGuruAsBase64();

  // Fallback SVG if billHeader.png is not found
  const fallbackLogoSvg = `
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
  `;

  // Use the actual bill header image or fallback to SVG
  let headerImage;
  if (billHeaderBase64) {
    headerImage = billHeaderBase64;
  } else {
    // Handle btoa for Node.js vs Browser environments for fallback
    try {
      if (typeof btoa !== 'undefined') {
        headerImage = `data:image/svg+xml;base64,${btoa(fallbackLogoSvg)}`;
      } else if (typeof Buffer !== 'undefined') {
        headerImage = `data:image/svg+xml;base64,${Buffer.from(fallbackLogoSvg).toString('base64')}`;
      } else {
        headerImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackLogoSvg)}`;
      }
    } catch (e) {
      // Final fallback to encoded SVG
      headerImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackLogoSvg)}`;
    }
  }

  // Generate table rows for goods
  const generateGoodsRows = () => {
    let rows = '';
    const maxRows = Math.max(nosArray.length, particularsArray.length, 1);

    for (let i = 0; i < maxRows; i++) {
      const nos = nosArray[i] || '';
      const particulars = particularsArray[i] || '';

      rows += `
        <tr style="height: 50px;">
          <td style='width:40px;min-width:40px;'>${i + 1}</td>
          <td style='width:80px;min-width:80px;'>${getValue(data.lorryReceiptNumber)}</td>
          <td style='width:80px;min-width:80px;'>${getValue(data.fromLocation)}</td>
          <td style='width:80px;min-width:80px;'>${getValue(data.toLocation)}</td>
          <td style='width:100px;min-width:100px;'>${getValue(data.invoiceNumber)}</td>
          <td style='width:80px;min-width:80px;'>${formatCurrency(freight)}</td>
          <td style='width:100px;min-width:100px;'>${formatCurrency(hamali + aoc + doorDelivery + collection + serviceCharge + extraLoading)}</td>
          <td style='width:100px;min-width:100px;'>${formatCurrency(totalAmount)}</td>
        </tr>
      `;
    }

    // Add empty rows to fill the space (with borders to extend columns)
    const remainingRows = Math.max(0, 10 - maxRows);
    for (let i = 0; i < remainingRows; i++) {
      rows += `
        <tr>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;
    }

    return rows;
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shree Dattaguru Road Lines Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
    * {
      font-size: inherit;
    }
    .invoice {
      width: 800px;
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
    table th, table td {
      padding: 0;
      margin: 0;
    }
    th, td {
      border: 1px solid black;
      text-align: center;
      vertical-align: middle;
      font-size: 12px;
      height: 36px;
      padding: 2px 4px;
      max-width: 100px;
      overflow-wrap: break-word;
      word-break: break-word;
      white-space: normal;
      overflow: hidden;
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
    <div class="header-section" style="text-align:center; margin-bottom:16px;">

  <!-- Header Image -->
<img src="${headerImage}" 
     alt="Shree Dattaguru Road Lines" 
     style="height:150px; max-width:80%; object-fit:contain; display:block; margin:0 auto;" />

<!-- Branch Addresses -->
<div class="branch-addresses" 
     style="margin-top:12px; font-size:12px; color:#4B5563; line-height:1.4; text-align:center; display:block;">

  <!-- Tarapur Branch --> 
  <div style="margin-bottom:4px; white-space:nowrap;">
    <span style="color:#DC2626; font-weight:bold;">TARAPUR:</span>Plot No. W - 4, Camlin Naka, MIDC, Tarapur. M.: 9823364283 / 7276272828
  </div>

  <!-- Bhiwandi Branch -->
  <div style="white-space:nowrap;">
    <span style="color:#DC2626; font-weight:bold;">BHIWANDI:</span> Godown No. A-2, Gali No 2, Opp Capital Roadlines, Khandagale Estate, Puma Village, Bhiwandi. M.: 9222161259 / 9168027868
  </div>

</div>

</div>


    <!-- Top Section -->
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td colspan="5" style="height: 60px; text-align: left; vertical-align: top; border-left: 1px solid black; border-top: 1px solid black; border-bottom: none; border-right: 1px solid black; padding: 6px 8px 2px 8px;">
          <div style="min-height: 50px; display: flex; flex-direction: column; justify-content: flex-start; gap: 0;">
            <span style="font-size: 13px; line-height: 1.1;">To,</span>
            <span style="font-weight: bold; font-size: 14px; line-height: 1.1;">M/s ${getValue(data.consignee?.consigneeName)}</span>
            <span style="line-height: 1.1;">${getValue(data.consignee?.address)}</span>
            <span style="line-height: 1.1;">${getValue(data.consignee?.city)} - ${getValue(data.consignee?.pinCode)}</span>
            <span style="line-height: 1.1;">${getValue(data.consignee?.state)}</span>
            <span style="line-height: 1.1;">GSTIN: ${getValue(data.consignee?.gstin)}</span>
          </div>
        </td>
        <td style="border-right: 1px solid black; text-align: center; width: 260px; min-width: 220px; max-width: 320px; border-top: 1px solid black; border-bottom: none; padding: 0; vertical-align: middle;">
          <div style="display: flex; align-items: center; justify-content: center; height: 60px; width: 100%;">
            <span style="font-size: 17px; font-weight: bold; line-height: 1.1; white-space: nowrap;">Bill No. : <span style='font-size: 17px; font-weight: bold;'>${getValue(data.invoiceNumber)}</span></span>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="5" class="no-border" style="border-left: 1px solid black; border-bottom: none; border-right: none;"></td>
        <td style="border-right: 1px solid black; text-align: center; width: 260px; min-width: 220px; max-width: 320px; border-bottom: none; padding: 2px 8px 6px 8px; vertical-align: middle;">
          <span style="font-size: 13px; line-height: 1.1;">Date : <span style='font-size: 15px; font-weight: bold;'>${formatDate(data.date)}</span></span>
        </td>
      </tr>
    </table>

    <!-- Main Table Header -->
    <table style="height: 500px; border: 1px solid black;">
      <tr style="height: 50px;">
        <th rowspan="2" style="width: 40px;">Sr.</th>
        <th rowspan="2" style="width: 70px;">L.R. No.</th>
        <th colspan="2" style="width: 140px;">Particulars of Goods Transported</th>
        <th rowspan="2" style="width: 90px;">Inv. No.</th>
        <th rowspan="2" style="width: 70px;">Rate</th>
        <th rowspan="2" style="width: 90px;">Other Charges</th>
        <th rowspan="2" style="width: 90px;">Freight Amt.</th>
      </tr>
      <tr style="height: 50px;">
        <th>From</th>
        <th>To</th>
      </tr>
      <!-- Goods Rows -->
      ${generateGoodsRows()}
    </table>

    <!-- Amount & Total Section -->
    <table>
      <tr>
        <td colspan="5" style="border-right: none; text-align: left; padding: 4px 6px 2px 6px; font-size: 14px; line-height: 1.1;"><b>Amount Rs. ${formatCurrency(totalAmount)}</b></td>
        <td style="width: 80px; text-align: left; padding: 4px 6px 2px 6px; font-size: 14px; line-height: 1.1;"><strong>Total</strong></td>
        <td style="width: 80px; padding: 4px 6px 2px 6px; font-size: 14px; line-height: 1.1;"><strong>${formatCurrency(totalAmount)}</strong></td>
      </tr>
    </table>

    <!-- Remark Section -->
    <table>
      <tr>
        <td colspan="3" style="text-align: left; border-right: none; padding: 4px 6px 2px 6px; font-size: 14px; line-height: 1.1; vertical-align: top;">
          <b>Remark</b><br>
          ${getValue(data.remarks)}
        </td>
        <td style="border-left: none; padding: 4px 6px 2px 6px;"></td>
      </tr>
    </table>

    <!-- Final Section -->
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <!-- PAN No. and GSTIN cell -->
        <td style="width: 15%; text-align: center; vertical-align: middle; padding: 4px 6px 2px 6px; font-size: 13px; line-height: 1.1;">
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
        <td style="width: 10%; text-align: left; vertical-align: middle; padding: 0 8px; font-size: 15px;">
          For<br>
          <b>Shree Dattaguru Road Lines</b>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  return html;
};

export default invoiceTemplate; 