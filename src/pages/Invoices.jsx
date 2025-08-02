import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileInvoice, 
  faCalendarAlt,
  faTruck,
  faDownload,
  faSpinner,
  faFileAlt,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/common/Button';
import invoiceService from '../services/invoiceService';
import { useToast } from '../components/common/ToastSystem';

const Invoices = () => {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState({});
  
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { 
          search: debouncedSearchTerm
        })
      };
      
      const response = await invoiceService.getInvoices(params);
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      
      // Only show individual error toast for non-connection errors
      if (err.response && err.response.status < 500) {
        error('Failed to fetch invoices. Please try again.');
      }
      // Connection errors are handled by the API interceptor
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, error]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadPdf = async (id) => {
    try {
      setIsGeneratingPdf(prev => ({ ...prev, [id]: true }));
      
      const invoice = invoices.find(inv => inv.id === id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Use Electron IPC if available
      if (window.electronAPI && window.electronAPI.generateInvoicePdf) {
        const result = await window.electronAPI.generateInvoicePdf(invoice);
        
        if (result.success) {
          success('Invoice PDF generated successfully');
        } else {
          error(result.message || 'Failed to generate invoice PDF');
        }
      } else {
        // Fallback: use the service method
        const pdfBuffer = await invoiceService.downloadInvoicePdf(id);
        
        // Create blob and download
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        success('Invoice PDF downloaded successfully');
      }
    } catch (err) {
      error('Failed to download invoice PDF');
      console.error('Error downloading PDF:', err);
    } finally {
      setIsGeneratingPdf(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-gray-600">Manage and track your invoices generated from lorry receipts</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search by invoice number, consignor, consignee, or truck number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-primary-400" />
        </div>
      ) : (
        <>
          {/* Invoice Content */}
          {invoices.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No invoices match your search criteria.' : 'No lorry receipts available to generate invoices.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                    <div className="p-6">
                      {/* Action Buttons */}
                      <div className="flex justify-end items-start mb-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadPdf(invoice.id)}
                            disabled={isGeneratingPdf[invoice.id]}
                            className="text-green-600 hover:text-green-700 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isGeneratingPdf[invoice.id] ? "Generating PDF..." : "Download PDF"}
                          >
                            <FontAwesomeIcon 
                              icon={isGeneratingPdf[invoice.id] ? faSpinner : faDownload} 
                              className={isGeneratingPdf[invoice.id] ? "animate-spin" : ""} 
                            />
                          </button>
                        </div>
                      </div>

                      {/* Invoice Number */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileInvoice} className="text-primary-400" />
                          Invoice #{invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-600">LR: {invoice.lorryReceiptNumber}</p>
                      </div>

                      {/* Consignor & Consignee Info */}
                      <div className="mb-4">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>From:</strong> {invoice.consignor?.consignorName || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>To:</strong> {invoice.consignee?.consigneeName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Truck & Amount */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faTruck} className="text-primary-400" />
                          <span className="text-sm font-medium text-gray-700">Truck:</span>
                          <span className="text-sm text-gray-600">{invoice.truckNumber || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Date & Amount */}
                      <div className="text-sm text-gray-500 border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-400" />
                            {formatDate(invoice.date)}
                          </span>
                          <span className="text-lg font-bold text-primary-400">
                            ₹{(typeof invoice.totalAmount === 'number' ? invoice.totalAmount : parseFloat(invoice.totalAmount) || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* List View */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faFileInvoice} className="text-primary-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">#{invoice.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.lorryReceiptNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invoice.consignor?.consignorName || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invoice.consignee?.consigneeName || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.truckNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">
                            ₹{(typeof invoice.totalAmount === 'number' ? invoice.totalAmount : parseFloat(invoice.totalAmount) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDownloadPdf(invoice.id)}
                                disabled={isGeneratingPdf[invoice.id]}
                                className="text-green-600 hover:text-green-700 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isGeneratingPdf[invoice.id] ? "Generating PDF..." : "Download PDF"}
                              >
                                <FontAwesomeIcon 
                                  icon={isGeneratingPdf[invoice.id] ? faSpinner : faDownload} 
                                  className={isGeneratingPdf[invoice.id] ? "animate-spin" : ""} 
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-200 transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-200 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invoices;
