import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faEye,  faFileAlt,
  faCalendarAlt,
  faSpinner,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import lorryReceiptService from '../services/lorryReceiptService';
import { downloadLorryReceiptPrintPdf } from '../services/pdfServiceRenderer';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastSystem';
// import LorryReceiptModal from '../components/lorryReceipts/LorryReceiptModal';
import LorryReceiptViewModal from '../components/lorryReceipts/LorryReceiptViewModal';

const LorryReceipts = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);  const [selectedLorryReceipt, setSelectedLorryReceipt] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // ConfirmDialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    dangerConfirm: false
  });

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
  const fetchLorryReceipts = useCallback(async () => {
    try {
      setLoading(true);      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && {
          search: debouncedSearchTerm
        })
      };

      const response = await lorryReceiptService.getLorryReceipts(params);

      if (response.success) {
        setLorryReceipts(response.data.lorryReceipts);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching lorry receipts:', error);

      // Only show individual error toast for non-connection errors
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch lorry receipts. Please try again.');
      }
      // Connection errors are handled by the API interceptor
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchLorryReceipts();
  }, [fetchLorryReceipts]);  const handleCreateLorryReceipt = () => {
    navigate('/lorry-receipts/create');
  };

  const handleEditLorryReceipt = (lorryReceipt) => {
    navigate(`/lorry-receipts/edit/${lorryReceipt._id}`);
  };  const handleViewLorryReceipt = async (lorryReceiptId) => {
    try {
      const response = await lorryReceiptService.getLorryReceiptById(lorryReceiptId);
      if (response.success) {
        setSelectedLorryReceipt(response.data); // Fixed: removed .lorryReceipt
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching lorry receipt details:', error);

      // Only show individual error toast for non-connection errors
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch lorry receipt details. Please try again.');
      }
      // Connection errors are handled by the API interceptor
    }
  };const handleDeleteLorryReceipt = async (lorryReceiptId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lorry Receipt',
      message: 'Are you sure you want to delete this lorry receipt? This action cannot be undone.',
      dangerConfirm: true,
      onConfirm: async () => {
        try {
          const response = await lorryReceiptService.deleteLorryReceipt(lorryReceiptId);
          if (response.success) {
            toast.success('Lorry receipt deleted successfully');
            fetchLorryReceipts(); // Refresh the list
          }
        } catch (error) {
          console.error('Error deleting lorry receipt:', error);
          toast.error('Failed to delete lorry receipt. Please try again.');
        }
      }
    });
  };  const handleDownloadPDF = async (lorryReceiptId) => {
    try {
      toast.info('Generating PDF...', { autoClose: 2000 });
      
      // Fetch the complete lorry receipt data
      const response = await lorryReceiptService.getLorryReceiptById(lorryReceiptId);
      if (!response.success) {
        throw new Error('Failed to fetch lorry receipt details');
      }

      const lorryReceiptData = response.data;
      
      // Generate and download the PDF
      const result = await downloadLorryReceiptPrintPdf(
        lorryReceiptData,
        `LorryReceipt_${lorryReceiptData.lorryReceiptNumber}_${new Date().toISOString().split('T')[0]}.pdf`
      );

      if (result.success) {
        toast.success('PDF downloaded successfully');
      } else {
        // Check if user cancelled the save operation
        if (result.message === 'User cancelled save operation') {
          toast.info('PDF not saved');
        } else {
          throw new Error(result.message || result.error || 'Failed to generate PDF');
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(`Failed to download PDF: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lorry Receipts</h1>
        <p className="text-gray-600">Manage and track your lorry receipts</p>
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
            placeholder="Search by LR number, consignor, consignee, or truck number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent w-full sm:w-80"
          />
        </div>
        <Button
          text="Create Lorry Receipt"
          onClick={handleCreateLorryReceipt}
          className="text-white font-semibold"
          width="w-auto"
          icon={<FontAwesomeIcon icon={faPlus} />}
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-primary-400" />
        </div>
      ) : (
        <>
          {lorryReceipts.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No lorry receipts found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No lorry receipts match your search criteria.' : 'Create your first lorry receipt to get started.'}
              </p>
              {!searchTerm && (
                <Button
                  text="Create Your First Lorry Receipt"
                  onClick={handleCreateLorryReceipt}
                  className="text-white font-semibold"
                  width="w-auto"
                />
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lorryReceipts.slice(0, 3).map((lorryReceipt) => (
                  <div key={lorryReceipt._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                    <div className="p-6">
                      {/* Action Buttons */}
                      <div className="flex justify-end items-start mb-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewLorryReceipt(lorryReceipt._id)}
                            className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(lorryReceipt._id)}
                            className="text-green-600 hover:text-green-700 p-1 transition-colors"
                            title="Download PDF"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button
                            onClick={() => handleEditLorryReceipt(lorryReceipt)}
                            className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                            title="Edit Lorry Receipt"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteLorryReceipt(lorryReceipt._id)}
                            className="text-red-600 hover:text-red-800 p-1 transition-colors"
                            title="Delete Lorry Receipt"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                      </div>

                      {/* LR Number */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="text-primary-400" />
                          LR No: {lorryReceipt.lorryReceiptNumber}
                        </h3>
                      </div>                      {/* Consignor & Consignee Info */}
                      <div className="mb-4">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>From:</strong> {lorryReceipt.consignor?.consignorName || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lorryReceipt.consignor?.city || lorryReceipt.consignor?.address || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>To:</strong> {lorryReceipt.consignee?.consigneeName || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lorryReceipt.consignee?.city || lorryReceipt.consignee?.address || ''}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-gray-500 border-t pt-3">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-400" />
                          Date: {formatDate(lorryReceipt.date)}
                        </span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lorryReceipts.map((lorryReceipt) => (
                        <tr key={lorryReceipt._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faFileAlt} className="text-primary-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{lorryReceipt.lorryReceiptNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lorryReceipt.consignor?.consignorName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{lorryReceipt.consignor?.city || lorryReceipt.consignor?.address || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lorryReceipt.consignee?.consigneeName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{lorryReceipt.consignee?.city || lorryReceipt.consignee?.address || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(lorryReceipt.date)}
                          </td>                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewLorryReceipt(lorryReceipt._id)}
                                className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(lorryReceipt._id)}
                                className="text-green-600 hover:text-green-700 p-1 transition-colors"
                                title="Download PDF"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </button>
                              <button
                                onClick={() => handleEditLorryReceipt(lorryReceipt)}
                                className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                                title="Edit Lorry Receipt"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteLorryReceipt(lorryReceipt._id)}
                                className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                title="Delete Lorry Receipt"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-200 transition-colors"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-200 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}      {/* Modals */}
      {isViewModalOpen && (
        <LorryReceiptViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          lorryReceipt={selectedLorryReceipt}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        dangerConfirm={confirmDialog.dangerConfirm}
      />
    </div>
  );
};

export default LorryReceipts;
