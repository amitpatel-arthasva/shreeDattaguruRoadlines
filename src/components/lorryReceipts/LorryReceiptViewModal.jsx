import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faTruck, 
  faBox, 
  faMoneyBillWave,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';

const LorryReceiptViewModal = ({ isOpen, onClose, lorryReceipt }) => {
  
  // Debug logging
  React.useEffect(() => {
    if (isOpen && lorryReceipt) {
    }
  }, [isOpen, lorryReceipt]);
  
  if (!lorryReceipt) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="p-6">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Consignment Note Details
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-700">
                  CN No: {lorryReceipt.lorryReceiptNumber}
                </span>
                
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Date:</strong> {formatDate(lorryReceipt.date)}</p>
              <p><strong>From:</strong> {lorryReceipt.fromLocation}</p>
              <p><strong>To:</strong> {lorryReceipt.toLocation}</p>
              {lorryReceipt.createdAt && <p><strong>Created:</strong> {formatDate(lorryReceipt.createdAt)}</p>}
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
              {lorryReceipt.consignor?.pan && (
                <p><strong>PAN:</strong> {lorryReceipt.consignor.pan}</p>
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
              {lorryReceipt.consignee?.pan && (
                <p><strong>PAN:</strong> {lorryReceipt.consignee.pan}</p>
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
              <p><strong>Truck Number:</strong> {lorryReceipt.truckDetails?.truckNumber || lorryReceipt.truckNumber || 'N/A'}</p>
              <p><strong>Vehicle Type:</strong> {lorryReceipt.truckDetails?.vehicleType || 'N/A'}</p>
              {lorryReceipt.truckDetails?.capacity && (
                <p><strong>Capacity:</strong> {lorryReceipt.truckDetails.capacity} Tons</p>
              )}
              {lorryReceipt.truckDetails?.ownerName && (
                <p><strong>Owner:</strong> {lorryReceipt.truckDetails.ownerName}</p>
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
              {lorryReceipt.materialDetails?.length > 0 ? (
                lorryReceipt.materialDetails.map((material, index) => (
                  <div key={index} className="border-l-4 border-primary-400 pl-3">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Nos:</strong> {material.nos}</p>
                      <p><strong>Particulars:</strong> {material.particulars}</p>
                      {material.actualWeight && (
                        <p><strong>Actual Weight:</strong> {material.actualWeight.value} {material.actualWeight.unit}</p>
                      )}
                      {material.chargedWeight && (
                        <p><strong>Chargeable Weight:</strong> {material.chargedWeight.value} {material.chargedWeight.unit}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">
                  {lorryReceipt.actualWeight && (
                    <p><strong>Actual Weight:</strong> {lorryReceipt.actualWeight} Tons</p>
                  )}
                  {lorryReceipt.chargeableWeight && (
                    <p><strong>Chargeable Weight:</strong> {lorryReceipt.chargeableWeight} Tons</p>
                  )}
                  {/* Show raw nos and particulars arrays if available */}
                  {lorryReceipt.nos && lorryReceipt.nos.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Nos:</strong> {Array.isArray(lorryReceipt.nos) ? lorryReceipt.nos.join(', ') : lorryReceipt.nos}</p>
                    </div>
                  )}
                  {lorryReceipt.particulars && lorryReceipt.particulars.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Particulars:</strong> {Array.isArray(lorryReceipt.particulars) ? lorryReceipt.particulars.join(', ') : lorryReceipt.particulars}</p>
                    </div>
                  )}
                  {(!lorryReceipt.nos || lorryReceipt.nos.length === 0) && 
                   (!lorryReceipt.particulars || lorryReceipt.particulars.length === 0) && (
                    <p className="text-gray-500">No material details available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Freight Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary-400" />
            Freight Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>Freight:</strong></p>
              <p className="text-gray-900 font-medium">{formatCurrency(lorryReceipt.freightDetails?.freight || lorryReceipt.freight)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Hamali:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.hamali || lorryReceipt.hamali)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>AOC:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.aoc || lorryReceipt.aoc)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Door Delivery:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.doorDelivery || lorryReceipt.doorDelivery)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Collection:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.collection || lorryReceipt.collection)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Service Charge:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.stCharge || lorryReceipt.serviceCharge)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Extra Loading:</strong></p>
              <p className="text-gray-900">{formatCurrency(lorryReceipt.freightDetails?.extraLoading || lorryReceipt.extraLoading)}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Total:</strong></p>
              <p className="text-gray-900 font-bold text-lg">{formatCurrency(lorryReceipt.freightDetails?.total || lorryReceipt.total)}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>Payment Type:</strong></p>
              <p className="text-gray-900">{lorryReceipt.paymentType || 'N/A'}</p>
            </div>
            {lorryReceipt.deliveryAt && (
              <div>
                <p className="text-gray-600"><strong>Delivery At:</strong></p>
                <p className="text-gray-900">{lorryReceipt.deliveryAt}</p>
              </div>
            )}
            {lorryReceipt.remarks && (
              <div className="md:col-span-2">
                <p className="text-gray-600"><strong>Remarks:</strong></p>
                <p className="text-gray-900">{lorryReceipt.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LorryReceiptViewModal;
