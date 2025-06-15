import React, { useState, useEffect, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faInfoCircle, faExclamationTriangle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

// Create context for toast notifications
const ToastContext = createContext();

// Toast types with their styles
const TOAST_TYPES = {
  SUCCESS: {
    bgColor: 'bg-green-500',
    icon: faCheckCircle,
  },
  INFO: {
    bgColor: 'bg-blue-500',
    icon: faInfoCircle,
  },
  WARNING: {
    bgColor: 'bg-yellow-500',
    icon: faExclamationTriangle,
  },
  ERROR: {
    bgColor: 'bg-red-500',
    icon: faTimesCircle,
  },
};

// Provider component to wrap the app with
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [connectionErrorToastId, setConnectionErrorToastId] = useState(null);

  const addToast = (message, type = 'INFO', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    if (id === connectionErrorToastId) {
      setConnectionErrorToastId(null);
    }
  };

  const clearToasts = () => {
    setToasts([]);
    setConnectionErrorToastId(null);
  };

  // Handle server connection errors
  useEffect(() => {
    const handleServerError = (event) => {
      const { message, type } = event.detail;
      
      if (type === 'CONNECTION_ERROR') {
        // Remove existing connection error toast if present
        if (connectionErrorToastId) {
          removeToast(connectionErrorToastId);
        }
        
        // Add new connection error toast with longer duration
        const toastId = addToast(message, 'ERROR', Infinity); // Persistent until connection restored
        setConnectionErrorToastId(toastId);
      }
    };

    const handleServerRestored = (event) => {
      const { message } = event.detail;
      
      // Remove connection error toast if present
      if (connectionErrorToastId) {
        removeToast(connectionErrorToastId);
        setConnectionErrorToastId(null);
      }
      
      // Show success message
      addToast(message, 'SUCCESS', 3000);
    };

    window.addEventListener('serverError', handleServerError);
    window.addEventListener('serverRestored', handleServerRestored);

    return () => {
      window.removeEventListener('serverError', handleServerError);
      window.removeEventListener('serverRestored', handleServerRestored);
    };
  }, [connectionErrorToastId]);

  // Expose context methods
  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success: (message, duration) => addToast(message, 'SUCCESS', duration),
    info: (message, duration) => addToast(message, 'INFO', duration),
    warning: (message, duration) => addToast(message, 'WARNING', duration),
    error: (message, duration, options = {}) => {
      // Check if this is a connection error and we already have one showing
      if (options.isConnectionError && connectionErrorToastId) {
        return connectionErrorToastId; // Don't add duplicate
      }
      return addToast(message, 'ERROR', duration);
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast container component - improved for responsive design
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 z-50 pointer-events-none w-full px-4 flex justify-center sm:justify-end sm:px-4 sm:right-4">
      {/* Center toasts on mobile, right-aligned on larger screens */}
      <div className="flex flex-col items-center sm:items-end space-y-2 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Individual toast component - improved for mobile display and animations
const Toast = ({ toast, onClose }) => {
  const { message, type, duration } = toast;
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.INFO;

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        duration: 0.2, 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      className={`${toastStyle.bgColor} rounded-lg shadow-lg pointer-events-auto w-full`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center flex-grow overflow-hidden">
          <div className="flex-shrink-0 text-white mr-3">
            <FontAwesomeIcon icon={toastStyle.icon} />
          </div>
          <p className="text-white text-sm sm:text-base break-words overflow-hidden">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors focus:outline-none ml-3 flex-shrink-0"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </motion.div>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default useToast;