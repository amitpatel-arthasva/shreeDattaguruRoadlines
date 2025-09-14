/**
 * HTML template for Quotation PDF generation
 * This template matches the structure and layout of the lorry receipt template
 */

const quotationTemplate = (data) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Helper function to safely get values
  const getValue = (value, defaultValue = 'N/A') => {
    return value || defaultValue;
  };

  // Helper function to format material details
  const formatMaterialDetails = (materials) => {
    if (!materials || !Array.isArray(materials)) return 'N/A';
    return materials.map(material => 
      `${getValue(material.materialName)} - ${getValue(material.quantity)} ${getValue(material.unit, 'Units')}`
    ).join(', ');
  };

  // Parse material details for table display
  const materialDetails = data.materialDetails || [];
  
  // Calculate totals
  const ratePerTon = parseFloat(data.ratePerTon || 0);
  const totalFreightWithGST = parseFloat(data.totalFreightWithGST || 0);
  const driverCashRequired = parseFloat(data.driverCashRequired || 0);

  // Create a professional SVG logo as fallback (browser-compatible)
  const logoSvg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#f8f9fa" stroke="#C5677B" stroke-width="2"/>
      <text x="40" y="25" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#C5677B" text-anchor="middle">
        SHREE
      </text>
      <text x="40" y="35" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#C5677B" text-anchor="middle">
        DATTAGURU
      </text>
      <text x="40" y="45" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#C5677B" text-anchor="middle">
        ROAD
      </text>
      <text x="40" y="55" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#C5677B" text-anchor="middle">
        LINES
      </text>
      <text x="40" y="70" font-family="Arial, sans-serif" font-size="6" fill="#666" text-anchor="middle">
        Transport
      </text>
    </svg>
  `;
  
  // Use encoded SVG for browser compatibility
  const headerImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation - ${getValue(data.quotationNumber)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 20px;
        }
        
        .main-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border: 2px solid #000;
            padding: 15px;
        }
        
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #000;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo-image {
            width: 80px;
            height: 80px;
            border: 1px solid #C5677B;
            background: #f9f9f9;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #C5677B;
        }
        
        .jurisdiction-section {
            text-align: right;
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            line-height: 1.25;
        }
        
        .jurisdiction-title {
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .service-details {
            margin-bottom: 8px;
        }
        
        .service-title {
            font-weight: 600;
        }
        
        .quotation-copy {
            font-weight: bold;
            color: #DC2626;
            border: 1px solid #DC2626;
            padding: 4px 8px;
            display: inline-block;
            margin-top: 8px;
        }
        
        .form-container {
            border: 1px solid #000;
            background: white;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td, th {
            border: 1px solid #000;
            padding: 6px;
            vertical-align: top;
        }

        .bold {
            font-weight: bold;
        }

        .center {
            text-align: center;
        }

        .address-row {
            display: flex;
            width: 100%;
        }

        .client-details {
            flex: 2;
        }

        .quotation-details {
            flex: 1;
        }
        
        .address-cell {
            height: 120px;
            vertical-align: top;
            padding: 8px;
        }
        
        .form-value {
            border-bottom: 1px solid #000;
            min-height: 18px;
            padding: 3px;
            margin: 3px 0;
            display: block;
        }
        
        .form-label {
            font-weight: bold;
            margin-bottom: 4px;
            display: block;
        }
        
        .required {
            color: #DC2626;
        }
        
        .flex-row {
            display: flex;
            gap: 8px;
            margin: 3px 0;
        }
        
        .flex-1 {
            flex: 1;
        }
        
        .address-section {
            width: 180px;
            padding: 8px;
            font-size: 11px;
            line-height: 1.3;
            vertical-align: top;
        }
        
        .address-section hr {
            margin: 8px 0;
            border: 0;
            border-top: 1px solid #000;
        }
        
        .quotation-container {
            display: flex;
            width: 100%;
        }
        
        .quotation-table {
            flex: 1;
            border: none !important;
        }
        
        .quotation-table td {
            border: 1px solid #000;
            padding: 4px;
            vertical-align: top;
        }
        
        .rate-column {
            width: 100px;
            padding: 0;
        }
        
        .rate-values {
            display: flex;
            flex-direction: column;
            height: 320px;
        }
        
        .rate-item {
            flex: 1;
            border-bottom: 1px solid #000;
            padding: 6px 4px;
            display: flex;
            align-items: center;
            font-size: 11px;
        }
        
        .rate-item:last-child {
            border-bottom: none;
            font-weight: bold;
        }
        
        .details-column {
            width: 120px;
            padding: 0;
        }
        
        .details-values {
            display: flex;
            flex-direction: column;
            height: 320px;
        }
        
        .details-item {
            flex: 2;
            border-bottom: 1px solid #000;
            padding: 8px 4px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-size: 11px;
        }
        
        .payment-section {
            flex: 2;
            border-bottom: 1px solid #000;
            padding: 6px 4px;
            font-size: 10px;
        }
        
        .validity-section {
            flex: 1;
            padding: 6px 4px;
            text-align: center;
            font-size: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .payment-option {
            margin-bottom: 4px;
            display: flex;
            align-items: center;
        }
        
        .payment-radio {
            margin-right: 4px;
            font-size: 12px;
        }
        
        .material-list {
            padding: 4px;
            min-height: 80px;
        }
        
        .material-item {
            margin-bottom: 6px;
            padding: 2px;
            border-bottom: 1px dotted #ccc;
            font-size: 11px;
        }
        
        .delivery-row, .remarks-row {
            height: 35px;
        }
        
        .footer-row {
            height: 50px;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- Header Section -->
        <div class="header-section">
            <div class="logo-section">
                <img src="${headerImage}" 
                     alt="Logo" class="logo-image">
                <div class="company-name">SHREE DATTAGURU ROAD LINES</div>
            </div>
            <div class="jurisdiction-section">
                <div class="jurisdiction-title">SUBJECT TO PALGHAR JURISDICTION</div>
                <div class="service-details">
                    <div class="service-title">Transportation Services -</div>
                    <div>Full Load & Part Load</div>
                    <div>All India Transportation</div>
                </div>
                <div class="quotation-copy">QUOTATION</div>
            </div>
        </div>

        <!-- Form Container -->
        <div class="form-container">
            <!-- Client Details Section -->
            <table>
                <tbody>
                    <tr>
                        <td class="address-cell" style="width: 50%;">
                            <span class="form-label">Client - M/s <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.quoteToCompany?.companyName)}</div>
                            <div class="form-value">${getValue(data.quoteToCompany?.address)}</div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.quoteToCompany?.city)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.quoteToCompany?.state)}</div>
                                </div>
                                <div style="width: 60px;">
                                    <div class="form-value">${getValue(data.quoteToCompany?.pincode)}</div>
                                </div>
                            </div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.quoteToCompany?.gstNumber)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.quoteToCompany?.panNumber)}</div>
                                </div>
                            </div>
                        </td>
                        <td class="address-cell" style="width: 25%;">
                            <span class="form-label">Quotation No. <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.quotationNumber)}</div>
                            
                            <span class="form-label">Date <span class="required">*</span></span>
                            <div class="form-value">${formatDate(data.quotationDate)}</div>
                            
                            <span class="form-label">Valid Till <span class="required">*</span></span>
                            <div class="form-value">${formatDate(data.quotationValidity?.expiryDate)}</div>
                        </td>
                        <td class="address-cell" style="width: 25%;">
                            <div class="flex-row">
                                <div class="flex-1">
                                    <span class="form-label">From <span class="required">*</span></span>
                                    <div class="form-value">${getValue(data.fromLocation)}</div>
                                </div>
                                <div class="flex-1">
                                    <span class="form-label">To <span class="required">*</span></span>
                                    <div class="form-value">${getValue(data.toLocation)}</div>
                                </div>
                            </div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <span class="form-label">Load Type</span>
                                    <div class="form-value">${getValue(data.loadType)}</div>
                                </div>
                                <div class="flex-1">
                                    <span class="form-label">Trip Type</span>
                                    <div class="form-value">${getValue(data.tripType)}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Main Quotation Table -->
            <table>
                <tbody>
                    <tr>
                        <td class="address-section">
                            <strong>TARAPUR</strong><br />
                            Plot No. W-4,<br />
                            Camlin Naka,<br />
                            MIDC, Tarapur<br />
                            M: 9823364283 /<br />
                            9168027869 /<br />
                            8446665945<br />
                            <hr />
                            <strong>BHIWANDI</strong><br />
                            Godown No. A-2,<br />
                            Gali No. 2,<br />
                            Opp. Capital Roadlines,<br />
                            Khandagale Estate,<br />
                            Purna Village, Bhiwandi.<br />
                            M.: 7507844317 /<br />
                            9168027868<br />
                            <hr />
                            <b>PAN: AGTPV0112D<br />
                            GSTIN: 27AGTPV0112D1ZG</b>
                        </td>
                        <td>
                            <table class="quotation-table">
                                <thead>
                                    <tr class="bold center">
                                        <th style="width: 60px;">Sr. No.</th>
                                        <th>Material Details <span class="required">*</span></th>
                                        <th style="width: 80px;">Rate Rs.</th>
                                        <th style="width: 80px;">Amount</th>
                                        <th style="width: 100px;">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="height: 320px;">
                                        <td style="padding: 4px; vertical-align: top;">
                                            <div class="material-list">
                                                ${materialDetails.map((material, index) => 
                                                    `<div class="material-item">${index + 1}</div>`
                                                ).join('')}
                                            </div>
                                        </td>
                                        
                                        <td style="padding: 4px; vertical-align: top;">
                                            <div class="material-list">
                                                ${materialDetails.map((material, index) => 
                                                    `<div class="material-item">${getValue(material.materialName)} - ${getValue(material.quantity)} ${getValue(material.unit, 'Units')}</div>`
                                                ).join('')}
                                            </div>
                                        </td>
                                        
                                        <td class="rate-column">
                                            <div class="rate-values">
                                                <div class="rate-item">Rate per ${getValue(data.rateType, 'Ton')}</div>
                                                <div class="rate-item">GST ${getValue(data.applicableGST, '18%')}</div>
                                                <div class="rate-item">Total Freight</div>
                                                <div class="rate-item">Driver Cash</div>
                                                <div class="rate-item">Demurrage Rate</div>
                                                <div class="rate-item">Payment Terms</div>
                                                <div class="rate-item">Validity</div>
                                                <div class="rate-item">Total Amount</div>
                                            </div>
                                        </td>
                                        
                                        <td class="rate-column">
                                            <div class="rate-values">
                                                <div class="rate-item">${formatCurrency(ratePerTon)}</div>
                                                <div class="rate-item">${getValue(data.applicableGST, '18%')}</div>
                                                <div class="rate-item">${formatCurrency(totalFreightWithGST)}</div>
                                                <div class="rate-item">${formatCurrency(driverCashRequired)}</div>
                                                <div class="rate-item">${formatCurrency(data.demurrageRatePerDay || 0)}/day</div>
                                                <div class="rate-item">${getValue(data.payBy, 'Consignee')}</div>
                                                <div class="rate-item">${getValue(data.quotationValidity?.validityDays, 30)} days</div>
                                                <div class="rate-item">${formatCurrency(totalFreightWithGST)}</div>
                                            </div>
                                        </td>
                                        
                                        <td class="details-column">
                                            <div class="details-values">
                                                <div class="details-item">
                                                    Payment By <span class="required">*</span><br />
                                                    <strong>${getValue(data.payBy, 'Consignee')}</strong>
                                                </div>
                                                <div class="details-item">
                                                    <strong>${formatCurrency(driverCashRequired)}</strong><br />
                                                    Driver Cash Required
                                                </div>
                                                <div class="payment-section">
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payBy === 'Consignor' ? '●' : '○'}</span>
                                                        <label>Consignor</label>
                                                    </div>
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payBy === 'Consignee' ? '●' : '○'}</span>
                                                        <label>Consignee</label>
                                                    </div>
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payBy === 'Advance' ? '●' : '○'}</span>
                                                        <label>Advance</label>
                                                    </div>
                                                </div>
                                                <div class="validity-section">
                                                    Valid for<br /><b>${getValue(data.quotationValidity?.validityDays, 30)} DAYS</b><br />
                                                    Till: ${formatDate(data.quotationValidity?.expiryDate)}
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

            <!-- Payment Remarks Section -->
            <table>
                <tbody>
                    <tr class="delivery-row">
                        <td>
                            Payment Remarks: <span class="required">*</span> <strong>${getValue(data.paymentRemark, '')}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Demurrage Remarks Section -->
            <table>
                <tbody>
                    <tr class="remarks-row">
                        <td>
                            Demurrage Remarks: <strong>${getValue(data.demurrageRemark, '')}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Terms & Conditions Section -->
            <table>
                <tbody>
                    <tr class="remarks-row">
                        <td>
                            Terms & Conditions: <strong>${getValue(data.termsConditions, '')}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Footer -->
            <table>
                <tbody>
                    <tr class="footer-row">
                        <td style="width: 70%; vertical-align: top;">
                            This quotation is valid for ${getValue(data.quotationValidity?.validityDays, 30)} days from the date of issue. 
                            Rates are subject to change without prior notice. Terms and conditions apply.
                        </td>
                        <td style="width: 30%; vertical-align: bottom; text-align: center;">
                            For <span class="bold">Shree Dattaguru Road Lines</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;

  return html;
};

export default quotationTemplate; 