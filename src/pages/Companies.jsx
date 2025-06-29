import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faBuilding,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import companyService from '../services/companyService';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CompanyModal from '../components/companies/CompanyModal';
import { useToast } from '../components/common/ToastSystem';
import { useMasterData } from '../contexts/MasterDataContext';

const Companies = () => {
  const toast = useToast();
  const { refreshMasterData } = useMasterData();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    gstin: '',
    pan: ''
  });
  const [formErrors, setFormErrors] = useState({});

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
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const response = await companyService.getCompanies(params);

      if (response.success) {
        setCompanies(response.data.companies);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch companies. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      gstin: '',
      pan: ''
    });
    setFormErrors({});
    setEditingCompany(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Company name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pin_code.trim()) errors.pin_code = 'Pin code is required';
    else if (!/^\d{6}$/.test(formData.pin_code)) {
      errors.pin_code = 'Please enter a valid 6-digit pin code';
    }
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      errors.gstin = 'Please enter a valid GSTIN';
    }
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      errors.pan = 'Please enter a valid PAN';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, formData);
        toast.success('Company updated successfully!');
      } else {
        await companyService.createCompany(formData);
        toast.success('Company created successfully!');
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company. Please try again.');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      pin_code: company.pin_code || '',
      gstin: company.gstin || '',
      pan: company.pan || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (company) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Company',
      message: `Are you sure you want to delete company ${company.name}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(company.id),
      dangerConfirm: true
    });
  };

  const confirmDelete = async (companyId) => {
    try {
      await companyService.deleteCompany(companyId);
      toast.success('Company deactivated successfully!');
      fetchCompanies();
      // Refresh master data counts
      await refreshMasterData();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to deactivate company. Please try again.');
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600">Manage your business partners</p>            </div>
            <Button
              text="Add Company"
              icon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              width="w-auto"
              className="px-6 text-white font-medium"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by company name, GSTIN, or PAN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Companies List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary-600 animate-spin" />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faBuilding} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>                <p className="text-gray-600 mb-6">Get started by adding your first company.</p>
                <Button
                  text="Add Company"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() => {
                    resetForm();
                    setIsCreateModalOpen(true);
                  }}
                  width="w-auto"
                  className="px-6 text-white font-medium"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GSTIN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PAN
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faBuilding} className="text-primary-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{company.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{company.city}, {company.state}</div>
                            <div className="text-xs text-gray-400">{company.pin_code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.gstin || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.pan || 'N/A'}
                        </td>                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              icon={<FontAwesomeIcon icon={faEdit} />}
                              onClick={() => handleEdit(company)}
                              bgColor="#e5e7eb"
                              hoverBgColor="#d1d5db"
                              width="w-10"
                              height="h-10"
                              className="text-gray-600"
                            />
                            <Button
                              icon={<FontAwesomeIcon icon={faTrash} />}
                              onClick={() => handleDelete(company)}
                              bgColor="#fee2e2"
                              hoverBgColor="#fecaca"
                              width="w-10"
                              height="h-10"
                              className="text-red-600"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>                  <div className="flex gap-2">
                    <Button
                      text="Previous"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      bgColor="#e5e7eb"
                      hoverBgColor="#d1d5db"
                      width="w-auto"
                      className={`px-4 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'}`}
                    />
                    <Button
                      text="Next"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      bgColor="#e5e7eb"
                      hoverBgColor="#d1d5db"
                      width="w-auto"
                      className={`px-4 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Create/Edit Modal */}
      <CompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        editingCompany={editingCompany}
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
    </Layout>
  );
};

export default Companies;
