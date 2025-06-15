import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faQuestion } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  dangerConfirm = false
}) => {
  const [animation, setAnimation] = useState(false);
  const [backdropAnimation, setBackdropAnimation] = useState(false);

  const handleClose = useCallback(() => {
    setBackdropAnimation(false);
    setAnimation(false);
    // Delay actual closing to allow animation to complete
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    handleClose();
  }, [onConfirm, handleClose]);

  // Handle ESC key and animations
  useEffect(() => {
    if (isOpen) {
      // Staggered animations for smoother effect
      requestAnimationFrame(() => {
        setBackdropAnimation(true);
        setTimeout(() => setAnimation(true), 50);
      });
      
      // Add event listener for ESC key
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      setBackdropAnimation(false);
      setAnimation(false);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
        backdropAnimation ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transition-all duration-300 ease-out ${
          animation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >        {/* Header with Icon */}
        <div className="flex items-center gap-4 p-6 pb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            dangerConfirm 
              ? 'bg-red-100 text-red-600' 
              : 'bg-primary-100 text-primary-400'
          }`}>
            <FontAwesomeIcon 
              icon={dangerConfirm ? faExclamationTriangle : faQuestion} 
              className="text-xl"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0 sm:justify-end">
          <Button 
            text={cancelText}
            bgColor="#6B7280"
            hoverBgColor="#4B5563"
            className="text-white w-full sm:w-auto order-2 sm:order-1"
            onClick={handleClose}
          />
          <Button 
            text={confirmText}
            bgColor={dangerConfirm ? "#EF4444" : "#C5677B"}
            hoverBgColor={dangerConfirm ? "#DC2626" : "#C599B6"}
            className="text-white w-full sm:w-auto order-1 sm:order-2"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
