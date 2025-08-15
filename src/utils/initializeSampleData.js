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

  // Sample memos
  if (!existingMemos) {
    const sampleMemos = [
      {
        id: 1,
        memo_number: 'MEMO-0001',
        memo_date: '2024-01-15',
        company_id: 1,
        to_company: 'ABC Transport Ltd.',
        from_company: 'Shree Dattaguru Roadlines',
        subject: 'Route Schedule Update',
        content: 'This memo is to inform about the updated route schedule for the upcoming month. All drivers are requested to follow the new timings as mentioned in the attached schedule.',
        priority: 'high',
        status: 'completed',
        memo_type: 'internal',
        reference_number: 'REF-2024-001',
        remarks: 'Urgent implementation required',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        memo_number: 'MEMO-0002',
        memo_date: '2024-01-20',
        company_id: 2,
        to_company: 'XYZ Logistics Co.',
        from_company: 'Shree Dattaguru Roadlines',
        subject: 'Fleet Maintenance Notice',
        content: 'Scheduled maintenance for all vehicles in the fleet. Please ensure all vehicles are available for inspection on the specified dates.',
        priority: 'medium',
        status: 'pending',
        memo_type: 'external',
        reference_number: 'REF-2024-002',
        remarks: 'Coordinate with maintenance team',
        created_at: '2024-01-20T14:15:00Z',
        updated_at: '2024-01-20T14:15:00Z'
      },
      {
        id: 3,
        memo_number: 'MEMO-0003',
        memo_date: '2024-01-25',
        company_id: 3,
        to_company: 'Sample Company Inc.',
        from_company: 'Shree Dattaguru Roadlines',
        subject: 'Safety Protocol Guidelines',
        content: 'Updated safety protocol guidelines for all transport operations. All staff members must complete the safety training within 15 days.',
        priority: 'high',
        status: 'in_progress',
        memo_type: 'notice',
        reference_number: 'REF-2024-003',
        remarks: 'Training sessions scheduled for next week',
        created_at: '2024-01-25T09:45:00Z',
        updated_at: '2024-01-25T09:45:00Z'
      },
      {
        id: 4,
        memo_number: 'MEMO-0004',
        memo_date: '2024-01-28',
        company_id: 4,
        to_company: 'Quick Delivery Services',
        from_company: 'Shree Dattaguru Roadlines',
        subject: 'Fuel Price Adjustment',
        content: 'Due to the recent changes in fuel prices, there will be an adjustment in transportation charges effective from next month.',
        priority: 'medium',
        status: 'draft',
        memo_type: 'circular',
        reference_number: 'REF-2024-004',
        remarks: 'Review with finance team',
        created_at: '2024-01-28T16:20:00Z',
        updated_at: '2024-01-28T16:20:00Z'
      },
      {
        id: 5,
        memo_number: 'MEMO-0005',
        memo_date: '2024-02-01',
        company_id: 5,
        to_company: 'Reliable Transport',
        from_company: 'Shree Dattaguru Roadlines',
        subject: 'New Partnership Agreement',
        content: 'We are pleased to announce the new partnership agreement that will enhance our service delivery capabilities.',
        priority: 'low',
        status: 'completed',
        memo_type: 'external',
        reference_number: 'REF-2024-005',
        remarks: 'Contract signed and filed',
        created_at: '2024-02-01T11:10:00Z',
        updated_at: '2024-02-01T11:10:00Z'
      }
    ];
    localStorage.setItem('memos', JSON.stringify(sampleMemos));
  }

  console.log('Sample data initialized in localStorage');
};

// Call this function when the app starts
export default initializeSampleData;
