import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const CompanyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  formErrors, 
  editingCompany 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? 'Edit Company' : 'Add New Company'}
      maxWidth="max-w-3xl"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Company name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.name}
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
              rows="3"
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

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="City"
              />
              {formErrors.city && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {formErrors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  formErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="State"
              />
              {formErrors.state && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {formErrors.state}
                </p>
              )}
            </div>
          </div>

          {/* Pin Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Code *
            </label>
            <input
              type="text"
              value={formData.pin_code}
              onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                formErrors.pin_code ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="6-digit pin code"
              maxLength="6"
            />
            {formErrors.pin_code && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {formErrors.pin_code}
              </p>
            )}
          </div>

          {/* GSTIN and PAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  formErrors.gstin ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="15-digit GSTIN"
                maxLength="15"
              />
              {formErrors.gstin && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {formErrors.gstin}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN (Optional)
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  formErrors.pan ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="10-digit PAN"
                maxLength="10"
              />
              {formErrors.pan && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {formErrors.pan}
                </p>
              )}
            </div>
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
              text={editingCompany ? 'Update Company' : 'Add Company'}
              onClick={handleSubmit}
              bgColor="#6FFFE9"
              hoverBgColor="#5aebe9"
              className="text-black font-medium"
              width="w-36"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CompanyModal;
