/**
 * HTML template for Lorry Receipt Print/Download
 * This template exactly matches the layout of LorryReceiptFormPage.jsx
 * 
 * Issues Fixed:
 * 1. Added base64 billHeader.png image to replace problematic image path for Puppeteer
 * 2. Moved header section inside main container div
 * 3. Fixed data field mappings for both flat and nested data structures:
 *    - Handles both direct database fields (consignor_name) and nested objects (consignor.consignorName)
 *    - Fixed weight fields: charged_weight vs chargeable_weight
 *    - Fixed service charge field: st_charge vs service_charge
 *    - Fixed filename generation using lorryReceiptNumber, cn_number, lr_number or id fallback
 *    - Handles materialDetails array structure for nos/particulars
 *    - Handles freightDetails nested object structure
 * 4. Removed console.log which doesn't work in PDF context
 * 
 * Usage:
 * const html = lorryReceiptPrintTemplate(lorryReceiptData);
 * 
 * Expected data structure (handles multiple formats):
 * 
 * Nested format (from getLorryReceiptById):
 * {
 *   lorryReceiptNumber: "TPR-001",
 *   date: "2025-06-20",
 *   consignor: { consignorName: "...", address: "...", city: "...", state: "...", pinCode: "...", gstNumber: "...", pan: "..." },
 *   consignee: { consigneeName: "...", address: "...", city: "...", state: "...", pinCode: "...", gstNumber: "...", pan: "..." },
 *   truckDetails: { truckNumber: "..." },
 *   materialDetails: [{ nos: "50", particulars: "Cotton Bales" }],
 *   freightDetails: { freight: 1500, hamali: 100, ... },
 *   actualWeight: 2500,
 *   chargeableWeight: 2500,
 *   deliveryAt: "Mumbai",
 *   remarks: "Handle with care"
 * }
 * 
 * Flat format (direct from database):
 * {
 *   cn_number: "TPR-001",
 *   lr_date: "2025-06-20",
 *   consignor_name: "...", consignor_address: "...", consignor_city: "...",
 *   consignee_name: "...", consignee_address: "...", consignee_city: "...",
 *   truck_number: "...",
 *   nos: "[\"50\"]", particulars: "[\"Cotton Bales\"]",
 *   freight: 1500, hamali: 100, ...,
 *   actual_weight: 2500, chargeable_weight: 2500,
 *   delivery_at: "Mumbai", remarks: "Handle with care"
 * }
 */

import { getBillHeaderAsBase64 } from '../services/imageUtils.js';
import { clearImageCache } from '../services/imageUtils.js';

const lorryReceiptPrintTemplate = (data) => {
    // Force clear image cache to ensure latest header is used
    clearImageCache();
  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return parseFloat(amount).toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Helper function to safely get values
  const getValue = (value, defaultValue = '') => {
    return value || defaultValue;
  };
  // Parse JSON arrays for nos and particulars
  let nosArray = [];
  let particularsArray = [];
  
  // Handle different data structures returned by the service
  if (data.materialDetails && Array.isArray(data.materialDetails)) {
    // From the detailed view structure
    nosArray = data.materialDetails.map(item => item.nos);
    particularsArray = data.materialDetails.map(item => item.particulars);
  } else if (data.nos && data.particulars) {
    // Direct arrays from service
    nosArray = Array.isArray(data.nos) ? data.nos : (typeof data.nos === 'string' ? JSON.parse(data.nos) : ['']);
    particularsArray = Array.isArray(data.particulars) ? data.particulars : (typeof data.particulars === 'string' ? JSON.parse(data.particulars) : ['']);
  } else {
    // Try to parse from string
    try {
      nosArray = typeof data.nos === 'string' ? JSON.parse(data.nos) : (Array.isArray(data.nos) ? data.nos : ['']);
    } catch (e) {
      nosArray = [''];
    }
    
    try {
      particularsArray = typeof data.particulars === 'string' ? JSON.parse(data.particulars) : (Array.isArray(data.particulars) ? data.particulars : ['']);
    } catch (e) {
      particularsArray = [''];
    }
  }  // Calculate total - handle both flat structure and nested freightDetails
  const freight = parseFloat(data.freightDetails?.freight || data.freight || 0);
  const hamali = parseFloat(data.freightDetails?.hamali || data.hamali || 0);
  const aoc = parseFloat(data.freightDetails?.aoc || data.aoc || 0);
  const doorDelivery = parseFloat(data.freightDetails?.doorDelivery || data.door_delivery || 0);
  const detention = parseFloat(data.freightDetails?.detention || data.detention || 0);
  const collection = parseFloat(data.freightDetails?.collection || data.collection || 0);
  const stCharge = parseFloat(data.freightDetails?.stCharge || data.st_charge || data.service_charge || 20);
  const extraLoading = parseFloat(data.freightDetails?.extraLoading || data.extra_loading || 0);
  
  const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + stCharge + extraLoading;  // Get the actual company header image as base64
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lorry Receipt - ${getValue(data.lr_number || data.cnNumber)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
          body {
            font-family: Arial, sans-serif;
            font-size: 8px; /* Much smaller for compact layout */
            line-height: 1.2;
            color: #000;
            background: white;
            padding: 0; /* Remove body padding */
            max-width: 100%;
            overflow-x: hidden;
        }
        
        .min-h-screen {
            min-height: auto; /* Remove full height requirement */
            background-color: #f9fafb;
            padding: 6px; /* Reduced padding for compact layout */
        }
        
        .max-w-7xl {
            max-width: 100%; /* Use full width */
            margin: 0 auto;
        }
        
        .header-controls {
            display: none; /* Hide controls in print */
        }
        
        .header-section {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            margin-bottom: 10px; /* Reduced margin */
        }
        
        .header-inner {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        
        .logo-container {
            flex: 1;
            display: flex;
            justify-content: flex-start;
            margin-left: 10px; /* Reduced margin */
        }
        
        .logo-image {
            max-width: 200px; /* Much smaller logo */
            height: auto;
        }
        
        .jurisdiction-section {
            position: absolute;
            right: 0;
            text-align: right;
            font-size: 8px; /* Smaller font */
            font-weight: 500;
            color: #374151;
            line-height: 1.1;
        }
        
        .jurisdiction-title {
            margin-bottom: 4px; /* Reduced margin */
            font-weight: bold;
        }
        
        .service-details {
            margin-bottom: 4px; /* Reduced margin */
        }
        
        .service-title {
            font-weight: 600;
        }
        
        .drivers-copy {
            font-weight: bold;
            color: #000000;
            border: 1px solid #000000;
            padding: 2px 4px; /* Reduced padding */
            display: inline-block;
            font-size: 7px; /* Smaller font */
        }
        
        .container {
            width: 100%;
            border: 1px solid #000;
            padding: 5px; /* Further reduced padding */
            font-family: Arial, sans-serif;
            font-size: 8px; /* Smaller font */
            margin: 0 auto;
            background: white;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3px; /* Reduced margin */
        }

        td, th {
            border: 1px solid #000;
            padding: 2px 3px; /* Reduced padding */
            vertical-align: top;
        }

        .bold {
            font-weight: bold;
        }

        .center {
            text-align: center;
        }

        .row-container {
            display: flex;
            width: 100%;
        }

        .left-table {
            flex: 2;
            border-collapse: collapse;
        }

        .right-table {
            flex: 1;
            border-collapse: collapse;
        }

        .left-table td, .right-table td {
            border: 1px solid #000;
            padding: 2px 3px; /* Reduced padding */
            vertical-align: top;
        }
        
        .left-cell {
            height: 60px; /* Reduced height */
            vertical-align: top;
            padding: 3px; /* Reduced padding */
        }
        
        .form-value {
            border-bottom: 1px solid #000;
            min-height: 12px; /* Reduced height */
            padding: 1px; /* Reduced padding */
            margin: 1px 0;
            display: block;
            background: transparent;
        }
        
        .form-value-small {
            border-bottom: 1px solid #000;
            min-height: 10px; /* Reduced height */
            padding: 1px 2px; /* Reduced padding */
            margin: 1px 0;
            display: inline-block;
            width: 80px; /* Reduced width */
            background: transparent;
        }
        
        .flex-row {
            display: flex;
            gap: 4px; /* Reduced gap */
            margin: 1px 0; /* Reduced margin */
        }
        
        .flex-1 {
            flex: 1;
        }
        
        .address-section {
            width: 18%;
            padding: 4px; /* Reduced padding */
            font-size: 10px; /* Increased from 7px to 10px */
            line-height: 1.3; /* Slightly increased line height for better readability */
            vertical-align: top;
        }
        
        .address-section hr {
            margin: 4px 0; /* Reduced margin */
            border: 0;
            border-top: 1px solid #000;
        }
        
        .freight-table-container {
            height: 200px; /* Reduced height */
            border-collapse: collapse;
            width: 100%;
        }
        
        .nos-column {
            width: 10%;
            border-right: 1px solid #000;
            padding: 2px; /* Reduced padding */
            vertical-align: top;
        }
        
        .particulars-column {
            width: 60%;
            border-right: 1px solid #000;
            padding: 2px; /* Reduced padding */
            vertical-align: top;
        }
        
        .rate-left-column {
            padding: 0;
            vertical-align: top;
            border-bottom: 1px solid #000;
            width: 17%;
        }
        
        .rate-right-column {
            padding: 0;
            vertical-align: top;
            border-bottom: 1px solid #000;
            width: 15%;
        }
        
        .weight-column {
            padding: 0;
            vertical-align: top;
            border-bottom: 1px solid #000;
            width: 17%;
        }
        
        .rate-container, .weight-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 180px; /* Reduced height */
        }
        
        .rate-item {
            flex: 1;
            border-bottom: 1px solid #000;
            padding: 2px; /* Reduced padding */
            display: flex;
            align-items: center;
        }
        
        .rate-item:last-child {
            border-bottom: none;
        }
        
        .rate-value {
            flex: 1;
            border-bottom: 1px solid #000;
            padding: 1px; /* Reduced padding */
            display: flex;
            align-items: center;
            text-align: center;
            justify-content: center;
        }
        
        .rate-value:last-child {
            border-bottom: none;
        }
        
        .weight-item {
            flex: 2;
            border-bottom: 1px solid #000;
            padding: 2px; /* Reduced padding */
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        .payment-section {
            flex: 2;
            border-bottom: 1px solid #000;
            padding: 2px; /* Reduced padding */
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 7px; /* Smaller font */
        }
        
        .risk-section {
            flex: 1;
            padding: 2px; /* Reduced padding */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 7px; /* Smaller font */
        }
        
        .payment-option {
            margin-bottom: 2px; /* Reduced margin */
            display: flex;
            align-items: center;
        }
        
        .payment-radio {
            margin-right: 2px; /* Reduced margin */
        }
        
        .nos-item, .particulars-item {
            margin-bottom: 4px; /* Reduced margin */
            padding: 1px; /* Reduced padding */
            border-bottom: 1px solid #ccc;
            min-height: 10px; /* Reduced height */
        }
        
        .delivery-section, .remarks-section {
            height: 20px; /* Reduced height */
        }
        
        .remarks-section {
            height: 25px; /* Reduced height */
        }
        
        .footer-section {
            height: auto;
        }
        
        @media print {
            .min-h-screen {
                min-height: auto;
            }
            
            .header-controls {
                display: none !important;
            }
            
            .container {
                border: 1px solid #000;
                width: 100%;
                max-width: 100%;
            }
            
            body {
                padding: 5px;
                font-size: 8px;
            }
        }
    </style>
</head>
<body>    <div class="min-h-screen">
        <div class="max-w-7xl">
            <!-- Header Controls (hidden in print) -->
            <div class="header-controls">
                <!-- This would contain the buttons but they're hidden in print -->
            </div>
            
            <!-- Form Content -->
            <div class="container">
                <!-- Header Section with Logo and Jurisdiction -->
                <div class="header-section">
                    <div style="display: flex; flex-direction: row; align-items: flex-start; justify-content: space-between; width: 100%;">
                        <div style="flex-shrink:0; width: 65%; display: flex; align-items: center;">
                            <img src="${headerImage}" alt="BillLogo" style="width: 100%; max-width: 480px; height: auto;" />
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 320px; width: 35%; font-size: 12px; color: #374151; font-family: Arial, sans-serif;">
                            <div style="margin-bottom: 8px; font-weight: bold; font-size: 16px;">SUBJECT TO PALGHAR JURISDICTION</div>
                            <div style="margin-bottom: 8px; text-align: right; font-size: 12px;">
                                <div style="font-weight: 600;">Daily Part Load Service to -</div>
                                <div>Tarapur, Bhiwandi, Palghar,</div>
                                <div>Vashi, Taloja, Kolgoan Genises</div>
                            </div>
                            <div style="font-weight: bold; color: #d32f2f; border: 1px solid #d32f2f; padding: 4px 12px; display: inline-block; font-size: 14px; margin-top: 8px;">DRIVERS COPY</div>
                        </div>
                    </div>
                </div>
                <!-- Consignor / Consignee Section -->
                <div class="row-container">
                    <table class="left-table">
                        <tbody>
                            <tr>                                <td class="left-cell">                                    <div style="margin-bottom: 8px;">
                                        <strong>Consignor - M/s ${getValue(data.consignor?.consignorName || data.consignor_name)}</strong>
                                    </div>
                                    <div class="form-value">${getValue(data.consignor?.address || data.consignor_address)}</div>
                                    <div class="form-value">${getValue(data.consignor?.city || data.consignor_city)}, ${getValue(data.consignor?.state || data.consignor_state)} - ${getValue(data.consignor?.pinCode || data.consignor_pin_code || data.consignor_pincode)}</div>
                                </td>
                            </tr>
                            <tr>                                <td class="left-cell">                                    <div style="margin-bottom: 8px;">
                                        <strong>Consignee - M/s ${getValue(data.consignee?.consigneeName || data.consignee_name)}</strong>
                                    </div>
                                    <div class="form-value">${getValue(data.consignee?.address || data.consignee_address)}</div>
                                    <div class="form-value">${getValue(data.consignee?.city || data.consignee_city)}, ${getValue(data.consignee?.state || data.consignee_state)} - ${getValue(data.consignee?.pinCode || data.consignee_pin_code || data.consignee_pincode)}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>                    <table class="right-table">
                        <tbody>
                            <tr>
                                <td colspan="2">
                                    <strong>CN't No. - </strong>
                                    <span class="form-value-small">${getValue(data.lorryReceiptNumber || data.cn_number || data.lr_number)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 50%;">
                                    <strong>Date - </strong>
                                    <span class="form-value-small">${formatDate(data.date || data.lr_date)}</span>
                                </td>
                                <td style="width: 50%; text-align: center;" rowspan="2">
                                    <strong>Truck No. - </strong>
                                    <span class="form-value-small">${getValue(data.truckDetails?.truckNumber || data.truck_number || data.truckNumber)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>From - </strong>
                                    <span class="form-value-small">${getValue(data.fromLocation || data.from_location)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <strong>To - </strong>
                                    <span class="form-value-small">${getValue(data.toLocation || data.to_location)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Main Freight Table -->
                <table>
                    <tbody>
                        <tr>
                            <td rowspan="2" class="address-section">
                                <strong style="font-size: 11px;">TARAPUR</strong><br />
                                Plot No. W-4,<br />
                                Camlin Naka,<br />
                                MIDC, Tarapur<br />
                                M: 9823364283 /<br />
                                9168027869 /<br />
                                7276272828<br />
                                <hr />
                                <strong style="font-size: 11px;">BHIWANDI</strong><br />
                                Godown No. A-2,<br />
                                Gali No. 2,<br />
                                Opp. Capital Roadlines,<br />
                                Khandagale Estate,<br />
                                Purna Village, Bhiwandi.<br />
                                M.: 7507844317 /<br />
                                9168027868<br />
                                <hr />
                                <br />
                                <b style="font-size: 10px;">PAN: AGTPV0112D<br />
                                GSTIN: 27AGTPV0112D1ZG</b>
                            </td>
                            <td colspan="3">
                                <table class="freight-table-container">
                                    <tbody>
                                        <tr class="bold center">
                                            <td style="width: 10%;">Nos.</td>
                                            <td style="width: 60%;">Particulars</td>
                                            <td style="width: 18%;" colspan="2">Rate Rs.</td>
                                            <td style="width: 12%;">Weight</td>
                                        </tr>
                                        <tr>
                                            <!-- Nos Column -->
                                            <td class="nos-column">
                                                ${nosArray.map(nos => 
                                                    `<div class="nos-item">${getValue(nos)}</div>`
                                                ).join('')}
                                            </td>

                                            <!-- Particulars Column -->
                                            <td class="particulars-column">
                                                ${particularsArray.map(particular => 
                                                    `<div class="particulars-item">${getValue(particular)}</div>`
                                                ).join('')}
                                            </td>

                                            <!-- Rate Left Column -->
                                            <td class="rate-left-column">
                                                <div class="rate-container">
                                                    <div class="rate-item">Freight</div>
                                                    <div class="rate-item">Hamali</div>
                                                    <div class="rate-item">A.O.C</div>
                                                    <div class="rate-item">Door Dely</div>
                                                    <div class="rate-item">Detention</div>
                                                    <div class="rate-item">Collection</div>
                                                    <div class="rate-item">St.Charge</div>
                                                    <div class="rate-item">Extra Loading<br />paid by us</div>
                                                    <div class="rate-item">Total</div>
                                                </div>
                                            </td>

                                            <!-- Rate Right Column -->
                                            <td class="rate-right-column">
                                                <div class="rate-container">
                                                    <div class="rate-value">${formatCurrency(freight)}</div>
                                                    <div class="rate-value">${formatCurrency(hamali)}</div>
                                                    <div class="rate-value">${formatCurrency(aoc)}</div>
                                                    <div class="rate-value">${formatCurrency(doorDelivery)}</div>
                                                    <div class="rate-value">${formatCurrency(detention)}</div>
                                                    <div class="rate-value">${formatCurrency(collection)}</div>
                                                    <div class="rate-value">${formatCurrency(stCharge)}</div>
                                                    <div class="rate-value">${formatCurrency(extraLoading)}</div>
                                                    <div class="rate-value"><strong>${formatCurrency(totalAmount)}</strong></div>
                                                </div>
                                            </td>

                                            <!-- Weight Column -->
                                            <td class="weight-column">
                                                <div class="weight-container">                                                    <div class="weight-item">
                                                        Actual<br />
                                                        <strong>${getValue(data.actualWeight || data.actual_weight)}</strong> Kg.
                                                    </div>
                                                    <div class="weight-item">
                                                        <strong>${getValue(data.chargeableWeight || data.chargeable_weight || data.charged_weight)}</strong><br />
                                                        Chargeable
                                                    </div>                                                    <div class="payment-section">
                                                        <div class="payment-option">
                                                            <input type="radio" ${(data.freightDetails?.paymentType || data.paymentType || data.payment_type) === 'paid' ? 'checked' : ''} disabled class="payment-radio" />
                                                            <label>Paid</label>
                                                        </div>
                                                        <div class="payment-option">
                                                            <input type="radio" ${(data.freightDetails?.paymentType || data.paymentType || data.payment_type) === 'toBeBill' ? 'checked' : ''} disabled class="payment-radio" />
                                                            <label>To be Bill</label>
                                                        </div>
                                                        <div class="payment-option">
                                                            <input type="radio" ${(data.freightDetails?.paymentType || data.paymentType || data.payment_type) === 'toPay' ? 'checked' : ''} disabled class="payment-radio" />
                                                            <label>To Pay</label>
                                                        </div>
                                                    </div>
                                                    <div class="risk-section">
                                                        Goods entirely<br />booked at<br /><b>OWNER'S RISK</b>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- E-way Bill Section -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 2px;">
                    <tbody>
                        <tr>
                            <td style="padding: 6px 8px; border: 1px solid #000; text-align: left; background-color: #f9f9f9;">
                                <span style="font-family: Arial; font-size: 12px; font-weight: bold;">E-way Bill: </span>
                                <span style="font-family: Arial; font-size: 12px;">${getValue(data.ewayBill || data.eway_bill)}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Footer Sections -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 0; table-layout: fixed;">
                    <tbody>
                        <tr>
                            <td colspan="2" style="padding: 4px 8px; border: 1px solid #000; vertical-align: top;">
                                <div style="display: flex; align-items: center;">
                                    <span style="font-size: 12px; font-weight: normal;">Delivery At:</span>
                                    <span style="color: red; margin: 0 4px;">*</span>
                                    <span style="font-size: 12px; margin-left: 4px;">${getValue(data.deliveryAt || data.delivery_at)}</span>
                                </div>
                                <div style="border-bottom: 1px solid #000; margin-top: 2px;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 12px; border: 1px solid #000;">
                                <div style="display: flex; align-items: top;">
                                    <span style="width: 80px; font-size: 14px; font-family: Arial;">Remarks:</span>
                                    <div style="flex-grow: 1;">
                                        <div style="font-size: 14px; font-family: Arial; padding: 4px 0;">
                                            ${getValue(data.remarks || data.notes)}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr class="footer-section">
                            <td style="width: 50%; padding: 4px 8px; border: 1px solid #000;">
                                We are not responsible for any type of damages, leakage, fire & shortages. Kindly Insured by Consignor or Consignee
                            </td>
                            <td style="width: 50%; padding: 4px 8px; border: 1px solid #000; vertical-align: bottom; text-align: center;">
                                For <b>Shree Dattaguru Road Lines</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
};

export default lorryReceiptPrintTemplate;
