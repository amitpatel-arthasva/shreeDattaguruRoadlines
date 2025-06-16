import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faTruck, 
  faBox, 
  faMoneyBillWave,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faFileInvoice,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import { useToast } from '../common/ToastSystem';

const LorryReceiptViewModal = ({ isOpen, onClose, lorryReceipt }) => {
  const toast = useToast();
  
  if (!lorryReceipt) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Created':
        return 'text-blue-600 bg-blue-100';
      case 'In Transit':
        return 'text-orange-600 bg-orange-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    toast.info('PDF download functionality will be implemented soon');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="p-6">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lorry Receipt Details
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-700">
                  LR No: {lorryReceipt.lorryReceiptNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lorryReceipt.status)}`}>
                  {lorryReceipt.status}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Date:</strong> {formatDate(lorryReceipt.date)}</p>
              <p><strong>Created:</strong> {formatDate(lorryReceipt.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consignor Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-400" />
              Consignor Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {lorryReceipt.consignor?.consignorName || 'N/A'}</p>
              {lorryReceipt.consignor?.gstNumber && (
                <p><strong>GST:</strong> {lorryReceipt.consignor.gstNumber}</p>
              )}
              <p className="flex items-center gap-1">
                <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                {lorryReceipt.consignor?.contactNumber || 'N/A'}
              </p>
              {lorryReceipt.consignor?.email && (
                <p className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  {lorryReceipt.consignor.email}
                </p>
              )}
              <p className="flex items-start gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                <span>
                  {lorryReceipt.consignor?.address}<br />
                  {lorryReceipt.consignor?.city}, {lorryReceipt.consignor?.state} - {lorryReceipt.consignor?.pinCode}
                </span>
              </p>
            </div>
          </div>

          {/* Consignee Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-400" />
              Consignee Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {lorryReceipt.consignee?.consigneeName || 'N/A'}</p>
              {lorryReceipt.consignee?.gstNumber && (
                <p><strong>GST:</strong> {lorryReceipt.consignee.gstNumber}</p>
              )}
              <p className="flex items-center gap-1">
                <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                {lorryReceipt.consignee?.contactNumber || 'N/A'}
              </p>
              {lorryReceipt.consignee?.email && (
                <p className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  {lorryReceipt.consignee.email}
                </p>
              )}
              <p className="flex items-start gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                <span>
                  {lorryReceipt.consignee?.address}<br />
                  {lorryReceipt.consignee?.city}, {lorryReceipt.consignee?.state} - {lorryReceipt.consignee?.pinCode}
                </span>
              </p>
            </div>
          </div>

          {/* Truck Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faTruck} className="text-primary-400" />
              Truck Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Truck Number:</strong> {lorryReceipt.truckDetails?.truckNumber || 'N/A'}</p>
              <p><strong>Vehicle Type:</strong> {lorryReceipt.truckDetails?.vehicleType || 'N/A'}</p>
              <p><strong>Load Type:</strong> {lorryReceipt.truckDetails?.loadType || 'N/A'}</p>
              <p><strong>From:</strong> {lorryReceipt.truckDetails?.from || 'N/A'}</p>
              <p><strong>Driver Name:</strong> {lorryReceipt.truckDetails?.driverName || 'N/A'}</p>
              <p><strong>Driver Mobile:</strong> {lorryReceipt.truckDetails?.driverMobile || 'N/A'}</p>
              <p><strong>License Number:</strong> {lorryReceipt.truckDetails?.licenseNumber || 'N/A'}</p>
              {lorryReceipt.truckDetails?.weightGuarantee && (
                <p><strong>Weight Guarantee:</strong> {lorryReceipt.truckDetails.weightGuarantee.value} {lorryReceipt.truckDetails.weightGuarantee.unit}</p>
              )}
            </div>
          </div>

          {/* Material Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-primary-400" />
              Material Details
            </h3>
            <div className="space-y-3">
              {lorryReceipt.materialDetails?.map((material, index) => (
                <div key={index} className="border-l-4 border-primary-400 pl-3">
                  <p className="font-medium">{material.materialName}</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Packaging:</strong> {material.packagingType}</p>
                    <p><strong>Quantity:</strong> {material.quantity}</p>
                    <p><strong>Articles:</strong> {material.numberOfArticles}</p>
                    {material.actualWeight && (
                      <p><strong>Actual Weight:</strong> {material.actualWeight.value} {material.actualWeight.unit}</p>
                    )}
                    {material.chargedWeight && (
                      <p><strong>Charged Weight:</strong> {material.chargedWeight.value} {material.chargedWeight.unit}</p>
                    )}
                    {material.freightRate && (
                      <p><strong>Freight Rate:</strong> ₹{material.freightRate.value} {material.freightRate.unit}</p>
                    )}
                    {material.hsnCode && (
                      <p><strong>HSN Code:</strong> {material.hsnCode}</p>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-500">No material details available</p>}
            </div>
          </div>
        </div>

        {/* Freight Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary-400" />
            Freight Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Freight Type:</strong> {lorryReceipt.freightDetails?.freightType || 'N/A'}</p>
              <p><strong>Pay By:</strong> {lorryReceipt.freightDetails?.freightPayBy || 'N/A'}</p>
              <p><strong>Basic Freight:</strong> {formatCurrency(lorryReceipt.freightDetails?.totalBasicFreight)}</p>
            </div>
            <div>
              <p><strong>GST:</strong> {lorryReceipt.freightDetails?.gstDetails?.applicableGST || 'N/A'}</p>
              <p><strong>GST Amount:</strong> {formatCurrency(lorryReceipt.freightDetails?.gstDetails?.gstAmount)}</p>
              <p><strong>Sub Total:</strong> {formatCurrency(lorryReceipt.freightDetails?.subTotal)}</p>
            </div>            <div>
              <p><strong>Advance Received:</strong> {formatCurrency(lorryReceipt.freightDetails?.advanceDetails?.advanceReceived)}</p>
              <p><strong>Total Freight:</strong> {formatCurrency(lorryReceipt.freightDetails?.totalFreight)}</p>
              <p><strong>Remaining:</strong> {formatCurrency(lorryReceipt.freightDetails?.advanceDetails?.remainingFreight)}</p>
            </div>
          </div>
          
          {/* Detailed Charges Breakdown */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p><strong>Freight:</strong> {formatCurrency(lorryReceipt.freightDetails?.freight)}</p>
              <p><strong>Hamali:</strong> {formatCurrency(lorryReceipt.freightDetails?.hamali)}</p>
            </div>
            <div>
              <p><strong>AOC:</strong> {formatCurrency(lorryReceipt.freightDetails?.aoc)}</p>
              <p><strong>Door Delivery:</strong> {formatCurrency(lorryReceipt.freightDetails?.doorDelivery)}</p>
            </div>
            <div>
              <p><strong>Collection:</strong> {formatCurrency(lorryReceipt.freightDetails?.collection)}</p>
              <p><strong>Service Charge:</strong> {formatCurrency(lorryReceipt.freightDetails?.serviceCharge)}</p>
            </div>
            <div>
              <p><strong>Extra Loading:</strong> {formatCurrency(lorryReceipt.freightDetails?.extraLoading)}</p>
              <p><strong>Payment Type:</strong> {lorryReceipt.paymentType || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Invoice & E-Way Bill Details */}
        {(lorryReceipt.invoiceAndEwayDetails?.invoiceDetails?.length > 0 || 
          lorryReceipt.invoiceAndEwayDetails?.ewayBillDetails?.ewayBillNumber) && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileInvoice} className="text-primary-400" />
              Invoice & E-Way Bill Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {lorryReceipt.invoiceAndEwayDetails?.invoiceDetails?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Invoice Details</h4>
                  {lorryReceipt.invoiceAndEwayDetails.invoiceDetails.map((invoice, index) => (
                    <div key={index} className="space-y-1">
                      <p><strong>Invoice Number:</strong> {invoice.invoiceNumber || 'N/A'}</p>
                      <p><strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {lorryReceipt.invoiceAndEwayDetails?.ewayBillDetails?.ewayBillNumber && (
                <div>
                  <h4 className="font-medium mb-2">E-Way Bill Details</h4>
                  <div className="space-y-1">
                    <p><strong>E-Way Bill Number:</strong> {lorryReceipt.invoiceAndEwayDetails.ewayBillDetails.ewayBillNumber}</p>
                    {lorryReceipt.invoiceAndEwayDetails.ewayBillDetails.ewayBillExpiryDate && (
                      <p><strong>Expiry Date:</strong> {formatDate(lorryReceipt.invoiceAndEwayDetails.ewayBillDetails.ewayBillExpiryDate)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {lorryReceipt.notes && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <p className="text-sm text-gray-700">{lorryReceipt.notes}</p>
          </div>
        )}        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>      </div>
    </Modal>
  );
};

export default LorryReceiptViewModal;
