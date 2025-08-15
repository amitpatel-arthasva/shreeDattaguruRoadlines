
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BillHeader from '../../assets/images/billHeader.png';

const MemoEditModal = ({ memo, onClose, onSave }) => {
  if (!memo) return null;
  // Always extract tableData the same way as MemoPrintTemplate
  let tableData = [];
  if (Array.isArray(memo.tableData) && memo.tableData.length > 0) {
    tableData = memo.tableData;
  } else if (typeof memo.table_data === 'string') {
    try {
      tableData = JSON.parse(memo.table_data);
    } catch {
      tableData = [];
    }
  } else if (Array.isArray(memo.table_data)) {
    tableData = memo.table_data;
  }
  if (!Array.isArray(tableData) || tableData.length === 0) {
    tableData = [{ lr_no: '', articles: '', consignor: '', consignee: '', kgs: '', freight: '' }];
  }
  const [form, setForm] = useState({ ...memo });
  const [tableRows, setTableRows] = useState(tableData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableRowChange = (idx, field, value) => {
    setTableRows((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const addTableRow = () => {
    setTableRows((prev) => [
      ...prev,
      { lr_no: '', articles: '', consignor: '', consignee: '', kgs: '', freight: '' }
    ]);
  };

  const removeTableRow = (idx) => {
    if (tableRows.length > 1) {
      setTableRows((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Explicitly include all fields needed for update
    onSave({
      id: form.id,
      memo_number: form.memo_number,
      memo_date: form.memo_date,
      lorry_no: form.lorry_no,
      driver_name: form.driver_name,
      ac_no: form.ac_no,
      address: form.address,
      from_location: form.from_location,
      to_location: form.to_location,
      lorry_hire: form.lorry_hire,
      advance: form.advance,
      hamali: form.hamali,
      balance: form.balance,
      payable_at: form.payable_at,
      broker: form.broker,
      remarks: form.remarks,
  table_data: tableRows
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-[95vw]" className="min-h-[90vh]">
      <form onSubmit={handleSubmit} className="memo-form">
        <div className="memo-print-template bg-white py-4 px-2 min-h-[900px] flex flex-col items-center">
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
            {/* Main Memo Box */}
            <div className="border border-black mx-2 mb-2 bg-white">
              <div className="flex flex-row">
                {/* Left Column */}
                <div className="w-1/2 p-3 pr-1 text-sm">
                  <div className="flex mb-1"><span className="font-bold w-32">MEMO No. TPR</span><input type="text" name="memo_number" value={form.memo_number} onChange={e => setForm(prev => ({ ...prev, memo_number: e.target.value }))} className="border-b border-black flex-1 ml-1 bg-transparent" disabled /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Lorry No.</span><input type="text" name="lorry_no" value={form.lorry_no || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Driver's Name</span><input type="text" name="driver_name" value={form.driver_name || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Ac No.</span><input type="text" name="ac_no" value={form.ac_no || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Address</span><input type="text" name="address" value={form.address || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-16">From</span><input type="text" name="from_location" value={form.from_location || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /><span className="font-bold w-8 ml-2">To</span><input type="text" name="to_location" value={form.to_location || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                </div>
                {/* Right Column */}
                <div className="w-1/2 p-3 pl-1 text-sm">
                  <div className="flex mb-1"><span className="font-bold w-32">Lorry Hire Rs.</span><input type="text" name="lorry_hire" value={form.lorry_hire || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent text-right" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Advance Rs.</span><input type="text" name="advance" value={form.advance || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent text-right" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Hamali</span><input type="text" name="hamali" value={form.hamali || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent text-right" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Balance</span><input type="text" name="balance" value={form.balance || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent text-right" /><span className="font-bold w-16 ml-2">Payable at</span><input type="text" name="payable_at" value={form.payable_at || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Broker</span><input type="text" name="broker" value={form.broker || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-16">Date</span><input type="date" name="memo_date" value={form.memo_date ? form.memo_date.substring(0,10) : ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" required /></div>
                </div>
              </div>
              {/* Remarks */}
              <div className="flex flex-row px-3 pb-1">
                <span className="font-bold w-20">Remarks:</span>
                <input type="text" name="remarks" value={form.remarks || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" />
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
                    <th className="border border-black px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.lr_no || ''} onChange={e => handleTableRowChange(idx, 'lr_no', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.articles || ''} onChange={e => handleTableRowChange(idx, 'articles', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.consignor || ''} onChange={e => handleTableRowChange(idx, 'consignor', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.consignee || ''} onChange={e => handleTableRowChange(idx, 'consignee', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.kgs || ''} onChange={e => handleTableRowChange(idx, 'kgs', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1"><input type="text" value={row.freight || ''} onChange={e => handleTableRowChange(idx, 'freight', e.target.value)} className="bg-transparent border-b border-black w-full" /></td>
                      <td className="border border-black px-2 py-1 text-center"><button type="button" onClick={() => removeTableRow(idx)} className="text-red-500 font-bold">X</button></td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="text-center py-2">
                      <button type="button" onClick={addTableRow} className="bg-blue-500 text-white px-2 py-1 rounded">Add Row</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Signature Section (view only, not editable) */}
            <div className="flex flex-row justify-end mt-8 mb-2 mr-8">
              <div className="text-center">
                <div className="mb-8">For SHREE DATTAGURU ROADLINES</div>
                <div className="border-t border-black w-40 mx-auto pt-1 text-xs">Authorised Signatory</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 w-[90%] max-w-4xl">
            <Button text="Cancel" type="button" onClick={onClose} className="bg-gray-300 text-gray-700" />
            <Button text="Save" type="submit" className="bg-primary-400 text-white" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MemoEditModal;
