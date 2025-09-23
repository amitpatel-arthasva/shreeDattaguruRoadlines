import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../common/ToastSystem';
import { useNavigate } from 'react-router-dom';
import BillHeader from '../../assets/images/billHeader.png';
import memoService from '../../services/memoService';
import lorryReceiptService from '../../services/lorryReceiptService';

const MemoFormPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  // State for memo form data
  const [formData, setFormData] = useState({
    memo_number: '',
    memo_date: '',
    lr_number: '',
    lorry_hire: '',
    lorry_no: '',
    driver_name: '',
    ac_no: '',
    address: '',
    from_location: '',
    advance_rs: '',
    hamali: '',
    balance: '',
    broker: '',
    to_location: '',
    payable_at: '',
    consignorName: '',
    consigneeName: ''
  });

  // State for LR dropdown
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [isLoadingLRs, setIsLoadingLRs] = useState(true);

  // State for table rows
  const [tableRows, setTableRows] = useState([
    {
      id: 1,
      lr_no: '',
      articles: '',
      consignor: '',
      consignee: '',
      kgs: '',
      freight: ''
    }
  ]);

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
      setLorryReceipts([]);
    } finally {
      setIsLoadingLRs(false);
    }
  }, []);

  // Load lorry receipts on component mount
  useEffect(() => {
    loadLorryReceipts();
    generateMemoNumber();
  }, [loadLorryReceipts]);

  // Generate memo number
  const generateMemoNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({
      ...prev,
      memo_number: `TRP-${timestamp}`,
      memo_date: new Date().toISOString().split('T')[0]
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "ac_no") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "lorry_no") {
      // Progressive typing regex: allows partial input but max 4 digits at the end
      const regex = /^[A-Z]{0,2}\s?\d{0,2}\s?[A-Z]{0,2}\s?\d{0,4}$/i;
      if (regex.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add new table row
  const addTableRow = () => {
    const newRow = {
      id: tableRows.length + 1,
      lr_no: '',
      articles: '',
      consignor: '',
      consignee: '',
      kgs: '',
      freight: ''
    };
    setTableRows([...tableRows, newRow]);
  };

  // Update table row
  const updateTableRow = (rowId, field, value) => {
    setTableRows(prev => prev.map(row =>
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  // Select LR for table row
  const selectLRForRow = (rowId, lr) => {
    setTableRows(prev => prev.map(row =>
      row.id === rowId ? {
        ...row,
        lr_no: lr.lorryReceiptNumber || lr.cn_number || lr.lr_number || 'N/A',
        consignor: lr.consignor?.consignorName || lr.consignor_name || 'N/A',
        consignee: lr.consignee?.consigneeName || lr.consignee_name || 'N/A'
      } : row
    ));
  };

  // Remove table row
  const removeTableRow = (rowId) => {
    if (tableRows.length > 1) {
      setTableRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const requiredFields = {
      memo_number: 'Memo number is required',
      memo_date: 'Memo date is required',
      lorry_no: 'Lorry number is required',
      driver_name: 'Driver name is required',
      from_location: 'From location is required',
      to_location: 'To location is required',
      lorry_hire: 'Lorry hire amount is required'
    };

    const errors = {};
    let hasErrors = false;

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      const value = typeof formData[field] === 'string' ? formData[field].trim() : formData[field];
      if (value === undefined || value === null || value === '') {
        errors[field] = requiredFields[field];
        hasErrors = true;
      }
    });

    // Validate table data
    if (tableRows.length === 0 || tableRows.every(row => !row.lr_no && !row.articles)) {
      hasErrors = true;
    }

    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields first
    if (!validateRequiredFields()) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    try {
      const memoData = {
        memo_number: formData.memo_number,
        memo_date: formData.memo_date,
        lorry_hire: formData.lorry_hire,
        lorry_no: formData.lorry_no,
        driver_name: formData.driver_name,
        ac_no: formData.ac_no,
        address: formData.address,
        from_location: formData.from_location,
        advance_rs: formData.advance_rs,
        hamali: formData.hamali,
        balance: formData.balance,
        broker: formData.broker,
        to_location: formData.to_location,
        payable_at: formData.payable_at,
        table_data: tableRows
      };

      const response = await memoService.createMemo(memoData);

      if (response.success) {
        toast.success('Memo created successfully!');
        // Navigate to /memos and pass new memo ID via location state
        navigate('/memos', { state: { newMemoId: response.data.id } });
      } else {
        console.error('Memo creation failed:', response);
        alert(`Error creating memo: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      alert(`Error creating memo: ${error.message || error}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Control Buttons - Hidden in Print */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded hover:from-orange-500 hover:to-red-500"
            >
              Print
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded hover:from-orange-500 hover:to-red-500"
            >
              Create Memo
            </button>
          </div>
        </div>




        <form onSubmit={handleSubmit} className="memo-form">
          <div className="container bg-white">

            {/* Memo Details Section */}
            <div className="row-container">
              <table className="left-table">
                <tbody>
                  <tr>
                    <td className="left-cell">
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">MEMO No. TPR</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="memo_number"
                              value={formData.memo_number.replace('TRP-', '')}
                              onChange={(e) => setFormData(prev => ({ ...prev, memo_number: `TRP-${e.target.value}` }))}
                              className="form-input font-bold"
                              placeholder="001"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Lorry No.</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="lorry_no"
                              value={formData.lorry_no}
                              onChange={handleInputChange}
                              className="form-input uppercase"
                              placeholder="MH 12 AB 1234"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Driver's Name</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="driver_name"
                              value={formData.driver_name}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Full name"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Contact No.</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="ac_no"
                              value={formData.ac_no}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Contact number"
                              maxLength={10}
                              pattern='[0-9]{10}'
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Address</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Full address"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <strong className="mr-2 whitespace-nowrap">From</strong>
                        <div className="w-1/2">
                          <div className="input-container">
                            <input
                              type="text"
                              name="from_location"
                              value={formData.from_location}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Origin"
                              required
                            />
                          </div>
                        </div>
                        <strong className="mr-2 ml-4 whitespace-nowrap">To</strong>
                        <div className="w-1/2">
                          <div className="input-container">
                            <input
                              type="text"
                              name="to_location"
                              value={formData.to_location}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Destination"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="right-table">
                <tbody>
                  <tr>
                    <td className="left-cell">
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Lorry Hire Rs.</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="lorry_hire"
                              value={formData.lorry_hire}
                              onChange={handleInputChange}
                              className="form-input text-right"
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Advance Rs.</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="advance_rs"
                              value={formData.advance_rs}
                              onChange={handleInputChange}
                              className="form-input text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Hamali</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="hamali"
                              value={formData.hamali}
                              onChange={handleInputChange}
                              className="form-input text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Balance</strong>
                        <div className="w-1/2">
                          <div className="input-container">
                            <input
                              type="text"
                              name="balance"
                              value={formData.balance}
                              onChange={handleInputChange}
                              className="form-input text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <strong className="mr-2 ml-2 whitespace-nowrap">Payable at</strong>
                        <div className="w-1/2">
                          <div className="input-container">
                            <input
                              type="text"
                              name="payable_at"
                              value={formData.payable_at || ''}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Location"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Broker</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="text"
                              name="broker"
                              value={formData.broker}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Broker name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <strong className="mr-2 whitespace-nowrap">Date</strong>
                        <div className="w-full">
                          <div className="input-container w-full">
                            <input
                              type="date"
                              name="memo_date"
                              value={formData.memo_date}
                              onChange={handleInputChange}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Items Table Section - Lorry Receipt Style */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>L.R. No.</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Articles</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Consignor</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Consignee</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Kgs.</th>
                  <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Freight</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    row={row}
                    index={index}
                    lorryReceipts={lorryReceipts}
                    isLoadingLRs={isLoadingLRs}
                    updateTableRow={updateTableRow}
                    selectLRForRow={selectLRForRow}
                    removeTableRow={removeTableRow}
                    isLastRow={index === tableRows.length - 1}
                  />
                ))}
                {/* Total Row */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>Total:</td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontSize: '11px' }}>
                    <div className="input-container inline-block">
                      <span className="form-input-rate" style={{ width: '80px', textAlign: 'right' }}></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Add Row Button */}
            <div className="mt-1 print:hidden" style={{ marginLeft: '20px' }}>
              <button
                type="button"
                onClick={addTableRow}
                className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700"
              >
                + Add Row
              </button>
            </div>

            {/* Signature Section */}
            <div style={{ marginTop: '30px', textAlign: 'right', marginRight: '20px' }}>
              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '40px' }}>
                  For SHREE DATTAGURU ROADLINES
                </div>
                <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '5px' }}></div>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Authorised Signatory</div>
              </div>
            </div>
          </div>
        </form>

        {/* Lorry Receipt Form Styles with Print Layout */}
        <style jsx="true">{`        
          .container {
            width: 1000px;
            border: 1px solid #000;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0 auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }

          td, th {
            border: 1px solid #000;
            padding: 4px 6px;
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
          }

          .right-table {
            flex: 1;
            border-collapse: collapse;
          }

          .left-table td, .right-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
          }        
          .left-cell {
            height: 100px;
            vertical-align: top;
            padding: 6px;
          }

          .input-container {
            cursor: text;
            min-height: 20px;
            padding: 2px 2px;
            margin: 1px 0;
            border-radius: 2px;
            transition: background-color 0.2s ease;
          }

          .input-container:hover {
            background: #F3F4F6;
          }        

          .input-container:focus-within {
            background: #F9FAFB;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
          }

          .input-container.inline-block {
            display: inline-block;
            margin: 0 2px;
            padding: 2px 4px;
            min-height: auto;
            border-radius: 4px;
          }        

          .form-input {
            width: 100%;
            border: none;
            border-bottom: 1px solid #000;
            margin-top: 2px;
            padding: 2px 2px;
            font-size: 12px;
            background: transparent;
            min-height: 16px;
          }

          .form-input:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 1px;
            background: #F9FAFB;
          }

          .form-input:disabled {
            background: #F3F4F6 !important;
            color: #6B7280;
            cursor: not-allowed;
          }

          .form-input-rate {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 11px;
            text-align: center;
            padding: 2px 4px;
            min-height: 16px;
            border-bottom: 1px solid #ccc;
          }

          .form-input-rate:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 1px;
            background: #F9FAFB;
          }

          .form-input-nos {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 11px;
            padding: 2px 4px;
            min-height: 18px;
            border-bottom: 1px solid #ccc;
          }

          .form-input-nos:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 1px;
            background: #F9FAFB;
          }

          .form-input-particulars {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 11px;
            padding: 2px 4px;
            min-height: 18px;
            border-bottom: 1px solid #ccc;
          }

          .form-input-particulars:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 1px;
            background: #F9FAFB;
          }

          .memo-form .container {
            max-width: none;
          }

          @media print {
            .min-h-screen {
              min-height: auto;
            }
            
            .max-w-none {
              max-width: none;
            }
            
            .flex.justify-between {
              display: none;
            }
            
            .container {
              border: 2px solid #000;
              width: 100%;
              max-width: 1400px;
            }

            .print\\:hidden {
              display: none !important;
            }

            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            .bg-gray-100 {
              background: white !important;
            }

            .shadow-xl {
              box-shadow: none !important;
            }

            .rounded {
              border-radius: 0 !important;
            }

            .p-4 {
              padding: 0 !important;
            }

            .mb-4 {
              margin-bottom: 0 !important;
            }

            .mx-4 {
              margin-left: 0 !important;
              margin-right: 0 !important;
            }

            table, th, td {
              border: 1px solid #000 !important;
              border-collapse: collapse !important;
            }

            .text-red-600 {
              color: #dc2626 !important;
            }

            .border-red-600 {
              border-color: #dc2626 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// TableRow Component for the memo table with enhanced searchable dropdown
const TableRow = ({ row, lorryReceipts, isLoadingLRs, updateTableRow, selectLRForRow, removeTableRow, isLastRow }) => {
  const [showLRDropdown, setShowLRDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLRs, setFilteredLRs] = useState([]);

  // Filter lorry receipts based on search term (same logic as lorry receipt page)
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

      // Limit to 25 results for better performance but show more data
      setFilteredLRs(filtered.slice(0, 25));
    }
  }, [searchTerm, lorryReceipts, showLRDropdown]);

  const selectLR = (lr) => {
    selectLRForRow(row.id, lr);
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
      if (!e.target.closest(`#lr-dropdown-${row.id}`)) {
        setShowLRDropdown(false);
        setSearchTerm('');
      }
    };

    if (showLRDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLRDropdown, row.id]);

  return (
    <tr>
      {/* L.R. No. with Wide Searchable Dropdown */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top', position: 'relative' }}>
        <div style={{ position: 'relative' }} id={`lr-dropdown-${row.id}`}>
          <button
            type="button"
            onClick={openDropdown}
            disabled={isLoadingLRs}
            className="form-input-nos"
            style={{
              width: '100%',
              textAlign: 'left',
              cursor: isLoadingLRs ? 'not-allowed' : 'pointer',
              background: 'white',
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
              minWidth: '450px', // Make dropdown much wider
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
                  placeholder="🔍 Search by LR No, Consignor, Consignee, Truck No..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  autoFocus
                />
              </div>

              {/* Clear Selection Option */}
              <div
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '11px',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 'bold'
                }}
                onClick={() => {
                  updateTableRow(row.id, 'lr_no', '');
                  updateTableRow(row.id, 'consignor', '');
                  updateTableRow(row.id, 'consignee', '');
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

              {/* Lorry Receipt Options */}
              {filteredLRs.map((lr) => (
                <div
                  key={lr.id}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '11px',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => selectLR(lr)}
                  onMouseEnter={(e) => e.target.style.background = '#eff6ff'}
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
                    }}>{lr.consignor?.consignorName || lr.consignor_name || 'N/A'}</span>
                    <span style={{
                      margin: '0 6px',
                      color: '#6b7280',
                      fontWeight: 'bold'
                    }}>→</span>
                    <span style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{lr.consignee?.consigneeName || lr.consignee_name || 'N/A'}</span>
                  </div>

                  {/* Additional Info */}
                  <div style={{
                    color: '#6b7280',
                    fontSize: '9px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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

      {/* Articles */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
        <div className="input-container">
          <input
            type="text"
            value={row.articles}
            onChange={(e) => updateTableRow(row.id, 'articles', e.target.value)}
            className="form-input-particulars"
            placeholder=""
          />
        </div>
      </td>

      {/* Consignor (Auto-filled) */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
        <div className="input-container">
          <input
            type="text"
            value={row.consignor}
            onChange={(e) => updateTableRow(row.id, 'consignor', e.target.value)}
            className="form-input-particulars"
            placeholder=""
            style={{ background: '#f9f9f9' }}
          />
        </div>
      </td>

      {/* Consignee (Auto-filled) */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
        <div className="input-container">
          <input
            type="text"
            value={row.consignee}
            onChange={(e) => updateTableRow(row.id, 'consignee', e.target.value)}
            className="form-input-particulars"
            placeholder=""
            style={{ background: '#f9f9f9' }}
          />
        </div>
      </td>

      {/* Kgs */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
        <div className="input-container">
          <input
            type="text"
            value={row.kgs}
            onChange={(e) => updateTableRow(row.id, 'kgs', e.target.value)}
            className="form-input-rate"
            placeholder=""
            style={{ textAlign: 'right' }}
          />
        </div>
      </td>

      {/* Freight */}
      <td style={{ border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="input-container" style={{ flex: 1 }}>
            <input
              type="text"
              value={row.freight}
              onChange={(e) => updateTableRow(row.id, 'freight', e.target.value)}
              className="form-input-rate"
              placeholder=""
              style={{ textAlign: 'right' }}
            />
          </div>
          {!isLastRow && (
            <button
              type="button"
              onClick={() => removeTableRow(row.id)}
              className="print:hidden"
              style={{
                marginLeft: '4px',
                color: '#dc2626',
                fontSize: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove row"
            >
              ×
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default MemoFormPage;
