import React, { createContext, useContext, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

const MasterDataContext = createContext();

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};

export const MasterDataProvider = ({ children }) => {
  const refreshMasterData = useCallback(async () => {
    try {
      console.log('Refreshing master data...');
      await dashboardService.refreshMasterData();
      console.log('✅ Master data refreshed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error refreshing master data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const ensureSchemaUpdates = useCallback(async () => {
    try {
      console.log('Ensuring database schema is up to date...');
      await dashboardService.ensureSchemaUpdates();
      console.log('✅ Schema updates complete');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating schema:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    refreshMasterData,
    ensureSchemaUpdates
  };

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
};

export default MasterDataContext;
