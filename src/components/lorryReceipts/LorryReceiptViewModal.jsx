import React from 'react';
import truckHeader from '../../../assets/truck_image.png';
import nameHeader from '../../../assets/shree_datta_guru.png';
import Modal from '../common/Modal';

const LorryReceiptViewModal = ({ isOpen, onClose, lorryReceipt }) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);

  // Debug logging
  React.useEffect(() => {
    if (isOpen && lorryReceipt) {
      console.log('LorryReceiptViewModal received data:', lorryReceipt);
    }
  }, [isOpen, lorryReceipt]);

  if (!lorryReceipt) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return parseFloat(amount).toFixed(2);
  };

  const getValue = (value, defaultValue = '') => {
    return value || defaultValue;
  };

  // Parse material details
  let nosArray = [];
  let particularsArray = [];

  if (lorryReceipt.materialDetails && Array.isArray(lorryReceipt.materialDetails)) {
    nosArray = lorryReceipt.materialDetails.map(item => item.nos);
    particularsArray = lorryReceipt.materialDetails.map(item => item.particulars);
  } else if (lorryReceipt.nos && lorryReceipt.particulars) {
    nosArray = Array.isArray(lorryReceipt.nos) ? lorryReceipt.nos :
      (typeof lorryReceipt.nos === 'string' ? JSON.parse(lorryReceipt.nos) : ['']);
    particularsArray = Array.isArray(lorryReceipt.particulars) ? lorryReceipt.particulars :
      (typeof lorryReceipt.particulars === 'string' ? JSON.parse(lorryReceipt.particulars) : ['']);
  } else {
    try {
      nosArray = typeof lorryReceipt.nos === 'string' ? JSON.parse(lorryReceipt.nos) :
        (Array.isArray(lorryReceipt.nos) ? lorryReceipt.nos : ['']);
    } catch {
      nosArray = [''];
    }

    try {
      particularsArray = typeof lorryReceipt.particulars === 'string' ? JSON.parse(lorryReceipt.particulars) :
        (Array.isArray(lorryReceipt.particulars) ? lorryReceipt.particulars : ['']);
    } catch {
      particularsArray = [''];
    }
  }

  // Calculate totals
  const freight = parseFloat(lorryReceipt.freightDetails?.freight || lorryReceipt.freight || 0);
  const hamali = parseFloat(lorryReceipt.freightDetails?.hamali || lorryReceipt.hamali || 0);
  const aoc = parseFloat(lorryReceipt.freightDetails?.aoc || lorryReceipt.aoc || 0);
  const doorDelivery = parseFloat(lorryReceipt.freightDetails?.doorDelivery || lorryReceipt.door_delivery || 0);
  const detention = parseFloat(lorryReceipt.freightDetails?.detention || lorryReceipt.detention || 0);
  const collection = parseFloat(lorryReceipt.freightDetails?.collection || lorryReceipt.collection || 0);
  const stCharge = parseFloat(lorryReceipt.freightDetails?.stCharge || lorryReceipt.st_charge || lorryReceipt.service_charge || 20);
  const extraLoading = parseFloat(lorryReceipt.freightDetails?.extraLoading || lorryReceipt.extra_loading || 0);
  const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + stCharge + extraLoading;

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0)); // Max zoom 200%
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 50%
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]" className="min-h-[90vh]">
      <div className="bg-white h-full flex flex-col">
        {/* Modal Header - Print Controls */}
        <div className="flex justify-between items-center p-4 border-b print:hidden bg-gray-50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Lorry Receipt Details</h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="bg-white text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-1 text-sm"
                title="Zoom Out"
              >
                🔍➖
              </button>
              <span className="px-2 text-sm font-medium text-gray-700">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="bg-white text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-1 text-sm"
                title="Zoom In"
              >
                🔍➕
              </button>
              <button
                onClick={handleResetZoom}
                className="bg-white text-gray-700 px-2 py-2 rounded hover:bg-gray-100 text-xs"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Bill Content */}
        <div className="flex-1 overflow-auto p-6">
          <div
            className="bill-content max-w-none"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`
            }}
          >
            {/* Header Section with Logo and Jurisdiction */}
            <div className="header-section">
              <div className='w-full flex flex-row items-start justify-between py-2'>
                <div className='flex-shrink-0 flex items-center w-2/3'>
                  <img src={truckHeader} alt="BillLogo" className="h-40 object-contain " />
                  <img src={nameHeader} alt="BillLogo" className=" h-40 object-contain  ml-30" />
                </div>
                <div className='flex flex-col items-end text-xs font-medium text-gray-700 leading-tight min-w-[320px] w-1/3'>
                  <div className='mb-2 font-bold text-base'>SUBJECT TO PALGHAR JURISDICTION</div>
                  <div className='mb-2 text-right text-xs'>
                    <div className='font-semibold'>Daily Part Load Service to -</div>
                    <div>Tarapur, Bhiwandi, Palghar,</div>
                    <div>Vashi, Taloja, Kolgoan Genises</div>
                  </div>
                  <div className='font-bold text-red-600 border border-red-600 px-2 py-1 inline-block text-xs mt-2'>
                    DRIVERS COPY
                  </div>
                </div>
              </div>
            </div>
<div className="w-[90%] mx-auto -mt-8 mb-6 ml-75">
                  <div className="text-xs font-medium text-gray-500 leading-snug space-y-2">
                    <div>
                      <span className="text-red-600 font-bold">TARAPUR:</span>
                      Plot No. W - 4, Camlin Naka, MIDC, Tarapur.
                      M.: 9823364283 / 7276272828
                    </div>
                    <div>
                      <span className="text-red-600 font-bold">BHIWANDI:</span>
                      Godown No. A-2, Gali No 2, Opp Capital Roadlines, Khandagale Estate,<br />
                      <div className="ml-20">
                        Puma Village, Bhiwandi. M.: 9222161259 / 9168027868
                      </div>
                    </div>
                  </div>
                </div>
            {/* Main Container */}
            <div className="container">
              {/* Consignor / Consignee Section */}
              <div className="row-container">
                <table className="left-table">
                  <tbody>
                    <tr>
                      <td className="left-cell">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Consignor - M/s {getValue(lorryReceipt.consignor?.consignorName || lorryReceipt.consignor_name)}</strong>
                        </div>
                        <div className="form-value">{getValue(lorryReceipt.consignor?.address || lorryReceipt.consignor_address)}</div>
                        <div className="form-value">{getValue(lorryReceipt.consignor?.city || lorryReceipt.consignor_city)}, {getValue(lorryReceipt.consignor?.state || lorryReceipt.consignor_state)} - {getValue(lorryReceipt.consignor?.pinCode || lorryReceipt.consignor_pin_code || lorryReceipt.consignor_pincode)}</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="left-cell">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Consignee - M/s {getValue(lorryReceipt.consignee?.consigneeName || lorryReceipt.consignee_name)}</strong>
                        </div>
                        <div className="form-value">{getValue(lorryReceipt.consignee?.address || lorryReceipt.consignee_address)}</div>
                        <div className="form-value">{getValue(lorryReceipt.consignee?.city || lorryReceipt.consignee_city)}, {getValue(lorryReceipt.consignee?.state || lorryReceipt.consignee_state)} - {getValue(lorryReceipt.consignee?.pinCode || lorryReceipt.consignee_pin_code || lorryReceipt.consignee_pincode)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="right-table">
                  <tbody>
                    <tr>
                      <td colSpan="2">
                        <strong>CN't No. - </strong>
                        <span className="form-value-small">{getValue(lorryReceipt.lorryReceiptNumber || lorryReceipt.cn_number || lorryReceipt.lr_number)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: '50%' }}>
                        <strong>Date - </strong>
                        <span className="form-value-small">{formatDate(lorryReceipt.date || lorryReceipt.lr_date)}</span>
                      </td>
                      <td style={{ width: '50%', textAlign: 'center' }} rowSpan="2">
                        <strong>Truck No. - </strong>
                        <span className="form-value-small">{getValue(lorryReceipt.truckDetails?.truckNumber || lorryReceipt.truck_number || lorryReceipt.truckNumber)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>From - </strong>
                        <span className="form-value-small">{getValue(lorryReceipt.fromLocation || lorryReceipt.from_location)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2">
                        <strong>To - </strong>
                        <span className="form-value-small">{getValue(lorryReceipt.toLocation || lorryReceipt.to_location)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Main Freight Table */}
              <table>
                <tbody>
                  <tr>
                    <td rowSpan="2" className="address-section">
                      <strong>TARAPUR</strong><br />
                      Plot No. W-4,<br />
                      Camlin Naka,<br />
                      MIDC, Tarapur<br />
                      M: 9823364283 /<br />
                      9168027869 /<br />
                      7276272828<br />
                      <hr />
                      <strong>BHIWANDI</strong><br />
                      Godown No. A-2,<br />
                      Gali No. 2,<br />
                      Opp. Capital Roadlines,<br />
                      Khandagale Estate,<br />
                      Purna Village, Bhiwandi.<br />
                      M.: 7507844317 /<br />
                      9168027868<br />
                      <hr />
                      <strong>VASHI</strong><br />
                      Godown No. C-15,<br />
                      Sector - 19A,<br />
                      Vashi, Navi Mumbai.<br />
                      M.: 9168027867
                    </td>
                    <td>
                      <table className="freight-table-container">
                        <tbody>
                          <tr>
                            {/* Nos Column */}
                            <td className="nos-column">
                              {nosArray.map((nos, index) =>
                                <div key={index} className="nos-item">{getValue(nos)}</div>
                              )}
                            </td>

                            {/* Particulars Column */}
                            <td className="particulars-column">
                              {particularsArray.map((particular, index) =>
                                <div key={index} className="particulars-item">{getValue(particular)}</div>
                              )}
                            </td>

                            {/* Rate Left Column */}
                            <td className="rate-left-column">
                              <div className="rate-container">
                                <div className="rate-item">Freight</div>
                                <div className="rate-item">Hamali</div>
                                <div className="rate-item">A.O.C</div>
                                <div className="rate-item">Door Dely</div>
                                <div className="rate-item">Detention</div>
                                <div className="rate-item">Collection</div>
                                <div className="rate-item">St.Charge</div>
                                <div className="rate-item">Extra Loading<br />paid by us</div>
                                <div className="rate-item">Total</div>
                              </div>
                            </td>

                            {/* Rate Right Column */}
                            <td className="rate-right-column">
                              <div className="rate-container">
                                <div className="rate-value">{formatCurrency(freight)}</div>
                                <div className="rate-value">{formatCurrency(hamali)}</div>
                                <div className="rate-value">{formatCurrency(aoc)}</div>
                                <div className="rate-value">{formatCurrency(doorDelivery)}</div>
                                <div className="rate-value">{formatCurrency(detention)}</div>
                                <div className="rate-value">{formatCurrency(collection)}</div>
                                <div className="rate-value">{formatCurrency(stCharge)}</div>
                                <div className="rate-value">{formatCurrency(extraLoading)}</div>
                                <div className="rate-value"><strong>{formatCurrency(totalAmount)}</strong></div>
                              </div>
                            </td>

                            {/* Weight Column */}
                            <td className="weight-column">
                              <div className="weight-container">
                                <div className="weight-item">
                                  <p>Actual<br />
                                    <strong>{getValue(lorryReceipt.actualWeight || lorryReceipt.actual_weight)}</strong> <br /> Kg.</p>
                                </div>
                                <div className="weight-item">
                                  <p>Chargeable <br /><strong>{getValue(lorryReceipt.chargeableWeight || lorryReceipt.chargeable_weight || lorryReceipt.charged_weight)}</strong></p>
                                </div>
                                <div className="payment-section">
                                  <div className="payment-option">
                                    <input type="radio" checked={(lorryReceipt.freightDetails?.paymentType || lorryReceipt.paymentType || lorryReceipt.payment_type) === 'paid'} disabled className="payment-radio" />
                                    <label>Paid</label>
                                  </div>
                                  <div className="payment-option">
                                    <input type="radio" checked={(lorryReceipt.freightDetails?.paymentType || lorryReceipt.paymentType || lorryReceipt.payment_type) === 'toBeBill'} disabled className="payment-radio" />
                                    <label>To be Bill</label>
                                  </div>
                                  <div className="payment-option">
                                    <input type="radio" checked={(lorryReceipt.freightDetails?.paymentType || lorryReceipt.paymentType || lorryReceipt.payment_type) === 'toPay'} disabled className="payment-radio" />
                                    <label>To Pay</label>
                                  </div>
                                </div>
                                <div className="risk-section">
                                  Goods entirely<br />booked at<br /><b>OWNER'S RISK</b>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Sections */}
              <table>
                <tbody>
                  <tr className="delivery-section">
                    <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '80px' }}>Delivery At:</span>
                        <span style={{ color: 'red', marginRight: '4px' }}>*</span>
                        <div className="input-container flex-grow">
                          <div className="form-value" style={{ border: '1px solid #000', padding: '4px 8px', minWidth: '250px' }}>
                            {getValue(lorryReceipt.deliveryAt || lorryReceipt.delivery_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '80px' }}>E-way Bill:</span>
                        <div className="input-container flex-grow">
                          <div className="form-value" style={{ border: '1px solid #000', padding: '4px 8px', minWidth: '250px' }}>
                            {getValue(lorryReceipt.ewayBill || lorryReceipt.eway_bill)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="remarks-section">
                    <td colSpan="3">
                      Remarks:
                      <span className="form-value" style={{ display: 'inline-block', width: '450px' }}>{getValue(lorryReceipt.remarks || lorryReceipt.notes)}</span>
                    </td>
                  </tr>
                  <tr className="footer-section">
                    <td style={{ width: '70%' }}>
                      We are not responsible for any type of damages, leakage, fire & shortages. Kindly Insured by Consignor or Consignee
                    </td>
                    <td style={{ width: '30%', verticalAlign: 'bottom', textAlign: 'center' }}>
                      For <b>Shree Dattaguru Road Lines</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CSS Styles */}
        <style jsx>{`
          .bill-content {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.4;
            color: #000;
            background: white;
            max-width: none;
            min-width: 1400px;
            width: 100%;
          }

          .header-section {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            margin-bottom: 30px;
          }

          .header-inner {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            max-width: 1800px;
          }

          .logo-container {
            flex: 1;
            display: flex;
            justify-content: flex-start;
            margin-left: 0;
          }

          .logo-image {
            max-width: 550px;
            height: auto;
          }

          .jurisdiction-section {
            position: absolute;
            right: 0;
            text-align: right;
            font-size: 14px;
            font-weight: 500;
            color: #000;
            line-height: 1.3;
          }

          .jurisdiction-title {
            margin-bottom: 10px;
            font-weight: bold;
          }

          .service-details {
            margin-bottom: 10px;
          }

          .service-title {
            font-weight: 600;
          }

          .drivers-copy {
            font-weight: bold;
            color: #dc2626;
            border: 2px solid #dc2626;
            padding: 8px 16px;
            display: inline-block;
            margin-top: 6px;
          }

          .container {
            width: 100%;
            max-width: 1600px;
            border: 2px solid #000;
            padding: 25px;
            margin: 0 auto;
            font-size: 14px;
          }

          .row-container {
            display: flex;
            width: 100%;
            margin-bottom: 20px;
            gap: 20px;
          }

          .left-table {
            flex: 2.5;
            border-collapse: collapse;
          }

          .right-table {
            flex: 1;
            border-collapse: collapse;
          }

          .left-table td, .right-table td {
            border: 2px solid #000;
            padding: 15px 18px;
            vertical-align: top;
            font-size: 16px;
          }

          .left-cell {
            height: 160px;
            vertical-align: top;
            padding: 18px;
          }

          .form-value {
            border-bottom: 2px solid #000;
            min-height: 24px;
            padding: 6px 8px;
            margin: 5px 0;
            display: block;
            background: transparent;
            font-size: 16px;
          }

          .form-value-small {
            border-bottom: 2px solid #000;
            min-height: 24px;
            padding: 6px 8px;
            margin: 4px 0;
            display: inline-block;
            width: 160px;
            background: transparent;
            font-size: 16px;
          }

          .address-section {
            width: 18%;
            padding: 12px;
            font-size: 14px;
            line-height: 1.3;
            vertical-align: top;
            border: 2px solid #000;
          }

          .address-section hr {
            margin: 12px 0;
            border: 0;
            border-top: 2px solid #000;
          }

          .freight-table-container {
            height: 400px;
            border-collapse: collapse;
            width: 100%;
            border: 2px solid #000;
          }

          .nos-column {
            width: 10%;
            border-right: 2px solid #000;
            padding: 12px;
            vertical-align: top;
            font-size: 15px;
          }

          .particulars-column {
            width: 40%;
            border-right: 2px solid #000;
            padding: 12px;
            vertical-align: top;
            font-size: 15px;
          }

          .rate-left-column {
            padding: 0;
            vertical-align: top;
            width: 16%;
            border-right: 2px solid #000;
          }

          .rate-right-column {
            padding: 0;
            vertical-align: top;
            width: 14%;
            border-right: 2px solid #000;
          }

          .weight-column {
            padding: 0;
            vertical-align: top;
            width: 20%;
          }

          .rate-container, .weight-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 400px;
          }

          .rate-item, .rate-value {
            flex: 1;
            border-bottom: 2px solid #000;
            padding: 12px 10px;
            display: flex;
            align-items: center;
            font-size: 15px;
            min-height: 45px;
          }

          .weight-item {
            flex: 2;
            border-bottom: 2px solid #000;
            padding: 12px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            text-align: center;
            min-height: 80px;
          }

          .rate-item:last-child, .rate-value:last-child {
            border-bottom: none;
            font-weight: bold;
          }

          .payment-section {
            flex: 3;
            padding: 12px;
            font-size: 14px;
            border-bottom: 2px solid #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100px;
          }

          .payment-option {
            margin: 4px 0;
            display: flex;
            align-items: center;
          }

          .payment-radio {
            margin-right: 8px;
            transform: scale(1.2);
          }

          .risk-section {
            flex: 2;
            padding: 12px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70px;
          }

          .delivery-section, .remarks-section {
            border: 2px solid #000;
            border-top: none;
          }

          .footer-section {
            border: 2px solid #000;
            border-top: none;
          }

          .delivery-section td, .remarks-section td, .footer-section td {
            padding: 18px;
            font-size: 15px;
          }

          .nos-item, .particulars-item {
            margin: 3px 0;
            font-size: 15px;
            line-height: 1.4;
          }

          /* Ensure main freight table has no gaps */
          .container > table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }

          .container > table td {
            padding: 0;
            border: 2px solid #000;
            vertical-align: top;
          }

          @media print {
            .print\\:hidden {
              display: none !important;
            }
            
            .bill-content {
              margin: 0;
              padding: 20px;
              font-size: 14px;
              min-width: auto;
              transform: scale(1.0);
            }
            
            .container {
              border: 2px solid #000;
              margin: 0;
              page-break-inside: avoid;
              max-width: none;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            .header-inner {
              width: 100%;
            }

            .logo-image {
              max-width: 600px;
            }

            /* Print-specific adjustments */
            .freight-table-container {
              height: 300px;
            }

            .rate-container, .weight-container {
              min-height: 300px;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default LorryReceiptViewModal;
