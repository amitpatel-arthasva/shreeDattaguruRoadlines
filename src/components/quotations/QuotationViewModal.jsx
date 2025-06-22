import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faTruck, 
  faBox, 
  faMoneyBill, 
  faCalendarAlt,
  faMapMarkerAlt,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import quotationService from '../../services/quotationService';
import { useToast } from '../common/ToastSystem';

const QuotationViewModal = ({ isOpen, onClose, quotation }) => {
  const toast = useToast();
  
  if (!isOpen || !quotation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = () => {
    const expiryDate = new Date(quotation.quotationValidity?.expiryDate);
    const today = new Date();
    
    if (expiryDate < today) {
      return 'text-red-600 bg-red-100 border-red-200';
    } else if (expiryDate - today < 7 * 24 * 60 * 60 * 1000) {
      return 'text-orange-600 bg-orange-100 border-orange-200';
    }
    return 'text-primary-400 bg-primary-50 border-primary-200';
  };

  const getStatusText = () => {
    const expiryDate = new Date(quotation.quotationValidity?.expiryDate);
    const today = new Date();
    
    if (expiryDate < today) {
      return 'Expired';
    } else if (expiryDate - today < 7 * 24 * 60 * 60 * 1000) {
      return 'Expiring Soon';
    }
    return 'Active';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary-400 to-primary-300">
        <div className="text-white">
          <h2 className="text-2xl font-bold">Quotation Details</h2>
          <p className="text-primary-50 mt-1">
            Created on {formatDate(quotation.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4">
    
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Company Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-400" />
              Company Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-gray-900 font-medium">
                  {quotation.quoteToCompany?.companyName || 'N/A'}
                </p>
              </div>
              
              {quotation.quoteToCompany?.gstNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600">GST Number</label>
                  <p className="text-gray-900">{quotation.quoteToCompany.gstNumber}</p>
                </div>
              )}
              
              {quotation.quoteToCompany?.contactNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Number</label>
                  <p className="text-gray-900">{quotation.quoteToCompany.contactNumber}</p>
                </div>
              )}
              
              {quotation.quoteToCompany?.address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">
                    {quotation.quoteToCompany.address}
                    {quotation.quoteToCompany.city && `, ${quotation.quoteToCompany.city}`}
                    {quotation.quoteToCompany.state && `, ${quotation.quoteToCompany.state}`}
                    {quotation.quoteToCompany.pinCode && ` - ${quotation.quoteToCompany.pinCode}`}
                  </p>
                </div>
              )}
              
              {quotation.quoteToCompany?.inquiryVia && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Inquiry Via</label>
                  <p className="text-gray-900">{quotation.quoteToCompany.inquiryVia}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
              Trip Information
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">From</label>
                  <p className="text-gray-900 font-medium">
                    {quotation.tripDetails?.from || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">To</label>
                  <p className="text-gray-900 font-medium">
                    {quotation.tripDetails?.to || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Load Type</label>
                  <p className="text-gray-900">
                    {quotation.tripDetails?.fullOrPartLoad || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Trip Type</label>
                  <p className="text-gray-900">
                    {quotation.tripDetails?.tripType || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Material Details</label>
                <p className="text-gray-900">
                  {quotation.materialDetails?.map((material, index) => (
                    <span key={index} className="block">
                      {material.materialName} - {material.quantity} {material.unit}
                    </span>
                  )) || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Freight Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBill} className="text-green-600" />
              Freight Information
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Rate Per Ton</label>
                  <p className="text-gray-900 font-medium">
                    {formatCurrency(quotation.freightBreakup?.rate?.value)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Rate Type</label>
                  <p className="text-gray-900">
                    {quotation.freightBreakup?.rate?.type || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Applicable GST</label>
                <p className="text-gray-900">
                  {quotation.freightBreakup?.applicableGST || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Total Freight with GST</label>
                <p className="text-gray-900 font-bold text-lg">
                  {formatCurrency(quotation.freightBreakup?.totalFreightWithGST)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="text-blue-600" />
              Payment Terms
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Pay By</label>
                <p className="text-gray-900">
                  {quotation.paymentTerms?.payBy || 'N/A'}
                </p>
              </div>
              
              {quotation.paymentTerms?.driverCashRequired && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Driver Cash Required</label>
                  <p className="text-gray-900">
                    {formatCurrency(quotation.paymentTerms.driverCashRequired)}
                  </p>
                </div>
              )}
              
              {quotation.paymentTerms?.paymentRemark && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Remark</label>
                  <p className="text-gray-900">
                    {quotation.paymentTerms.paymentRemark}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validity */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600" />
              Validity Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Valid Up To</label>
                <p className="text-gray-900">
                  {quotation.quotationValidity?.validUpTo?.type === 'Days' 
                    ? `${quotation.quotationValidity.validUpTo.value} Days`
                    : formatDate(quotation.quotationValidity?.validUpTo?.value)
                  }
                </p>
              </div>
              
              {quotation.quotationValidity?.expiryDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                  <p className="text-gray-900">
                    {formatDate(quotation.quotationValidity.expiryDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Demurrage Details */}
          {quotation.demurrageDetails && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faTruck} className="text-orange-600" />
                Demurrage Details
              </h3>
              
              <div className="space-y-3">
                {quotation.demurrageDetails.demurrageRatePerDay && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rate Per Day</label>
                    <p className="text-gray-900">
                      {formatCurrency(quotation.demurrageDetails.demurrageRatePerDay)}
                    </p>
                  </div>
                )}
                
                {quotation.demurrageDetails.demurrageRemark && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Remark</label>
                    <p className="text-gray-900">
                      {quotation.demurrageDetails.demurrageRemark}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        {quotation.termsAndConditions && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms and Conditions</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {quotation.termsAndConditions}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuotationViewModal;
