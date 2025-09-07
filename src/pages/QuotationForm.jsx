import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/common/ToastSystem';
import quotationService from '../services/quotationService';

const QuotationForm = () => {
  // Add row handler for destinations
  const handleAddDestinationRow = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [
        ...prev.destinations,
        { srNo: prev.destinations.length + 1, destination: '', freight: '' }
      ]
    }));
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
  quotationNumber: '',
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState('');

  useEffect(() => {
    const loadQuotation = async (quotationId) => {
      try {
        const response = await quotationService.getQuotationById(quotationId);
        if (response.success) {
          const quotation = response.data.quotation;
          setFormData({
            quotationNumber: quotation.quotationNumber || '',
            date: quotation.date || new Date().toISOString().split('T')[0],
            companyName: quotation.companyName || '',
            location: quotation.location || '',
            attentionTo: quotation.toUser || '',
            destinations: quotation.destinations || [
              { srNo: 1, destination: '', freight: '' },
              { srNo: 2, destination: '', freight: '' },
              { srNo: 3, destination: '', freight: '' },
              { srNo: 4, destination: '', freight: '' },
              { srNo: 5, destination: '', freight: '' },
              { srNo: 6, destination: '', freight: '' }
            ]
          });
          setQuotationNumber(quotation.quotationNumber);
        }
      } catch (error) {
        console.error('Error loading quotation:', error);
        toast.error('Failed to load quotation details');
      }
    };

    const generateQuotationNumber = async () => {
      try {
        const response = await quotationService.generateQuotationNumber();
        setQuotationNumber(response);
      } catch (error) {
        console.error('Error generating quotation number:', error);
        const fallbackNumber = `QUO-${new Date().getFullYear()}${Date.now().toString().slice(-3)}`;
        setQuotationNumber(fallbackNumber);
      }
    };

    if (id) {
      setIsEditMode(true);
      loadQuotation(id);
    } else {
      generateQuotationNumber();
    }
  }, [id, toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDestinationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.quotationNumber.trim()) {
      newErrors['quotationNumber'] = 'Quotation number is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors['companyName'] = 'Company name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors['location'] = 'Location is required';
    }

    // Destination validation - at least one destination should have both destination and freight
    const hasValidDestination = formData.destinations.some(dest => 
      dest.destination && dest.destination.trim() && dest.freight && dest.freight.toString().trim()
    );
    
    if (!hasValidDestination) {
      newErrors['destinations'] = 'At least one destination with freight rate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Map formData to backend structure
    const mappedData = {
      quotationNumber: formData.quotationNumber,
      quotationDate: formData.date,
      companyName: formData.companyName,
      location: formData.location,
      toUser: formData.attentionTo,
      destinations: (formData.destinations || [])
        .filter(dest => dest.destination && dest.freight)
        .map(dest => ({
          destination: dest.destination,
          freight: dest.freight
        })),
    };

    try {
      let response;
      if (isEditMode) {
        response = await quotationService.updateQuotation(id, mappedData);
      } else {
        response = await quotationService.createQuotation(mappedData);
      }
      
      if (response.success) {
        toast.success(`Quotation ${isEditMode ? 'updated' : 'created'} successfully`);
        navigate('/quotations');
      } else {
        toast.error(response.error || `Failed to ${isEditMode ? 'update' : 'create'} quotation`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} quotation:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} quotation. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      quotationNumber: '',
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
    setErrors({});
  };

  const getError = (field) => {
    return errors[field] || '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit Quotation' : 'Create New Quotation'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update quotation details' : 'Fill in the details to create a new quotation'}
            </p>
          </div>
          <button
            onClick={() => navigate('/quotations')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Quotations
          </button>
        </div>
        
        {quotationNumber && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-sm font-medium text-orange-800">
              Quotation Number: {quotationNumber}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md print:shadow-none">
        {/* Printable Form Content */}
        <div className="p-8 print:p-6">
          
          {/* Section 2: Reference & Date */}
          <div className="flex justify-between items-end mb-8">
            <div className="flex-1 mr-8">
              <span className="text-sm font-medium">Ref. No.</span>
              <input
                type="text"
                value={formData.quotationNumber}
                onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                className="block w-full border-0 border-b border-gray-400 bg-transparent px-0 py-1 text-base focus:border-black focus:ring-0"
                placeholder="Enter quotation number"
                required
              />
              {getError('quotationNumber') && (
                <p className="text-red-500 text-sm mt-1">{getError('quotationNumber')}</p>
              )}
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
              {getError('date') && (
                <p className="text-red-500 text-sm mt-1">{getError('date')}</p>
              )}
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
              {getError('companyName') && (
                <p className="text-red-500 text-sm mt-1">{getError('companyName')}</p>
              )}
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
              {getError('location') && (
                <p className="text-red-500 text-sm mt-1">{getError('location')}</p>
              )}
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
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleAddDestinationRow}
                className="px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
              >
                + Add Row
              </button>
            </div>
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
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 print:hidden">
            <button
              type="button"
              onClick={async () => {
                const result = await quotationService.fillDummyQuotation();
                if (result.success) {
                  toast.success('Dummy quotation created');
                  navigate('/quotations');
                } else {
                  toast.error(result.error || 'Failed to create dummy quotation');
                }
              }}
              className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Fill Dummy Data
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSave} />
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Quotation' : 'Create Quotation')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm; 