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

import { getBillHeaderAsBase64, getImageAsBase64 } from './imageUtils.js';

const lorryReceiptPrintTemplate = (data) => {
    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '';
        return parseFloat(amount);
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
    }

    // Calculate total - handle both flat structure and nested freightDetails
    const freight = parseFloat(data.freightDetails?.freight || data.freight || 0);
    const hamali = parseFloat(data.freightDetails?.hamali || data.hamali || 0);
    const aoc = parseFloat(data.freightDetails?.aoc || data.aoc || 0);
    const doorDelivery = parseFloat(data.freightDetails?.doorDelivery || data.door_delivery || 0);
    const detention = parseFloat(data.freightDetails?.detention || data.detention || 0);
    const collection = parseFloat(data.freightDetails?.collection || data.collection || 0);
    const stCharge = parseFloat(data.freightDetails?.stCharge || data.st_charge || data.service_charge || 20);
    const extraLoading = parseFloat(data.freightDetails?.extraLoading || data.extra_loading || 0);

    const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + stCharge + extraLoading;

    // Get the actual company header image as base64
    const billHeaderBase64 = getBillHeaderAsBase64();
    const billheader5Base64 = getImageAsBase64('shree-datta-guru.png');

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr; // fallback if invalid
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // ddmmyyyy format
    }


    // Fallback SVG if billHeader.png is not found - stretched to full width
    const fallbackLogoSvg = `
    <svg width="100%" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 80" preserveAspectRatio="none">
      <rect width="100%" height="80" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
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
        .rate-table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
        }
        .rate-label {
            padding: 0;
            border-left: 1px solid #000;
            border-bottom: 1px solid #000;
            border-right: 1px solid #000;
        }
        .rate-amount {
            padding: 0;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
        }
        @page {
            margin: 0; /* Remove all print margins */
            size: A4;
        }
        
        * {
            margin: 0;
            box-sizing: border-box;
            outline: none !important; /* Remove outlines */
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px; /* Readable font size */
            line-height: 1.0; /* Tighter line height for compactness */
            color: #000;
            background: white;
            padding: 0 !important; /* Remove padding for precise margin control */
            margin: 0 !important; /* Remove margin for precise control */
            max-width: 100%; /* Use full width */
            overflow-x: hidden;
            width: 100%;
            height: 100vh; /* Full viewport height */
        }

        body, .container, table {
            outline: none !important;
            border-color: #000 !important; /* only black borders */
        }

        table, th, td {
            border: 1px solid #000 !important;
            box-sizing: border-box;
        }

        .min-h-screen {
            min-height: auto;
            background-color: white;
            padding: 0 !important;
            margin: 0 auto !important; /* Center with equal margins */
            position: relative;
            top: 0;
            width: 94%; /* Match main page width for consistency */
            max-width: 94% !important;
            height: auto; /* Allow natural height for full content visibility */
            overflow: visible; /* Allow content to be fully visible */
            transform-origin: top center; /* Scale from top center */
            transform: scale(1.0); /* No scaling, natural size */
        }

        .max-w-7xl {
            max-width: 100% !important; /* Use full width of scaled container */
            margin: 0 auto !important; /* Center with equal auto margins on both sides */
            padding: 0 !important; /* Remove padding to avoid uneven spacing */
            width: 100%;
            height: 100%; /* Fill the container height */
        }

        .header-controls {
            display: none;
        }

        /* Global styles for 50% page usage - readable font sizes */
        td {
            padding: 1px !important; /* Minimal padding for compact layout */
            font-size: 12px !important; /* Readable font size minimum 12px */
            border: 1px solid #000 !important; /* Ensure all cells have consistent borders */
            box-sizing: border-box;
        }

        table {
            margin-bottom: 0px !important; /* No margin between tables for tightest spacing */
        }

        .header-section {
            display: flex;
            justify-content: center;
            align-items: center;
            position: center;
            margin-bottom: 1px; /* Reduced for compactness */
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
            margin-left: 10px;
        }

        .logo-image {
            max-width: 580px; /* Reduced from 650px for a slightly smaller header */
            height: auto;
            min-height: 50px; /* Reduced minimum height for better balance */
        }

        .jurisdiction-section {
            position: absolute;
            right: 0;
            text-align: right;
            font-size: 12px; /* Increased to meet 12px minimum */
            font-weight: 500;
            color: #374151;
            line-height: 1.1;
        }

        .jurisdiction-title {
            font-size: 12px; /* Reduced from default for less overlap */
            margin-bottom: 4px;
            font-weight: bold;
            text-align: right; /* Move text to the right */
            margin-left: auto; /* Push the element to the right */
            padding-right: 5px; /* Reduced padding from the right edge */
            padding-left: 30px; /* Add left padding to push it further right */
            margin-top: 30px; /* Further increased top margin for more space from smaller header */
        }

        .service-details {
            margin-bottom: 4px;
        }

        .service-title {
            font-weight: 600;
        }

        .drivers-copy {
            font-weight: bold;
            color: #000000;
            padding: 2px 4px;
            display: inline-block;
            font-size: 12px; /* Increased from 7px to 12px */
        }

        .container {
            width: 100%;
            padding: 0 !important;
            font-family: Arial, sans-serif;
            font-size: 12px; /* Restored to 12px for readability */
            margin: 0 !important; /* Remove auto centering */
            background: white;
            position: relative;
            top: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3px;
        }

        td, th {
            border: 1px solid #000; /* Keep inner borders for separation */
            padding: 3px; /* Consistent 3px padding throughout */
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
            border: 0px; /* Remove outer border to avoid overlap */
        }

        .right-table {
            flex: 1;
            border-collapse: collapse;
            border: 0px; /* Remove outer border to avoid overlap */
        }

        .left-table td, .right-table td {
            border: 1px solid #000; /* Keep inner borders for separation */
            padding: 3px; /* Consistent 3px padding throughout */
            vertical-align: top;
            height: auto; /* ensure minimal height */
        }

        .left-cell {
            height: auto;
            vertical-align: top;
            padding: 3px; /* Consistent 3px padding throughout */
        }

        .left-cell > div {
            margin-bottom: 0 !important; /* removed all margin */
        }

        .form-value {
            border-bottom: none; /* Remove underline */
            padding: 3px; /* Consistent 3px padding throughout */
            margin: 2px 0; /* Added margin */
        }

        .form-value-small {
            border-bottom: none; /* Remove underline */
            padding: 3px; /* Consistent 3px padding throughout */
            margin: 0; /* removed margin */
            display: inline;
        }        .flex-row {
            display: flex;
            gap: 4px;
            margin: 1px 0;
        }

        .flex-1 {
            flex: 1;
        }

        .address-section {
            width: 18%;
            padding: 5px; /* Increased padding for more space */
            font-size: 12px; /* Readable font size minimum 12px */
            line-height: 1.3; /* More vertical space for clarity */
            vertical-align: top;
            height: 220px; /* Increased height for less cramped look */
        }

        .address-section hr {
            margin: 6px 0; /* More margin for visual separation */
            border: 0;
            border-top: 1px solid #000;
        }

        .freight-table-container {
            height: 180px; /* Reduced from 250px to minimize empty space */
            border-collapse: separate; /* Use separate to avoid border overlap */
            border-spacing: 0; /* No spacing between cells */
            width: 100%;
            border: 1px solid #000; /* Consistent outer border */
            table-layout: fixed; /* Fixed layout for consistent column widths */
        }

        /* Remove outer borders from freight table header cells but keep separators */
        .freight-table-container tr:first-child td {
            border-top: 0px !important;
            border-left: 0px !important;
            border-bottom: 1px solid #000 !important; /* Keep bottom border */
        }

        .freight-table-container tr:first-child td:not(:last-child) {
            border-right: 1px solid #000 !important; /* Keep separators between header columns */
        }

        .freight-table-container tr:first-child td:last-child {
            border-right: 0px !important; /* Remove right border on last column */
        }

        .nos-column {
            width: 10%;
            border-right: 1px solid #000;
            border-left: none; /* Remove to avoid double borders */
            border-top: none; /* Remove to avoid double borders */
            border-bottom: none; /* Remove to avoid double borders */
            padding: 3px;
            vertical-align: top;
        }

        .particulars-column {
            width: 45%; /* Increased width to stretch to available space */
            border-right: 1px solid #000;
            border-left: none; /* Remove to avoid double borders */
            border-top: none; /* Remove to avoid double borders */
            border-bottom: none; /* Remove to avoid double borders */
            padding: 3px;
            vertical-align: top;
        }

        .rate-label {
            width: 50%; /* Equal width for labels */
            padding: 2px 4px; /* Restored padding */
            border-right: 1px solid #000; /* Separator between label and amount */
            border-bottom: 1px solid #000; /* Row separator */
            font-size: 12px; /* Restored font size */
            line-height: 1.0;
            vertical-align: middle;
            text-align: left;
        }

        .rate-amount {
            width: 50%; /* Equal width for amounts */
            padding: 2px 4px; /* Restored padding */
            border-bottom: 1px solid #000; /* Row separator */
            font-size: 12px; /* Restored font size */
            line-height: 1.0;
            vertical-align: middle;
            text-align: right; /* Right alignment for amounts */
        }

        /* Remove border from last row */
        .rate-label:last-child, .rate-amount:last-child {
            border-bottom: none;
        }

        .weight-column {
            padding: 3px; /* Consistent 3px padding throughout */
            vertical-align: top;
            border-bottom: 1px solid #000;
            border-left: 0px; /* No left border as rate table already has right border */
            border-top: 1px solid #000; /* Restore top border */
            border-right: 1px solid #000; /* Right border for proper separation */
            width: 22%; /* Width to accommodate weight info */
        }        .rate-container, .weight-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 280px; /* Increased to match the new table height */
            width: 100%;
            justify-content: flex-start; /* Align content to top */
        }

        .rate-label {
            padding-left: 4px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            font-size: 12px;
        }
        .rate-amount {
            text-align: right;
            padding-right: 4px;
            border-bottom: 1px solid #000;
            font-size: 12px;
            border-left: none !important;
        }
        .rate-item:last-child {
            border-bottom: none; /* Remove border from last item */
            font-weight: bold; /* Bold for total */
        }

        .rate-label {
            padding-left: 4px;
            border-left: none !important;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            font-size: 12px;

        }
        .rate-amount {
            text-align: right;
            padding-right: 4px;
            border-right: none !important;
            border-bottom: 1px solid #000;
            font-size: 12px;
        }

        .rate-value:last-child {
            border-bottom: none; /* Remove border from last item to match rate-item */
            font-weight: bold; /* Bold for total */
        }

        .weight-item {
            flex: 1; /* Equal distribution to match other columns */
            border-bottom: 1px solid #000; /* Row separator */
            padding: 2px; /* Compact padding */
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 16px; /* Same height as rate items */
            line-height: 1.0; /* Tight line height for compactness */
            font-size: 12px; /* Maintain 12px minimum for readability */
        }

        .payment-section {
            flex: 2;
            border-bottom: 1px solid #000;
            padding: 4px; /* Compact padding */
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 12px; /* Maintain 12px for readability */
        }

        .risk-section {
            flex: 0.5; /* Reduce flex to take less space */
            padding: 2px; /* Minimal padding */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 12px; /* Maintain 12px for readability */
            line-height: 1.0; /* Tight line height */
        }

        .payment-option {
            margin-bottom: 2px; /* Reduced from 4px to 2px */
            display: flex;
            align-items: center;
        }

        .payment-radio {
            margin-right: 2px; /* Reduced from 4px to 2px */
        }

        .nos-item, .particulars-item {
            margin-bottom: 2px; /* Reduced from 4px for more compact layout */
            padding: 3px; /* Consistent 3px padding throughout */
            border-bottom: 1px solid #ccc;
            min-height: 12px; /* Reduced from 15px for more compact layout */
        }

        .delivery-section, .remarks-section {
            height: 25px; /* Increased for better visibility */
        }

        .remarks-section {
            height: 25px; /* Increased for better visibility */
        }

        .footer-section {
            height: auto;
        }

        @ @media print {
      * {
        margin: 0 !important;
        padding: 0 !important;
      }
      html, body {
        margin: 0 auto !important;
        padding: 10px !important;
        height: auto !important;
        width: 100% !important;
        max-width: 800px !important;
      }
      .container {
        width: 100% !important;
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        transform: none !important;
        height: auto;
      }
      .min-h-screen {
        margin: 0 auto !important;
        padding: 0 !important;
        max-width: 94% !important; /* Match the main page width for perfectly balanced spacing */
        width: 94% !important;
      }
        }
    </style>
</head>
<body>
    <div class="min-h-screen">
        <div class="max-w-7xl">
            <!-- Header Controls -->
            <div class="header-controls"></div>
            
            <!-- Form Content -->
            <div class="container">
                <!-- Header Section -->
                <div class="header-section">
                    <div class="header-inner">                    
                        <div class="logo-container">
                            <img src="${billheader5Base64}" 
                                 alt="Shree Dattaguru Road Lines Header" class="logo-image" />
                        </div>
                        <div class="jurisdiction-section">
                            <div class="jurisdiction-title">SUBJECT TO PALGHAR JURISDICTION</div>
                            <div class="service-details">
                                <div class="service-title">Daily Part Load Service to -</div>
                                <div>Tarapur, Bhiwandi, Palghar,</div>
                                <div>Vashi, Taloja, Kolgoan Genises</div>
                            </div>
                            <div class="drivers-copy">DRIVERS COPY</div>
                        </div>
                    </div>
                </div>
                
                <!-- Consignor / Consignee Section -->
                <div class="row-container">
                    <table class="left-table">
                        <tbody>
                            <tr style="height: auto;">
                                <td class="left-cell" style="height: auto; padding 5px 5px;">
                                    <div>
                                        <strong>Consignor - M/s ${getValue(data.consignor?.consignorName || data.consignor_name)}</strong>
                                    </div>
                                    <div class="form-value">${getValue(data.consignor?.address || data.consignor_address)}, ${getValue(data.consignor?.city || data.consignor_city)}, ${getValue(data.consignor?.state || data.consignor_state)} - ${getValue(data.consignor?.pinCode || data.consignor_pin_code || data.consignor_pincode)}</div>
                                </td>
                            </tr>
                            <tr style="height: auto;">
                                <td class="left-cell" style="height: auto;padding 5px 5px;">
                                    <div>
                                        <strong>Consignee - M/s ${getValue(data.consignee?.consigneeName || data.consignee_name)}</strong>
                                    </div>
                                    <div class="form-value">${getValue(data.consignee?.address || data.consignee_address)}, ${getValue(data.consignee?.city || data.consignee_city)}, ${getValue(data.consignee?.state || data.consignee_state)} - ${getValue(data.consignee?.pinCode || data.consignee_pin_code || data.consignee_pincode)}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Right Table -->
                    <table class="right-table">
                        <tbody>
                            <tr style="height: auto;">
                                <td colspan="2" style="padding: 12px 16px; height: auto;">
                                    <strong>CN't No. - </strong>
                                    <span class="form-value-small">${getValue(data.lorryReceiptNumber || data.cn_number || data.lr_number)}</span>
                                </td>
                            </tr>
                            <tr style="height: auto;">
                                <td style="width: 50%; padding: 3px 3px; height: auto; white-space: nowrap;">
                                    <strong>Date - </strong>
                                    <span class="form-value-small" style="white-space: nowrap;">${formatDate(data.date || data.lr_date)}</span>
                                </td>
                                <td style="width: 50%; text-align: center; padding: 3px 3px; height: auto; white-space: nowrap;">
                                    <strong>Truck No. - </strong>
                                    <span class="form-value-small" style="white-space: nowrap;">${getValue(data.truckDetails?.truckNumber || data.truck_number || data.truckNumber)}</span>
                                </td>
                            </tr>
                            <tr style="height: auto;">
                                <td style="width: 40%; padding: 3px 3px; height: auto; white-space: nowrap;">
                                    <strong>From - </strong>
                                    <span class="form-value-small" style="white-space: nowrap;">${getValue(data.fromLocation || data.from_location)}</span>
                                </td>
                                <td style="width: 40%; padding: 3px 3px; height: auto;">
                                    <strong>To - </strong>
                                    <span class="form-value-small">${getValue(data.toLocation || data.to_location)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Main Freight Table -->
                <table style="margin-bottom: 0 !important;">
                    <tbody>
                        <tr>
                            <td rowspan="2" class="address-section">
                                <strong style="font-size: 12px;">TARAPUR</strong><br />
                                Plot No. W-4, Camlin Naka,<br />
                                MIDC, Tarapur<br />
                                M: 9823364283 / 9168027869 / 8446665945<br />
                                <hr />
                                <strong style="font-size: 12px;">BHIWANDI</strong><br />
                                Godown No. A-2, Gali No. 2,<br />
                                Opp. Capital Roadlines, Khandagale Estate,<br />
                                Purna Village, Bhiwandi.<br />
                                M.: 7507844317 / 9168027868<br />
                                <hr />
                                PAN: AGTPV0112D<br />
                                GSTIN: 27AGTPV0112D1ZG
                            </td>
                            <td colspan="3">
                                <table class="freight-table-container">
                                    <tbody>
                                        <tr class="bold center">
                                            <td style="width: 10%; border: 1px solid #000;">Nos.</td>
                                            <td style="width: 45%; border: 1px solid #000;">Particulars</td>
                                            <td style="width: 22%; border: 1px solid #000;" colspan="2">Rate Rs.</td>
                                            <td style="width: 23%; border: 1px solid #000;">Weight</td>
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

                                            <!-- Rate Columns as Single Table -->
                                            <td colspan="2" style="padding: 0;">
                                                <table class="rate-table" style="height: 280px;">
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">Freight</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(freight)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">Hamali</td>
                                                        <td class="rate-amount" style="border-left:none;padding-right: 10px;">${formatCurrency(hamali)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">A.O.C</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(aoc)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">Door Dely</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(doorDelivery)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">Detention</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(detention)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">Collection</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(collection)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label">St.Charge</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(stCharge)}</td>
                                                    </tr>
                                                    <tr style="height: 34px;">
                                                        <td class="rate-label">Extra Loading<br />paid by us</td>
                                                        <td class="rate-amount" style="border-left:none; padding-right: 10px;">${formatCurrency(extraLoading)}</td>
                                                    </tr>
                                                    <tr style="height: 25px;">
                                                        <td class="rate-label" style="font-weight: bold; border-bottom: none;">Total</td>
                                                        <td class="rate-amount" style="font-weight: bold; border-bottom: none; border-left:none; padding-right: 10  px;">${formatCurrency(totalAmount)}</td>
                                                    </tr>
                                                </table>
                                            </td>

                                            <!-- Weight Column -->
                                            <td class="weight-column">
                                                <div class="weight-container">                                                    <div class="weight-item">
                                                        <p>Actual<br />
                                                        <strong>${getValue(data.actualWeight || data.actual_weight)} Kg.</strong></p>
                                                    </div>
                                                    <div class="weight-item">
                                                        <p>Chargeable<br /><br/><strong>${getValue(data.chargeableWeight || data.chargeable_weight || data.charged_weight)}</strong></p>
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
                                        <!-- E-way Bill row moved up within freight table -->
                                        <tr>
                                            <td colspan="5" 
                                                style="padding: 3px; font-size: 12px; font-weight: bold; text-align: left; border: 1px solid #000;">
                                                E-way Bill: ${getValue(data.ewayBill || data.eway_bill || data.ewaybill)}
                                            </td>
                                            </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Footer Sections with Continuous Right Box -->
                <table style="width: 100%; border-collapse: collapse; margin: 0 !important; table-layout: fixed;">
                    <tbody>
                        <tr>
                            <td style="width: 70%; padding: 1px 3px; border: 1px solid #000; border-right: none; vertical-align: top;">
                                <div style="margin-bottom: 0;">
                                    <span style="font-family: Arial; font-size: 12px;">Delivery At:</span>
                                    <span style="font-family: Arial; font-size: 12px; margin-left: 2px;">${getValue(data.deliveryAt || data.delivery_at)}</span>
                                </div>
                            </td>
                            <td rowspan="3" style="width: 30%; padding: 3px; border: 1px solid #000; border-left: 2px solid #000; vertical-align: bottom; text-align: center;">
                                <div style="margin-top: auto;">
                                    <span style="font-family: Arial; font-size: 12px;">For Shree Dattaguru Road Lines</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 70%; padding: 1px 3px; border: 1px solid #000; border-right: none; border-top: none;">
                                <div style="margin-bottom: 0;">
                                    <span style="font-family: Arial; font-size: 12px;">Remarks:</span>
                                    <span style="font-family: Arial; font-size: 12px; margin-left: 2px;">${getValue(data.remarks || data.notes)}</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 70%; padding: 1px 3px; border: 1px solid #000; border-right: none; border-top: none;">
                                <div style="margin-bottom: 0;">
                                    <span style="font-family: Arial; font-size: 10px;">We are not responsible for any type of damages, leakage, fire & shortages. Kindly Insured by Consignor or Consignee</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
        </div>
    </div>
    
</body>
</html>
`;

    return html;
};

export default lorryReceiptPrintTemplate;