import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import { useToast } from '../common/ToastSystem';
import Step1ConsignorDetails from './steps/Step1ConsignorDetails';
import Step2ConsigneeDetails from './steps/Step2ConsigneeDetails';
import Step3MaterialTruckDetails from './steps/Step3MaterialTruckDetails';
import Step4FreightDetails from './steps/Step4FreightDetails';

const LorryReceiptModal = ({ isOpen, onClose, onSubmit, lorryReceipt, mode }) => {
  const toast = useToast();
  const [scrollToTopFn, setScrollToTopFn] = useState(null);

  const [formData, setFormData] = useState({
    lorryReceiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    
    // Consignor Details
    consignor: {
      consignorName: '',
      gstNumber: '',
      contactNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      email: ''
    },
    
    // Loading Address
    loadingAddress: {
      sameAsConsignor: true,
      partyName: '',
      gstNumber: '',
      contactNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      pickupPoints: ['']
    },
    
    // Consignee Details
    consignee: {
      consigneeName: '',
      gstNumber: '',
      contactNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      email: ''
    },
    
    // Delivery Details
    deliveryDetails: {
      deliveryType: 'Door',
      sameAsConsignee: true,
      companyName: '',
      contactPersonName: '',
      gstNumber: '',
      contactNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      deliveryPoints: ['']
    },
    
    // Invoice & E-Way Bill Details
    invoiceAndEwayDetails: {
      valueOfGoods: {
        type: 'As per Invoice',
        invoiceAmount: ''
      },
      invoiceDetails: [{
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0]
      }],
      ewayBillDetails: {
        ewayBillNumber: '',
        ewayBillExpiryDate: '',
        ewayBillGeneratedOn: '',
        ewayBillExtendedPeriod: ''
      },
      detailsShowIn: 'Consignor'
    },
    
    // Truck Details
    truckDetails: {
      truckNumber: '',
      vehicleType: '',
      from: '',
      weightGuarantee: {
        value: '',
        unit: 'MT'
      },
      driverName: '',
      driverMobile: '',
      licenseNumber: '',
      loadType: 'Full Load'
    },
    
    // Material Details
    materialDetails: [{
      materialName: '',
      packagingType: 'Bags',
      quantity: '',
      numberOfArticles: '',
      actualWeight: {
        value: '',
        unit: 'MT'
      },
      chargedWeight: {
        value: '',
        unit: 'MT'
      },
      freightRate: {
        value: '',
        unit: 'Per MT'
      },
      hsnCode: '',
      containerNumber: '',
      dimensions: {
        lengthFt: '',
        widthFt: '',
        heightFt: ''
      }
    }],
    
    // Freight Details
    freightDetails: {
      freightType: 'Paid',
      totalBasicFreight: 0,
      charges: {
        pickupCharge: 0,
        doorDeliveryCharge: 0,
        loadingCharge: 0,
        unloadingCharge: 0,
        packingCharge: 0,
        unpackingCharge: 0,
        serviceCharge: 0,
        cashOnDelivery: 0,
        dateOnDelivery: 0,
        otherCharges: 0
      },
      subTotal: 0,
      gstDetails: {
        gstFileAndPayBy: 'Consignee',
        applicableGST: 'NIL (On reverse charge)',
        gstAmount: 0
      },
      advanceDetails: {
        advanceReceived: 0,
        remainingFreight: 0
      },
      tdsDetails: {
        tdsPercentage: 0,
        tdsType: 'TDS Deduction',
        tdsAmount: 0
      },
      roundOff: 0,
      totalFreight: 0,
      freightPayBy: 'Consignor',
      hideFreightFromPdf: false
    },
    
    status: 'Created',
    notes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && lorryReceipt) {
      setFormData(prev => ({
        ...prev,
        ...lorryReceipt,
        date: lorryReceipt.date ? new Date(lorryReceipt.date).toISOString().split('T')[0] : prev.date
      }));
    }
  }, [mode, lorryReceipt]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayInputChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, template) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeArrayItem = (section, index) => {
    if (formData[section].length > 1) {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.consignor.consignorName && 
               formData.consignor.contactNumber && 
               formData.consignor.address;
      case 2:
        return formData.consignee.consigneeName && 
               formData.consignee.contactNumber && 
               formData.consignee.address;
      case 3:
        return formData.truckDetails.truckNumber && 
               formData.truckDetails.vehicleType && 
               formData.truckDetails.driverName &&
               formData.materialDetails[0].materialName;
      case 4:
        return formData.freightDetails.freightType;
      default:
        return false;
    }
  };
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      // Scroll to top when moving to next step
      if (scrollToTopFn) {
        setTimeout(() => scrollToTopFn(), 100);
      }
    } else {
      toast.error('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting lorry receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ConsignorDetails
            formData={formData}
            handleInputChange={handleInputChange}
            handleNestedInputChange={handleNestedInputChange}
          />
        );
      case 2:
        return (
          <Step2ConsigneeDetails
            formData={formData}
            handleInputChange={handleInputChange}
            handleNestedInputChange={handleNestedInputChange}
          />
        );
      case 3:
        return (
          <Step3MaterialTruckDetails
            formData={formData}
            handleInputChange={handleInputChange}
            handleNestedInputChange={handleNestedInputChange}
            handleArrayInputChange={handleArrayInputChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );      case 4:
        return (
          <Step4FreightDetails
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };
  const steps = [
    { number: 1, title: 'Consignor & Loading', subtitle: 'Consignor and loading details' },
    { number: 2, title: 'Consignee & Delivery', subtitle: 'Consignee and delivery details' },
    { number: 3, title: 'Material & Truck', subtitle: 'Material and truck details' },
    { number: 4, title: 'Freight & Invoice', subtitle: 'Freight and invoice details' }
  ];

  return (    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="max-w-4xl"
      title={mode === 'create' ? 'Create Lorry Receipt' : 'Edit Lorry Receipt'}
      subtitle={steps[currentStep - 1].subtitle}
      showCloseButton={false}
      onScrollToTop={setScrollToTopFn}
    >
      {/* Steps Indicator */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50">
        <div className="flex justify-between overflow-x-auto pb-2 sm:pb-0">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex items-center min-w-0 ${index < steps.length - 1 ? 'flex-1' : ''} mr-2 sm:mr-0`}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                  currentStep >= step.number
                    ? 'bg-primary-400 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-2 min-w-0 hidden sm:block">
                <p className={`text-xs sm:text-sm font-medium truncate ${
                  currentStep >= step.number ? 'text-primary-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 sm:mx-4 hidden sm:block ${
                  currentStep > step.number ? 'bg-primary-400' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        {/* Mobile step titles */}
        <div className="mt-2 sm:hidden">
          <p className="text-xs font-medium text-primary-400 text-center">
            {steps[currentStep - 1].title}
          </p>
        </div>
      </div>      {/* Form Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-2 p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary-400 hover:none md:hover:bg-primary-300 text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                <span className="truncate">{mode === 'create' ? 'Create Lorry Receipt' : 'Update Lorry Receipt'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LorryReceiptModal;
