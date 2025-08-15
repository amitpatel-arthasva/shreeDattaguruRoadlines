// Memo Print Template for Electron PDF generation
// Returns HTML string for the memo in the same format as src/templates/memoPrintTemplate.js
import { getBillHeaderAsBase64 } from './imageUtils.js';

function memoPrintTemplate(memo) {
  if (!memo) return '';
  const billHeaderBase64 = getBillHeaderAsBase64();
  return `
    <div style="background:#f3f4f6;padding:32px 8px;min-height:900px;display:flex;flex-direction:column;align-items:center;">
      <div style="width:90%;max-width:900px;background:#fff;padding:0;">
        <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:8px;">
            <img src="${billHeaderBase64}" alt="Header" style="height:120px;object-fit:contain;margin-left:8px;margin-top:8px;max-width:70%;" />
          <div style="text-align:right;font-size:12px;margin-top:8px;margin-right:8px;">
            <div style="font-weight:bold;">SUBJECT TO PALGHAR JURISDICTION</div>
            <div>Daily Part Load Service to -<br />Tarapur, Bhiwandi, Palghar,<br />Vashi, Taloja, Kolgoan Genises</div>
            <div style="border:1px solid #ef4444;color:#ef4444;padding:2px 8px;display:inline-block;margin-top:4px;font-size:12px;">MEMO COPY</div>
          </div>
        </div>
        <div style="border:1px solid #000;margin:0 8px 8px 8px;background:#fff;">
          <div style="display:flex;flex-direction:row;">
            <div style="width:50%;padding:12px 4px 12px 12px;font-size:14px;">
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">MEMO No. TPR</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.memo_number || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Lorry No.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.lorry_no || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Driver's Name</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.driver_name || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Ac No.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.ac_no || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Address</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.address || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:64px;">From</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.from_location || ''}</span><span style="font-weight:bold;width:32px;margin-left:8px;">To</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.to_location || ''}</span></div>
            </div>
            <div style="width:50%;padding:12px 12px 12px 4px;font-size:14px;">
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Lorry Hire Rs.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.lorry_hire || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Advance Rs.</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.advance || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Hamali</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.hamali || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Balance</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.balance || ''}</span><span style="font-weight:bold;width:64px;margin-left:8px;">Payable at</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.payable_at || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:128px;">Broker</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.broker || ''}</span></div>
              <div style="display:flex;margin-bottom:4px;"><span style="font-weight:bold;width:64px;">Date</span><span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.memo_date || ''}</span></div>
            </div>
          </div>
          <div style="display:flex;flex-direction:row;padding:0 12px 4px 12px;">
            <span style="font-weight:bold;width:80px;">Remarks:</span>
            <span style="border-bottom:1px solid #000;flex:1;margin-left:4px;">${memo.remarks || ''}</span>
          </div>
        </div>
        <div style="margin:0 8px;">
          <table style="width:100%;border:1px solid #000;font-size:14px;border-collapse:collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="border:1px solid #000;padding:4px 8px;">L.R. No.</th>
                <th style="border:1px solid #000;padding:4px 8px;">Articles</th>
                <th style="border:1px solid #000;padding:4px 8px;">Consignor</th>
                <th style="border:1px solid #000;padding:4px 8px;">Consignee</th>
                <th style="border:1px solid #000;padding:4px 8px;">Kgs.</th>
                <th style="border:1px solid #000;padding:4px 8px;">Freight</th>
              </tr>
            </thead>
            <tbody>
              ${(memo.tableData && memo.tableData.length > 0)
                ? memo.tableData.map(row => `
                  <tr>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.lr_no || ''}</td>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.articles || ''}</td>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.consignor || ''}</td>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.consignee || ''}</td>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.kgs || ''}</td>
                    <td style="border:1px solid #000;padding:4px 8px;">${row.freight || ''}</td>
                  </tr>
                `).join('')
                : `<tr><td style='border:1px solid #000;padding:4px 8px;text-align:center;' colspan='6'>No rows</td></tr>`}
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
