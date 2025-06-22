import apiService from './apiService.js';

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      // Get quotations count
      const quotationsResult = await apiService.query('SELECT COUNT(*) as total FROM quotations');
      const totalQuotations = quotationsResult[0]?.total || 0;

      // Get lorry receipts count (invoices are the same as lorry receipts)
      const lorryReceiptsResult = await apiService.query('SELECT COUNT(*) as total FROM lorry_receipts');
      const totalLorryReceipts = lorryReceiptsResult[0]?.total || 0;

      // Get companies count
      const companiesResult = await apiService.query('SELECT COUNT(*) as total FROM companies');
      const totalCompanies = companiesResult[0]?.total || 0;

      // Get trucks count
      const trucksResult = await apiService.query('SELECT COUNT(*) as total FROM trucks');
      const totalTrucks = trucksResult[0]?.total || 0;

      // Get drivers count
      const driversResult = await apiService.query('SELECT COUNT(*) as total FROM drivers');
      const totalDrivers = driversResult[0]?.total || 0;

      return {
        success: true,
        data: {
          quotations: { total: totalQuotations },
          lorryReceipts: { total: totalLorryReceipts },
          invoices: { total: totalLorryReceipts }, // Same as lorry receipts
          master: {
            trucks: totalTrucks,
            drivers: totalDrivers,
            customers: totalCompanies
          }
        }
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }
}

export default new DashboardService(); 