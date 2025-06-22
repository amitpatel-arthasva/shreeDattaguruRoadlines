import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BillHeader from '../../assets/images/billHeader.png';
import companyService from '../../services/companyService';
import lorryReceiptService from '../../services/lorryReceiptService';
import truckService from '../../services/truckService';

const LorryReceiptFormPage = () => {
  const navigate = useNavigate();    // Company autocomplete state
  const [companies, setCompanies] = useState([]);
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [filteredConsignorCompanies, setFilteredConsignorCompanies] = useState([]);
  const [filteredConsigneeCompanies, setFilteredConsigneeCompanies] = useState([]);
  const [addConsignorCompany, setAddConsignorCompany] = useState(false);
  const [addConsigneeCompany, setAddConsigneeCompany] = useState(false);
  const [consignorSelectedFromDropdown, setConsignorSelectedFromDropdown] = useState(false);
  const [consigneeSelectedFromDropdown, setConsigneeSelectedFromDropdown] = useState(false);
  const [dummyDataIndex, setDummyDataIndex] = useState(0);
  const [focusedConsignorIndex, setFocusedConsignorIndex] = useState(-1); // -1 means input focused, 0+ means dropdown item focused
  const [focusedConsigneeIndex, setFocusedConsigneeIndex] = useState(-1);  const consignorDropdownRef = useRef(null);  const consigneeDropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const truckDropdownRef = useRef(null);
  const consignorInputRef = useRef(null);
  const consigneeInputRef = useRef(null);

  // Dummy data for development
  const dummyData = [
    {
      consignorName: 'ABC Industries Ltd.',
      consignorAddress1: '123 Industrial Area, Phase 1',
      consignorCity: 'Mumbai',
      consignorState: 'Maharashtra',
      consignorPincode: '400001',
      consignorGstin: '27ABCIN1234F1Z5',
      consignorPan: 'ABCIN1234F',
      consigneeName: 'XYZ Manufacturing Pvt. Ltd.',
      consigneeAddress1: '456 Manufacturing Hub, Sector 10',
      consigneeCity: 'Delhi',
      consigneeState: 'Delhi',
      consigneePincode: '110001',      
	  consigneeGstin: '07XYZMA1234C1Z8',
      consigneePan: 'XYZMA1234C',
      truckNumber: 'MH 12 AB 1234',
      date: '2025-01-15',
      to: 'Delhi',
      from: 'Tarapur',
      nos: ['50', '25'],
      particulars: ['Cotton Bales', 'Textile Materials'],
      freight: '15000',      hamali: '500',
      aoc: '200',
      doorDelivery: '300',
      collection: '100',
      stCharge: '20',
      extraLoading: '0',
      actualWeight: '2500',
      chargeableWeight: '2500',      paid: '16120',
      toBeBill: '0',
      toPay: '0',
      paymentType: 'paid',
      deliveryAt: 'Delhi Warehouse',
      total: '16120',
      remarks: 'Handle with care'
    },
    {
      consignorName: 'PQR Traders',
      consignorAddress1: '789 Trade Center, Main Road',
      consignorCity: 'Ahmedabad',
      consignorState: 'Gujarat',
      consignorPincode: '380001',
      consignorGstin: '24PQRTR1234G1Z9',
      consignorPan: 'PQRTR1234G',
      consigneeName: 'RST Corporation',
      consigneeAddress1: '654 Corporate Plaza',
      consigneeCity: 'Bangalore',
      consigneeState: 'Karnataka',
      consigneePincode: '560001',      consigneeGstin: '29RSTCO1234K1Z3',
      consigneePan: 'RSTCO1234K',
      truckNumber: 'GJ 01 AA 5678',
      date: '2025-01-16',
      to: 'Bangalore',
      from: 'Bhiwandi',
      nos: ['100'],
      particulars: ['Electronic Components'],
      freight: '12000',      hamali: '400',
      aoc: '150',
      doorDelivery: '250',
      collection: '0',
      stCharge: '20',
      extraLoading: '200',
      actualWeight: '1800',
      chargeableWeight: '2000',      paid: '0',
      toBeBill: '13020',
      toPay: '0',
      paymentType: 'toBeBill',
      deliveryAt: 'RST Warehouse',
      total: '13020',
      remarks: 'Fragile items'
    },
    {
      consignorName: 'LMN Enterprises',
      consignorAddress1: '321 Business Park',
      consignorCity: 'Pune',
      consignorState: 'Maharashtra',
      consignorPincode: '411001',
      consignorGstin: '27LMNEN1234H1Z7',
      consignorPan: 'LMNEN1234H',
      consigneeName: 'Global Textiles Inc.',
      consigneeAddress1: '987 Textile Zone',
      consigneeCity: 'Surat',
      consigneeState: 'Gujarat',
      consigneePincode: '395001',      consigneeGstin: '24GLTEX1234M1Z1',
      consigneePan: 'GLTEX1234M',
      truckNumber: 'KA 05 BC 3456',
      date: '2025-01-17',
      to: 'Surat',
      from: 'Tarapur',
      nos: ['75', '25', '10'],
      particulars: ['Raw Materials', 'Chemicals', 'Dyes'],
      freight: '18000',      hamali: '600',
      aoc: '300',
      doorDelivery: '400',
      collection: '150',
      stCharge: '20',
      extraLoading: '500',
      actualWeight: '3200',
      chargeableWeight: '3500',      paid: '0',
      toBeBill: '0',
      toPay: '19470',
      paymentType: 'toPay',
      deliveryAt: 'Global Textiles Factory',
      total: '19470',
      remarks: 'Chemical items - handle carefully'
    },
    {
      consignorName: 'Tech Solutions Pvt. Ltd.',
      consignorAddress1: '555 IT Park, Block A',
      consignorCity: 'Hyderabad',
      consignorState: 'Telangana',
      consignorPincode: '500001',
      consignorGstin: '36TECHS1234T1Z4',
      consignorPan: 'TECHS1234T',
      consigneeName: 'Innovation Hub Ltd.',
      consigneeAddress1: '777 Tech Valley, Phase 2',
      consigneeCity: 'Chennai',
      consigneeState: 'Tamil Nadu',
      consigneePincode: '600001',      consigneeGstin: '33INNOV1234C1Z8',
      consigneePan: 'INNOV1234C',
      truckNumber: 'DL 8C AA 9012',
      date: '2025-01-18',
      to: 'Chennai',
      from: 'Bhiwandi',
      nos: ['20', '15'],
      particulars: ['Servers', 'Networking Equipment'],
      freight: '25000',      hamali: '800',
      aoc: '400',
      doorDelivery: '500',
      collection: '200',
      stCharge: '20',
      extraLoading: '300',
      actualWeight: '1500',
      chargeableWeight: '1500',      paid: '26220',
      toBeBill: '0',
      toPay: '0',
      paymentType: 'paid',
      deliveryAt: 'Innovation Hub Data Center',
      total: '26220',
      remarks: 'High-value electronic equipment'
    }
  ];    const [formData, setFormData] = useState({
    consignorName: '',
    consignorAddress1: '',
    consignorCity: '',
    consignorState: '',
    consignorPincode: '',
    consignorGstin: '',
    consignorPan: '',
    consigneeName: '',
    consigneeAddress1: '',
    consigneeCity: '',
    consigneeState: '',
    consigneePincode: '',
    consigneeGstin: '',
    consigneePan: '',
    cnNumber: '',
    truckNumber: '',
    date: '',
    to: '',
    from: '',
    nos: [''],
    particulars: [''],    freight: '',
    hamali: '',
    aoc: '',
    doorDelivery: '',
    collection: '',
    stCharge: '20', // Default value is 20
    extraLoading: '',
    actualWeight: '',
    chargeableWeight: '',paid: '',
    toBeBill: '',
    toPay: '',
    paymentType: 'paid', // 'paid', 'toBeBill', or 'toPay'
    deliveryAt: '',
	total: '',    remarks: ''
  });
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateGSTIN = (gstin) => {
    if (!gstin) return '';
    // GSTIN format: 15 characters - 2 digits (state code) + 10 alphanumeric (PAN) + 1 alpha + 1 alphanumeric + 1 alphanumeric
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin.toUpperCase())) {
      return 'Invalid GSTIN format. Expected format: 27ABCDE1234F1Z5';
    }
    return '';
  };

  const validatePAN = (pan) => {
    if (!pan) return '';
    // PAN format: 5 letters + 4 digits + 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase())) {
      return 'Invalid PAN format. Expected format: ABCDE1234F';
    }
    return '';
  };

  const validatePincode = (pincode) => {
    if (!pincode) return '';
    // Indian PIN code format: 6 digits
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return 'Invalid PIN code. Must be 6 digits and cannot start with 0';
    }
    return '';
  };
  const validateTruckNumber = (truckNumber) => {
    if (!truckNumber) return '';
    // Indian truck number format: AA 00 AA 0000 or AA00AA0000
    const truckRegex = /^[A-Z]{2}[\s-]?[0-9]{2}[\s-]?[A-Z]{2}[\s-]?[0-9]{4}$/;
    if (!truckRegex.test(truckNumber.toUpperCase().replace(/\s+/g, ' '))) {
      return 'Invalid truck number format. Expected format: MH 12 AB 1234';
    }
    return '';
  };

  // Validate field on change
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'consignorGstin':
      case 'consigneeGstin':
        error = validateGSTIN(value);
        break;
      case 'consignorPan':
      case 'consigneePan':
        error = validatePAN(value);
        break;
      case 'consignorPincode':
      case 'consigneePincode':
        error = validatePincode(value);
        break;
      case 'truckNumber':
        error = validateTruckNumber(value);
        break;
      default:
        break;
    }    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));    return error === '';
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const requiredFields = {
      // Consignor details
      consignorName: 'Consignor name is required',
      consignorAddress1: 'Consignor address is required',
      consignorCity: 'Consignor city is required',
      consignorState: 'Consignor state is required',
      consignorPincode: 'Consignor PIN code is required',
      consignorGstin: 'Consignor GSTIN is required',
      consignorPan: 'Consignor PAN is required',
      
      // Consignee details
      consigneeName: 'Consignee name is required',
      consigneeAddress1: 'Consignee address is required',
      consigneeCity: 'Consignee city is required',
      consigneeState: 'Consignee state is required',
      consigneePincode: 'Consignee PIN code is required',
      consigneeGstin: 'Consignee GSTIN is required',
      consigneePan: 'Consignee PAN is required',
        // Transport details
      truckNumber: 'Truck number is required',
      date: 'Date is required',
      from: 'From location is required',
      to: 'To location is required',
      
      // Weight details
      actualWeight: 'Actual weight is required',
      chargeableWeight: 'Chargeable weight is required',
      
      // Payment details
      deliveryAt: 'Delivery location is required'
    };

    const errors = {};
    let hasErrors = false;

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = requiredFields[field];
        hasErrors = true;
      }
    });

    // Check nos and particulars arrays
    if (!formData.nos || formData.nos.length === 0 || formData.nos.every(item => !item || item.trim() === '')) {
      errors.nos = 'At least one item quantity is required';
      hasErrors = true;
    }

    if (!formData.particulars || formData.particulars.length === 0 || formData.particulars.every(item => !item || item.trim() === '')) {
      errors.particulars = 'At least one item description is required';
      hasErrors = true;
    }

    // Validate payment type selection
    const paymentAmount = parseFloat(formData.paid) || 0;
    const toBeBillAmount = parseFloat(formData.toBeBill) || 0;
    const toPayAmount = parseFloat(formData.toPay) || 0;

    if (paymentAmount === 0 && toBeBillAmount === 0 && toPayAmount === 0) {
      errors.paymentType = 'Please specify payment amount in at least one payment type';
      hasErrors = true;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));    return !hasErrors;
  };

  // Check if company already exists with same data
  const findExistingCompany = (companyData) => {
    return companies.find(company => 
      company.name === companyData.name &&
      company.address === companyData.address &&
      company.city === companyData.city &&
      company.state === companyData.state &&
      company.pin_code === companyData.pin_code &&
      company.gstin === companyData.gstin &&
      company.pan === companyData.pan
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate the field if it's one of the fields we validate
    validateField(name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleDivClick = (e) => {
    const input = e.currentTarget.querySelector('input');
    if (input) {
      input.focus();
    }  };

  const handlePrint = () => {
    window.print();
  };

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
    loadTrucks();
  }, []);

  // Load companies from API
  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ limit: 1000 });
      if (response.success) {
        setCompanies(response.data.companies || []);
        setFilteredConsignorCompanies(response.data.companies || []);
        setFilteredConsigneeCompanies(response.data.companies || []);
      }    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  // Load trucks from API
  const loadTrucks = async () => {
    try {
      const response = await truckService.getTrucks({ limit: 1000 });
      if (response.success) {
        setTrucks(response.data.trucks || []);
      }
    } catch (error) {
      console.error('Error loading trucks:', error);
    }
  };

  // Handle company name input changes with search
  const handleCompanyNameChange = (e, type) => {
    const { value } = e.target;
    
    if (type === 'consignor') {
      setFormData(prev => ({ ...prev, consignorName: value }));
      filterCompanies(value, 'consignor');
      setShowConsignorDropdown(true);
      setFocusedConsignorIndex(-1); // Reset focus when typing
      setConsignorSelectedFromDropdown(false); // Reset selection state when typing
      // Clear NEW state when user starts typing again
      if (addConsignorCompany && value !== formData.consignorName) {
        setAddConsignorCompany(false);
      }
    } else {
      setFormData(prev => ({ ...prev, consigneeName: value }));
      filterCompanies(value, 'consignee');
      setShowConsigneeDropdown(true);
      setFocusedConsigneeIndex(-1); // Reset focus when typing
      setConsigneeSelectedFromDropdown(false); // Reset selection state when typing
      // Clear NEW state when user starts typing again
      if (addConsigneeCompany && value !== formData.consigneeName) {
        setAddConsigneeCompany(false);
      }
    }
  };

  // Filter companies based on search term
  const filterCompanies = (searchTerm, type) => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (type === 'consignor') {
      setFilteredConsignorCompanies(filtered);
    } else {
      setFilteredConsigneeCompanies(filtered);
    }
  };  // Select a company from dropdown
  const selectCompany = (company, type) => {
    if (type === 'consignor') {
      setFormData(prev => ({
        ...prev,
        consignorName: company.name,
        consignorAddress1: company.address || '',
        consignorCity: company.city || '',
        consignorState: company.state || '',
        consignorPincode: company.pin_code || '',
        consignorGstin: company.gstin || '',
        consignorPan: company.pan || ''
      }));
      setShowConsignorDropdown(false);
      setFocusedConsignorIndex(-1);
      setAddConsignorCompany(false); // Clear NEW state when selecting existing company
      setConsignorSelectedFromDropdown(true); // Mark as selected from dropdown
    } else {
      setFormData(prev => ({
        ...prev,
        consigneeName: company.name,
        consigneeAddress1: company.address || '',
        consigneeCity: company.city || '',
        consigneeState: company.state || '',
        consigneePincode: company.pin_code || '',
        consigneeGstin: company.gstin || '',
        consigneePan: company.pan || ''
      }));
      setShowConsigneeDropdown(false);
      setFocusedConsigneeIndex(-1);
      setAddConsigneeCompany(false); // Clear NEW state when selecting existing company
      setConsigneeSelectedFromDropdown(true); // Mark as selected from dropdown
    }
  };// Create new company
  const createNewCompany = (type) => {
    if (type === 'consignor') {
      setAddConsignorCompany(true);
      setShowConsignorDropdown(false);
      setFocusedConsignorIndex(-1);
    } else {
      setAddConsigneeCompany(true);
      setShowConsigneeDropdown(false);
      setFocusedConsigneeIndex(-1);
    }
  };
  // Handle form submission with company creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields first
    if (!validateRequiredFields()) {
      alert('Please fill in all required fields before submitting.');
      return;
    }
    
    try {
      let consignorId = null;
      let consigneeId = null;      // Handle consignor company - create new unless selected from dropdown
      if (!consignorSelectedFromDropdown) {
        // Check if company already exists before creating new one
        const consignorData = {
          name: formData.consignorName,
          address: formData.consignorAddress1,
          city: formData.consignorCity,
          state: formData.consignorState,
          pin_code: formData.consignorPincode,
          gstin: formData.consignorGstin,
          pan: formData.consignorPan
        };
        
        // First check if company already exists
        const existingConsignor = findExistingCompany(consignorData);
        if (existingConsignor) {
          consignorId = existingConsignor.id;
          console.log('Using existing consignor company:', existingConsignor.name);
        } else {
          // Create new company only if it doesn't exist
          const consignorResponse = await companyService.createCompany(consignorData);
          if (consignorResponse.success) {
            consignorId = consignorResponse.data.id;
            console.log('Created new consignor company:', consignorData.name);
            // Refresh companies list to include the new company
            await loadCompanies();
          } else {
            alert('Error creating consignor company. Please try again.');
            return;
          }
        }
      } else {
        // Find existing consignor (was selected from dropdown)
        const existingConsignor = companies.find(c => c.name === formData.consignorName);
        if (existingConsignor) {
          consignorId = existingConsignor.id;
        }
      }      // Handle consignee company - create new unless selected from dropdown
      if (!consigneeSelectedFromDropdown) {
        // Check if company already exists before creating new one
        const consigneeData = {
          name: formData.consigneeName,
          address: formData.consigneeAddress1,
          city: formData.consigneeCity,
          state: formData.consigneeState,          pin_code: formData.consigneePincode,
          gstin: formData.consigneeGstin,
          pan: formData.consigneePan
        };
        
        // First check if company already exists
        const existingConsignee = findExistingCompany(consigneeData);
        if (existingConsignee) {
          consigneeId = existingConsignee.id;
          console.log('Using existing consignee company:', existingConsignee.name);
        } else {
          // Create new company only if it doesn't exist
          const consigneeResponse = await companyService.createCompany(consigneeData);
          if (consigneeResponse.success) {
            consigneeId = consigneeResponse.data.id;
            console.log('Created new consignee company:', consigneeData.name);
            // Refresh companies list to include the new company
            await loadCompanies();
          } else {
            alert('Error creating consignee company. Please try again.');
            return;
          }
        }
      } else {
        // Find existing consignee (was selected from dropdown)
        const existingConsignee = companies.find(c => c.name === formData.consigneeName);
        if (existingConsignee) {
          consigneeId = existingConsignee.id;
        }
      }// Validate that we have both company IDs
      if (!consignorId || !consigneeId) {
        alert('Error: Unable to determine consignor or consignee company. Please try again.');
        return;
      }      // Prepare lorry receipt data (only with company references)
      const lorryReceiptData = {
        truck_number: formData.truckNumber,
        lr_date: formData.date,
        to_location: formData.to,
        from_location: formData.from,
        consignor_id: consignorId,
        consignee_id: consigneeId,
        nos: JSON.stringify(formData.nos),
        particulars: JSON.stringify(formData.particulars),
        freight: parseFloat(formData.freight) || 0,
        hamali: parseFloat(formData.hamali) || 0,
        aoc: parseFloat(formData.aoc) || 0,
        door_delivery: parseFloat(formData.doorDelivery) || 0,
        collection: parseFloat(formData.collection) || 0,
        st_charge: parseFloat(formData.stCharge) || 0,
        extra_loading: parseFloat(formData.extraLoading) || 0,
        actual_weight: parseFloat(formData.actualWeight) || 0,
        chargeable_weight: parseFloat(formData.chargeableWeight) || 0,        paid: parseFloat(formData.paid) || 0,
        to_be_bill: parseFloat(formData.toBeBill) || 0,
        to_pay: parseFloat(formData.toPay) || 0,
        payment_type: formData.paymentType,
        delivery_at: formData.deliveryAt,
        total: parseFloat(formData.total) || 0,
        remarks: formData.remarks
      };// Create lorry receipt
      const response = await lorryReceiptService.createLorryReceipt(lorryReceiptData);

      if (response.success) {
        alert('Lorry Receipt created successfully!');
        navigate('/lorry-receipts');
      } else {
        alert('Error creating lorry receipt');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error creating lorry receipt');
    }
  };  // Fill dummy data function
  const fillDummyData = () => {
    const currentDummy = dummyData[dummyDataIndex];    // Exclude cnNumber from dummy data since it should be auto-generated
    const { cnNumber: _cnNumber, ...dummyDataWithoutCN } = currentDummy;
    setFormData(prev => ({
      ...prev,
      ...dummyDataWithoutCN
    }));
    setDummyDataIndex((prev) => (prev + 1) % dummyData.length);
    
    // Reset company creation flags
    setAddConsignorCompany(false);
    setAddConsigneeCompany(false);
    setConsignorSelectedFromDropdown(false);
    setConsigneeSelectedFromDropdown(false);
  };// Handle input blur - check if should set add company state
  const handleCompanyInputBlur = (type) => {
    // Use setTimeout to allow for click on dropdown items
    setTimeout(() => {
      const companyName = type === 'consignor' ? formData.consignorName : formData.consigneeName;
      const isDropdownOpen = type === 'consignor' ? showConsignorDropdown : showConsigneeDropdown;
      
      if (!isDropdownOpen && companyName && companyName.trim() !== '') {
        const existingCompany = companies.find(c => 
          c.name.toLowerCase() === companyName.toLowerCase()
        );
        
        if (!existingCompany) {
          if (type === 'consignor') {
            setAddConsignorCompany(true);
          } else {
            setAddConsigneeCompany(true);
          }
        }
      }
    }, 150); // Small delay to allow dropdown clicks
  };  // Handle keyboard navigation for company dropdowns
  const handleCompanyKeyDown = (e, type) => {
    const isConsignor = type === 'consignor';
    const isDropdownOpen = isConsignor ? showConsignorDropdown : showConsigneeDropdown;
    const filteredCompanies = isConsignor ? filteredConsignorCompanies : filteredConsigneeCompanies;
    const focusedIndex = isConsignor ? focusedConsignorIndex : focusedConsigneeIndex;
    const setFocusedIndex = isConsignor ? setFocusedConsignorIndex : setFocusedConsigneeIndex;
    
    // Total options = filtered companies only (no create new company option in dropdown anymore)
    const totalOptions = filteredCompanies.length;

    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: Move focus back to input if in dropdown, or allow normal tab behavior
          if (focusedIndex >= 0) {
            setFocusedIndex(-1);
            const inputRef = isConsignor ? consignorInputRef : consigneeInputRef;
            inputRef.current?.focus();
          } else {
            // Allow normal tab behavior to go to previous field
            return;
          }
        } else {
          // Tab: Move focus to first dropdown item if on input, or cycle through dropdown
          if (focusedIndex < 0 && totalOptions > 0) {
            setFocusedIndex(0);
          } else if (focusedIndex >= 0 && focusedIndex < totalOptions - 1) {
            setFocusedIndex(focusedIndex + 1);
          } else {
            // Allow normal tab behavior to go to next field
            if (isConsignor) {
              setShowConsignorDropdown(false);
              setFocusedConsignorIndex(-1);
            } else {
              setShowConsigneeDropdown(false);
              setFocusedConsigneeIndex(-1);
            }
            return;
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusedIndex < totalOptions - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1);
        } else if (focusedIndex === 0) {
          setFocusedIndex(-1);
          const inputRef = isConsignor ? consignorInputRef : consigneeInputRef;
          inputRef.current?.focus();
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCompanies.length) {
          // Select existing company
          selectCompany(filteredCompanies[focusedIndex], type);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (isConsignor) {
          setShowConsignorDropdown(false);
          setFocusedConsignorIndex(-1);
        } else {
          setShowConsigneeDropdown(false);
          setFocusedConsigneeIndex(-1);
        }
        break;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    // Check if company name matches existing and set add company state accordingly
    const checkAndSetAddCompanyState = (companyName, type) => {
      if (!companyName || companyName.trim() === '') {
        return;
      }
      
      const existingCompany = companies.find(c => 
        c.name.toLowerCase() === companyName.toLowerCase()
      );
      
      if (!existingCompany) {
        if (type === 'consignor') {
          setAddConsignorCompany(true);
        } else {
          setAddConsigneeCompany(true);
        }
      }
    };

    const handleClickOutside = (event) => {
      if (consignorDropdownRef.current && !consignorDropdownRef.current.contains(event.target)) {
        if (showConsignorDropdown) {
          checkAndSetAddCompanyState(formData.consignorName, 'consignor');
        }
        setShowConsignorDropdown(false);
      }
      if (consigneeDropdownRef.current && !consigneeDropdownRef.current.contains(event.target)) {
        if (showConsigneeDropdown) {
          checkAndSetAddCompanyState(formData.consigneeName, 'consignee');
        }
        setShowConsigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConsignorDropdown, showConsigneeDropdown, formData.consignorName, formData.consigneeName, companies]);  // Handle From field input and dropdown
  const handleFromInputChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, from: value }));
    setShowFromDropdown(true);
  };
  const generateCnNumber = async (location) => {
    try {
      const prefix = location === 'Tarapur' ? 'TPR' : 'BWD';
      
      // Fetch the highest CN number from database for this prefix
      const response = await lorryReceiptService.getNextCnNumber(prefix);
      
      if (response.success) {
        return `${prefix}-${response.data.nextNumber.toString().padStart(3, '0')}`;
      } else {
        // Fallback to 001 if API fails
        return `${prefix}-001`;
      }
    } catch (error) {
      console.error('Error generating CN number:', error);
      // Fallback to 001 if API fails
      const prefix = location === 'Tarapur' ? 'TPR' : 'BWD';
      return `${prefix}-001`;
    }
  };

  const selectFromLocation = async (location) => {
    const cnNumber = await generateCnNumber(location);
    setFormData(prev => ({ 
      ...prev, 
      from: location,
      cnNumber: cnNumber
    }));
    setShowFromDropdown(false);
  };

  const handleFromInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowFromDropdown(false);
    }, 200);
  };
  // Generate CN number when form loads if location is selected
  useEffect(() => {
    if (formData.from && !formData.cnNumber) {
      generateCnNumber(formData.from).then(cnNumber => {
        setFormData(prev => ({ ...prev, cnNumber }));
      });
    }  }, [formData.from, formData.cnNumber]);
  // Handle Truck field input and dropdown
  const handleTruckInputChange = (e) => {
    const { value } = e.target;
    
    // Auto-capitalize truck number
    const capitalizedValue = value.toUpperCase();
    
    // Validate truck number
    validateField('truckNumber', capitalizedValue);
    
    setFormData(prev => ({ ...prev, truckNumber: capitalizedValue }));
    setShowTruckDropdown(true);
  };

  const selectTruck = (truck) => {
    // Validate selected truck number
    validateField('truckNumber', truck.truck_number);
    
    setFormData(prev => ({ ...prev, truckNumber: truck.truck_number }));
    setShowTruckDropdown(false);
  };
  const handleTruckInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowTruckDropdown(false);
    }, 200);  };

  // Calculate total automatically when charge fields change
  useEffect(() => {
    const calculateTotal = () => {
      const freight = parseFloat(formData.freight) || 0;
      const hamali = parseFloat(formData.hamali) || 0;
      const aoc = parseFloat(formData.aoc) || 0;
      const doorDelivery = parseFloat(formData.doorDelivery) || 0;
      const collection = parseFloat(formData.collection) || 0;
      const stCharge = parseFloat(formData.stCharge) || 0;
      const extraLoading = parseFloat(formData.extraLoading) || 0;
      
      const total = freight + hamali + aoc + doorDelivery + collection + stCharge + extraLoading;
      
      // Update total field
      setFormData(prev => ({ ...prev, total: total.toString() }));
    };

    calculateTotal();
  }, [formData.freight, formData.hamali, formData.aoc, formData.doorDelivery, formData.collection, formData.stCharge, formData.extraLoading]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
		<div className="max-w-7xl mx-auto">
		<div className="flex justify-between items-center mb-4">
			<button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDummyData}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Fill Dummy Data
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create
            </button>
            <button
              onClick={handlePrint}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Print
            </button>
          </div>
        </div>
		<div className='flex justify-center items-center relative'>
		<div className='w-[90%] flex justify-center items-center mb-4 relative'>
			<div className='flex-1 flex justify-left ml-18'>
				<img src={BillHeader} alt="BillLogo" className="max-w-154 h-auto" />
			</div>
			<div className='absolute right-0 text-right text-xs font-medium text-gray-700 leading-tight'>
				<div className='mb-2 font-bold'>SUBJECT TO PALGHAR JURISDICTION</div>
				<div className='mb-2'>
					<div className='font-semibold'>Daily Part Load Service to -</div>
					<div>Tarapur, Bhiwandi, Palghar,</div>
					<div>Vashi, Taloja, Kolgoan Genises</div>
				</div>
				<div className='font-bold text-red-600 border border-red-600 px-2 py-1 inline-block'>
					DRIVERS COPY
				</div>
			</div>
		</div>
		</div>
        <form onSubmit={handleSubmit} className="lorry-receipt-form">
          <div className="container bg-white">
            {/* Consignor / Consignee */}            <div className="row-container">
              <table className="left-table">
                <tbody>
                  <tr>
                    <td className="left-cell">
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Consignor - M/s <span className="text-red-500">*</span></strong>
                        <div className="w-full">
                          <div className="input-container w-full relative" ref={consignorDropdownRef}>
                            <input
                              ref={consignorInputRef}
                              type="text"
                              name="consignorName"
                              value={formData.consignorName}
                              onChange={(e) => handleCompanyNameChange(e, 'consignor')}
                              onFocus={() => setShowConsignorDropdown(true)}
                              onBlur={() => handleCompanyInputBlur('consignor')}
                              onKeyDown={(e) => handleCompanyKeyDown(e, 'consignor')}
                              className="form-input"
                              placeholder="Company Name"
                              autoComplete="off"
                            />
                            {addConsignorCompany && (
                              <span className="absolute right-2 top-1 text-xs text-green-600 font-semibold">NEW</span>
                            )}
                              {showConsignorDropdown && (
                              <>
                                {/* Create New Company Button above dropdown */}
                                <div className="absolute bottom-full left-0 right-0 mb-1">
                                  <button
                                    type="button"
                                    onClick={() => createNewCompany('consignor')}
                                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                    <span className="mr-2">+</span>
                                    Create New Company
                                  </button>
                                </div>
                                
                                {/* Dropdown with companies */}
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                  {/* Show filtered companies */}
                                  {filteredConsignorCompanies.map((company, index) => (
                                  <div
                                    key={company.id}
                                    className={`px-3 py-2 cursor-pointer border-b border-gray-100 ${
                                      focusedConsignorIndex === index 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => selectCompany(company, 'consignor')}
                                  >
                                    <div className="font-medium text-sm">{company.name}</div>
                                    {company.city && (
                                      <div className="text-xs text-gray-500">{company.city}, {company.state}</div>
                                    )}
                                  </div>
                                ))}                                
                                {filteredConsignorCompanies.length === 0 && formData.consignorName && (
                                  <div className="px-3 py-2 text-gray-500 text-sm">
                                    No companies found
                                  </div>
                                )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="input-container" onClick={handleDivClick}>
                        <input
                          type="text"
                          name="consignorAddress1"
                          value={formData.consignorAddress1}                          onChange={handleInputChange}
                          className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                          placeholder="Address"
                          disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                        />
                      </div>
                      <div className="flex gap-2">                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorCity"
                            value={formData.consignorCity}                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="City"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorState"
                            value={formData.consignorState}                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="State"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorPincode"
                            value={formData.consignorPincode}                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consignorPincode ? 'border-red-500' : ''}`}
                            placeholder="Pin Code"
                            style={{ width: '80px' }}
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                          {validationErrors.consignorPincode && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consignorPincode}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorGstin"
                            value={formData.consignorGstin}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consignorGstin ? 'border-red-500' : ''}`}                            placeholder="GSTIN"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                          {validationErrors.consignorGstin && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consignorGstin}</div>
                          )}
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorPan"
                            value={formData.consignorPan}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consignorPan ? 'border-red-500' : ''}`}                            placeholder="PAN"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                          {validationErrors.consignorPan && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consignorPan}</div>
                          )}
                        </div></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="left-cell">
                      <div className="flex items-center mb-2">
                        <strong className="mr-2 whitespace-nowrap">Consignee - M/s <span className="text-red-500">*</span></strong>
                        <div className="w-full">
                          <div className="input-container w-full relative" ref={consigneeDropdownRef}>
                            <input
                              ref={consigneeInputRef}
                              type="text"
                              name="consigneeName"
                              value={formData.consigneeName}
                              onChange={(e) => handleCompanyNameChange(e, 'consignee')}
                              onFocus={() => setShowConsigneeDropdown(true)}
                              onBlur={() => handleCompanyInputBlur('consignee')}
                              onKeyDown={(e) => handleCompanyKeyDown(e, 'consignee')}
                              className="form-input"
                              placeholder="Company Name"
                              autoComplete="off"
                            />
                            {addConsigneeCompany && (
                              <span className="absolute right-2 top-1 text-xs text-green-600 font-semibold">NEW</span>
                            )}
                              {showConsigneeDropdown && (
                              <>
                                {/* Create New Company Button above dropdown */}
                                <div className="absolute bottom-full left-0 right-0 mb-1">
                                  <button
                                    type="button"
                                    onClick={() => createNewCompany('consignee')}
                                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                    <span className="mr-2">+</span>
                                    Create New Company
                                  </button>
                                </div>
                                
                                {/* Dropdown with companies */}
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                  {/* Show filtered companies */}
                                  {filteredConsigneeCompanies.map((company, index) => (
                                    <div
                                      key={company.id}
                                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 ${
                                        focusedConsigneeIndex === index 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'hover:bg-gray-100'
                                      }`}
                                      onClick={() => selectCompany(company, 'consignee')}
                                    >
                                      <div className="font-medium text-sm">{company.name}</div>
                                      {company.city && (
                                        <div className="text-xs text-gray-500">{company.city}, {company.state}</div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {filteredConsigneeCompanies.length === 0 && formData.consigneeName && (
                                    <div className="px-3 py-2 text-gray-500 text-sm">
                                      No companies found
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div></div>
                      </div>
                      <div className="input-container" onClick={handleDivClick}><input
                          type="text"
                          name="consigneeAddress1"
                          value={formData.consigneeAddress1}
                          onChange={handleInputChange}
                          className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                          placeholder="Address Line"
                          disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneeCity"
                            value={formData.consigneeCity}                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="City"
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneeState"
                            value={formData.consigneeState}
                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="State"
                          />
                        </div>
						<div className="input-container" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneePincode"
                            value={formData.consigneePincode}                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consigneePincode ? 'border-red-500' : ''}`}
                            placeholder="Pin Code"
                            style={{ width: '80px' }}
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                          {validationErrors.consigneePincode && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consigneePincode}</div>
                          )}
                        </div>
                      </div>                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneeGstin"
                            value={formData.consigneeGstin}
                            onChange={handleInputChange}                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consigneeGstin ? 'border-red-500' : ''}`}
                            placeholder="GSTIN"
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                          {validationErrors.consigneeGstin && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consigneeGstin}</div>
                          )}
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneePan"
                            value={formData.consigneePan}
                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''} ${validationErrors.consigneePan ? 'border-red-500' : ''}`}                            placeholder="PAN"
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                          {validationErrors.consigneePan && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.consigneePan}</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>              
				</table>
              <table className="right-table">
                <tbody>
                  <tr>
                    <td>
                      <strong>CN't No. - </strong>
                      <div className="input-container inline-block" onClick={handleDivClick}>
                        <input
                          type="text"
                          name="cnNumber"
                          value={formData.cnNumber}
                          className="form-input-small bg-gray-100"
                          readOnly
                          placeholder="Select location first"                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Truck No. - <span className="text-red-500">*</span></strong>
                      <div className="relative inline-block">
                        <div className="input-container inline-block" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="truckNumber"
                            value={formData.truckNumber}
                            onChange={handleTruckInputChange}
                            onFocus={() => setShowTruckDropdown(true)}
                            onBlur={handleTruckInputBlur}
                            className={`form-input-small ${validationErrors.truckNumber ? 'border-red-500' : ''}`}
                            placeholder="Truck Number"
                            autoComplete="off"
                          />
                          {validationErrors.truckNumber && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors.truckNumber}</div>
                          )}
                        </div>
                        {showTruckDropdown && (
                          <div 
                            ref={truckDropdownRef}
                            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                            style={{ minWidth: '200px' }}
                          >
                            {trucks.map((truck) => (
                              <div
                                key={truck.id}
                                className="px-3 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-100"
                                onClick={() => selectTruck(truck)}
                              >
                                <div className="font-medium text-sm">{truck.truck_number}</div>
                                <div className="text-xs text-gray-500">{truck.truck_type} - {truck.capacity_ton}T</div>
                              </div>
                            ))}
                            {trucks.length === 0 && (
                              <div className="px-3 py-2 text-gray-500 text-sm">
                                No trucks found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Date - <span className="text-red-500">*</span></strong>
                      <div className="input-container inline-block" onClick={handleDivClick}>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="form-input-small"                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>From - <span className="text-red-500">*</span></strong>
                      <div className="relative inline-block">
                        <div className="input-container inline-block" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="from"
                            value={formData.from}
                            onChange={handleFromInputChange}
                            onFocus={() => setShowFromDropdown(true)}
                            onBlur={handleFromInputBlur}
                            className="form-input-small"
                            placeholder="From Location"
                            autoComplete="off"
                          />
                        </div>                        {showFromDropdown && (
                          <div 
                            ref={fromDropdownRef}
                            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                            style={{ minWidth: '150px' }}
                          >
                            {['Tarapur', 'Bhiwandi'].map((location) => (
                              <div
                                key={location}
                                className="px-3 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-100"
                                onClick={() => selectFromLocation(location)}
                              >
                                <div className="font-medium text-sm">{location}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>To - <span className="text-red-500">*</span></strong>
                      <div className="input-container inline-block" onClick={handleDivClick}>
                        <input
                          type="text"
                          name="to"
                          value={formData.to}
                          onChange={handleInputChange}
                          className="form-input-small"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Address Block + Main Table */}
            <table>
              <tbody>
                <tr>
                  <td rowSpan="2" width="18%">
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
					<br />
                    <b>PAN: AGTPV0112D<br />
                    GSTIN: 27AGTPV0112D1ZG</b>
					</td>
                  {/* Freight Table */}
                  <td colSpan="3">                    <table style={{ height: '330px', borderCollapse: 'collapse', width: '100%' }}>
                      <tbody>
                        <tr className="bold center">
                          <td width="10%">Nos. <span className="text-red-500">*</span></td>
                          <td width="60%">Particulars <span className="text-red-500">*</span></td>
                          <td width="18%" colSpan="2">Rate Rs.</td>
                          <td width="12%">Weight</td>
                        </tr>
                        <tr>{/* Nos. */}
                          <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                            {formData.nos.map((nos, index) => (
                              <div key={index} className="flex items-center mb-2">
                                <div className="input-container flex-1" onClick={handleDivClick}>
                                  <input
                                    type="text"
                                    value={nos}
                                    onChange={(e) => handleArrayInputChange(index, 'nos', e.target.value)}
                                    className="form-input-nos"
                                    placeholder={`Nos ${index + 1}`}
                                  />
                                </div>
                                {formData.nos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayField(index, 'nos')}
                                    className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addArrayField('nos')}
                              className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                            >
                              + Add More
                            </button>
                          </td>

                          {/* Particulars */}
                          <td style={{ borderRight: '1px solid #000', padding: '4px' }}>
                            {formData.particulars.map((particular, index) => (
                              <div key={index} className="flex items-center mb-2">
                                <div className="input-container flex-1" onClick={handleDivClick}>
                                  <input
                                    type="text"
                                    value={particular}
                                    onChange={(e) => handleArrayInputChange(index, 'particulars', e.target.value)}
                                    className="form-input-particulars"
                                    placeholder={`Particulars ${index + 1}`}
                                  />
                                </div>
                                {formData.particulars.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayField(index, 'particulars')}
                                    className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addArrayField('particulars')}
                              className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                            >
                              + Add More
                            </button>
                          </td>                          
						  {/* Left Rate Rs. subcolumn */}
                          <td style={{ padding: 0, verticalAlign: 'top', borderBottom: '1px solid #000', width: '17%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Freight
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Hamali
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                A.O.C
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Door Dely
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Collection
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                St.Charge
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Extra Loading <br /> paid by us
                              </div>
                              <div style={{flex: '1',  padding: '4px', display: 'flex', alignItems: 'center' }}>
                                Total
                              </div>
                            </div>
                          </td>

                          {/* Right Rate Rs. subcolumn */}
                          <td style={{ padding: 0, verticalAlign: 'top', borderBottom: '1px solid #000', width: '15%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="freight"
                                    value={formData.freight}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="hamali"
                                    value={formData.hamali}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="aoc"
                                    value={formData.aoc}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="doorDelivery"
                                    value={formData.doorDelivery}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="collection"
                                    value={formData.collection}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="stCharge"
                                    value={formData.stCharge}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{  flex: '1', borderBottom: '1px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
                                    type="text"
                                    name="extraLoading"
                                    value={formData.extraLoading}
                                    onChange={handleInputChange}
                                    className="form-input-rate"
                                  />
                                </div>
                              </div>
                              <div style={{ flex: '1', padding: '2px', display: 'flex', alignItems: 'center' }}>                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                  <input
									type="text"
									name="total"
									value={formData.total}
									readOnly
									className="form-input-total"
									style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
								  />
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: 0, verticalAlign: 'top', borderBottom: '1px solid #000', width: '17%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                              <div style={{ flex: '2', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Actual&nbsp;&nbsp;<span className="text-red-500">*</span>                                <div className="input-container inline-block" onClick={handleDivClick}>
                                  <input
                                    type="text"
                                    name="actualWeight"
                                    value={formData.actualWeight}
                                    onChange={handleInputChange}
                                    className={`form-input-weight ${validationErrors.actualWeight ? 'border-red-500' : ''}`}
                                  />
                                  {validationErrors.actualWeight && (
                                    <div className="text-red-500 text-xs mt-1">{validationErrors.actualWeight}</div>
                                  )}
                                </div>
                                &nbsp;Kg.
                              </div>
                              <div style={{ flex: '2', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>                                <div className="input-container inline-block" onClick={handleDivClick}>
                                  <input
                                    type="text"
                                    name="chargeableWeight"
                                    value={formData.chargeableWeight}
                                    onChange={handleInputChange}
                                    className={`form-input-weight ${validationErrors.chargeableWeight ? 'border-red-500' : ''}`}
                                  />
                                  {validationErrors.chargeableWeight && (
                                    <div className="text-red-500 text-xs mt-1">{validationErrors.chargeableWeight}</div>
                                  )}
                                </div>
                                &nbsp;Chargeable <span className="text-red-500">*</span>
                              </div>                              <div style={{ flex: '2', borderBottom: '1px solid #000', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '10px' }}>                                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="radio"
                                    id="payment-paid"
                                    name="paymentType"
                                    value="paid"
                                    checked={formData.paymentType === 'paid'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                                    style={{ marginRight: '4px' }}
                                  />
                                  <label htmlFor="payment-paid">Paid</label>
                                </div>
                                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="radio"
                                    id="payment-toBeBill"
                                    name="paymentType"
                                    value="toBeBill"
                                    checked={formData.paymentType === 'toBeBill'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                                    style={{ marginRight: '4px' }}
                                  />
                                  <label htmlFor="payment-toBeBill">To be Bill</label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="radio"
                                    id="payment-toPay"
                                    name="paymentType"
                                    value="toPay"
                                    checked={formData.paymentType === 'toPay'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                                    style={{ marginRight: '4px' }}
                                  />
                                  <label htmlFor="payment-toPay">To Pay</label>
                                </div>
                              </div>
                              <div style={{ flex: '1', padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '11px' }}>
                                Goods entirely<br />booked at <br/><b>OWNER'S RISK</b>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>                  </td>
                </tr>
              </tbody>
            </table>
            {/* Footer */}
            <table>
              <tbody>
                <tr style={{ height: '30px' }}>
                  <td colSpan="3" style={{ verticalAlign: 'top' }}>
                    Delivery At: <span className="text-red-500">*</span>{' '}
                    <div className="input-container inline-block" onClick={handleDivClick}>
                      <input
                        type="text"
                        name="deliveryAt"
                        value={formData.deliveryAt}
                        onChange={handleInputChange}
                        className="form-input-delivery"
                      />
                    </div>
                  </td>
                </tr>
                <tr style={{ height: '40px' }}>
                  <td colSpan="3" style={{ verticalAlign: 'top' }}>
                    Remarks: <div className="input-container inline-block" onClick={handleDivClick}>
                      <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        className="form-input-remarks"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="70%">
                    We are not responsible for any type of damages, leakage, fire & shortages. Kindly Insured by Consignor or Consignee
                  </td>
                  <td width="20%" colSpan="3" style={{ verticalAlign: 'bottom' }}>
                    For <b>Shree Dattaguru Road Lines</b>
                  </td>                </tr>
              </tbody>            </table>
          </div>
        </form>
      </div>

      <style jsx="true">{`        
	  	.container {
          width: 1000px;
          border: 1px solid #000;
          padding: 20px;
          font-family: Arial, sans-serif;
          font-size: 12px;
          margin: 0 auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }

        td, th {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
        }

        .bold {
          font-weight: bold;
        }

        .center {
          text-align: center;
        }

        .row-container {
          display: flex;
          width: 100%;
        }

        .left-table {
          flex: 2;
          border-collapse: collapse;
        }

        .right-table {
          flex: 1;
          border-collapse: collapse;
        }

        .left-table td, .right-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
        }        
		  .left-cell {
          height: 100px;
          vertical-align: top;
          padding: 6px;
        }.input-container {
          cursor: text;
          min-height: 20px;
          padding: 2px 2px;
          margin: 1px 0;
          border-radius: 2px;
          transition: background-color 0.2s ease;
        }

        .input-container:hover {
          background: #F3F4F6;
        }        .input-container:focus-within {
          background: #F9FAFB;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input-container.inline-block {
          display: inline-block;
          margin: 0 2px;
          padding: 2px 4px;
          min-height: auto;
          border-radius: 4px;
        }        .form-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid #000;
          margin-top: 2px;
          padding: 2px 2px;
          font-size: 12px;
          background: transparent;
          min-height: 16px;
        }

        .form-input:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input:disabled {
          background: #F3F4F6 !important;
          color: #6B7280;
          cursor: not-allowed;
        }.form-input-small {
          width: 120px;
          border: none;
          background: transparent;
          font-size: 12px;
          padding: 1px 4px;
          min-height: 14px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-small:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-nos {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 11px;
          padding: 2px 4px;
          min-height: 18px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-nos:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-particulars {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 11px;
          padding: 2px 4px;
          min-height: 18px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-particulars:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }        .form-input-rate {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 11px;
          text-align: center;
          padding: 2px 4px;
          min-height: 16px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-rate:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-weight {
          width: 60px;
          border: none;
          background: transparent;
          font-size: 10px;
          padding: 2px 4px;
          min-height: 16px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-weight:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-payment {
          width: 60px;
          border: none;
          background: transparent;
          font-size: 9px;
          padding: 2px 4px;
          min-height: 14px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-payment:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-delivery {
          width: 250px;
          border: none;
          background: transparent;
          font-size: 11px;
          padding: 2px 4px;
          min-height: 18px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-delivery:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-total {
          width: 100px;
          border: none;
          background: transparent;
          font-size: 11px;
          padding: 2px 4px;
          min-height: 18px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-total:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }

        .form-input-remarks {
          width: 450px;
          border: none;
          background: transparent;
          font-size: 11px;
          padding: 2px 4px;
          min-height: 18px;
          border-bottom: 1px solid #ccc;
        }

        .form-input-remarks:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 1px;
          background: #F9FAFB;
        }        @media print {
          .min-h-screen {
            min-height: auto;
          }
          
          .max-w-none {
            max-width: none;
          }
          
          .flex.justify-between {
            display: none;
          }
          
          .container {
            border: 2px solid #000;
            width: 100%;
            max-width: 1400px;
          }
        }
      `}</style>
    </div>
  );
};

export default LorryReceiptFormPage;
