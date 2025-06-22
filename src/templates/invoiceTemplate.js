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

import { getBillHeaderAsBase64 } from '../services/imageUtils.js';

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
  const collection = parseFloat(data.collection || 0);
  const serviceCharge = parseFloat(data.serviceCharge || 0);
  const extraLoading = parseFloat(data.extraLoading || 0);
  
  const totalAmount = freight + hamali + aoc + doorDelivery + collection + serviceCharge + extraLoading;

  // Get the actual company header image as base64
  const billHeaderBase64 = getBillHeaderAsBase64();
  
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
        <tr>
          <td>${i + 1}</td>
          <td>${getValue(data.lorryReceiptNumber)}</td>
          <td>${getValue(data.fromLocation)}</td>
          <td>${getValue(data.toLocation)}</td>
          <td>${getValue(data.invoiceNumber)}</td>
          <td>${formatCurrency(freight)}</td>
          <td>${formatCurrency(hamali + aoc + doorDelivery + collection + serviceCharge + extraLoading)}</td>
          <td>${formatCurrency(totalAmount)}</td>
        </tr>
      `;
    }
    
    // Add empty rows to fill the space
    const remainingRows = Math.max(0, 10 - maxRows);
    for (let i = 0; i < remainingRows; i++) {
      rows += `
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
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
      max-width: 100%;
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
      <img src="${headerImage}" alt="Shree Dattaguru Road Lines" class="header-image">
      <div class="company-info">
        <strong>PAN No. AGTPV0112D</strong><br>
        <strong>GSTIN : 27AGTPV0112D1ZG</strong>
      </div>
    </div>

    <!-- Top Section -->
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td colspan="5" style="height: 50px; text-align: left; border-left: 1px solid black; border-top: 1px solid black; border-bottom: none; border-right: 1px solid black;">
          To,<br><br>
          <b>M/s ${getValue(data.consignee?.consigneeName)}</b><br>
          ${getValue(data.consignee?.address)}<br>
          ${getValue(data.consignee?.city)} - ${getValue(data.consignee?.pinCode)}<br>
          ${getValue(data.consignee?.state)}<br>
          GSTIN: ${getValue(data.consignee?.gstin)}
        </td>
        <td style="border-right: 1px solid black; text-align: left; width: 220px; border-top: 1px solid black; border-bottom: none;">
          Bill No. : <strong>${getValue(data.invoiceNumber)}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="5" class="no-border" style="border-left: 1px solid black; border-bottom: none; border-right: none;"></td>
        <td style="border-right: 1px solid black; text-align: left; width: 220px; border-bottom: none;">
          Date : <strong>${formatDate(data.date)}</strong>
        </td>
      </tr>
    </table>

    <!-- Main Table Header -->
    <table>
      <tr>
        <th rowspan="2" style="width: 30px;">Sr.</th>
        <th rowspan="2" style="width: 60px;">L.R. No.</th>
        <th colspan="2">Particulars of Goods Transported</th>
        <th rowspan="2" style="width: 50px;">Inv. No.</th>
        <th rowspan="2" style="width: 50px;">Rate</th>
        <th rowspan="2" style="width: 80px;">Other Charges</th>
        <th rowspan="2" style="width: 80px;">Freight Amt.</th>
      </tr>
      <tr>
        <th>From</th>
        <th>To</th>
      </tr>
      <!-- Goods Rows -->
      ${generateGoodsRows()}
    </table>

    <!-- Amount & Total Section -->
    <table>
      <tr>
        <td colspan="5" style="border-right: none; text-align: left;"><b>Amount Rs. ${formatCurrency(totalAmount)}</b></td>
        <td style="width: 80px; text-align: left;"><strong>Total</strong></td>
        <td style="width: 80px;"><strong>${formatCurrency(totalAmount)}</strong></td>
      </tr>
    </table>

    <!-- Remark Section -->
    <table>
      <tr>
        <td colspan="3" style="text-align: left; border-right: none; height: 50px; vertical-align: top;">
          <b>Remark</b><br>
          ${getValue(data.remarks)}
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
</html>`;

  return html;
};

export default invoiceTemplate; 