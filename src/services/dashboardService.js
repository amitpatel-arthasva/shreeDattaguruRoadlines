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

      // Get companies count (only active)
      const companiesResult = await apiService.query('SELECT COUNT(*) as total FROM companies WHERE is_active = 1');
      const totalCompanies = companiesResult[0]?.total || 0;

      // Get trucks count (only active)
      const trucksResult = await apiService.query('SELECT COUNT(*) as total FROM trucks WHERE is_active = 1');
      const totalTrucks = trucksResult[0]?.total || 0;

      // Get drivers count (only active)
      const driversResult = await apiService.query('SELECT COUNT(*) as total FROM drivers WHERE is_active = 1');
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

  // Refresh master data and ensure database schema is up to date
  async refreshMasterData() {
    try {
      // Load fresh master data counts
      const stats = await this.getDashboardStats();
      
      return {
        success: true,
        message: 'Master data refreshed successfully',
        data: stats.data
      };
    } catch (error) {
      console.error('Error refreshing master data:', error);
      throw error;
    }
  }
}

export default new DashboardService();