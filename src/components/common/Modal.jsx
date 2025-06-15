import React, { useEffect, useState, useCallback, useRef } from "react";

// Custom scrollbar styles using the theme colors
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(71, 3, 75, 0.1);
    border-radius: 10px;
    margin: 6px 0;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #C599B6;
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #C5677B;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
`;

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = "max-w-4xl",
  title,
  subtitle,
  showCloseButton = true,
  className = "",
  onScrollToTop
}) => {
  const [animation, setAnimation] = useState(false);
  const [backdropAnimation, setBackdropAnimation] = useState(false);  const modalContentRef = useRef(null);
  const scrollableContentRef = useRef(null);
  const scrollToTop = useCallback(() => {
    if (scrollableContentRef.current) {
      // First try to scroll the modal's content area
      scrollableContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Also find and scroll any nested scrollable elements
      const nestedScrollables = scrollableContentRef.current.querySelectorAll('.overflow-y-auto');
      nestedScrollables.forEach(element => {
        element.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }, []);

  // Expose scrollToTop function to parent component
  useEffect(() => {
    if (onScrollToTop) {
      onScrollToTop(scrollToTop);
    }
  }, [onScrollToTop, scrollToTop]);

  const handleClose = useCallback(() => {
    setBackdropAnimation(false);
    setAnimation(false);
    // Delay actual closing to allow animation to complete
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  // Handle click outside modal
  const handleBackdropClick = useCallback((event) => {
    // Only close if clicking the backdrop, not the modal content
    if (
      modalContentRef.current && 
      !modalContentRef.current.contains(event.target)
    ) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      // Add a new history entry when modal opens
      window.history.pushState({ modal: true }, "");
      
      // Staggered animations for smoother effect
      // First trigger backdrop animation
      requestAnimationFrame(() => {
        setBackdropAnimation(true);
        // Then trigger modal content animation slightly after
        setTimeout(() => setAnimation(true), 50);
      });
      
      // Handle back button navigation
      const handlePopState = () => {
        handleClose();
      };
      
      // Add event listener for ESC key
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      document.addEventListener('keydown', handleEscKey);
      
      // Clean up event listeners when modal closes
      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      setBackdropAnimation(false);
      setAnimation(false);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style>{scrollbarStyles}</style>
      
      <div 
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
          backdropAnimation ? 'backdrop-blur-md bg-black/50' : 'backdrop-blur-none bg-black/0'
        }`}
        onClick={handleBackdropClick}
      >        
	    <div 
          ref={modalContentRef}
          className={`bg-white rounded-lg ${maxWidth} w-full relative border border-gray-300 shadow-xl transition-all duration-300 ease-out overflow-hidden h-full sm:h-auto max-h-[95vh] flex flex-col ${
            animation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${className}`}
        >          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
              {title && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
            {/* Content */}
          <div 
            ref={scrollableContentRef}
            className={`custom-scrollbar overflow-y-auto flex-1 ${title || showCloseButton ? '' : 'h-full'}`}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
