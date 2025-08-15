/**
 * HTML template for Quotation PDF generation
 * This template matches the structure and layout of the lorry receipt template
 */


const quotationTemplate = (data, imageBase64 = null) => {
    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return parseFloat(amount).toFixed(2);
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN');
    };
    const getValue = (value, defaultValue = 'N/A') => value || defaultValue;
    const materialDetails = data.materialDetails || [];

            const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Quotation - ${getValue(data.quotationNumber)}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 11px; color: #222; margin: 0; padding: 0; }
                .main-container { max-width: 700px; margin: 16px auto; border: 2px solid #0d47a1; background: #fff; padding: 0; }
                .header-red { background: #fff; color: #b71c1c; text-align: center; padding: 4px 0 0 0; border-bottom: none; }
                .header-hindi { font-size: 22px; font-weight: bold; color: #b71c1c; font-family: 'Mangal', Arial, sans-serif; margin-bottom: 0px; }
                .header-eng { font-size: 22px; font-weight: bold; color: #0d47a1; letter-spacing: 1px; margin-top: 0px; margin-bottom: 0px; }
                .header-underline { border-bottom: 2px solid #0d47a1; width: 80%; margin: 0 auto 2px auto; }
                .sub-header { text-align: center; color: #b71c1c; font-size: 12px; font-weight: bold; margin: 0; background: #fff; border-bottom: none; padding: 0; letter-spacing: 1px; }
                .info-row { display: flex; justify-content: space-between; font-size: 10px; margin: 0 8px 0 8px; align-items: flex-start; }
                .info-left { text-align: left; width: 70%; line-height: 1.1; }
                .info-branch { font-weight: bold; color: #b71c1c; display: inline; }
                .info-address { color: #0d47a1; font-weight: normal; display: inline; }
                .info-mob { color: #0d47a1; font-weight: normal; display: block; margin-left: 60px; font-size: 9px; }
                .info-right { text-align: left; width: 30%; line-height: 1.1; vertical-align: top; }
                .info-email { color: #b71c1c; font-weight: bold; display: block; text-align: center; margin-top: 2px; }
                .info-pan { color: #b71c1c; font-weight: bold; display: block; text-align: left; }
                .info-gstin { color: #b71c1c; font-weight: bold; display: block; text-align: left; }
                .ref-date-row { display: flex; justify-content: space-between; margin: 0 8px 0 8px; font-size: 10px; }
                .ref-date-row .ref { color: #0d47a1; font-weight: bold; }
                .ref-date-row .date { color: #0d47a1; font-weight: bold; }
                .to-block { margin: 8px 18px 0 18px; font-size: 11px; }
                .to-block b { color: #b71c1c; }
                .to-label { display: inline-block; min-width: 30px; }
                .sub-label, .attn-label { font-weight: bold; color: #b71c1c; }
                .table-section { margin: 10px 18px 0 18px; }
                table { width: 98%; margin: 0 auto; border-collapse: collapse; font-size: 11px; }
                th, td { border: 1px solid #0d47a1; padding: 4px 6px; text-align: center; }
                th { background: #0d47a1; color: #fff; font-weight: bold; font-size: 12px; }
                .footer { margin: 16px 18px 0 18px; font-size: 10px; }
                .footer-sign { text-align: right; font-weight: bold; margin-top: 30px; font-size: 12px; color: #0d47a1; }
                .note { font-size: 9px; margin-top: 8px; text-align: left; }
                .signature-space { height: 30px; }
            </style>
        </head>
        <body>
            <div class="main-container">
                                        <div class="header-red" style="background: #fff; text-align: center; padding: 0; border-bottom: none;">
                                                <img src="${imageBase64 ? `data:image/png;base64,${imageBase64}` : ''}" alt="Shree Dattaguru Road Lines Header" style="max-width: 90%; height: auto; margin: 0 0 18px 60px; display: block;" />
                                                <div class="header-underline" style="margin-top: 2px;"></div>
                                                <div style="height: 18px;"></div>
                                        </div>
                    <!-- Address and contact line moved below header image as per request -->
                    <!-- Email removed as per request -->
                    <!-- GST number and PAN removed as per request -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin: 2px 30px 0 30px; font-size: 12px;">
                        <div style="color: #0d47a1; font-weight: bold;">Ref.: ${getValue(data.referenceNo, data.quotationNumber || '')}</div>
                        <div style="color: #0d47a1; font-weight: bold; text-align: right;">Date: ${formatDate(data.quotationDate)}</div>
                    </div>
                    <div class="to-block">
                        <span class="to-label"><b>To,</b></span><br>
                        ${getValue(data.companyName, 'N/A')}<br>
                        ${getValue(data.location, '')}<br>
                        <span class="sub-label">Sub:</span> Quotation <br>
                        <span class="attn-label">Kind Attn:</span> ${getValue(data.kindAtten, 'N/A')}<br>
                        <br>
                        Respected sir,<br>
                        With ref. to the above subject we are giving our most competitive rates as below -
                    </div>
                    <div class="table-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Destination</th>
                                    <th>Freight, up to ${getValue(data.capacity, '8MT')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Array.isArray(data.destinations) && data.destinations.length > 0 ?
                                    data.destinations.map((dest, idx) =>
                                        `<tr><td>${idx + 1}</td><td>${getValue(dest.destination || dest.name, 'N/A')}</td><td>${formatCurrency(dest.freight || dest.rate)}</td></tr>`
                                    ).join('') :
                                    '<tr><td>1</td><td>N/A</td><td>0.00</td></tr><tr><td>2</td><td>N/A</td><td>0.00</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                <div class="note" style="margin: 25px 40px 0 40px; padding: 0; background: none; border: none; border-radius: 0;">
                    <span style="font-weight: bold; color: #b71c1c;">Note:</span><br>
                    <span style="margin-left: 18px;">1) Kindly insure your valued material at your end.</span><br>
                    <span style="margin-left: 18px;">2) Loading / unloading charges &amp; other charges will be extra as actual paid by us.</span><br>
                    <span style="margin-left: 18px;">3) Detention charges will be extra as per destination / vehicle.</span>
                </div>
                <div class="footer" style="margin: 35px 40px 0 40px; font-size: 13px;">
                    <div style="margin-bottom: 18px;">Thanking you &amp; awaiting your favorable reply.</div>
                    <div class="signature-space" style="height: 60px;"></div>
                    <div class="footer-sign" style="text-align: right; font-weight: bold; font-size: 15px;">
                        Yours faithfully,<br><br><br><br>For Shree Dattaguru Road Lines
                    </div>
                </div>
            </div>
        </body>
        </html>`;
    return html;
};
export default quotationTemplate;
                            


