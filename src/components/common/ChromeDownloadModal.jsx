import React, { useState } from 'react';

const ChromeDownloadModal = ({ isOpen, onClose }) => {
  const [downloadStatus, setDownloadStatus] = useState({
    status: 'checking',
    message: 'Initializing...'
  });

  React.useEffect(() => {
    let cleanup = null;

    const downloadChrome = async () => {
      try {
        // Set up progress listener
        cleanup = window.electronAPI.onChromeDownloadProgress((progress) => {
          setDownloadStatus(progress);
        });

        // Request Chrome download from main process
        const result = await window.electronAPI.downloadChrome();

        if (result.success) {
          setTimeout(() => {
            onClose(true);
          }, 1000);
        } else {
          setDownloadStatus({
            status: 'error',
            message: result.error || 'Download failed. Please check your internet connection and try again.'
          });
        }
      } catch (error) {
        setDownloadStatus({
          status: 'error',
          message: `Error: ${error.message}`
        });
      }
    };

    if (isOpen) {
      downloadChrome();
    }

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isOpen, onClose]);

  const retryDownload = async () => {
    try {
      setDownloadStatus({ status: 'downloading', message: 'Retrying download...' });
      
      // Set up progress listener
      const cleanup = window.electronAPI.onChromeDownloadProgress((progress) => {
        setDownloadStatus(progress);
      });

      // Request Chrome download from main process
      const result = await window.electronAPI.downloadChrome();

      if (result.success) {
        setTimeout(() => {
          onClose(true);
        }, 1000);
      } else {
        setDownloadStatus({
          status: 'error',
          message: result.error || 'Download failed. Please check your internet connection and try again.'
        });
      }

      // Cleanup
      cleanup();
    } catch (error) {
      setDownloadStatus({
        status: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (downloadStatus.status) {
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'downloading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus.status) {
      case 'complete': return '✅';
      case 'error': return '❌';
      case 'downloading': return '⏬';
      default: return '🔍';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-4xl mb-4">{getStatusIcon()}</div>
          <h3 className="text-lg font-semibold mb-2">PDF Generation Setup</h3>
          <p className={`mb-4 ${getStatusColor()}`}>
            {downloadStatus.message}
          </p>
          
          {downloadStatus.status === 'downloading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {downloadStatus.status === 'complete' && (
            <button
              onClick={() => onClose(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Continue
            </button>
          )}
          
          {downloadStatus.status === 'error' && (
            <div className="space-x-2">
              <button
                onClick={retryDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => onClose(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChromeDownloadModal;
