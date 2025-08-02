import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Database settings state
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isElectronEnv, setIsElectronEnv] = useState(false);

  const loadCurrentPath = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const path = await apiService.getDatabasePath();
        setCurrentPath(path || 'Not set');
      } else {
        setCurrentPath('Browser environment - database stored in IndexedDB');
      }
    } catch (error) {
      console.error('Error loading database path:', error);
      setCurrentPath('Error loading path: ' + error.message);
    }
  }, []);

  useEffect(() => {
    // Check if we're in Electron environment
    setIsElectronEnv(window.electronAPI !== undefined);
    loadCurrentPath();
  }, [loadCurrentPath]);

  const selectDatabaseFolder = async () => {
    if (!isElectronEnv) {
      alert('Database folder selection is only available in the desktop app. In browser mode, data is stored locally.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Confirm with user about migration
      const shouldMigrate = window.confirm(
        'Do you want to migrate your current data to the new database location? ' +
        'This will copy all your existing data to the new location.'
      );
      
      const result = await apiService.selectDatabaseFolder(shouldMigrate);
      
      if (result.success) {
        setCurrentPath(result.path);
        if (shouldMigrate && result.migrated) {
          alert('Database folder updated successfully! Your data has been migrated to the new location.');
        } else {
          alert('Database folder updated successfully!');
        }
      } else {
        alert('Error: ' + (result.message || 'Failed to update database folder'));
      }
    } catch (error) {
      console.error('Error selecting database folder:', error);
      alert('Error selecting database folder: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'database', label: 'Database Settings', icon: '💾' },
  ];
  const ProfileSection = () => (
    <div className="bg-gradient-to-br from-white to-orange-50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-200">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">
        User Information
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="px-3 py-2 border border-orange-200 rounded-lg bg-orange-50 backdrop-blur-sm">
            {user?.name || 'N/A'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="px-3 py-2 border border-orange-200 rounded-lg bg-orange-50 backdrop-blur-sm">
            {user?.email || 'N/A'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="px-3 py-2 border border-orange-200 rounded-lg bg-orange-50 backdrop-blur-sm">
            {user?.role || 'user'}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>To update your profile information, please contact your system administrator.</p>
      </div>
    </div>
  );
  const DatabaseSection = () => (
    <div className="bg-gradient-to-br from-white to-orange-50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-200">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">
        Database Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Database Location
          </label>
          <div className="p-3 bg-orange-50 backdrop-blur-sm border border-orange-200 rounded-lg">
            <p className="text-sm text-gray-600 break-all">
              {currentPath}
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Database Location
          </label>
          {isElectronEnv ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Select a folder where you want to store your database file. Your current data will be automatically migrated to the new location.
              </p>
              <button
                onClick={selectDatabaseFolder}
                disabled={isLoading}
                className={`px-4 sm:px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-400 to-orange-400 hover:from-orange-500 hover:to-red-500 hover:shadow-md transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Migrating Data...
                  </span>
                ) : 'Select New Folder & Migrate Data'}
              </button>
            </>
          ) : (
            <div className="p-3 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                You are running in browser mode. Database folder selection is only available in the desktop application.
                Your data is safely stored in the browser's local storage.
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Database Migration & Safety</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>All your current data will be automatically copied to the new location</li>
            <li>The original database will remain as a backup until you confirm the migration</li>
            <li>Make sure to choose a location that is regularly backed up</li>
            <li>Avoid storing on temporary or removable drives</li>
            <li>The application may restart after changing the location</li>
            <li>Migration process is safe and preserves all your business data</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] bg-gradient-to-br rounded-4xl from-orange-50 to-amber-50 text-gray-900">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-red-400 to-orange-400 backdrop-blur-sm shadow-sm p-4 rounded-2xl mx-4 mt-4 border border-orange-300">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transform scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-gradient-to-br from-orange-400 to-red-400 backdrop-blur-sm min-h-[80vh] p-6 rounded-4xl border-r border-orange-300 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
          
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                    : 'text-white hover:bg-white/20 hover:shadow-sm hover:transform hover:scale-102'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="lg:hidden mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'database' && <DatabaseSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
