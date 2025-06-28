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

  // Installation state
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationStatus, setInstallationStatus] = useState('');

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

  const handleDependenciesInstall = async () => {
    if (!isElectronEnv) {
      alert('Installation scripts are only available in the desktop app.');
      return;
    }

    try {
      setIsInstalling(true);
      setInstallationStatus('Starting PDF dependencies installation with bundled Node.js...');
      
      const result = await window.electronAPI.runDependenciesInstall();
      
      if (result.success) {
        setInstallationStatus('PDF dependencies installation started in new window. Please keep the command window open until completion.');
        alert('PDF dependencies installation has been started in a new command window. Please follow the progress and keep the window open until installation completes.');
      } else {
        setInstallationStatus(`Error: ${result.error}`);
        alert(`Installation failed: ${result.error}`);
      }
    } catch (error) {
      setInstallationStatus(`Error: ${error.message}`);
      alert(`Installation failed: ${error.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'database', label: 'Database Settings', icon: '💾' },
    { id: 'installation', label: 'Installation Setup', icon: '🔧' },
  ];
  const ProfileSection = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold text-[#C5677B] mb-4">
        User Information
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            {user?.name || 'N/A'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            {user?.email || 'N/A'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 backdrop-blur-sm">
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold text-[#C5677B] mb-4">
        Database Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Database Location
          </label>
          <div className="p-3 bg-gray-50/80 backdrop-blur-sm border rounded-lg">
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
                className={`px-4 sm:px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:scale-105'
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

  const InstallationSection = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold text-[#C5677B] mb-4">
        Installation Setup
      </h2>
      
      <div className="space-y-6">
        {!isElectronEnv && (
          <div className="p-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-600">
              <span className="mr-2">ℹ️</span>
              <span>Installation scripts are only available in the desktop app.</span>
            </div>
          </div>
        )}

        {installationStatus && (
          <div className="p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-600">
              <span className="mr-2">📝</span>
              <span>{installationStatus}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF Dependencies Installation
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Install Puppeteer and Chrome browser using the bundled Node.js runtime. 
            This script will set up everything needed for PDF generation in a new command window.
          </p>
          <button
            onClick={handleDependenciesInstall}
            disabled={isInstalling || !isElectronEnv}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 hover:shadow-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isInstalling ? 'Installing...' : 'Install PDF Dependencies'}
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">What gets installed?</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li><strong>Puppeteer Library:</strong> PDF generation package (~5MB download)</li>
            <li><strong>Chrome Browser:</strong> Headless browser for PDF rendering (~150MB download)</li>
            <li><strong>Note:</strong> Uses the bundled Node.js runtime (already included in the app)</li>
          </ul>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Installation Process</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Click the button above to start the installation</li>
            <li>A new command window will open showing real-time progress</li>
            <li>The script will first install the Puppeteer package</li>
            <li>Then it will download the Chrome browser for PDF generation</li>
            <li>Keep the command window open until installation completes</li>
            <li>Total installation time: 3-10 minutes (depending on internet speed)</li>
            <li>You only need to run this once unless you encounter issues</li>
          </ul>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">About the Node Bundle</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>The application includes a portable Node.js runtime (~50MB)</li>
            <li>This bundle can be copied to other machines for offline installation</li>
            <li>No system-wide Node.js installation required</li>
            <li>All components are isolated and won't affect other applications</li>
            <li>The bundle location can be found in the application's resources folder</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] bg-gradient-to-br rounded-4xl from-blue-50 to-indigo-100 text-primary-400">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">        {/* Mobile Header */}
        <div className="lg:hidden bg-white/70 backdrop-blur-sm shadow-sm p-4 rounded-2xl mx-4 mt-4 border border-white/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-400">Settings</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      ? 'bg-[#C5677B] text-white shadow-md transform scale-105'
                      : 'bg-white/50 text-gray-700 hover:bg-white/70 hover:shadow-sm'
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
        <div className="hidden lg:block w-64 bg-white/50 backdrop-blur-sm min-h-[80vh] p-6 rounded-4xl border-r border-white/20">
          <h1 className="text-3xl font-bold text-primary-400 mb-8">Settings</h1>
          
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#C5677B] text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/50 hover:shadow-sm'
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
            <h2 className="text-2xl font-bold text-primary-400">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'database' && <DatabaseSection />}
            {activeTab === 'installation' && <InstallationSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
