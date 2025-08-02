import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye,
  faFileAlt,
  faCalendarAlt,
  faSpinner,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import quotationService from '../services/quotationService';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastSystem';
import QuotationViewModal from '../components/quotations/QuotationViewModal';

const Quotations = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState({});
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
  
  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { companyName: debouncedSearchTerm })
      };
      
      const response = await quotationService.getQuotations(params);
      
      if (response.success) {
        setQuotations(response.data.quotations);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      // Only show individual error toast for non-connection errors
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch quotations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleCreateQuotation = () => {
    navigate('/quotations/create');
  };

  const handleEditQuotation = (quotation) => {
    navigate(`/quotations/edit/${quotation._id}`);
  };
  
  const handleViewQuotation = async (quotationId) => {
    try {
      const response = await quotationService.getQuotationById(quotationId);
      if (response.success) {
        setSelectedQuotation(response.data.quotation);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      toast.error('Failed to fetch quotation details. Please try again.');
    }
  };
  
  const handleDeleteQuotation = async (quotationId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Quotation',
      message: 'Are you sure you want to delete this quotation? This action cannot be undone.',
      dangerConfirm: true,
      onConfirm: async () => {
        try {
          const response = await quotationService.deleteQuotation(quotationId);
          if (response.success) {
            toast.success('Quotation deleted successfully');
            fetchQuotations(); // Refresh the list
          }
        } catch (error) {
          console.error('Error deleting quotation:', error);
          toast.error('Failed to delete quotation. Please try again.');
        }
      }
    });
  };
  
  const handleDownloadPdf = async (quotationId, companyName) => {
    try {
      setIsGeneratingPdf(prev => ({ ...prev, [quotationId]: true }));
      
      const result = await quotationService.generateQuotationPdf(quotationId);
      
      // Check if we're in Electron environment and got a success/failure response
      if (result && typeof result === 'object' && 'success' in result) {
        // Electron IPC response - dialog and file saving is handled by main process
        if (result.success) {
          toast.success('PDF generated and saved successfully!');
        } else {
          toast.error(result.message || 'Failed to generate PDF. Please try again.');
        }
        return;
      }
      
      // Web environment - result is a blob, handle download manually
      const pdfBlob = result;
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename similar to QuotationViewModal
      const shortId = String(quotationId).slice(-6).toUpperCase(); // Convert to string first, then get last 6 characters
      const quotationNumber = `QUO-${shortId}`;
      const cleanCompanyName = (companyName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${quotationNumber}_${cleanCompanyName}.pdf`;
      
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message with "Open Now" option
      toast.success(
        <div className="flex items-center justify-between">
          <span>PDF downloaded successfully</span>
          <button
            onClick={() => {
              // Create a new blob URL for opening
              const openUrl = window.URL.createObjectURL(pdfBlob);
              window.open(openUrl, '_blank');
              // Clean up the URL after a delay
              setTimeout(() => window.URL.revokeObjectURL(openUrl), 1000);
            }}
            className="ml-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm rounded hover:from-orange-500 hover:to-red-500 transition-colors"
          >
            Open Now
          </button>
        </div>,
        { duration: 5000 } // Show for 5 seconds to give time to click "Open Now"
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(prev => ({ ...prev, [quotationId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Helper function to check if quotation is expired
  const isQuotationExpired = (quotation) => {
    if (!quotation.quotationValidity?.expiryDate) {
      return false;
    }
    
    const expiryDate = new Date(quotation.quotationValidity.expiryDate);
    const today = new Date();
    
    return expiryDate < today;
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotations</h1>
        <p className="text-gray-600">Manage and track your quotations</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent w-full sm:w-80"
          />
        </div>
        <Button
          text="Create Quotation"
          onClick={handleCreateQuotation}
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
          {/* Quotations Content */}
          {quotations.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No quotations found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No quotations match your search criteria.' : 'Create your first quotation to get started.'}
              </p>
              {!searchTerm && (
                <Button
                  text="Create Your First Quotation"
                  onClick={handleCreateQuotation}
                  className="text-white font-semibold"
                  width="w-auto"
                />
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quotations.slice(0, 3).map((quotation) => (
                  <div key={quotation._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                    <div className="p-6">
                      {/* Status Badge and Action Buttons */}
                      <div className="flex justify-between items-start mb-4">
                        {/* Status Badge - Only show for expired quotations */}
                        <div className="flex-1">
                          {isQuotationExpired(quotation) && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewQuotation(quotation._id)}
                            className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(quotation._id, quotation.quoteToCompany?.companyName)}
                            disabled={isGeneratingPdf[quotation._id]}
                            className="text-green-600 hover:text-green-700 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isGeneratingPdf[quotation._id] ? "Generating PDF..." : "Download PDF"}
                          >
                            <FontAwesomeIcon 
                              icon={isGeneratingPdf[quotation._id] ? faSpinner : faDownload} 
                              className={isGeneratingPdf[quotation._id] ? "animate-spin" : ""} 
                            />
                          </button>
                          <button
                            onClick={() => handleEditQuotation(quotation)}
                            className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                            title="Edit Quotation"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuotation(quotation._id)}
                            className="text-red-600 hover:text-red-800 p-1 transition-colors"
                            title="Delete Quotation"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>

                      {/* Quote Number */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="text-primary-400" />
                          Quote No: {quotation.quotationNumber}
                        </h3>
                      </div>

                      {/* Company Info */}
                      <div className="mb-4">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Company:</strong> {quotation.quoteToCompany?.companyName || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {quotation.quoteToCompany?.companyAddress || quotation.quoteToCompany?.city || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>From:</strong> {quotation.tripDetails?.from || 'N/A'} → <strong>To:</strong> {quotation.tripDetails?.to || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-gray-500 border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-400" />
                            Created: {formatDate(quotation.createdAt)}
                          </span>
                          {quotation.quotationValidity?.expiryDate && (
                            <span className="text-xs">
                              Expires: {formatDate(quotation.quotationValidity.expiryDate)}
                            </span>
                          )}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotations.map((quotation) => (
                        <tr key={quotation._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faFileAlt} className="text-primary-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isQuotationExpired(quotation) && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{quotation.quoteToCompany?.companyName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{quotation.quoteToCompany?.city || quotation.quoteToCompany?.companyAddress || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{quotation.tripDetails?.from || 'N/A'} → {quotation.tripDetails?.to || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{quotation.tripDetails?.fullOrPartLoad || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(quotation.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {quotation.quotationValidity?.expiryDate ? formatDate(quotation.quotationValidity.expiryDate) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewQuotation(quotation._id)}
                                className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(quotation._id, quotation.quoteToCompany?.companyName)}
                                disabled={isGeneratingPdf[quotation._id]}
                                className="text-green-600 hover:text-green-700 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isGeneratingPdf[quotation._id] ? "Generating PDF..." : "Download PDF"}
                              >
                                <FontAwesomeIcon 
                                  icon={isGeneratingPdf[quotation._id] ? faSpinner : faDownload} 
                                  className={isGeneratingPdf[quotation._id] ? "animate-spin" : ""} 
                                />
                              </button>
                              <button
                                onClick={() => handleEditQuotation(quotation)}
                                className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                                title="Edit Quotation"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuotation(quotation._id)}
                                className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                title="Delete Quotation"
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
            </div>
          )}

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
        </>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <QuotationViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          quotation={selectedQuotation}
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

export default Quotations;