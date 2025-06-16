import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const TruckModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  formErrors, 
  editingTruck 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTruck ? 'Edit Truck' : 'Add New Truck'}
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Truck Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Truck Number *
            </label>
            <input
              type="text"
              value={formData.truck_number}
              onChange={(e) => setFormData({ ...formData, truck_number: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.truck_number ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., MH 12 AB 1234"
            />
            {formErrors.truck_number && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.truck_number}
              </p>
            )}
          </div>

          {/* Truck Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Truck Type *
            </label>
            <select
              value={formData.truck_type}
              onChange={(e) => setFormData({ ...formData, truck_type: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.truck_type ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">Select truck type</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Container">Container</option>
              <option value="Trailer">Trailer</option>
              <option value="Mini Truck">Mini Truck</option>
            </select>
            {formErrors.truck_type && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.truck_type}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Tons) *
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.capacity_ton}
              onChange={(e) => setFormData({ ...formData, capacity_ton: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.capacity_ton ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., 10.5"
            />
            {formErrors.capacity_ton && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.capacity_ton}
              </p>
            )}
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name *
            </label>
            <input
              type="text"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.owner_name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Owner's full name"
            />
            {formErrors.owner_name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.owner_name}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              text="Cancel"
              onClick={onClose}
              bgColor="#e5e7eb"
              hoverBgColor="#d1d5db"
              className="text-gray-700"
              width="w-24"
            />
            <Button
              text={editingTruck ? 'Update Truck' : 'Add Truck'}
              onClick={handleSubmit}
              bgColor="#6FFFE9"
              hoverBgColor="#5aebe9"
              className="text-black font-medium"
              width="w-32"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TruckModal;
