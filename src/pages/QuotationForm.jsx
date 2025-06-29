import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faBox, 
  faMoneyBill, 
  faCalendarAlt,
  faPlus,
  faTrash,
  faSave,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/common/ToastSystem';
import quotationService from '../services/quotationService';
import companyService from '../services/companyService';

const QuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    // Company details
    quoteToCompany: {
      companyId: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      gstNumber: '',
      panNumber: ''
    },
    
    // Trip details
    tripDetails: {
      from: '',
      to: '',
      fullOrPartLoad: 'Full Load',
      tripType: 'One Way'
    },
    
    // Material details
    materialDetails: [
      {
        materialName: '',
        quantity: '',
        unit: 'Units',
        description: ''
      }
    ],
    
    // Freight breakup
    freightBreakup: {
      rate: {
        value: '',
        type: 'Per Ton'
      },
      applicableGST: '18%',
      totalFreightWithGst: 0
    },
    
    // Payment terms
    paymentTerms: {
      payBy: 'Consignee',
      driverCashRequired: '',
      paymentRemark: ''
    },
    
    // Quotation validity
    quotationValidity: {
      validUpTo: {
        type: 'Days',
        value: 30
      },
      expiryDate: null
    },
    
    // Demurrage details
    demurrageDetails: {
      demurrageRatePerDay: '',
      demurrageRemark: ''
    },
    
    // Terms and conditions
    termsAndConditions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState('');

  useEffect(() => {
    loadCompanies();
    if (id) {
      setIsEditMode(true);
      loadQuotation(id);
    } else {
      generateQuotationNumber();
    }
  }, [id]);

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      if (response.success) {
        setCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const loadQuotation = async (quotationId) => {
    try {
      const response = await quotationService.getQuotationById(quotationId);
      if (response.success) {
        const quotation = response.data.quotation;
        setFormData({
          quoteToCompany: {
            companyId: quotation.quoteToCompany?.companyId || '',
            companyName: quotation.quoteToCompany?.companyName || '',
            address: quotation.quoteToCompany?.address || '',
            city: quotation.quoteToCompany?.city || '',
            state: quotation.quoteToCompany?.state || '',
            pinCode: quotation.quoteToCompany?.pinCode || '',
            gstNumber: quotation.quoteToCompany?.gstNumber || '',
            panNumber: quotation.quoteToCompany?.panNumber || ''
          },
          tripDetails: {
            from: quotation.tripDetails?.from || '',
            to: quotation.tripDetails?.to || '',
            fullOrPartLoad: quotation.tripDetails?.fullOrPartLoad || 'Full Load',
            tripType: quotation.tripDetails?.tripType || 'One Way'
          },
          materialDetails: quotation.materialDetails?.length > 0 ? quotation.materialDetails : [
            {
              materialName: '',
              quantity: '',
              unit: 'Units',
              description: ''
            }
          ],
          freightBreakup: {
            rate: {
              value: quotation.freightBreakup?.rate?.value || '',
              type: quotation.freightBreakup?.rate?.type || 'Per Ton'
            },
            applicableGST: quotation.freightBreakup?.applicableGST || '18%',
            totalFreightWithGst: quotation.freightBreakup?.totalFreightWithGst || 0
          },
          paymentTerms: {
            payBy: quotation.paymentTerms?.payBy || 'Consignee',
            driverCashRequired: quotation.paymentTerms?.driverCashRequired || '',
            paymentRemark: quotation.paymentTerms?.paymentRemark || ''
          },
          quotationValidity: {
            validUpTo: {
              type: quotation.quotationValidity?.validUpTo?.type || 'Days',
              value: quotation.quotationValidity?.validUpTo?.value || 30
            },
            expiryDate: quotation.quotationValidity?.expiryDate || null
          },
          demurrageDetails: {
            demurrageRatePerDay: quotation.demurrageDetails?.demurrageRatePerDay || '',
            demurrageRemark: quotation.demurrageDetails?.demurrageRemark || ''
          },
          termsAndConditions: quotation.termsAndConditions || ''
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

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${nestedSection}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${nestedSection}.${field}`]: ''
      }));
    }
  };

  const handleMaterialChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      materialDetails: prev.materialDetails.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materialDetails: [
        ...prev.materialDetails,
        {
          materialName: '',
          quantity: '',
          unit: 'Units',
          description: ''
        }
      ]
    }));
  };

  const removeMaterial = (index) => {
    if (formData.materialDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        materialDetails: prev.materialDetails.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCompanySelect = (companyId) => {
    const selectedCompany = companies.find(company => company.id == companyId);
    if (selectedCompany) {
      setFormData(prev => ({
        ...prev,
        quoteToCompany: {
          companyId: selectedCompany.id,
          companyName: selectedCompany.name,
          address: selectedCompany.address || '',
          city: selectedCompany.city || '',
          state: selectedCompany.state || '',
          pinCode: selectedCompany.pin_code || '',
          gstNumber: selectedCompany.gstin || '',
          panNumber: selectedCompany.pan || ''
        }
      }));
    }
  };

  const calculateTotalFreight = () => {
    const rateValue = parseFloat(formData.freightBreakup.rate.value) || 0;
    const gstPercentage = parseFloat(formData.freightBreakup.applicableGST.replace('%', '')) || 18;
    const totalWithGst = rateValue * (1 + gstPercentage / 100);
    
    setFormData(prev => ({
      ...prev,
      freightBreakup: {
        ...prev.freightBreakup,
        totalFreightWithGst: totalWithGst
      }
    }));
  };

  useEffect(() => {
    calculateTotalFreight();
  }, [formData.freightBreakup.rate.value, formData.freightBreakup.applicableGST]);

  const validateForm = () => {
    const newErrors = {};

    // Company validation
    if (!formData.quoteToCompany.companyId) {
      newErrors['quoteToCompany.companyId'] = 'Company is required';
    }

    // Trip details validation
    if (!formData.tripDetails.from.trim()) {
      newErrors['tripDetails.from'] = 'From location is required';
    }
    if (!formData.tripDetails.to.trim()) {
      newErrors['tripDetails.to'] = 'To location is required';
    }

    // Material details validation
    formData.materialDetails.forEach((material, index) => {
      if (!material.materialName.trim()) {
        newErrors[`materialDetails.${index}.materialName`] = 'Material name is required';
      }
      if (!material.quantity.trim()) {
        newErrors[`materialDetails.${index}.quantity`] = 'Quantity is required';
      }
    });

    // Freight validation
    if (!formData.freightBreakup.rate.value || parseFloat(formData.freightBreakup.rate.value) <= 0) {
      newErrors['freightBreakup.rate.value'] = 'Valid rate is required';
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

    try {
      let response;
      if (isEditMode) {
        response = await quotationService.updateQuotation(id, formData);
      } else {
        response = await quotationService.createQuotation(formData);
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
      quoteToCompany: {
        companyId: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        gstNumber: '',
        panNumber: ''
      },
      tripDetails: {
        from: '',
        to: '',
        fullOrPartLoad: 'Full Load',
        tripType: 'One Way'
      },
      materialDetails: [
        {
          materialName: '',
          quantity: '',
          unit: 'Units',
          description: ''
        }
      ],
      freightBreakup: {
        rate: {
          value: '',
          type: 'Per Ton'
        },
        applicableGST: '18%',
        totalFreightWithGst: 0
      },
      paymentTerms: {
        payBy: 'Consignee',
        driverCashRequired: '',
        paymentRemark: ''
      },
      quotationValidity: {
        validUpTo: {
          type: 'Days',
          value: 30
        },
        expiryDate: null
      },
      demurrageDetails: {
        demurrageRatePerDay: '',
        demurrageRemark: ''
      },
      termsAndConditions: ''
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} className="text-primary-400" />
            Company Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Company *
              </label>
              <select
                value={formData.quoteToCompany.companyId}
                onChange={(e) => handleCompanySelect(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                  getError('quoteToCompany.companyId') ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {getError('quoteToCompany.companyId') && (
                <p className="text-red-500 text-sm mt-1">{getError('quoteToCompany.companyId')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={formData.quoteToCompany.gstNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="GST Number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.quoteToCompany.address}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Company Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.quoteToCompany.city}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.quoteToCompany.state}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="State"
              />
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
            Trip Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Location *
              </label>
              <input
                type="text"
                value={formData.tripDetails.from}
                onChange={(e) => handleInputChange('tripDetails', 'from', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                  getError('tripDetails.from') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="From Location"
              />
              {getError('tripDetails.from') && (
                <p className="text-red-500 text-sm mt-1">{getError('tripDetails.from')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Location *
              </label>
              <input
                type="text"
                value={formData.tripDetails.to}
                onChange={(e) => handleInputChange('tripDetails', 'to', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                  getError('tripDetails.to') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="To Location"
              />
              {getError('tripDetails.to') && (
                <p className="text-red-500 text-sm mt-1">{getError('tripDetails.to')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Type
              </label>
              <select
                value={formData.tripDetails.fullOrPartLoad}
                onChange={(e) => handleInputChange('tripDetails', 'fullOrPartLoad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="Full Load">Full Load</option>
                <option value="Part Load">Part Load</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Type
              </label>
              <select
                value={formData.tripDetails.tripType}
                onChange={(e) => handleInputChange('tripDetails', 'tripType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="One Way">One Way</option>
                <option value="Round Trip">Round Trip</option>
              </select>
            </div>
          </div>
        </div>

        {/* Material Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-orange-600" />
              Material Details
            </h2>
            <button
              type="button"
              onClick={addMaterial}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Material
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.materialDetails.map((material, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Material {index + 1}</h3>
                  {formData.materialDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      value={material.materialName}
                      onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                        getError(`materialDetails.${index}.materialName`) ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Material Name"
                    />
                    {getError(`materialDetails.${index}.materialName`) && (
                      <p className="text-red-500 text-sm mt-1">{getError(`materialDetails.${index}.materialName`)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      value={material.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                        getError(`materialDetails.${index}.quantity`) ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Quantity"
                    />
                    {getError(`materialDetails.${index}.quantity`) && (
                      <p className="text-red-500 text-sm mt-1">{getError(`materialDetails.${index}.quantity`)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={material.unit}
                      onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    >
                      <option value="Units">Units</option>
                      <option value="Kg">Kg</option>
                      <option value="Tons">Tons</option>
                      <option value="Bags">Bags</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Meters">Meters</option>
                      <option value="Bales">Bales</option>
                      <option value="Rolls">Rolls</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={material.description}
                      onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="Description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Freight Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBill} className="text-green-600" />
            Freight Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate *
              </label>
              <input
                type="number"
                value={formData.freightBreakup.rate.value}
                onChange={(e) => handleNestedInputChange('freightBreakup', 'rate', 'value', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                  getError('freightBreakup.rate.value') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rate"
                step="0.01"
                min="0"
              />
              {getError('freightBreakup.rate.value') && (
                <p className="text-red-500 text-sm mt-1">{getError('freightBreakup.rate.value')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Type
              </label>
              <select
                value={formData.freightBreakup.rate.type}
                onChange={(e) => handleNestedInputChange('freightBreakup', 'rate', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="Per Ton">Per Ton</option>
                <option value="Per Trip">Per Trip</option>
                <option value="Per KM">Per KM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable GST
              </label>
              <select
                value={formData.freightBreakup.applicableGST}
                onChange={(e) => handleInputChange('freightBreakup', 'applicableGST', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="0%">0%</option>
                <option value="5%">5%</option>
                <option value="12%">12%</option>
                <option value="18%">18%</option>
                <option value="28%">28%</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Freight with GST:</span>
              <span className="text-2xl font-bold text-primary-600">
                ₹{formData.freightBreakup.totalFreightWithGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay By
              </label>
              <select
                value={formData.paymentTerms.payBy}
                onChange={(e) => handleInputChange('paymentTerms', 'payBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="Consignee">Consignee</option>
                <option value="Consignor">Consignor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Cash Required
              </label>
              <input
                type="number"
                value={formData.paymentTerms.driverCashRequired}
                onChange={(e) => handleInputChange('paymentTerms', 'driverCashRequired', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Amount"
                step="0.01"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Remark
              </label>
              <textarea
                value={formData.paymentTerms.paymentRemark}
                onChange={(e) => handleInputChange('paymentTerms', 'paymentRemark', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                rows="3"
                placeholder="Payment terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* Quotation Validity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
            Quotation Validity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Up To
              </label>
              <select
                value={formData.quotationValidity.validUpTo.type}
                onChange={(e) => handleNestedInputChange('quotationValidity', 'validUpTo', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="Days">Days</option>
                <option value="Date">Specific Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.quotationValidity.validUpTo.type === 'Days' ? 'Number of Days' : 'Expiry Date'}
              </label>
              {formData.quotationValidity.validUpTo.type === 'Days' ? (
                <input
                  type="number"
                  value={formData.quotationValidity.validUpTo.value}
                  onChange={(e) => handleNestedInputChange('quotationValidity', 'validUpTo', 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="30"
                  min="1"
                />
              ) : (
                <input
                  type="date"
                  value={formData.quotationValidity.validUpTo.value || ''}
                  onChange={(e) => handleNestedInputChange('quotationValidity', 'validUpTo', 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Demurrage Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demurrage Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demurrage Rate Per Day
              </label>
              <input
                type="number"
                value={formData.demurrageDetails.demurrageRatePerDay}
                onChange={(e) => handleInputChange('demurrageDetails', 'demurrageRatePerDay', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Rate per day"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demurrage Remark
              </label>
              <input
                type="text"
                value={formData.demurrageDetails.demurrageRemark}
                onChange={(e) => handleInputChange('demurrageDetails', 'demurrageRemark', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Demurrage terms..."
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
          
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            rows="6"
            placeholder="Enter terms and conditions..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
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
      </form>
    </div>
  );
};

export default QuotationForm; 