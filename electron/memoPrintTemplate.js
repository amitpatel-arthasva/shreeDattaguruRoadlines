// memoPrintTemplate.js
import { getImageAsBase64 } from './imageUtils.js';

function memoPrintTemplate(memo) {
  if (!memo) return '';

  const billHeaderBase64 = getImageAsBase64('billHeader.png');

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  }

  // ...existing code...
  return `
  <div style="padding:0;min-height:900px;display:block;background:#fff;">
    <div style="width:100%;background:#fff;padding:0;margin:0;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;">
        <img src="${billHeaderBase64}" alt="Header" 
             style="height:120px;object-fit:contain;margin-left:2px;margin-top:2px;max-width:80%;" />
        <div style="text-align:right;font-size:12px;margin:2px;">
          <div style="font-weight:bold;">SUBJECT TO PALGHAR JURISDICTION</div>
          <div>Daily Part Load Service to -<br/>Tarapur, Bhiwandi, Palghar,<br/>Vashi, Taloja, Kolgoan Genises</div>
          <div style="border:1px solid #ef4444;color:#ef4444;padding:1px 6px;display:inline-block;margin-top:2px;font-size:12px;">
            MEMO COPY
          </div>
        </div>
      </div>

      <!-- Branch addresses -->
      <div style="margin: 5px 0 6px 120px; font-size:11px; font-weight:500; color:#000; line-height:1.4;">
        <div style="margin-bottom:2px;">
          <span style="font-weight:bold;color:#dc2626;">TARAPUR:</span> Plot No. W - 4, Camlin Naka, MIDC, Tarapur. M.: 9823364283 / 8446665945
        </div>
        <div>
          <span style="font-weight:bold;color:#dc2626;">BHIWANDI:</span> Godown No. A-2, Gali No 2, Opp Capital Roadlines, Khandagale Estate,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Puma Village, Bhiwandi. M.: 9222161259 / 9168027868
        </div>
      </div>

      <!-- Top Block Container -->
      <div style="border:1px solid #000;width:100%;background:#fff;margin-bottom:16px;">
        <div style="display:flex;flex-direction:row;">
          <!-- Left block -->
          <div style="width:50%;padding:6px;font-size:13px;border-right:1px solid #000;">
            <div style="margin-bottom:4px;"><b>MEMO No. TPR</b> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;">${memo.memo_number || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Lorry No.</b> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;">${memo.lorry_no || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Driver's Name</b> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;">${memo.driver_name || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Contact No.</b> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;">${memo.ac_no || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Address</b> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;">${memo.address || ''}</span></div>
            <div style="margin-bottom:4px;">
              <b>From</b> <span style="border-bottom:1px solid #000;min-width:100px;display:inline-block;">${memo.from_location || ''}</span>
              <b style="margin-left:10px;">To</b> <span style="border-bottom:1px solid #000;min-width:100px;display:inline-block;">${memo.to_location || ''}</span>
            </div>
          </div>
          <!-- Right block -->
          <div style="width:50%;padding:6px;font-size:13px;">
            <div style="margin-bottom:4px;"><b>Lorry Hire Rs.</b> <span style="border-bottom:1px solid #000;min-width:120px;display:inline-block;">${memo.lorry_hire || '0.00'}</span></div>
            <div style="margin-bottom:4px;"><b>Advance Rs.</b> <span style="border-bottom:1px solid #000;min-width:120px;display:inline-block;">${memo.advance || '0.00'}</span></div>
            <div style="margin-bottom:4px;"><b>Hamali</b> <span style="border-bottom:1px solid #000;min-width:120px;display:inline-block;">${memo.hamali || '0.00'}</span></div>
            <div style="margin-bottom:4px;"><b>Balance</b> <span style="border-bottom:1px solid #000;min-width:80px;display:inline-block;">${memo.balance || '0.00'}</span> 
              <b style="margin-left:8px;">Payable at</b> <span style="border-bottom:1px solid #000;min-width:80px;display:inline-block;">${memo.payable_at || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Broker</b> <span style="border-bottom:1px solid #000;min-width:120px;display:inline-block;">${memo.broker || ''}</span></div>
            <div style="margin-bottom:4px;"><b>Date</b> <span style="border-bottom:1px solid #000;min-width:120px;display:inline-block;">${formatDate(memo.memo_date) || ''}</span></div>
          </div>
        </div>
      </div>

      <!-- Bottom Block Container (Table) -->
      <div style="border:1px solid #000;width:100%;background:#fff;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">L.R. No.</th>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">Articles</th>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">Consignor</th>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">Consignee</th>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">Kgs.</th>
              <th style="border:1px solid #000;padding:8px;background:#f8f9fa;font-weight:bold;text-align:center;">Freight</th>
            </tr>
          </thead>
          <tbody>
            ${(memo.tableData && memo.tableData.length > 0) 
              ? memo.tableData.map(row => `
                <tr>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;">${row.lr_no || ''}</td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;">${row.articles || ''}</td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;">${row.consignor || ''}</td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;">${row.consignee || ''}</td>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;">${row.kgs || ''}</td>
                  <td style="border:1px solid #000;padding:8px;text-align:right;min-height:40px;">${row.freight || ''}</td>
                </tr>
              `).join('')
              : `
                <tr>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;text-align:right;min-height:40px;"></td>
                </tr>
                <tr>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;text-align:center;min-height:40px;"></td>
                  <td style="border:1px solid #000;padding:8px;text-align:right;min-height:40px;"></td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>

      <!-- Signature -->
      <div style="display:flex;justify-content:flex-end;margin-top:40px;margin-right:40px;">
        <div style="text-align:center;">
          <div style="margin-bottom:40px;font-weight:bold;">For SHREE DATTAGURU ROADLINES</div>
          <div style="border-top:1px solid #000;width:160px;margin:0 auto;padding-top:4px;font-size:12px;">Authorised Signatory</div>
        </div>
      </div>
    </div>
  </div>
  `;
// ...existing code...
}

export default memoPrintTemplate;