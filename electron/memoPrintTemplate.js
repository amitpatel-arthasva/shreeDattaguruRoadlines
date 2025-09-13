// Memo Print Template for Electron PDF generation
// Returns HTML string for the memo in the same format as src/templates/memoPrintTemplate.js
import { getImageAsBase64 } from './imageUtils.js';

function memoPrintTemplate(memo) {
  if (!memo) return '';
  // Use original billHeader.png directly (not getBillHeaderAsBase64 which returns billHeader4.png)
  const billHeaderBase64 = getImageAsBase64('billHeader.png');
   function formatDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr; // fallback if invalid

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`; // ddmmyyyy format
}

  return `
    <div style="padding:0;min-height:900px;display:block;background:#fff;">
      <div style="width:100%;max-width:100%;background:#fff;padding:0;margin:0;">
  <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:2px;">
            <img src="${billHeaderBase64}" alt="Header" style="height:120px;object-fit:contain;margin-left:2px;margin-top:2px;max-width:80%;" />
          <div style="text-align:right;font-size:12px;margin-top:2px;margin-right:2px;">
            <div style="font-weight:bold;">SUBJECT TO PALGHAR JURISDICTION</div>
            <div>Daily Part Load Service to -<br />Tarapur, Bhiwandi, Palghar,<br />Vashi, Taloja, Kolgoan Genises</div>
            <div style="border:1px solid #ef4444;color:#ef4444;padding:1px 4px;display:inline-block;margin-top:2px;font-size:12px;">MEMO COPY</div>
          </div>
        </div>
        
        <!-- Address Section positioned below company name -->
  <div style="margin: 2px 0 4px 10px; font-size:11px; font-weight:500; color:#000; line-height:1.2;">
          <div style="margin-bottom:2px;">
            <span style="font-weight:bold; color:#dc2626;">TARAPUR:</span>Plot No. W - 4, Camlin Naka, MIDC, Tarapur. M.: 9823364283 / 7276272828
          </div>
          <div>
            <span style="font-weight:bold; color:#dc2626;">BHIWANDI:</span>Godown No. A-2, Gali No 2, Opp Capital Roadlines, Khandagale Estate,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Puma Village, Bhiwandi. M.: 9222161259 / 9168027868
          </div>
        </div>
        
  <div style="border:1px solid #000;margin:0;background:#fff;width:100%;border-bottom:none;">
          <div style="display:flex;flex-direction:row;">
            <div style="width:50%;padding:4px 2px 4px 4px;font-size:14px;">
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">MEMO No. TPR</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.memo_number || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Lorry No.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.lorry_no || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Driver's Name</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.driver_name || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Contact No.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.ac_no || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Address</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.address || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:64px;">From</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.from_location || ''}</span><span style="font-weight:bold;width:32px;margin-left:8px;">To</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.to_location || ''}</span></div>
            </div>
            <div style="width:50%;padding:4px 4px 4px 4px;font-size:14px;">
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Lorry Hire Rs.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.lorry_hire || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Advance Rs.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.advance || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Hamali</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.hamali || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Balance</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.balance || ''}</span><span style="font-weight:bold;width:64px;margin-left:8px;">Payable at</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.payable_at || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Broker</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.broker || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Date</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${formatDate(memo.memo_date) || ''}</span></div>
            </div>
          </div>
          <div style="display:flex;flex-direction:row;padding:0 12px 4px 12px;">
            <span style="font-weight:bold;width:80px;">Remarks:</span>
            <span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.remarks || ''}</span>
          </div>
          <div style="height:12px;"></div>
          <div style="height:8px;"></div>
        <!-- LR No. Table nested inside memo details box -->
  <table style="width:100%;border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-top:none;font-size:14px;border-collapse:collapse;margin:8px 0 0 0;padding:0;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="border:1px solid #000;padding:2px 4px;">L.R. No.</th>
                <th style="border:1px solid #000;padding:2px 4px;">Articles</th>
                <th style="border:1px solid #000;padding:2px 4px;">Consignor</th>
                <th style="border:1px solid #000;padding:2px 4px;">Consignee</th>
                <th style="border:1px solid #000;padding:2px 4px;">Kgs.</th>
                <th style="border:1px solid #000;padding:2px 4px;">Freight</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="6" style="height:12px;border:none;padding:0;"></td></tr>
              ${(memo.tableData && memo.tableData.length > 0)
                ? memo.tableData.map(row => `
                  <tr>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.lr_no || ''}</td>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.articles || ''}</td>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.consignor || ''}</td>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.consignee || ''}</td>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.kgs || ''}</td>
                    <td style="border:1px solid #000;padding:2px 4px;">${row.freight || ''}</td>
                  </tr>
                `).join('')
                : `<tr><td style='border:1px solid #000;padding:2px 4px;text-align:center;' colspan='6'>No rows</td></tr>`}
            </tbody>
          </table>
        </div>
        <div style="display:flex;flex-direction:row;justify-content:flex-end;margin-top:32px;margin-bottom:8px;margin-right:32px;">
          <div style="text-align:center;">
            <div style="margin-bottom:32px;">For SHREE DATTAGURU ROADLINES</div>
            <div style="border-top:1px solid #000;width:160px;margin:0 auto;padding-top:4px;font-size:12px;">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default memoPrintTemplate;
