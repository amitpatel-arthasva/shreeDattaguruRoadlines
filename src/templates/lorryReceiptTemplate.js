/**
 * HTML template for Lorry Receipt PDF generation
 * This template matches the exact format of the LorryReceiptFormPage.jsx
 */

const lorryReceiptTemplate = (data) => {
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

  // Map database field names to form field names
  const freight = parseFloat(data.freight || 0);
  const hamali = parseFloat(data.hamali || 0);
  const aoc = parseFloat(data.aoc || 0);
  const doorDelivery = parseFloat(data.door_delivery || 0);
  const detention = parseFloat(data.detention || 0);
  const collection = parseFloat(data.collection || 0);
  const serviceCharge = parseFloat(data.service_charge || data.st_charge || 20); // Default 20
  const extraLoading = parseFloat(data.extra_loading || 0);
  
  const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + serviceCharge + extraLoading;

  // Handle arrays for nos and particulars
  const nosArray = data.nos || [data.quantity || ''];
  const particularsArray = data.particulars || [''];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lorry Receipt - ${getValue(data.lr_number)}</title>
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
        
        .drivers-copy {
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

        .consignor-consignee {
            flex: 2;
        }

        .cn-truck-date {
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
        
        .freight-container {
            display: flex;
            width: 100%;
        }
        
        .freight-table {
            flex: 1;
            border: none !important;
        }
        
        .freight-table td {
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
        
        .weight-column {
            width: 120px;
            padding: 0;
        }
        
        .weight-values {
            display: flex;
            flex-direction: column;
            height: 320px;
        }
        
        .weight-item {
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
        
        .risk-section {
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
        
        .particulars-list {
            padding: 4px;
            min-height: 80px;
        }
        
        .particulars-item, .nos-item {
            margin-bottom: 6px;
            padding: 2px;
            border-bottom: 1px dotted #ccc;
            font-size: 11px;
        }
        
        .nos-item {
            text-align: center;
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
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" 
                     alt="Logo" class="logo-image" style="background: #f0f0f0; border: 2px solid #C5677B;">
                <div class="company-name">SHREE DATTAGURU ROAD LINES</div>
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

        <!-- Form Container -->
        <div class="form-container">
            <!-- Address Section -->
            <table>
                <tbody>
                    <tr>
                        <td class="address-cell" style="width: 50%;">
                            <span class="form-label">Consignor - M/s <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.consignor_name)}</div>
                            <div class="form-value">${getValue(data.consignor_address)}</div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignor_city)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignor_state)}</div>
                                </div>
                                <div style="width: 60px;">
                                    <div class="form-value">${getValue(data.consignor_pincode)}</div>
                                </div>
                            </div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignor_gstin)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignor_pan)}</div>
                                </div>
                            </div>
                        </td>
                        <td class="address-cell" style="width: 25%;">
                            <span class="form-label">C.N.No. <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.lr_number)}</div>
                            
                            <span class="form-label">Truck No. <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.truck_number || data.truck_reg_number)}</div>
                            
                            <span class="form-label">Date <span class="required">*</span></span>
                            <div class="form-value">${formatDate(data.lr_date)}</div>
                        </td>
                        <td class="address-cell" style="width: 25%;">
                            <div class="flex-row">
                                <div class="flex-1">
                                    <span class="form-label">From <span class="required">*</span></span>
                                    <div class="form-value">${getValue(data.from_location)}</div>
                                </div>
                                <div class="flex-1">
                                    <span class="form-label">To <span class="required">*</span></span>
                                    <div class="form-value">${getValue(data.to_location)}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="address-cell">
                            <span class="form-label">Consignee - M/s <span class="required">*</span></span>
                            <div class="form-value">${getValue(data.consignee_name)}</div>
                            <div class="form-value">${getValue(data.consignee_address)}</div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignee_city)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignee_state)}</div>
                                </div>
                                <div style="width: 60px;">
                                    <div class="form-value">${getValue(data.consignee_pincode)}</div>
                                </div>
                            </div>
                            <div class="flex-row">
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignee_gstin)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="form-value">${getValue(data.consignee_pan)}</div>
                                </div>
                            </div>
                        </td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>

            <!-- Main Freight Table -->
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
                            7276272828<br />
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
                            <table class="freight-table">
                                <thead>
                                    <tr class="bold center">
                                        <th style="width: 60px;">Nos. <span class="required">*</span></th>
                                        <th>Particulars <span class="required">*</span></th>
                                        <th style="width: 80px;">Rate Rs.</th>
                                        <th style="width: 80px;">Amount</th>
                                        <th style="width: 100px;">Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="height: 320px;">
                                        <td style="padding: 4px; vertical-align: top;">
                                            <div class="particulars-list">
                                                ${nosArray.map((nos, index) => 
                                                    `<div class="nos-item">${getValue(nos)}</div>`
                                                ).join('')}
                                            </div>
                                        </td>
                                        
                                        <td style="padding: 4px; vertical-align: top;">
                                            <div class="particulars-list">
                                                ${particularsArray.map((particular, index) => 
                                                    `<div class="particulars-item">${getValue(particular)}</div>`
                                                ).join('')}
                                            </div>
                                        </td>
                                        
                                        <td class="rate-column">
                                            <div class="rate-values">
                                                <div class="rate-item">Freight</div>
                                                <div class="rate-item">Hamali</div>
                                                <div class="rate-item">A.O.C</div>
                                                <div class="rate-item">Door Dely</div>
                                                <div class="rate-item">Collection</div>
                                                <div class="rate-item">St.Charge</div>
                                                <div class="rate-item">Extra Loading<br />paid by us</div>
                                                <div class="rate-item">Total</div>
                                            </div>
                                        </td>
                                        
                                        <td class="rate-column">
                                            <div class="rate-values">
                                                <div class="rate-item">${formatCurrency(freight)}</div>
                                                <div class="rate-item">${formatCurrency(hamali)}</div>
                                                <div class="rate-item">${formatCurrency(aoc)}</div>
                                                <div class="rate-item">${formatCurrency(doorDelivery)}</div>
                                                <div class="rate-item">${formatCurrency(collection)}</div>
                                                <div class="rate-item">${formatCurrency(serviceCharge)}</div>
                                                <div class="rate-item">${formatCurrency(extraLoading)}</div>
                                                <div class="rate-item">${formatCurrency(totalAmount)}</div>
                                            </div>
                                        </td>
                                        
                                        <td class="weight-column">
                                            <div class="weight-values">
                                                <div class="weight-item">
                                                    Actual <span class="required">*</span><br />
                                                    <strong>${getValue(data.actual_weight)}</strong> Kg.
                                                </div>
                                                <div class="weight-item">
                                                    <strong>${getValue(data.charged_weight)}</strong><br />
                                                    Chargeable <span class="required">*</span>
                                                </div>
                                                <div class="payment-section">
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payment_type === 'paid' ? '●' : '○'}</span>
                                                        <label>Paid</label>
                                                    </div>
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payment_type === 'toBeBill' ? '●' : '○'}</span>
                                                        <label>To be Bill</label>
                                                    </div>
                                                    <div class="payment-option">
                                                        <span class="payment-radio">${data.payment_type === 'toPay' ? '●' : '○'}</span>
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

            <!-- Delivery Section -->
            <table>
                <tbody>
                    <tr class="delivery-row">
                        <td>
                            Delivery At: <span class="required">*</span> <strong>${getValue(data.delivery_at)}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Remarks Section -->
            <table>
                <tbody>
                    <tr class="remarks-row">
                        <td>
                            Remarks: <strong>${getValue(data.remarks, '')}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Footer -->
            <table>
                <tbody>
                    <tr class="footer-row">
                        <td style="width: 70%; vertical-align: top;">
                            We are not responsible for any type of damages, leakage, fire & shortages. Kindly Insured by Consignor or Consignee
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

export default lorryReceiptTemplate;
