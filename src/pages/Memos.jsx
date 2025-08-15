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
import memoService from '../services/memoService';
import { downloadMemoPrintPdf } from '../services/pdfServiceRenderer';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastSystem';
import MemoViewModal from '../components/memos/MemoViewModal';
import MemoEditModal from '../components/memos/MemoEditModal';
import { useLocation } from 'react-router-dom';

const Memos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const fetchMemos = useCallback(async () => {
    try {
      setLoading(true);
      setMemos([]); // Force clear before fetching to ensure UI update
      // Use memoService to fetch memos (supports mock and real data)
      const response = await (await import('../services/memoService')).default.getMemos({ page: currentPage, limit: 10, search: debouncedSearchTerm });
      let allMemos = (response && response.success && response.data && response.data.memos) ? response.data.memos : [];
      setMemos(allMemos);
      console.log('Updated memos after fetch:', allMemos);
      setTotalPages(response?.data?.totalPages || 1);
      // Extra debug: log memos state after set
      setTimeout(() => {
        console.log('Memos state after setMemos:', allMemos);
        console.log('Current page:', currentPage, 'Total pages:', response?.data?.totalPages, 'Total records:', response?.data?.totalRecords);
      }, 100);
    } catch (error) {
      console.error('Error fetching memos:', error);
      toast.error('Failed to fetch memos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  // Ensure memos are fetched when currentPage changes (especially after delete)
  useEffect(() => {
    fetchMemos();
  }, [currentPage]);

  // Show view modal for newly created memo if present in location state
  useEffect(() => {
    if (location?.state?.newMemoId) {
      handleViewMemo(location.state.newMemoId);
      // Clear the state so modal doesn't reopen on navigation
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  const handleCreateMemo = () => {
    navigate('/memos/create');
  };

  const handleEditMemo = (memo) => {
  setSelectedMemo(memo);
  setIsEditModalOpen(true);
  };

  const handleViewMemo = async (memoId) => {
    try {
      const memoService = (await import('../services/memoService')).default;
      const response = await memoService.getMemoById(memoId);
      if (response.success && response.data) {
        setSelectedMemo(response.data);
        setIsViewModalOpen(true);
      } else {
        toast.error('Memo not found');
      }
    } catch (error) {
      console.error('Error fetching memo details:', error);
      toast.error('Failed to fetch memo details. Please try again.');
    }
  };

  const handleDeleteMemo = async (memoId) => {
    console.log('Attempting to delete memo with id:', memoId);
    setConfirmDialog(prev => ({
      isOpen: true,
      title: 'Delete Memo',
      message: 'Are you sure you want to delete this memo? This action cannot be undone.',
      dangerConfirm: true,
      onConfirm: async () => {
        try {
          const memoService = (await import('../services/memoService')).default;
          const result = await memoService.deleteMemo(memoId);
          console.log('Delete result (raw):', result);
          if (!result || typeof result !== 'object') {
            toast.error('Delete failed: No response or invalid response from backend.');
            return;
          }
          if (result.success === true || (typeof result.changes === 'number' && result.changes > 0)) {
            toast.success('Memo deleted successfully');
            // Refetch memos after deletion
            await fetchMemos();
          } else {
            toast.error((result && result.error) || 'Failed to delete memo. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting memo:', error);
          toast.error('Failed to delete memo. Please try again.');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };
  // If the memos array is empty after a delete and not on the first page, go to previous page
  useEffect(() => {
    if (!loading && memos.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [memos, currentPage, loading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Download Memo as PDF
  const handleDownloadMemo = async (memoId) => {
    try {
      toast.info('Generating PDF...', { autoClose: 2000 });
      // Fetch memo data (simulate what memoService does)
      const response = await memoService.getMemoById(memoId);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch memo data');
      }
      const memoData = response.data;
      const result = await downloadMemoPrintPdf(memoData);
      if (window.electronAPI && result && result.success && result.filePath) {
        toast.success('PDF downloaded and saved successfully!', { autoClose: 2000 });
        return;
      }
      if (result && result.success && result.filename) {
        toast.success('PDF downloaded successfully!', { autoClose: 2000 });
        return;
      }
      // Fallback for web: treat as Blob if needed
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Memo_${memoData.memo_number || memoId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('PDF downloaded successfully!', { autoClose: 2000 });
        return;
      }
      throw new Error('Failed to download PDF');
    } catch (error) {
      console.error('Error downloading memo PDF:', error);
      toast.error('Failed to download PDF. Please try again.', { autoClose: 3000 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Edit Memo Modal */}
      {isEditModalOpen && selectedMemo && (
        <MemoEditModal
          memo={selectedMemo}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (updatedMemo) => {
            const memoService = (await import('../services/memoService')).default;
            const result = await memoService.updateMemo(updatedMemo.id, updatedMemo);
            if (result.success) {
              toast.success('Memo updated successfully');
              setIsEditModalOpen(false);
              fetchMemos();
            } else {
              toast.error('Failed to update memo.');
            }
          }}
        />
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Memos</h1>
        <p className="text-gray-600">Manage and track your memos</p>
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
            placeholder="Search by subject or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent w-full sm:w-80"
          />
        </div>
        <Button
          text="Create Memo"
          onClick={handleCreateMemo}
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
          {/* Card/List View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {memos.map((memo) => (
              <div key={memo.id} className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
                <div className="flex justify-end gap-2 mb-2">
                  <button
                    onClick={() => handleViewMemo(memo.id)}
                    className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-700 p-1 transition-colors"
                    title="Download Memo"
                    onClick={() => handleDownloadMemo(memo.id)}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                  <button
                    onClick={() => handleEditMemo(memo)}
                    className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                    title="Edit Memo"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="text-red-600 hover:text-red-800 p-1 transition-colors"
                    title="Delete Memo"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                {/* Memo Number */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileAlt} className="text-primary-400" />
                    {memo.memo_number}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium truncate">
                    {memo.subject || 'No Subject'}
                  </p>
                </div>
                {/* Company Info */}
                <div className="mb-4">
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Company:</strong> {memo.q_company_name || memo.company_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>To:</strong> {memo.to_location || memo.to_company || 'N/A'}
                    </p>
                  </div>
                </div>
                {/* Date */}
                <div className="text-sm text-gray-500 border-t pt-3">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-400" />
                    Date: {formatDate(memo.memo_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* List/Table View */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memo No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memos.map((memo) => (
                    <tr key={memo.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileAlt} className="text-primary-400" />
                        {memo.memo_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(memo.status)}`}>
                          {memo.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{memo.subject || 'No Subject'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{memo.q_company_name || memo.company_name || 'N/A'}<br/>{memo.to_location || memo.to_company || ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(memo.memo_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => handleViewMemo(memo.id)}
                          className="text-primary-400 hover:text-primary-300 p-1 transition-colors"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700 p-1 transition-colors"
                          title="Download Memo"
                          onClick={() => handleDownloadMemo(memo.id)}
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="text-primary-300 hover:text-primary-200 p-1 transition-colors"
                          title="Edit Memo"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="text-red-600 hover:text-red-800 p-1 transition-colors"
                          title="Delete Memo"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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
        </>
      )}

      {/* View Modal */}
      <MemoViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        memo={selectedMemo}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        dangerConfirm={confirmDialog.dangerConfirm}
      />
    </div>
  );
};

export default Memos;
