// Utility function to initialize sample data in localStorage for demo purposes
export const initializeSampleData = () => {
  // Check if data already exists
  const existingMemos = localStorage.getItem('memos');
  const existingCompanies = localStorage.getItem('companies');

  // Sample companies
  if (!existingCompanies) {
    const sampleCompanies = [
      { id: 1, name: 'ABC Transport Ltd.', address: 'Mumbai, Maharashtra', contact: '+91-9876543210' },
      { id: 2, name: 'XYZ Logistics Co.', address: 'Delhi, India', contact: '+91-9876543211' },
      { id: 3, name: 'Sample Company Inc.', address: 'Bangalore, Karnataka', contact: '+91-9876543212' },
      { id: 4, name: 'Quick Delivery Services', address: 'Chennai, Tamil Nadu', contact: '+91-9876543213' },
      { id: 5, name: 'Reliable Transport', address: 'Pune, Maharashtra', contact: '+91-9876543214' }
    ];
    localStorage.setItem('companies', JSON.stringify(sampleCompanies));
  }

};

// Call this function when the app starts
export default initializeSampleData;
