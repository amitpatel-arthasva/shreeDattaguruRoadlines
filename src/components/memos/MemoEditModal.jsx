
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BillHeader from '../../assets/images/billHeader.png';
import lorryReceiptService from '../../services/lorryReceiptService';

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

  // State for LR dropdown
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [isLoadingLRs, setIsLoadingLRs] = useState(true);

  // Load lorry receipts from API
  const loadLorryReceipts = useCallback(async () => {
    setIsLoadingLRs(true);
    try {

      const response = await lorryReceiptService.getLorryReceipts({ limit: 1000 });

      if (response && response.success) {
        if (response.data && response.data.lorryReceipts) {
          setLorryReceipts(response.data.lorryReceipts);
        } else {
          setLorryReceipts([]);
        }
      } else {
        setLorryReceipts([]);
      }
    } catch (error) {
      console.error('💥 Exception during API call:', error);
      setLorryReceipts([]);
    } finally {
      setIsLoadingLRs(false);
    }
  }, []);

  // Load lorry receipts on component mount
  useEffect(() => {
    loadLorryReceipts();
  }, [loadLorryReceipts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableRowChange = (idx, field, value) => {
    setTableRows((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Select LR for table row
  const selectLRForRow = (rowIdx, lr) => {
    setTableRows(prev => prev.map((row, i) =>
      i === rowIdx ? {
        ...row,
        lr_no: lr.lorryReceiptNumber || lr.cn_number || lr.lr_number || 'N/A',
        consignor: lr.consignor?.consignorName || lr.consignor_name || 'N/A',
        consignee: lr.consignee?.consigneeName || lr.consignee_name || 'N/A'
      } : row
    ));
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
            <div className="w-[90%] mx-auto -mt-2 mb-6 ml-30">
              <div className="text-xs font-medium text-gray-500 leading-snug space-y-2">
                <div>
                  <span className="text-red-600 font-bold">TARAPUR:</span>
                  Plot No. W - 4, Camlin Naka, MIDC, Tarapur.
                  M.: 9823364283 / 8446665945
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
                  <div className="flex mb-1"><span className="font-bold w-32">MEMO No. TPR</span><input type="text" name="memo_number" value={form.memo_number} onChange={e => setForm(prev => ({ ...prev, memo_number: e.target.value }))} className="border-b border-black flex-1 ml-1 bg-transparent" disabled /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Lorry No.</span><input type="text" name="lorry_no" value={form.lorry_no || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Driver's Name</span><input type="text" name="driver_name" value={form.driver_name || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
                  <div className="flex mb-1"><span className="font-bold w-32">Contact No.</span><input type="text" name="ac_no" value={form.ac_no || ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" /></div>
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
                  <div className="flex mb-1"><span className="font-bold w-16">Date</span><input type="date" name="memo_date" value={form.memo_date ? form.memo_date.substring(0, 10) : ''} onChange={handleChange} className="border-b border-black flex-1 ml-1 bg-transparent" required /></div>
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
                    <TableRowEdit
                      key={idx}
                      row={row}
                      index={idx}
                      lorryReceipts={lorryReceipts}
                      isLoadingLRs={isLoadingLRs}
                      handleTableRowChange={handleTableRowChange}
                      selectLRForRow={selectLRForRow}
                      removeTableRow={removeTableRow}
                    />
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

// TableRowEdit component with LR selection dropdown
const TableRowEdit = ({ row, index, lorryReceipts, isLoadingLRs, handleTableRowChange, selectLRForRow, removeTableRow }) => {
  const [showLRDropdown, setShowLRDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLRs, setFilteredLRs] = useState([]);

  // Filter lorry receipts based on search term
  useEffect(() => {
    if (showLRDropdown) {
      let filtered = lorryReceipts;

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = lorryReceipts.filter(lr => {
          return (
            // Search by CN/LR number (new structure)
            (lr.lorryReceiptNumber && lr.lorryReceiptNumber.toLowerCase().includes(searchLower)) ||
            // Search by CN number (fallback)
            (lr.cn_number && lr.cn_number.toLowerCase().includes(searchLower)) ||
            // Search by LR number (fallback)
            (lr.lr_number && lr.lr_number.toLowerCase().includes(searchLower)) ||
            // Search by consignor name (new structure)
            (lr.consignor?.consignorName && lr.consignor.consignorName.toLowerCase().includes(searchLower)) ||
            // Search by consignor name (fallback)
            (lr.consignor_name && lr.consignor_name.toLowerCase().includes(searchLower)) ||
            // Search by consignee name (new structure)
            (lr.consignee?.consigneeName && lr.consignee.consigneeName.toLowerCase().includes(searchLower)) ||
            // Search by consignee name (fallback)
            (lr.consignee_name && lr.consignee_name.toLowerCase().includes(searchLower)) ||
            // Search by truck number (new structure)
            (lr.truckNumber && lr.truckNumber.toLowerCase().includes(searchLower)) ||
            // Search by truck number (fallback)
            (lr.truck_reg_number && lr.truck_reg_number.toLowerCase().includes(searchLower)) ||
            (lr.truck_number && lr.truck_number.toLowerCase().includes(searchLower))
          );
        });
      }

      // Limit to 25 results for better performance
      setFilteredLRs(filtered.slice(0, 25));
    }
  }, [searchTerm, lorryReceipts, showLRDropdown]);

  const selectLR = (lr) => {
    selectLRForRow(index, lr);
    setShowLRDropdown(false);
    setSearchTerm('');
  };

  const openDropdown = () => {
    if (!isLoadingLRs) {

      setShowLRDropdown(true);
      setFilteredLRs(lorryReceipts.slice(0, 25)); // Show first 25 items initially
    } else {
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`#lr-dropdown-edit-${index}`)) {
        setShowLRDropdown(false);
        setSearchTerm('');
      }
    };

    if (showLRDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLRDropdown, index]);

  return (
    <tr>
      {/* L.R. No. with Searchable Dropdown */}
      <td className="border border-black px-2 py-1" style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }} id={`lr-dropdown-edit-${index}`}>
          <button
            type="button"
            onClick={openDropdown}
            disabled={isLoadingLRs}
            style={{
              width: '100%',
              textAlign: 'left',
              cursor: isLoadingLRs ? 'not-allowed' : 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #ccc',
              fontSize: '11px',
              padding: '4px 6px',
              opacity: isLoadingLRs ? 0.6 : 1
            }}
          >
            {isLoadingLRs ? 'Loading...' : (row.lr_no || 'Select LR...')}
            <span style={{ float: 'right' }}>{isLoadingLRs ? '⏳' : '▼'}</span>
          </button>

          {showLRDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              minWidth: '450px', // Make dropdown wider
              background: 'white',
              border: '2px solid #000',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
              borderRadius: '4px'
            }}>
              {/* Search Input */}
              <div style={{
                padding: '12px',
                borderBottom: '2px solid #e5e7eb',
                background: '#f8fafc',
                borderRadius: '4px 4px 0 0'
              }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Search by LR No, Consignor, Consignee..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Clear Selection Option */}
              <div
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontStyle: 'italic',
                  color: '#dc2626',
                  background: '#fef3c7',
                  borderBottom: '1px solid #e5e7eb'
                }}
                onClick={() => {
                  handleTableRowChange(index, 'lr_no', '');
                  handleTableRowChange(index, 'consignor', '');
                  handleTableRowChange(index, 'consignee', '');
                  setShowLRDropdown(false);
                  setSearchTerm('');
                }}
                onMouseEnter={(e) => e.target.style.background = '#fde68a'}
                onMouseLeave={(e) => e.target.style.background = '#fef3c7'}
              >
                <span style={{ marginRight: '8px' }}>❌</span>
                Clear Selection
              </div>

              {/* Loading State */}
              {isLoadingLRs && (
                <div style={{
                  padding: '20px 12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Loading lorry receipts...
                </div>
              )}

              {/* No LRs Available */}
              {!isLoadingLRs && lorryReceipts.length === 0 && (
                <div style={{
                  padding: '20px 12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#dc2626',
                  fontStyle: 'italic'
                }}>
                  <span style={{ marginRight: '8px' }}>⚠️</span>
                  No lorry receipts available
                </div>
              )}

              {/* No Results State */}
              {!isLoadingLRs && lorryReceipts.length > 0 && filteredLRs.length === 0 && searchTerm && (
                <div style={{
                  padding: '20px 12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <span style={{ marginRight: '8px' }}>🔍</span>
                  No results found for "{searchTerm}"
                </div>
              )}

              {/* LR Options */}
              {filteredLRs.map((lr, lrIndex) => (
                <div
                  key={lrIndex}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    borderBottom: lrIndex < filteredLRs.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: 'white'
                  }}
                  onClick={() => selectLR(lr)}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  {/* LR Number - Primary */}
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    color: '#1d4ed8',
                    fontSize: '12px'
                  }}>
                    <span style={{ marginRight: '8px' }}>📋</span>
                    {lr.lorryReceiptNumber || lr.cn_number || lr.lr_number || 'N/A'}
                  </div>

                  {/* Consignor to Consignee */}
                  <div style={{
                    color: '#374151',
                    fontSize: '10px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      minWidth: '45px',
                      marginRight: '6px'
                    }}>From:</span>
                    <span style={{
                      flex: 1,
                      marginRight: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {lr.consignor?.consignorName || lr.consignor_name || 'N/A'}
                    </span>
                  </div>

                  <div style={{
                    color: '#374151',
                    fontSize: '10px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      minWidth: '45px',
                      marginRight: '6px'
                    }}>To:</span>
                    <span style={{
                      flex: 1,
                      marginRight: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {lr.consignee?.consigneeName || lr.consignee_name || 'N/A'}
                    </span>
                  </div>

                  {/* Additional Info */}
                  <div style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <span>
                      {lr.truckNumber || lr.truck_reg_number || lr.truck_number ? (
                        <>🚛 {lr.truckNumber || lr.truck_reg_number || lr.truck_number}</>
                      ) : ''}
                    </span>
                    <span>
                      {lr.lr_date ? (
                        <>📅 {new Date(lr.lr_date).toLocaleDateString()}</>
                      ) : ''}
                    </span>
                  </div>
                </div>
              ))}

              {/* Show more indicator */}
              {!searchTerm && lorryReceipts.length > 25 && filteredLRs.length === 25 && (
                <div style={{
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontSize: '10px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  Showing first 25 results of {lorryReceipts.length} total. Use search to find specific LR.
                </div>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Other table cells remain as inputs */}
      <td className="border border-black px-2 py-1">
        <input
          type="text"
          value={row.articles || ''}
          onChange={e => handleTableRowChange(index, 'articles', e.target.value)}
          className="bg-transparent border-b border-black w-full"
        />
      </td>
      <td className="border border-black px-2 py-1">
        <input
          type="text"
          value={row.consignor || ''}
          onChange={e => handleTableRowChange(index, 'consignor', e.target.value)}
          className="bg-transparent border-b border-black w-full"
        />
      </td>
      <td className="border border-black px-2 py-1">
        <input
          type="text"
          value={row.consignee || ''}
          onChange={e => handleTableRowChange(index, 'consignee', e.target.value)}
          className="bg-transparent border-b border-black w-full"
        />
      </td>
      <td className="border border-black px-2 py-1">
        <input
          type="text"
          value={row.kgs || ''}
          onChange={e => handleTableRowChange(index, 'kgs', e.target.value)}
          className="bg-transparent border-b border-black w-full"
        />
      </td>
      <td className="border border-black px-2 py-1">
        <input
          type="text"
          value={row.freight || ''}
          onChange={e => handleTableRowChange(index, 'freight', e.target.value)}
          className="bg-transparent border-b border-black w-full"
        />
      </td>
      <td className="border border-black px-2 py-1 text-center">
        <button
          type="button"
          onClick={() => removeTableRow(index)}
          className="text-red-500 font-bold"
        >
          X
        </button>
      </td>
    </tr>
  );
};

export default MemoEditModal;
