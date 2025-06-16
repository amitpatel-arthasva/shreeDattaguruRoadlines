import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DriverModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  formErrors, 
  editingDriver 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driver Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Driver's full name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="10-digit phone number"
              maxLength="10"
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.phone}
              </p>
            )}
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Number *
            </label>
            <input
              type="text"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.license_number ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Driving license number"
            />
            {formErrors.license_number && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.license_number}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="4"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
                formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Complete address"
            />
            {formErrors.address && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.address}
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
              text={editingDriver ? 'Update Driver' : 'Add Driver'}
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

export default DriverModal;
