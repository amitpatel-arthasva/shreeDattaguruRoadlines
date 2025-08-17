import React, { useState, useEffect } from 'react';
import { useToast } from '../components/common/ToastSystem';

const LorryReceiptForm = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    lr_number: '',
    lr_date: new Date().toISOString().split('T')[0],
    from_location: '',
    to_location: '',
    consignor_id: '',
    consignee_id: '',
    truck_id: '',
    driver_id: '',
    truck_number: '',
    particulars: '',
    quantity: '',
    unit: 'Bags',
    freight: '',
    hamali: '0',
    aoc: '0',
    door_delivery: '0',
    collection: '0',
    service_charge: '20',
    extra_loading: '0',
    actual_weight: '',
    charged_weight: '',
    payment_type: 'Paid',
    service_tax_payable_by: 'Consignor',
    goods_risk: 'Owner',
    invoice_number: '',
    challan_number: '',
    delivery_at: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadAllData();
    generateLRNumber();
  }, []);

  const loadAllData = async () => {
    try {
      if (window.electronAPI) {        // Load companies with city information
        const companiesData = await window.electronAPI.query('SELECT id, name, address, city, state, pin_code, gstin, pan FROM companies ORDER BY name');
        setCompanies(companiesData);

        // Load trucks
        const trucksData = await window.electronAPI.query('SELECT * FROM trucks ORDER BY truck_number');
        setTrucks(trucksData);

        // Load drivers
        const driversData = await window.electronAPI.query('SELECT * FROM drivers WHERE is_active = 1 ORDER BY name');
        setDrivers(driversData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateLRNumber = async () => {
    try {
      if (window.electronAPI) {
        const lastLR = await window.electronAPI.query(
          `SELECT lr_number FROM lorry_receipts WHERE lr_number LIKE 'LR-%' 
           ORDER BY CAST(SUBSTR(lr_number, 4) AS INTEGER) DESC LIMIT 1`
        );
        
        let nextNumber = 1001;
        if (lastLR.length > 0) {
          const lastNumber = lastLR[0].lr_number;
          const numberPart = parseInt(lastNumber.split('-')[1]);
          nextNumber = numberPart + 1;
        }
        
        const lrNumber = `LR-${nextNumber}`;
        setFormData(prev => ({ ...prev, lr_number: lrNumber }));
      }
    } catch (error) {
      console.error('Error generating LR number:', error);
      const fallbackLR = `LR-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, lr_number: fallbackLR }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (type === 'number' || ['quantity', 'freight', 'hamali', 'aoc', 'door_delivery', 'collection', 'service_charge', 'extra_loading', 'actual_weight', 'charged_weight'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTruckChange = (e) => {
    const truckId = e.target.value;
    const selectedTruck = trucks.find(truck => truck.id == truckId);
    
    setFormData(prev => ({
      ...prev,
      truck_id: truckId,
      truck_number: selectedTruck ? selectedTruck.truck_number : ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.lr_number.trim()) newErrors.lr_number = 'LR Number is required';
    if (!formData.lr_date) newErrors.lr_date = 'LR Date is required';
    if (!formData.from_location.trim()) newErrors.from_location = 'From Location is required';
    if (!formData.to_location.trim()) newErrors.to_location = 'To Location is required';
    if (!formData.consignor_id) newErrors.consignor_id = 'Consignor is required';
    if (!formData.consignee_id) newErrors.consignee_id = 'Consignee is required';
    if (!formData.freight) newErrors.freight = 'Freight amount is required';

    // Numeric validation
    if (formData.freight && formData.freight < 0) newErrors.freight = 'Freight cannot be negative';
    if (formData.quantity && formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    const freight = parseFloat(formData.freight) || 0;
    const hamali = parseFloat(formData.hamali) || 0;
    const aoc = parseFloat(formData.aoc) || 0;
    const doorDelivery = parseFloat(formData.door_delivery) || 0;
    const collection = parseFloat(formData.collection) || 0;
    const serviceCharge = parseFloat(formData.service_charge) || 0;
    const extraLoading = parseFloat(formData.extra_loading) || 0;

    return freight + hamali + aoc + doorDelivery + collection + serviceCharge + extraLoading;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (window.electronAPI) {
        const submissionData = {
          ...formData,
          // Ensure numeric fields are properly handled
          quantity: formData.quantity ? parseInt(formData.quantity) : null,
          freight: parseFloat(formData.freight) || 0,
          hamali: parseFloat(formData.hamali) || 0,
          aoc: parseFloat(formData.aoc) || 0,
          door_delivery: parseFloat(formData.door_delivery) || 0,
          collection: parseFloat(formData.collection) || 0,
          service_charge: parseFloat(formData.service_charge) || 20,
          extra_loading: parseFloat(formData.extra_loading) || 0,
          actual_weight: formData.actual_weight ? parseFloat(formData.actual_weight) : null,
          charged_weight: formData.charged_weight ? parseFloat(formData.charged_weight) : null,
        };

        if (isEditMode) {
          await window.electronAPI.query(
            `UPDATE lorry_receipts SET 
             lr_date = ?, from_location = ?, to_location = ?, consignor_id = ?, consignee_id = ?,
             truck_id = ?, driver_id = ?, truck_number = ?, particulars = ?, quantity = ?, unit = ?,
             freight = ?, hamali = ?, aoc = ?, door_delivery = ?, collection = ?, service_charge = ?,
             extra_loading = ?, actual_weight = ?, charged_weight = ?, payment_type = ?,
             service_tax_payable_by = ?, goods_risk = ?, invoice_number = ?, challan_number = ?,
             delivery_at = ?, remarks = ?
             WHERE id = ?`,
            [
              submissionData.lr_date, submissionData.from_location, submissionData.to_location,
              submissionData.consignor_id, submissionData.consignee_id, submissionData.truck_id,
              submissionData.driver_id, submissionData.truck_number, submissionData.particulars,
              submissionData.quantity, submissionData.unit, submissionData.freight,
              submissionData.hamali, submissionData.aoc, submissionData.door_delivery,
              submissionData.collection, submissionData.service_charge, submissionData.extra_loading,
              submissionData.actual_weight, submissionData.charged_weight, submissionData.payment_type,
              submissionData.service_tax_payable_by, submissionData.goods_risk, submissionData.invoice_number,
              submissionData.challan_number, submissionData.delivery_at, submissionData.remarks,
              editId
            ]
          );
          toast.success('Lorry Receipt updated successfully!');
        } else {
          await window.electronAPI.query(
            `INSERT INTO lorry_receipts (
              lr_number, lr_date, from_location, to_location, consignor_id, consignee_id,
              truck_id, driver_id, truck_number, particulars, quantity, unit,
              freight, hamali, aoc, door_delivery, collection, service_charge,
              extra_loading, actual_weight, charged_weight, payment_type,
              service_tax_payable_by, goods_risk, invoice_number, challan_number,
              delivery_at, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              submissionData.lr_number, submissionData.lr_date, submissionData.from_location,
              submissionData.to_location, submissionData.consignor_id, submissionData.consignee_id,
              submissionData.truck_id, submissionData.driver_id, submissionData.truck_number,
              submissionData.particulars, submissionData.quantity, submissionData.unit,
              submissionData.freight, submissionData.hamali, submissionData.aoc,
              submissionData.door_delivery, submissionData.collection, submissionData.service_charge,
              submissionData.extra_loading, submissionData.actual_weight, submissionData.charged_weight,
              submissionData.payment_type, submissionData.service_tax_payable_by, submissionData.goods_risk,
              submissionData.invoice_number, submissionData.challan_number, submissionData.delivery_at,
              submissionData.remarks
            ]
          );
          toast.success('Lorry Receipt created successfully!');
          resetForm();
        }
      }
    } catch (error) {
  console.error('Error saving lorry receipt:', error);
  toast.error('Error saving lorry receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      lr_number: '',
      lr_date: new Date().toISOString().split('T')[0],
      from_location: '',
      to_location: '',
      consignor_id: '',
      consignee_id: '',
      truck_id: '',
      driver_id: '',
      truck_number: '',
      particulars: '',
      quantity: '',
      unit: 'Bags',
      freight: '',
      hamali: '0',
      aoc: '0',
      door_delivery: '0',
      collection: '0',
      service_charge: '20',
      extra_loading: '0',
      actual_weight: '',
      charged_weight: '',
      payment_type: 'Paid',
      service_tax_payable_by: 'Consignor',
      goods_risk: 'Owner',
      invoice_number: '',
      challan_number: '',
      delivery_at: '',
      remarks: '',
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
    generateLRNumber();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Lorry Receipt' : 'Create Lorry Receipt'}
        </h1>
        <p className="text-gray-600">Fill in the details below to {isEditMode ? 'update' : 'create'} a lorry receipt</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LR Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">LR Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LR Number *
              </label>
              <input
                type="text"
                name="lr_number"
                value={formData.lr_number}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
                placeholder="Auto-generating..."
              />
              <p className="text-xs text-gray-500 mt-1">This number is automatically generated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LR Date *
              </label>
              <input
                type="date"
                name="lr_date"
                value={formData.lr_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lr_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lr_date && <p className="text-red-500 text-xs mt-1">{errors.lr_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type *
              </label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Paid">Paid</option>
                <option value="To Be Bill">To Be Bill</option>
                <option value="To Pay">To Pay</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Location *
              </label>
              <input
                type="text"
                name="from_location"
                value={formData.from_location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.from_location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter departure location"
              />
              {errors.from_location && <p className="text-red-500 text-xs mt-1">{errors.from_location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Location *
              </label>
              <input
                type="text"
                name="to_location"
                value={formData.to_location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.to_location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter destination location"
              />
              {errors.to_location && <p className="text-red-500 text-xs mt-1">{errors.to_location}</p>}
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consignor *
              </label>
              <select
                name="consignor_id"
                value={formData.consignor_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.consignor_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >                <option value="">Select Consignor</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.city ? `(${company.city})` : ''}
                  </option>
                ))}
              </select>
              {errors.consignor_id && <p className="text-red-500 text-xs mt-1">{errors.consignor_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consignee *
              </label>
              <select
                name="consignee_id"
                value={formData.consignee_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.consignee_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >                <option value="">Select Consignee</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.city ? `(${company.city})` : ''}
                  </option>
                ))}
              </select>
              {errors.consignee_id && <p className="text-red-500 text-xs mt-1">{errors.consignee_id}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Service Tax Payable By
            </label>
            <select
              name="service_tax_payable_by"
              value={formData.service_tax_payable_by}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Consignor">Consignor</option>
              <option value="Consignee">Consignee</option>
            </select>
          </div>
        </div>

        {/* Vehicle & Driver Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle & Driver</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Truck
              </label>
              <select
                name="truck_id"
                value={formData.truck_id}
                onChange={handleTruckChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Truck</option>                {trucks.map(truck => (
                  <option key={truck.id} value={truck.id}>
                    {truck.truck_number} - {truck.truck_type || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Truck Number (Manual)
              </label>
              <input
                type="text"
                name="truck_number"
                value={formData.truck_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter truck number manually"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver
              </label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Particulars Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Particulars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Particulars
              </label>
              <input
                type="text"
                name="particulars"
                value={formData.particulars}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Diammonium Phosphate, MPK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bags">Bags</option>
                <option value="Kg">Kg</option>
                <option value="Tons">Tons</option>
                <option value="Nos">Nos</option>
                <option value="Pieces">Pieces</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charges Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Charges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Freight *
              </label>
              <input
                type="number"
                name="freight"
                value={formData.freight}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.freight ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter freight amount"
                step="0.01"
                min="0"
              />
              {errors.freight && <p className="text-red-500 text-xs mt-1">{errors.freight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hamali
              </label>
              <input
                type="number"
                name="hamali"
                value={formData.hamali}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AOC
              </label>
              <input
                type="number"
                name="aoc"
                value={formData.aoc}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Door Delivery
              </label>
              <input
                type="number"
                name="door_delivery"
                value={formData.door_delivery}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection
              </label>
              <input
                type="number"
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Charge
              </label>
              <input
                type="number"
                name="service_charge"
                value={formData.service_charge}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra Loading
              </label>
              <input
                type="number"
                name="extra_loading"
                value={formData.extra_loading}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <div className="text-lg font-semibold text-orange-900">
              Total Amount: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        {/* Weight Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Weight (kg)
              </label>
              <input
                type="number"
                name="actual_weight"
                value={formData.actual_weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                placeholder="Enter actual weight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charged Weight (kg)
              </label>
              <input
                type="number"
                name="charged_weight"
                value={formData.charged_weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                placeholder="Enter charged weight"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goods Risk
              </label>
              <select
                name="goods_risk"
                value={formData.goods_risk}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Owner">Owner</option>
                <option value="Carrier">Carrier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery At
              </label>
              <input
                type="text"
                name="delivery_at"
                value={formData.delivery_at}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter delivery location details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challan Number
              </label>
              <input
                type="text"
                name="challan_number"
                value={formData.challan_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter challan number"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any additional remarks"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-500 hover:to-red-500 disabled:from-amber-300 disabled:to-orange-300 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create')} Lorry Receipt
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default LorryReceiptForm;
