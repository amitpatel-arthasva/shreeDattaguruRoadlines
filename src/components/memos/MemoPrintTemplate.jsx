import React from 'react';
import BillHeader from '../../assets/images/billHeader.png';
const MemoPrintTemplate = ({ memo }) => {
  if (!memo) return null;
  return (
    <div className="memo-print-template bg-gray-100 py-8 px-2 min-h-[900px] flex flex-col items-center">
      {/* Header Section */}
      <div className="w-[90%] max-w-4xl bg-white p-0">
        <div className="flex items-start justify-between mb-2">
          <img src={BillHeader} alt="BillHeader" className="h-28 ml-2 mt-2" />
          <div className="text-right text-xs mt-2 mr-2">
            <div className="font-bold">SUBJECT TO PALGHAR JURISDICTION</div>
            <div>Daily Part Load Service to -<br />Tarapur, Bhiwandi, Palghar,<br />Vashi, Taloja, Kolgoan Genises</div>
            <div className="border border-red-500 text-red-500 px-2 py-1 inline-block mt-1 text-xs">MEMO COPY</div>
          </div>
        </div>
        {/* 📌 Addresses */}
        <div className="w-[90%] mx-auto -mt-2 mb-6 ml-20">
          <div className="text-xs font-medium text-gray-700 leading-snug space-y-2">
            <div>
              <span className="text-red-600 font-bold">TARAPUR:</span>
              Plot No. W - 4, Camlin Naka, MIDC, Tarapur.
              M.: 9823364283 / 7276272828
            </div>
            <div>
              <span className="text-red-600 font-bold">BHIWANDI:</span>
              Godown No. A-2, Gali No 2, Opp Capital Roadlines, Khandagale Estate,<br />
              <div className="ml-20">
                Puma Village, Bhiwandi. M.: 9222161259 / 9168027868
              </div>
            </div>
          </div>
        </div>
        {/* Main Memo Box */}
        <div className="border border-black mx-2 mb-2 bg-white">
          <div className="flex flex-row">
            {/* Left Column */}
            <div className="w-1/2 p-3 pr-1 text-sm">
              <div className="flex mb-1"><span className="font-bold w-32">MEMO No. TPR</span><span className="border-b border-black flex-1 ml-1">{memo.memo_number}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Lorry No.</span><span className="border-b border-black flex-1 ml-1">{memo.lorry_no}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Driver's Name</span><span className="border-b border-black flex-1 ml-1">{memo.driver_name}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Contact No.</span><span className="border-b border-black flex-1 ml-1">{memo.ac_no}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Address</span><span className="border-b border-black flex-1 ml-1">{memo.address}</span></div>
              <div className="flex mb-1"><span className="font-bold w-16">From</span><span className="border-b border-black flex-1 ml-1">{memo.from_location}</span><span className="font-bold w-8 ml-2">To</span><span className="border-b border-black flex-1 ml-1">{memo.to_location}</span></div>
            </div>
            {/* Right Column */}
            <div className="w-1/2 p-3 pl-1 text-sm">
              <div className="flex mb-1"><span className="font-bold w-32">Lorry Hire Rs.</span><span className="border-b border-black flex-1 ml-1">{memo.lorry_hire}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Advance Rs.</span><span className="border-b border-black flex-1 ml-1">{memo.advance}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Hamali</span><span className="border-b border-black flex-1 ml-1">{memo.hamali}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Balance</span><span className="border-b border-black flex-1 ml-1">{memo.balance}</span><span className="font-bold w-16 ml-2">Payable at</span><span className="border-b border-black flex-1 ml-1">{memo.payable_at}</span></div>
              <div className="flex mb-1"><span className="font-bold w-32">Broker</span><span className="border-b border-black flex-1 ml-1">{memo.broker}</span></div>
              <div className="flex mb-1"><span className="font-bold w-16">Date</span><span className="border-b border-black flex-1 ml-1">{memo.memo_date}</span></div>
            </div>
          </div>
          {/* Remarks */}
          <div className="flex flex-row px-3 pb-1">
            <span className="font-bold w-20">Remarks:</span>
            <span className="border-b border-black flex-1 ml-1">{memo.remarks}</span>
          </div>
        </div>
        {/* Table Section */}
        <div className="mx-2">
          <table className="w-full border border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1">L.R. No.</th>
                <th className="border border-black px-2 py-1">Articles</th>
                <th className="border border-black px-2 py-1">Consignor</th>
                <th className="border border-black px-2 py-1">Consignee</th>
                <th className="border border-black px-2 py-1">Kgs.</th>
                <th className="border border-black px-2 py-1">Freight</th>
              </tr>
            </thead>
            <tbody>
              {memo.tableData && memo.tableData.length > 0 ? (
                memo.tableData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1">{row.lr_no}</td>
                    <td className="border border-black px-2 py-1">{row.articles}</td>
                    <td className="border border-black px-2 py-1">{row.consignor}</td>
                    <td className="border border-black px-2 py-1">{row.consignee}</td>
                    <td className="border border-black px-2 py-1">{row.kgs}</td>
                    <td className="border border-black px-2 py-1">{row.freight}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-black px-2 py-1 text-center" colSpan={6}>No rows</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Signature Section */}
        <div className="flex flex-row justify-end mt-8 mb-2 mr-8">
          <div className="text-center">
            <div className="mb-8">For SHREE DATTAGURU ROADLINES</div>
            <div className="border-t border-black w-40 mx-auto pt-1 text-xs">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MemoPrintTemplate;

