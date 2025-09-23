import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../common/ToastSystem';

const QuotationModal = ({ isOpen, onClose, onSubmit, quotation, mode = 'create' }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refNo: '',
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    location: '',
    attentionTo: '',
    destinations: [
      { srNo: 1, destination: '', freight: '' },
      { srNo: 2, destination: '', freight: '' },
      { srNo: 3, destination: '', freight: '' },
      { srNo: 4, destination: '', freight: '' },
      { srNo: 5, destination: '', freight: '' },
      { srNo: 6, destination: '', freight: '' }
    ]
  });

  // Load quotation data when editing
  useEffect(() => {
    if (quotation && mode === 'edit') {
      setFormData({
        refNo: quotation.refNo || '',
        date: quotation.date || new Date().toISOString().split('T')[0],
        companyName: quotation.companyName || '',
        location: quotation.location || '',
        attentionTo: quotation.attentionTo || '',
        destinations: quotation.destinations || [
          { srNo: 1, destination: '', freight: '' },
          { srNo: 2, destination: '', freight: '' },
          { srNo: 3, destination: '', freight: '' },
          { srNo: 4, destination: '', freight: '' },
          { srNo: 5, destination: '', freight: '' },
          { srNo: 6, destination: '', freight: '' }
        ]
      });
    }
  }, [quotation, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDestinationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.refNo) {
      toast.error('Please enter reference number');
      return;
    }
    
    if (!formData.companyName) {
      toast.error('Please enter company name');
      return;
    }
    
    if (!formData.location) {
      toast.error('Please enter location');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting quotation:', error);
      toast.error('Failed to save quotation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      refNo: '',
      date: new Date().toISOString().split('T')[0],
      companyName: '',
      location: '',
      attentionTo: '',
      destinations: [
        { srNo: 1, destination: '', freight: '' },
        { srNo: 2, destination: '', freight: '' },
        { srNo: 3, destination: '', freight: '' },
        { srNo: 4, destination: '', freight: '' },
        { srNo: 5, destination: '', freight: '' },
        { srNo: 6, destination: '', freight: '' }
      ]
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary-400 to-primary-300">
        <div className="text-white">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Create Quotation' : 'Edit Quotation'}
          </h2>
          <p className="text-primary-50 text-sm mt-1">
            Professional quotation form
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      </div>

      {/* Printable Form */}
      <div className="p-8 bg-white print:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 2: Reference & Date */}
          <div className="flex justify-between items-end mb-8">
            <div className="flex-1 mr-8">
              <span className="text-sm font-medium">Ref. No.</span>
              <input
                type="text"
                value={formData.refNo}
                onChange={(e) => handleInputChange('refNo', e.target.value)}
                className="block w-full border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0"
                placeholder="Enter reference number"
                required
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Date</span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="block w-full border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Section 3: Recipient */}
          <div className="space-y-4 mb-8">
            <div className="text-base font-medium">To,</div>
            
            <div>
              <span className="text-sm">Company Name</span>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="block w-full border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0 mt-1"
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div>
              <span className="text-sm">Location</span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="block w-full border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0 mt-1"
                placeholder="Enter location"
                required
              />
            </div>
          </div>

          {/* Section 4: Subject */}
          <div className="space-y-3 mb-8">
            <div className="text-base font-medium">
              Sub: Quotation for Transportation Ex Palghar to Various Destination
            </div>
            
            <div className="flex items-end">
              <span className="text-sm font-medium mr-3">Kind Attn:</span>
              <input
                type="text"
                value={formData.attentionTo}
                onChange={(e) => handleInputChange('attentionTo', e.target.value)}
                className="flex-1 border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0"
                placeholder="Enter name"
              />
            </div>
          </div>

          {/* Section 5: Opening Paragraph */}
          <div className="space-y-3 mb-8">
            <div className="text-base">Respected sir,</div>
            <div className="text-base">
              With ref. to the above subject we are giving most competitive rates as under:
            </div>
          </div>

          {/* Section 6: Rates Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 w-16 font-medium">Sr. No.</th>
                  <th className="text-left py-2 font-medium">Destination</th>
                  <th className="text-right py-2 w-48 font-medium">Freight up to 8MT</th>
                </tr>
              </thead>
              <tbody>
                {formData.destinations.map((dest, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-3 text-center font-medium">{dest.srNo}</td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={dest.destination}
                        onChange={(e) => handleDestinationChange(index, 'destination', e.target.value)}
                        className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-1 focus:border-gray-600 focus:ring-0"
                        placeholder="Enter destination"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={dest.freight}
                        onChange={(e) => handleDestinationChange(index, 'freight', e.target.value)}
                        className="w-full text-right border-0 border-b border-gray-300 bg-transparent px-0 py-1 focus:border-gray-600 focus:ring-0"
                        placeholder="Enter freight rate"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 7: Notes */}
          <div className="space-y-2 mb-8">
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Kindly Insure your valued material at your end.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Loading / unloading charges & other charges will be extra as actual paid by us.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Detention charges will be extra as per destination / vehicle.</span>
              </li>
            </ul>
          </div>

          {/* Section 8: Closing Paragraph */}
          <div className="mb-12">
            <div className="text-base">
              Thanking you & awaiting your favorable reply.
            </div>
          </div>

          {/* Section 9: Signature Block */}
          <div className="flex justify-end mb-8">
            <div className="text-right space-y-2">
              <div className="text-base">Yours faithfully,</div>
              <div className="text-base font-medium mt-8">For Shree Dattaguru Road Lines</div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 print:hidden">
            <Button
              text="Reset Form"
              onClick={resetForm}
              bgColor="#6B7280"
              hoverBgColor="#4B5563"
              className="text-white font-semibold"
              width="w-auto"
              type="button"
            />
            
            <div className="flex gap-3">
              <Button
                text="Cancel"
                onClick={onClose}
                bgColor="#EF4444"
                hoverBgColor="#DC2626"
                className="text-white font-semibold"
                width="w-auto"
                type="button"
              />
              <Button
                text={loading ? 'Saving...' : (mode === 'create' ? 'Create Quotation' : 'Update Quotation')}
                type="submit"
                className="text-white font-semibold"
                width="w-auto"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuotationModal; 
