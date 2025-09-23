import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import truckHeader from '../../../assets/truck_image.png';
import nameHeader from '../../../assets/shree_datta_guru.png';
import companyService from '../../services/companyService';
import lorryReceiptService from '../../services/lorryReceiptService';
import truckService from '../../services/truckService';
import Button from '../common/Button';
import { useToast } from '../common/ToastSystem';

const LorryReceiptEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  // Company autocomplete state
  const [companies, setCompanies] = useState([]);
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [locations, setLocations] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [filteredConsignorCompanies, setFilteredConsignorCompanies] = useState([]);
  const [filteredConsigneeCompanies, setFilteredConsigneeCompanies] = useState([]);
  const [addConsignorCompany, setAddConsignorCompany] = useState(false);
  const [addConsigneeCompany, setAddConsigneeCompany] = useState(false);
  const [consignorSelectedFromDropdown, setConsignorSelectedFromDropdown] = useState(false);
  const [consigneeSelectedFromDropdown, setConsigneeSelectedFromDropdown] = useState(false);
  const [focusedConsignorIndex, setFocusedConsignorIndex] = useState(-1);
  const [focusedConsigneeIndex, setFocusedConsigneeIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const consignorDropdownRef = useRef(null);
  const consigneeDropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const truckDropdownRef = useRef(null);
  const consignorInputRef = useRef(null);
  const consigneeInputRef = useRef(null);

    const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

  const [formData, setFormData] = useState({
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
    particulars: [''],
    freight: '',
    hamali: '',
    aoc: '',
    doorDelivery: '',
    detention: '',
    collection: '',
    stCharge: '',
    extraLoading: '',
    actualWeight: '',
    chargeableWeight: '',
    paid: '',
    toBeBill: '',
    toPay: '',
    paymentType: 'paid',
    deliveryAt: '',
    ewayBill: '',
    total: '',
    remarks: '',
    consignor_id: '',
    consignee_id: '',
    truck_id: '',
    driver_id: ''
  });

  const [errors, setErrors] = useState({});



  // adding fields for particulars
  const [particularsList, setParticularsList] = useState([]); // default
  const [showParticularsDropdown, setShowParticularsDropdown] = useState([false]); // one per input


useEffect(() => {
  const fetchParticulars = async () => {
    try {
      const allParticulars = await lorryReceiptService.getParticulars();
      setParticularsList(allParticulars.length ? allParticulars : ['JUTE', 'COTTON']);
    } catch (err) {
      setParticularsList(['JUTE', 'COTTON']);
      console.error('Failed to fetch particulars', err);
    }
  };
  fetchParticulars();
}, []);

const handleParticularInputChange = (index, value) => {
  const formattedValue = toTitleCase(value); // convert to Title Case

  setFormData(prev => {
    const newArr = [...prev.particulars];
    newArr[index] = formattedValue;
    return { ...prev, particulars: newArr };
  });

  setShowParticularsDropdown(prev => {
    const newArr = [...prev];
    newArr[index] = true; // show dropdown
    return newArr;
  });
};


const handleSelectParticular = async (value, index) => {
  const formattedValue = toTitleCase(value);

  // save new item to DB if not exists
  if (!particularsList.includes(formattedValue)) {
    const res = await lorryReceiptService.addParticular(formattedValue);
    if (res.success) setParticularsList(prev => [...prev, formattedValue]);
    else return alert('Failed to save particular');
  }

  // update form and hide dropdown
  setFormData(prev => {
    const newArr = [...prev.particulars];
    newArr[index] = formattedValue;
    return { ...prev, particulars: newArr };
  });

  setShowParticularsDropdown(prev => {
    const newArr = [...prev];
    newArr[index] = false;
    return newArr;
  });
};

const handleCustomParticular = async (index) => {
  const value = formData.particulars[index].trim();
  if (!value) return;
  await handleSelectParticular(value, index);
};

const addParticularField = () => {
  setFormData(prev => ({
    ...prev,
    particulars: [...prev.particulars, ''],
  }));
  setShowParticularsDropdown(prev => [...prev, false]);
};

const removeParticularField = (index) => {
  setFormData(prev => ({
    ...prev,
    particulars: prev.particulars.filter((_, i) => i !== index),
  }));
  setShowParticularsDropdown(prev => prev.filter((_, i) => i !== index));
};


  // Load existing lorry receipt data
  useEffect(() => {
    if (id) {
      loadLorryReceiptData();
    }
  }, [id]);

  // Load companies and trucks
  useEffect(() => {
    loadCompanies();
    loadTrucks();
  }, []);

  const loadLorryReceiptData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await lorryReceiptService.getLorryReceiptById(id);

      if (response.success && response.data) {
        const lr = response.data;

        // Parse JSON strings for arrays
        let nosArray = [''];
        let particularsArray = [''];

        // Get material details from the transformed structure
        if (lr.materialDetails && Array.isArray(lr.materialDetails)) {
          nosArray = lr.materialDetails.map(item => item.nos || '');
          particularsArray = lr.materialDetails.map(item => item.particulars || '');
        }


        // Transform the data to match form structure
        const formDataToSet = {
          consignorName: lr.consignor?.consignorName || '',
          consignorAddress1: lr.consignor?.address || '',
          consignorCity: lr.consignor?.city || '',
          consignorState: lr.consignor?.state || '',
          consignorPincode: lr.consignor?.pinCode || '',
          consignorGstin: lr.consignor?.gstNumber || '',
          consignorPan: lr.consignor?.pan || '',
          consigneeName: lr.consignee?.consigneeName || '',
          consigneeAddress1: lr.consignee?.address || '',
          consigneeCity: lr.consignee?.city || '',
          consigneeState: lr.consignee?.state || '',
          consigneePincode: lr.consignee?.pinCode || '',
          consigneeGstin: lr.consignee?.gstNumber || '',
          consigneePan: lr.consignee?.pan || '',
          cnNumber: lr.lorryReceiptNumber || '',
          truckNumber: lr.truckDetails?.truckNumber || '',
          date: lr.date || '',
          to: lr.toLocation || '',
          from: lr.fromLocation || '',
          nos: nosArray,
          particulars: particularsArray,
          freight: lr.freightDetails?.freight?.toString() || '',
          hamali: lr.freightDetails?.hamali?.toString() || '',
          aoc: lr.freightDetails?.aoc?.toString() || '',
          doorDelivery: lr.freightDetails?.doorDelivery?.toString() || '',
          detention: lr.freightDetails?.detention?.toString() || '',
          collection: lr.freightDetails?.collection?.toString() || '',
          ewayBill: lr.ewayBill || '',
          stCharge: lr.freightDetails?.stCharge?.toString() || '20',
          extraLoading: lr.freightDetails?.extraLoading?.toString() || '',
          actualWeight: lr.actualWeight?.toString() || '',
          chargeableWeight: lr.chargeableWeight?.toString() || '',
          paid: lr.freightDetails?.paid?.toString() || '',
          toBeBill: lr.freightDetails?.toBeBill?.toString() || '',
          toPay: lr.freightDetails?.toPay?.toString() || '',
          paymentType: lr.paymentType || 'paid',
          deliveryAt: lr.deliveryAt || '',
          total: lr.freightDetails?.total?.toString() || '',
          remarks: lr.remarks || '',
          consignor_id: lr.consignor_id || '',
          consignee_id: lr.consignee_id || '',
          truck_id: lr.truck_id || '',
          driver_id: lr.driver_id || ''
        };

        setFormData(formDataToSet);
      } else {
        console.error('No data received from API');
        toast.error('Failed to load lorry receipt data');
      }
    } catch (error) {
      console.error('Error loading lorry receipt data:', error);
      toast.error('Failed to load lorry receipt data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ limit: 1000 });
      if (response.success) {
        setCompanies(response.data.companies || []);
        setFilteredConsignorCompanies(response.data.companies || []);
        setFilteredConsigneeCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTruckInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowTruckDropdown(false);
    }, 200);
  };

  const handleDivClick = (e) => {
    const input = e.currentTarget.querySelector('input');
    if (input) {
      input.focus();
    }
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };
  const handleTruckInputChange = (e) => {
    const { value } = e.target;

    // Auto-capitalize truck number
    const capitalizedValue = value.toUpperCase();

    // Validate truck number
    validateField('truckNumber', capitalizedValue);

    setFormData(prev => ({ ...prev, truckNumber: capitalizedValue }));
    setShowTruckDropdown(true);
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    const freight = parseFloat(formData.freight) || 0;
    const hamali = parseFloat(formData.hamali) || 0;
    const aoc = parseFloat(formData.aoc) || 0;
    const doorDelivery = parseFloat(formData.doorDelivery) || 0;
    const detention = parseFloat(formData.detention) || 0;
    const collection = parseFloat(formData.collection) || 0;
    const stCharge = parseFloat(formData.stCharge) || 0;
    const extraLoading = parseFloat(formData.extraLoading) || 0;

    const total = freight + hamali + aoc + doorDelivery + detention + collection + stCharge + extraLoading;
    const totalValue = total.toFixed(2);

    // Update the total in form data
    setFormData(prev => ({ ...prev, total: totalValue }));

    return totalValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields first
    if (!validateRequiredFields()) {
      toast.error('Please fill in all required fields before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate total
      const total = calculateTotal();


      // Prepare data for update - match the service method expectations
      const updateData = {
        truck_number: formData.truckNumber,
        date: formData.date,
        to: formData.to,
        from: formData.from,
        consignor_id: formData.consignor_id,
        consignee_id: formData.consignee_id,
        nos: JSON.stringify(formData.nos),
        particulars: JSON.stringify(formData.particulars),
        freight: parseFloat(formData.freight) || 0,
        hamali: parseFloat(formData.hamali) || 0,
        aoc: parseFloat(formData.aoc) || 0,
        door_delivery: parseFloat(formData.doorDelivery) || 0,
        detention: parseFloat(formData.detention) || 0,
        collection: parseFloat(formData.collection) || 0,
        st_charge: parseFloat(formData.stCharge) || 0,
        extra_loading: parseFloat(formData.extraLoading) || 0,
        actual_weight: parseFloat(formData.actualWeight) || 0,
        chargeable_weight: parseFloat(formData.chargeableWeight) || 0,
        payment_type: formData.paymentType,
        delivery_at: formData.deliveryAt,
        eway_bill: formData.ewayBill,
        total: parseFloat(total) || 0,
        remarks: formData.remarks,
        truck_id: formData.truck_id,
        driver_id: formData.driver_id
      };


      const response = await lorryReceiptService.updateLorryReceipt(id, updateData);

      if (response.success) {
        toast.success('Lorry receipt updated successfully');
        navigate('/lorry-receipts');
      } else {
        toast.error(response.error || 'Failed to update lorry receipt');
      }
    } catch (error) {
      console.error('Error updating lorry receipt:', error);
      toast.error('Failed to update lorry receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/lorry-receipts');
  };

  // Validation functions
  const validateGSTIN = (gstin) => {
    if (!gstin) return '';
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin) ? '' : 'Invalid GSTIN format';
  };

  const validatePAN = (pan) => {
    if (!pan) return '';
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan) ? '' : 'Invalid PAN format';
  };

  const validatePincode = (pincode) => {
    if (!pincode) return '';
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode) ? '' : 'Invalid pincode format';
  };

  const validateTruckNumber = (truckNumber) => {
    if (!truckNumber) return 'Truck number is required';
    const truckRegex = /^[A-Z]{2}\s[0-9]{1,2}\s[A-Z]{1,2}\s[0-9]{4}$/;
    return truckRegex.test(truckNumber) ? '' : 'Invalid truck number format (e.g., MH 12 AB 1234)';
  };

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
      case 'actualWeight':
        if (!value) error = 'Actual weight is required';
        else if (isNaN(value) || parseFloat(value) <= 0) error = 'Actual weight must be a positive number';
        break;
      case 'chargeableWeight':
        if (!value) error = 'Chargeable weight is required';
        else if (isNaN(value) || parseFloat(value) <= 0) error = 'Chargeable weight must be a positive number';
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateRequiredFields = () => {
    const requiredFields = {
      consignorName: 'Consignor name',
      consigneeName: 'Consignee name',
      truckNumber: 'Truck number',
      date: 'Date',
      from: 'From location',
      to: 'To location',
      actualWeight: 'Actual weight',
      chargeableWeight: 'Chargeable weight',
      deliveryAt: 'Delivery at'
    };

    const errors = {};
    let hasErrors = false;

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = `${requiredFields[field]} is required`;
        hasErrors = true;
      }
    });

    // Validate arrays
    if (!formData.nos || formData.nos.length === 0 || formData.nos.every(nos => !nos || nos.trim() === '')) {
      errors.nos = 'At least one Nos entry is required';
      hasErrors = true;
    }

    if (!formData.particulars || formData.particulars.length === 0 || formData.particulars.every(particular => !particular || particular.trim() === '')) {
      errors.particulars = 'At least one Particulars entry is required';
      hasErrors = true;
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  // TODO: This function may be needed for future company validation features
  // const findExistingCompany = (companyData) => {
  //   return companies.find(company => 
  //     company.name.toLowerCase() === companyData.name.toLowerCase() &&
  //     company.address?.toLowerCase() === companyData.address?.toLowerCase() &&
  //     company.city?.toLowerCase() === companyData.city?.toLowerCase()
  //   );
  // };

  const handleCompanyNameChange = (e, type) => {
    const { value } = e.target;

    if (type === 'consignor') {
      setFormData(prev => ({ ...prev, consignorName: value }));
      filterCompanies(value, 'consignor');
      setShowConsignorDropdown(true);
      setFocusedConsignorIndex(-1);
      setConsignorSelectedFromDropdown(false);
      if (addConsignorCompany && value !== formData.consignorName) {
        setAddConsignorCompany(false);
      }
    } else {
      setFormData(prev => ({ ...prev, consigneeName: value }));
      filterCompanies(value, 'consignee');
      setShowConsigneeDropdown(true);
      setFocusedConsigneeIndex(-1);
      setConsigneeSelectedFromDropdown(false);
      if (addConsigneeCompany && value !== formData.consigneeName) {
        setAddConsigneeCompany(false);
      }
    }
  };

  const filterCompanies = (searchTerm, type) => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (type === 'consignor') {
      setFilteredConsignorCompanies(filtered);
    } else {
      setFilteredConsigneeCompanies(filtered);
    }
  };

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
      setAddConsignorCompany(false);
      setConsignorSelectedFromDropdown(true);
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
      setAddConsigneeCompany(false);
      setConsigneeSelectedFromDropdown(true);
    }
  };

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

  const handleCompanyInputBlur = (type) => {
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
    }, 150);
  };

  const handleCompanyKeyDown = (e, type) => {
    const isConsignor = type === 'consignor';
    const focusedIndex = isConsignor ? focusedConsignorIndex : focusedConsigneeIndex;
    const filteredCompanies = isConsignor ? filteredConsignorCompanies : filteredConsigneeCompanies;
    const totalOptions = filteredCompanies.length;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (focusedIndex >= 0) {
            if (isConsignor) {
              setFocusedConsignorIndex(-1);
              consignorInputRef.current?.focus();
            } else {
              setFocusedConsigneeIndex(-1);
              consigneeInputRef.current?.focus();
            }
          }
        } else {
          if (focusedIndex < 0 && totalOptions > 0) {
            if (isConsignor) {
              setFocusedConsignorIndex(0);
            } else {
              setFocusedConsigneeIndex(0);
            }
          } else if (focusedIndex >= 0 && focusedIndex < totalOptions - 1) {
            if (isConsignor) {
              setFocusedConsignorIndex(focusedIndex + 1);
            } else {
              setFocusedConsigneeIndex(focusedIndex + 1);
            }
          } else {
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
          if (isConsignor) {
            setFocusedConsignorIndex(focusedIndex + 1);
          } else {
            setFocusedConsigneeIndex(focusedIndex + 1);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex > 0) {
          if (isConsignor) {
            setFocusedConsignorIndex(focusedIndex - 1);
          } else {
            setFocusedConsigneeIndex(focusedIndex - 1);
          }
        } else if (focusedIndex === 0) {
          if (isConsignor) {
            setFocusedConsignorIndex(-1);
            consignorInputRef.current?.focus();
          } else {
            setFocusedConsigneeIndex(-1);
            consigneeInputRef.current?.focus();
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCompanies.length) {
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

  const handleFromInputChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, from: value }));
    setShowFromDropdown(true);
  };

  const generateCnNumber = async (location) => {
    try {
      const prefix = location === 'Tarapur' ? 'TPR' : 'BWD';
      const response = await lorryReceiptService.getNextCnNumber(prefix);

      if (response.success) {
        return `${prefix}-${response.data.nextNumber.toString().padStart(3, '0')}`;
      } else {
        return `${prefix}-001`;
      }
    } catch (error) {
      console.error('Error generating CN number:', error);
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

  const handleCustomLocation = async () => {
    const newLocation = formData.from.trim();
    if (!newLocation) return;

    // Add to DB
    const res = await lorryReceiptService.addLocation(newLocation);
    if (res.success) {
      setLocations(prev => [...prev, newLocation]);
      await selectFromLocation(newLocation);
    } else {
      alert('Failed to save new location. Try again.');
    }

    setShowFromDropdown(false);
  };


  const handleFromInputBlur = () => {
    setTimeout(() => {
      setShowFromDropdown(false);
    }, 200);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const allLocations = await lorryReceiptService.getLocations();
        setLocations(allLocations.length ? allLocations : ['Tarapur', 'Bhiwandi']);
      } catch (error) {
        console.error('Failed to load locations:', error);
        setLocations(['Tarapur', 'Bhiwandi']);
      }
    };

    fetchLocations();
  }, []);


  const selectTruck = (truck) => {
    validateField('truckNumber', truck.truck_number);
    setFormData(prev => ({ ...prev, truckNumber: truck.truck_number }));
    setShowTruckDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
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
  }, [showConsignorDropdown, showConsigneeDropdown, formData.consignorName, formData.consigneeName, companies]);

  // Generate CN number when form loads if location is selected
  useEffect(() => {
    if (formData.from && !formData.cnNumber) {
      generateCnNumber(formData.from).then(cnNumber => {
        setFormData(prev => ({ ...prev, cnNumber }));
      });
    }
  }, [formData.from, formData.cnNumber]);

  // Calculate total automatically when charge fields change
  useEffect(() => {
    calculateTotal();
  }, [formData.freight, formData.hamali, formData.aoc, formData.doorDelivery, formData.detention, formData.collection, formData.stCharge, formData.extraLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section matching form/print style */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className='w-full flex flex-row items-start justify-between py-2'>
            <div className='flex-shrink-0 flex items-center w-2/3'>
              <img src={truckHeader} alt="BillLogo" className="h-40 object-contain " />
              <img src={nameHeader} alt="BillLogo" className=" h-30 object-contain  ml-30" />
            </div>
            <div className='flex flex-col items-end text-xs font-medium text-gray-700 leading-tight min-w-[320px] w-1/3 mt-2'>
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
          <div className="w-[90%] mx-auto -mt-8 mb-6 ml-65">
            <div className="text-xs font-medium text-gray-500 leading-snug space-y-2">
              <div>
                <span className="text-red-600 font-bold">TARAPUR:</span>
                Plot No. W - 4, Camlin Naka, MIDC, Tarapur.
                M.: 9823364283 / 8446665945
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
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Lorry Receipt</h1>
              <p className="text-sm text-gray-600">Update lorry receipt details</p>
            </div>
            <div className="flex gap-3">
              <Button
                text="Cancel"
                onClick={handleCancel}
                bgColor="#6B7280"
                hoverBgColor="#4B5563"
                className="text-white"
              />
              <Button
                text={isSubmitting ? "Updating..." : "Update"}
                onClick={handleSubmit}
                bgColor="#C5677B"
                hoverBgColor="#C599B6"
                className="text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Same as LorryReceiptFormPage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="lorry-receipt-form">
          <div className="container bg-white">
            {/* Consignor / Consignee */}
            <div className="row-container">
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
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                  {filteredConsignorCompanies.map((company, index) => (
                                    <div
                                      key={company.id}
                                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 ${focusedConsignorIndex === index ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
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
                          value={formData.consignorAddress1}
                          onChange={handleInputChange}
                          className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                          placeholder="Address"
                          disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorCity"
                            value={formData.consignorCity}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="City"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorState"
                            value={formData.consignorState}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="State"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorPincode"
                            value={formData.consignorPincode}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="Pin Code"
                            style={{ width: '80px' }}
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorGstin"
                            value={formData.consignorGstin}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="GSTIN"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consignorPan"
                            value={formData.consignorPan}
                            onChange={handleInputChange}
                            className={`form-input ${consignorSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="PAN"
                            disabled={consignorSelectedFromDropdown && !addConsignorCompany}
                          />
                        </div>
                      </div>
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
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                  {filteredConsigneeCompanies.map((company, index) => (
                                    <div
                                      key={company.id}
                                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 ${focusedConsigneeIndex === index ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
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
                          </div>
                        </div>
                      </div>
                      <div className="input-container" onClick={handleDivClick}>
                        <input
                          type="text"
                          name="consigneeAddress1"
                          value={formData.consigneeAddress1}
                          onChange={handleInputChange}
                          className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                          placeholder="Address"
                          disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneeCity"
                            value={formData.consigneeCity}
                            onChange={handleInputChange}
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
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneePincode"
                            value={formData.consigneePincode}
                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="Pin Code"
                            style={{ width: '80px' }}
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneeGstin"
                            value={formData.consigneeGstin}
                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="GSTIN"
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
                        </div>
                        <div className="input-container flex-1" onClick={handleDivClick}>
                          <input
                            type="text"
                            name="consigneePan"
                            value={formData.consigneePan}
                            onChange={handleInputChange}
                            className={`form-input ${consigneeSelectedFromDropdown ? 'bg-gray-100' : ''}`}
                            placeholder="PAN"
                            disabled={consigneeSelectedFromDropdown && !addConsigneeCompany}
                          />
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
                          placeholder="Select location first" />
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
                          className="form-input-small" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>From - <span className="text-red-500">*</span></strong>
                      <div className="relative inline-block">
                        <div
                          className="input-container inline-block"
                          onClick={() => setShowFromDropdown(true)}
                        >
                          <input
                            type="text"
                            name="from"
                            value={formData.from || ''} // pre-fill existing value
                            onChange={(e) => {
                              setFormData({ ...formData, from: e.target.value });
                              setShowFromDropdown(true);
                            }}
                            onFocus={() => setShowFromDropdown(true)}
                            onBlur={handleFromInputBlur}
                            className="form-input-small"
                            placeholder="From Location"
                            autoComplete="off"
                          />
                        </div>

                        {showFromDropdown && (
                          <div
                            ref={fromDropdownRef}
                            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                            style={{ minWidth: '150px' }}
                          >
                            {(locations.length ? locations : ['Tarapur', 'Bhiwandi'])
                              .filter(loc =>
                                formData.from.trim() === ''
                                  ? true
                                  : loc.toLowerCase().includes(formData.from.toLowerCase())
                              )
                              .map((location) => (
                                <div
                                  key={location}
                                  className="px-3 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-100"
                                  onClick={() => selectFromLocation(location)}
                                >
                                  <div className="font-medium text-sm">{location}</div>
                                </div>
                              ))}

                            {/* Add new location option if typed value is not in list */}
                            {!locations.includes(formData.from.trim()) && formData.from.trim() !== '' && (
                              <div
                                className="px-3 py-2 cursor-pointer font-bold hover:bg-gray-100"
                                onClick={handleCustomLocation}
                              >
                                Add "{formData.from}"
                              </div>
                            )}
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
                    8446665945<br />

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
                            <div key={index} className="relative flex items-center mb-2">
                              <input
                                type="text"
                                value={particular}
                                onChange={(e) => handleParticularInputChange(index, e.target.value)}
                                placeholder={`Particulars ${index + 1}`}
                                className="form-input-particulars"
                              />

                              {showParticularsDropdown[index] && (
                                <div className="absolute top-full left-0 right-0 bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
                                  {particularsList
                                    .filter(item => item.toLowerCase().includes(particular.toLowerCase()))
                                    .map(item => (
                                      <div
                                        key={item}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelectParticular(item, index)}
                                      >
                                        {item}
                                      </div>
                                    ))}

                                  {!particularsList.includes(particular) && particular.trim() !== '' && (
                                    <div
                                      className="px-3 py-2 cursor-pointer font-bold hover:bg-gray-100"
                                      onClick={() => handleCustomParticular(index)}
                                    >
                                      Add "{particular}"
                                    </div>
                                  )}
                                </div>
                              )}

                              {formData.particulars.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeParticularField(index)}
                                  className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addParticularField}
                            className="text-blue-500 hover:text-blue-700 text-xs font-semibold mt-1"
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
                              Detention
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
                            <div style={{ flex: '1', padding: '4px', display: 'flex', alignItems: 'center' }}>
                              Total
                            </div>
                          </div>
                        </td>

                        {/* Right Rate Rs. subcolumn */}
                        <td style={{ padding: 0, verticalAlign: 'top', borderBottom: '1px solid #000', width: '15%' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                              <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
                                <input
                                  type="text"
                                  name="detention"
                                  value={formData.detention}
                                  onChange={handleInputChange}
                                  className="form-input-rate"
                                />
                              </div>
                            </div>
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', borderBottom: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ flex: '1', padding: '4px', display: 'flex', alignItems: 'center' }}>                                <div className="input-container" onClick={handleDivClick} style={{ width: '100%' }}>
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
                              Goods entirely<br />booked at <br /><b>OWNER'S RISK</b>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" style={{
                          border: '1px solid #000',
                          padding: '6px',
                          fontSize: '13px'
                        }}>
                          <strong>E-way Bill:</strong>&nbsp;
                          <input
                            type="text"
                            name="ewayBill"
                            value={formData.ewayBill || ''}
                            onChange={handleInputChange}
                            className="form-input-delivery"
                            placeholder="Enter E-way Bill number"
                            style={{ width: '250px', border: 'none', borderBottom: '1px solid #000' }}
                          />
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
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ marginRight: '6px' }}>
                        Delivery At: <span className="text-red-500">*</span>
                      </span>
                      <div className="input-container flex-grow">
                        <input
                          type="text"
                          name="deliveryAt"
                          value={formData.deliveryAt}
                          onChange={handleInputChange}
                          className="form-input-delivery"
                          style={{
                            width: '100%',
                            border: '1px solid #000',
                            padding: '4px 8px'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>

                {/* <td style={{ verticalAlign: 'top', width: '50%', paddingLeft: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '90px' }}>E-way Bill:</span>
                      <div className="input-container flex-grow" onClick={handleDivClick}>
                        <input
                          type="text"
                          name="ewayBill"
                          value={formData.ewayBill || ''}
                          onChange={handleInputChange}
                          className="form-input-delivery"
                          placeholder="Enter E-way Bill number"
                          style={{ width: '100%', minWidth: '180px' }}
                        />
                      </div>
                    </div>
                  </td> */}
                {/* </tr> */}
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
                  <td width="30%" colSpan="3" style={{ verticalAlign: 'bottom', textAlign: 'center' }}>
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

export default LorryReceiptEditPage; 
