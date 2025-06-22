import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faBox, 
  faMoneyBill, 
  faCalendarAlt,
  faFileAlt,
  faPlus,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../common/ToastSystem';
import companyService from '../../services/companyService';

const QuotationModal = ({ isOpen, onClose, onSubmit, quotation, mode = 'create' }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
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
      panNumber: '',
      contactNumber: ''
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

  // Load companies on component mount
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  // Load quotation data when editing
  useEffect(() => {
    if (quotation && mode === 'edit') {
      setFormData({
        quoteToCompany: {
          companyId: quotation.quoteToCompany?.companyId || '',
          companyName: quotation.quoteToCompany?.companyName || '',
          address: quotation.quoteToCompany?.address || '',
          city: quotation.quoteToCompany?.city || '',
          state: quotation.quoteToCompany?.state || '',
          pinCode: quotation.quoteToCompany?.pinCode || '',
          gstNumber: quotation.quoteToCompany?.gstNumber || '',
          panNumber: quotation.quoteToCompany?.panNumber || '',
          contactNumber: quotation.quoteToCompany?.contactNumber || ''
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
    }
  }, [quotation, mode]);

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

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
    const selectedCompany = companies.find(c => c.id === parseInt(companyId));
    if (selectedCompany) {
      setFormData(prev => ({
        ...prev,
        quoteToCompany: {
          companyId: selectedCompany.id,
          companyName: selectedCompany.name,
          address: selectedCompany.address,
          city: selectedCompany.city,
          state: selectedCompany.state,
          pinCode: selectedCompany.pin_code,
          gstNumber: selectedCompany.gstin,
          panNumber: selectedCompany.pan,
          contactNumber: selectedCompany.phone
        }
      }));
    }
  };

  const calculateTotalFreight = () => {
    const rateValue = parseFloat(formData.freightBreakup.rate.value) || 0;
    const gstPercentage = parseFloat(formData.freightBreakup.applicableGST.replace('%', '')) || 18;
    const totalWithGST = rateValue * (1 + gstPercentage / 100);
    
    setFormData(prev => ({
      ...prev,
      freightBreakup: {
        ...prev.freightBreakup,
        totalFreightWithGst: totalWithGST
      }
    }));
  };

  useEffect(() => {
    calculateTotalFreight();
  }, [formData.freightBreakup.rate.value, formData.freightBreakup.applicableGST]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.quoteToCompany.companyName) {
      toast.error('Please select a company');
      return;
    }
    
    if (!formData.tripDetails.from || !formData.tripDetails.to) {
      toast.error('Please enter from and to locations');
      return;
    }
    
    if (!formData.freightBreakup.rate.value) {
      toast.error('Please enter the freight rate');
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
      quoteToCompany: {
        companyId: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        gstNumber: '',
        panNumber: '',
        contactNumber: ''
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
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary-400 to-primary-300">
        <div className="text-white">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Quotation' : 'Edit Quotation'}
          </h2>
          <p className="text-primary-50 mt-1">
            {mode === 'create' ? 'Fill in the details below to create a new quotation' : 'Update the quotation details'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Company Information */}
          <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-400" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company *
                </label>
                <select
                  value={formData.quoteToCompany.companyId}
                  onChange={(e) => handleCompanySelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.companyName}
                  onChange={(e) => handleInputChange('quoteToCompany', 'companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.address}
                  onChange={(e) => handleInputChange('quoteToCompany', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.city}
                  onChange={(e) => handleInputChange('quoteToCompany', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.state}
                  onChange={(e) => handleInputChange('quoteToCompany', 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.pinCode}
                  onChange={(e) => handleInputChange('quoteToCompany', 'pinCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.gstNumber}
                  onChange={(e) => handleInputChange('quoteToCompany', 'gstNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.panNumber}
                  onChange={(e) => handleInputChange('quoteToCompany', 'panNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.quoteToCompany.contactNumber}
                  onChange={(e) => handleInputChange('quoteToCompany', 'contactNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
              Trip Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Location *
                </label>
                <input
                  type="text"
                  value={formData.tripDetails.from}
                  onChange={(e) => handleInputChange('tripDetails', 'from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Location *
                </label>
                <input
                  type="text"
                  value={formData.tripDetails.to}
                  onChange={(e) => handleInputChange('tripDetails', 'to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
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

          {/* Freight Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBill} className="text-green-600" />
              Freight Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.freightBreakup.rate.value}
                  onChange={(e) => handleNestedInputChange('freightBreakup', 'rate', 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Freight (with GST)
                </label>
                <input
                  type="text"
                  value={`₹${formData.freightBreakup.totalFreightWithGst.toFixed(2)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="text-primary-400" />
              Payment Terms
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay By
                </label>
                <select
                  value={formData.paymentTerms.payBy}
                  onChange={(e) => handleInputChange('paymentTerms', 'payBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="Consignor">Consignor</option>
                  <option value="Consignee">Consignee</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Cash Required
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paymentTerms.driverCashRequired}
                  onChange={(e) => handleInputChange('paymentTerms', 'driverCashRequired', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Remark
                </label>
                <textarea
                  value={formData.paymentTerms.paymentRemark}
                  onChange={(e) => handleInputChange('paymentTerms', 'paymentRemark', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Quotation Validity */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600" />
              Quotation Validity
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Up To
                </label>
                <select
                  value={formData.quotationValidity.validUpTo.type}
                  onChange={(e) => handleNestedInputChange('quotationValidity', 'validUpTo', 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="Days">Days from creation</option>
                  <option value="Date">Specific date</option>
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
                  />
                ) : (
                  <input
                    type="date"
                    value={formData.quotationValidity.validUpTo.value}
                    onChange={(e) => handleNestedInputChange('quotationValidity', 'validUpTo', 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Demurrage Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-red-600" />
              Demurrage Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demurrage Rate Per Day
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.demurrageDetails.demurrageRatePerDay}
                  onChange={(e) => handleInputChange('demurrageDetails', 'demurrageRatePerDay', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demurrage Remark
                </label>
                <textarea
                  value={formData.demurrageDetails.demurrageRemark}
                  onChange={(e) => handleInputChange('demurrageDetails', 'demurrageRemark', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Material Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-blue-600" />
              Material Details
            </h3>
            <Button
              text="Add Material"
              onClick={addMaterial}
              bgColor="#3B82F6"
              hoverBgColor="#2563EB"
              className="text-white font-semibold"
              width="w-auto"
              icon={<FontAwesomeIcon icon={faPlus} />}
            />
          </div>
          
          <div className="space-y-4">
            {formData.materialDetails.map((material, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Material {index + 1}</h4>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Name
                    </label>
                    <input
                      type="text"
                      value={material.materialName}
                      onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={material.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
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
                      <option value="Tons">Tons</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Bags">Bags</option>
                      <option value="Boxes">Boxes</option>
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
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-600" />
            Terms and Conditions
          </h3>
          
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
            rows="6"
            placeholder="Enter terms and conditions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            text="Reset Form"
            onClick={resetForm}
            bgColor="#6B7280"
            hoverBgColor="#4B5563"
            className="text-white font-semibold"
            width="w-auto"
          />
          
          <div className="flex gap-4">
            <Button
              text="Cancel"
              onClick={onClose}
              bgColor="#EF4444"
              hoverBgColor="#DC2626"
              className="text-white font-semibold"
              width="w-auto"
            />
            <Button
              text={loading ? 'Saving...' : (mode === 'create' ? 'Create Quotation' : 'Update Quotation')}
              onClick={handleSubmit}
              bgColor="#C5677B"
              hoverBgColor="#C599B6"
              className="text-white font-semibold"
              width="w-auto"
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default QuotationModal; 