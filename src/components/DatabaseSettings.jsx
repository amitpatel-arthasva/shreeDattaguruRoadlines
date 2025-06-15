import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const DatabaseSettings = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isElectronEnv, setIsElectronEnv] = useState(false);

  useEffect(() => {
    // Check if we're in Electron environment
    setIsElectronEnv(window.electronAPI !== undefined);
    loadCurrentPath();
  }, []);

  const loadCurrentPath = async () => {
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
  };

  const selectDatabaseFolder = async () => {
    if (!isElectronEnv) {
      alert('Database folder selection is only available in the desktop app. In browser mode, data is stored locally.');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await apiService.selectDatabaseFolder();
      
      if (result.success) {
        setCurrentPath(result.path);
        alert('Database folder updated successfully!');
      }
    } catch (error) {
      console.error('Error selecting database folder:', error);
      alert('Error selecting database folder: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Database Location
          </label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-sm text-gray-600 break-all">
              {currentPath}
            </p>
          </div>
        </div>        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Database Location
          </label>
          {isElectronEnv ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Select a folder where you want to store your database file. The database will be moved to the new location.
              </p>
              <button
                onClick={selectDatabaseFolder}
                disabled={isLoading}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Updating...' : 'Select Folder'}
              </button>
            </>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                You are running in browser mode. Database folder selection is only available in the desktop application.
                Your data is safely stored in the browser's local storage.
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Important Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>The database file contains all your business data</li>
            <li>Make sure to backup your data regularly</li>
            <li>Choose a location that is regularly backed up</li>
            <li>Avoid storing on temporary or removable drives</li>
            <li>The application will restart after changing the location</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettings;
