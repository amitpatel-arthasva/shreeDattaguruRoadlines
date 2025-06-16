import React, { useState, useEffect } from 'react';

const LorryReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    payment_type: '',
    from_location: '',
    to_location: '',
    consignor_id: '',
    consignee_id: ''
  });
  const [companies, setCompanies] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (window.electronAPI) {
        // Load companies for filter dropdown
        const companiesData = await window.electronAPI.query('SELECT * FROM companies ORDER BY name');
        setCompanies(companiesData);        // Load lorry receipts with joins - using city instead of full address for list view
        const receiptsData = await window.electronAPI.query(`
          SELECT lr.*, 
                 cons_or.name as consignor_name, 
                 COALESCE(cons_or.city, cons_or.address) as consignor_city,
                 cons_or.address as consignor_address,
                 cons_ee.name as consignee_name, 
                 COALESCE(cons_ee.city, cons_ee.address) as consignee_city,
                 cons_ee.address as consignee_address,
                 t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
                 d.name as driver_name, d.phone as driver_phone
          FROM lorry_receipts lr
          LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
          LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
          LEFT JOIN trucks t ON lr.truck_id = t.id
          LEFT JOIN drivers d ON lr.driver_id = d.id
          ORDER BY lr.lr_date DESC, lr.id DESC
        `);
        setReceipts(receiptsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      if (window.electronAPI) {        let sql = `
          SELECT lr.*, 
                 cons_or.name as consignor_name, 
                 COALESCE(cons_or.city, cons_or.address) as consignor_city,
                 cons_or.address as consignor_address,
                 cons_ee.name as consignee_name, 
                 COALESCE(cons_ee.city, cons_ee.address) as consignee_city,
                 cons_ee.address as consignee_address,
                 t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
                 d.name as driver_name, d.phone as driver_phone
          FROM lorry_receipts lr
          LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
          LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
          LEFT JOIN trucks t ON lr.truck_id = t.id
          LEFT JOIN drivers d ON lr.driver_id = d.id
          WHERE 1=1
        `;
        const params = [];

        if (filters.from_date) {
          sql += ' AND lr.lr_date >= ?';
          params.push(filters.from_date);
        }

        if (filters.to_date) {
          sql += ' AND lr.lr_date <= ?';
          params.push(filters.to_date);
        }

        if (filters.payment_type) {
          sql += ' AND lr.payment_type = ?';
          params.push(filters.payment_type);
        }

        if (filters.from_location) {
          sql += ' AND lr.from_location LIKE ?';
          params.push(`%${filters.from_location}%`);
        }

        if (filters.to_location) {
          sql += ' AND lr.to_location LIKE ?';
          params.push(`%${filters.to_location}%`);
        }

        if (filters.consignor_id) {
          sql += ' AND lr.consignor_id = ?';
          params.push(filters.consignor_id);
        }

        if (filters.consignee_id) {
          sql += ' AND lr.consignee_id = ?';
          params.push(filters.consignee_id);
        }

        sql += ' ORDER BY lr.lr_date DESC, lr.id DESC';

        const receiptsData = await window.electronAPI.query(sql, params);
        setReceipts(receiptsData);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Error applying filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      from_date: '',
      to_date: '',
      payment_type: '',
      from_location: '',
      to_location: '',
      consignor_id: '',
      consignee_id: ''
    });
    loadData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const calculateTotalAmount = (receipt) => {
    const freight = parseFloat(receipt.freight) || 0;
    const hamali = parseFloat(receipt.hamali) || 0;
    const aoc = parseFloat(receipt.aoc) || 0;
    const doorDelivery = parseFloat(receipt.door_delivery) || 0;
    const collection = parseFloat(receipt.collection) || 0;
    const serviceCharge = parseFloat(receipt.service_charge) || 0;
    const extraLoading = parseFloat(receipt.extra_loading) || 0;

    return freight + hamali + aoc + doorDelivery + collection + serviceCharge + extraLoading;
  };

  const viewDetails = (receipt) => {
    setSelectedReceipt(receipt);
    setShowDetails(true);
  };

  const deleteReceipt = async (id) => {
    if (!confirm('Are you sure you want to delete this lorry receipt?')) {
      return;
    }

    try {
      if (window.electronAPI) {
        await window.electronAPI.query('DELETE FROM lorry_receipts WHERE id = ?', [id]);
        alert('Lorry receipt deleted successfully!');
        loadData();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error deleting receipt. Please try again.');
    }
  };

  const printReceipt = (receipt) => {
    // Basic print functionality - can be enhanced
    const printWindow = window.open('', '_blank');
    const totalAmount = calculateTotalAmount(receipt);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Lorry Receipt - ${receipt.lr_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; }
            .charges { border-collapse: collapse; width: 100%; }
            .charges th, .charges td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LORRY RECEIPT</h1>
            <h2>LR Number: ${receipt.lr_number}</h2>
          </div>
          
          <div class="section">
            <span class="label">Date:</span> ${receipt.lr_date}<br>
            <span class="label">From:</span> ${receipt.from_location}<br>
            <span class="label">To:</span> ${receipt.to_location}
          </div>
          
          <div class="section">
            <span class="label">Consignor:</span> ${receipt.consignor_name || 'N/A'}<br>
            <span class="label">Consignee:</span> ${receipt.consignee_name || 'N/A'}
          </div>
          
          <div class="section">
            <span class="label">Vehicle:</span> ${receipt.truck_number || receipt.truck_reg_number || 'N/A'}<br>
            <span class="label">Driver:</span> ${receipt.driver_name || 'N/A'}
          </div>
          
          <div class="section">
            <span class="label">Particulars:</span> ${receipt.particulars || 'N/A'}<br>
            <span class="label">Quantity:</span> ${receipt.quantity || 'N/A'} ${receipt.unit || ''}
          </div>
          
          <table class="charges">
            <tr><th>Charge Type</th><th>Amount</th></tr>
            <tr><td>Freight</td><td>₹${receipt.freight || 0}</td></tr>
            <tr><td>Hamali</td><td>₹${receipt.hamali || 0}</td></tr>
            <tr><td>AOC</td><td>₹${receipt.aoc || 0}</td></tr>
            <tr><td>Door Delivery</td><td>₹${receipt.door_delivery || 0}</td></tr>
            <tr><td>Collection</td><td>₹${receipt.collection || 0}</td></tr>
            <tr><td>Service Charge</td><td>₹${receipt.service_charge || 0}</td></tr>
            <tr><td>Extra Loading</td><td>₹${receipt.extra_loading || 0}</td></tr>
            <tr class="total"><td>Total</td><td>₹${totalAmount.toFixed(2)}</td></tr>
          </table>
          
          <div class="section">
            <span class="label">Payment Type:</span> ${receipt.payment_type}<br>
            <span class="label">Goods Risk:</span> ${receipt.goods_risk}
          </div>
          
          ${receipt.remarks ? `<div class="section"><span class="label">Remarks:</span> ${receipt.remarks}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lorry Receipts</h1>
        <p className="text-gray-600">Manage and view all lorry receipts</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              name="payment_type"
              value={filters.payment_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Types</option>
              <option value="Paid">Paid</option>
              <option value="To Be Bill">To Be Bill</option>
              <option value="To Pay">To Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consignor</label>
            <select
              name="consignor_id"
              value={filters.consignor_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >              <option value="">All Consignors</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.city ? `(${company.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
            <input
              type="text"
              name="from_location"
              value={filters.from_location}
              onChange={handleFilterChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
            <input
              type="text"
              name="to_location"
              value={filters.to_location}
              onChange={handleFilterChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LR Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consignor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receipt.lr_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(receipt.lr_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.from_location} → {receipt.to_location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.consignor_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.consignee_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.truck_number || receipt.truck_reg_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(calculateTotalAmount(receipt))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      receipt.payment_type === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : receipt.payment_type === 'To Pay'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {receipt.payment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDetails(receipt)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => printReceipt(receipt)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => deleteReceipt(receipt.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {receipts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No lorry receipts found.</p>
            <p className="text-gray-400">Try adjusting your filters or create a new receipt.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Lorry Receipt Details - {selectedReceipt.lr_number}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>LR Number:</strong> {selectedReceipt.lr_number}</div>
                  <div><strong>Date:</strong> {selectedReceipt.lr_date}</div>
                  <div><strong>From:</strong> {selectedReceipt.from_location}</div>
                  <div><strong>To:</strong> {selectedReceipt.to_location}</div>
                  <div><strong>Consignor:</strong> {selectedReceipt.consignor_name || 'N/A'}</div>
                  <div><strong>Consignee:</strong> {selectedReceipt.consignee_name || 'N/A'}</div>
                  <div><strong>Vehicle:</strong> {selectedReceipt.truck_number || selectedReceipt.truck_reg_number || 'N/A'}</div>
                  <div><strong>Driver:</strong> {selectedReceipt.driver_name || 'N/A'}</div>
                  <div><strong>Particulars:</strong> {selectedReceipt.particulars || 'N/A'}</div>
                  <div><strong>Quantity:</strong> {selectedReceipt.quantity || 'N/A'} {selectedReceipt.unit || ''}</div>
                  <div><strong>Payment Type:</strong> {selectedReceipt.payment_type}</div>
                  <div><strong>Goods Risk:</strong> {selectedReceipt.goods_risk}</div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Charges Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Freight: {formatCurrency(selectedReceipt.freight)}</div>
                    <div>Hamali: {formatCurrency(selectedReceipt.hamali)}</div>
                    <div>AOC: {formatCurrency(selectedReceipt.aoc)}</div>
                    <div>Door Delivery: {formatCurrency(selectedReceipt.door_delivery)}</div>
                    <div>Collection: {formatCurrency(selectedReceipt.collection)}</div>
                    <div>Service Charge: {formatCurrency(selectedReceipt.service_charge)}</div>
                    <div>Extra Loading: {formatCurrency(selectedReceipt.extra_loading)}</div>
                    <div className="col-span-2 font-bold text-lg border-t pt-2">
                      Total: {formatCurrency(calculateTotalAmount(selectedReceipt))}
                    </div>
                  </div>
                </div>

                {selectedReceipt.remarks && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Remarks</h4>
                    <p className="text-sm text-gray-600">{selectedReceipt.remarks}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => printReceipt(selectedReceipt)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LorryReceiptList;
