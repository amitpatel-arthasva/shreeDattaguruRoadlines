import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faTruck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import truckService from '../services/truckService';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TruckModal from '../components/trucks/TruckModal';
import { useToast } from '../components/common/ToastSystem';

const Trucks = () => {
  const toast = useToast();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    truck_number: '',
    truck_type: '',
    capacity_ton: '',
    owner_name: ''
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

  const fetchTrucks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const response = await truckService.getTrucks(params);

      if (response.success) {
        setTrucks(response.data.trucks);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
      if (error.response && error.response.status < 500) {
        toast.error('Failed to fetch trucks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const resetForm = () => {
    setFormData({
      truck_number: '',
      truck_type: '',
      capacity_ton: '',
      owner_name: ''
    });
    setFormErrors({});
    setEditingTruck(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.truck_number.trim()) errors.truck_number = 'Truck number is required';
    if (!formData.truck_type.trim()) errors.truck_type = 'Truck type is required';
    if (!formData.capacity_ton || formData.capacity_ton <= 0) errors.capacity_ton = 'Valid capacity is required';
    if (!formData.owner_name.trim()) errors.owner_name = 'Owner name is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingTruck) {
        await truckService.updateTruck(editingTruck.id, formData);
        toast.success('Truck updated successfully!');
      } else {
        await truckService.createTruck(formData);
        toast.success('Truck created successfully!');
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      fetchTrucks();
    } catch (error) {
      console.error('Error saving truck:', error);
      toast.error('Failed to save truck. Please try again.');
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData({
      truck_number: truck.truck_number,
      truck_type: truck.truck_type,
      capacity_ton: truck.capacity_ton,
      owner_name: truck.owner_name
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (truck) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Truck',
      message: `Are you sure you want to delete truck ${truck.truck_number}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(truck.id),
      dangerConfirm: true
    });
  };

  const confirmDelete = async (truckId) => {
    try {
      await truckService.deleteTruck(truckId);
      toast.success('Truck deleted successfully!');
      fetchTrucks();
    } catch (error) {
      console.error('Error deleting truck:', error);
      toast.error('Failed to delete truck. Please try again.');
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
              <h1 className="text-3xl font-bold text-gray-900">Trucks</h1>
              <p className="text-gray-600">Manage your fleet of trucks</p>            </div>
            <Button
              text="Add Truck"
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
                    placeholder="Search by truck number, type, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trucks List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary-600 animate-spin" />
              </div>
            ) : trucks.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faTruck} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No trucks found</h3>                <p className="text-gray-600 mb-6">Get started by adding your first truck.</p>
                <Button
                  text="Add Truck"
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
                        Truck Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trucks.map((truck) => (
                      <tr key={truck.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faTruck} className="text-primary-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{truck.truck_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {truck.truck_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {truck.capacity_ton} Tons
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {truck.owner_name}
                        </td>                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              icon={<FontAwesomeIcon icon={faEdit} />}
                              onClick={() => handleEdit(truck)}
                              bgColor="#e5e7eb"
                              hoverBgColor="#d1d5db"
                              width="w-10"
                              height="h-10"
                              className="text-gray-600"
                            />
                            <Button
                              icon={<FontAwesomeIcon icon={faTrash} />}
                              onClick={() => handleDelete(truck)}
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
      <TruckModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        editingTruck={editingTruck}
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

export default Trucks;
