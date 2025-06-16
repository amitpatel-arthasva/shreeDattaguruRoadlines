import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faUser,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import driverService from '../services/driverService';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DriverModal from '../components/drivers/DriverModal';
import { useToast } from '../components/common/ToastSystem';

const Drivers = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: ''
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

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const response = await driverService.getDrivers(params);

      if (response.success) {
        setDrivers(response.data.drivers);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch drivers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      license_number: '',
      address: ''
    });
    setFormErrors({});
    setEditingDriver(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Driver name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.license_number.trim()) errors.license_number = 'License number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingDriver) {
        await driverService.updateDriver(editingDriver.id, formData);
        toast.success('Driver updated successfully!');
      } else {
        await driverService.createDriver(formData);
        toast.success('Driver created successfully!');
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver. Please try again.');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number,
      address: driver.address
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (driver) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Driver',
      message: `Are you sure you want to delete driver ${driver.name}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(driver.id),
      dangerConfirm: true
    });
  };

  const confirmDelete = async (driverId) => {
    try {
      await driverService.deleteDriver(driverId);
      toast.success('Driver deleted successfully!');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver. Please try again.');
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
              <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
              <p className="text-gray-600">Manage your driver database</p>            </div>
            <Button
              text="Add Driver"
              icon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              bgColor="#6FFFE9"
              hoverBgColor="#5aebe9"
              width="w-auto"
              className="px-6"
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
                    placeholder="Search by name, phone, or license number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Drivers List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary-600 animate-spin" />
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No drivers found</h3>                <p className="text-gray-600 mb-6">Get started by adding your first driver.</p>
                <Button
                  text="Add Driver"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() => {
                    resetForm();
                    setIsCreateModalOpen(true);
                  }}
                  bgColor="#6FFFE9"
                  hoverBgColor="#5aebe9"
                  width="w-auto"
                  className="px-6"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-primary-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{driver.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.license_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {driver.address}
                        </td>                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              icon={<FontAwesomeIcon icon={faEdit} />}
                              onClick={() => handleEdit(driver)}
                              bgColor="#e5e7eb"
                              hoverBgColor="#d1d5db"
                              width="w-10"
                              height="h-10"
                              className="text-gray-600"
                            />
                            <Button
                              icon={<FontAwesomeIcon icon={faTrash} />}
                              onClick={() => handleDelete(driver)}
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
      <DriverModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        editingDriver={editingDriver}
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

export default Drivers;
