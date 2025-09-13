import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPrint } from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';

const QuotationViewModal = ({ isOpen, onClose, quotation }) => {
  if (!isOpen || !quotation) return null;

  // Map backend fields to UI fields expected by the template
  const mapped = {
    refNo: quotation.refNo || quotation.quotationNumber || '',
    date: quotation.date || quotation.quotationDate || '',
    companyName: quotation.companyName || '',
    location: quotation.location || '',
    attentionTo: quotation.kindAtten || quotation.toUser || '',
    destinations: Array.isArray(quotation.destinations)
      ? quotation.destinations.map((dest, idx) => ({
          srNo: idx + 1,
          destination: dest.destination || dest.to || '',
          freight: dest.freight || dest.rate || '',
        }))
      : [],
    // Add more mappings as needed
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-red-500 to-red-600 print:hidden">
        <div className="text-white">
          <h2 className="text-xl font-bold">Quotation View</h2>
          <p className="text-red-100 text-sm mt-1">
            Professional quotation document
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Print button removed */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Company Header */}
      <div className="p-8 bg-white print:p-6">
        {/* Company Letterhead */}
        <div className="text-center mb-8 border-b-2 border-red-600 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-red-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600">श्री दत्तगुरु रोड लाईन्स</h1>
          </div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">SHREE DATTAGURU ROAD LINES</h2>
          <p className="text-sm text-gray-600 mb-1">Transport Contractors & Fleet Owners</p>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span><strong>TARAPUR:</strong> Plot No. W - 4, Camlin Naka, MIDC, Tarapur. M.: 9923964283 / 7276272828</span>
            </div>
            <div className="flex justify-between">
              <span><strong>BHIWANDI:</strong> Shop No. 3, Opp. Capital Roadlines, Khandagale Estate,</span>
            </div>
            <div className="text-center">
              <span>Purna Village, Bhiwandi. M.: 9222161259 / 9169027898</span>
            </div>
            <div className="text-center">
              <span>Email: srilinways1987@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Reference and Date */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-sm">Ref.</span>
            <span className="ml-2 font-mono">{mapped.refNo || 'TRP/2024/3024-33'}</span>
          </div>
          <div>
            <span className="text-sm">Date:</span>
            <span className="ml-2">{formatDate(mapped.date) || '05/03/2022'}</span>
          </div>
        </div>

        {/* To Section */}
        <div className="mb-6">
          <div className="mb-2">
            <strong>To,</strong>
          </div>
          <div className="mb-1">
            <strong>{mapped.companyName || 'M/s. Perfect Containers Pvt. Ltd.'}</strong>
          </div>
          <div className="mb-4">
            {mapped.location || 'Palghar'}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <div className="mb-2">
            <strong>Sub: Quotation for Transportation Ex Palghar to Various Destination.</strong>
          </div>
          <div className="mb-4">
            <strong>Kind Attn:</strong> {mapped.attentionTo || 'Shri Vijayji Pawar sir'}
          </div>
        </div>

        {/* Opening */}
        <div className="mb-6">
          <div className="mb-2">
            <strong>Respected sir,</strong>
          </div>
          <div className="mb-4">
            With ref. to the above subject we are giving most competitive rates as below -
          </div>
        </div>

        {/* Rates Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-3 py-2 text-center font-bold">Sr. No</th>
                <th className="border border-black px-3 py-2 text-center font-bold">Destination</th>
                <th className="border border-black px-3 py-2 text-center font-bold">Freight, up to 8MT</th>
              </tr>
            </thead>
            <tbody>
              {mapped.destinations.length > 0 ? (
                mapped.destinations.map((dest, index) => (
                  <tr key={index}>
                    <td className="border border-black px-3 py-2 text-center">{dest.srNo}</td>
                    <td className="border border-black px-3 py-2 text-center">{dest.destination}</td>
                    <td className="border border-black px-3 py-2 text-center">{dest.freight}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-black px-3 py-2 text-center" colSpan={3}>No destinations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <div className="text-sm">
            <div className="mb-1">
              <strong>Note:</strong> <strong>1)</strong> Kindly Insure your valued material at your end.
            </div>
            <div className="mb-1 ml-12">
              <strong>2)</strong> Loading / unloading charges & other charges will be extra as actual paid by us.
            </div>
            <div className="mb-4 ml-12">
              <strong>3)</strong> Detention charges will be extra as per destination / vehicle
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="mb-12">
          <div className="text-center">
            Thanking you & awaiting your favorable reply.
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-end">
          <div className="text-center">
            <div className="mb-2">Your faithfully,</div>
            <div className="mb-8"></div> {/* Space for signature */}
            <div className="font-bold">For Shree Dattaguru Road Lines</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuotationViewModal;
