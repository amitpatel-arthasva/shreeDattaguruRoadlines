import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt, faBars, faTimes, faReceipt, faFileText, faCalculator, faArrowLeft, faArrowRight, faTruck, faUser, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './ToastSystem';

const Navbar = () => {
  const [isFinancesDropdownOpen, setIsFinancesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFinancesHovered, setIsFinancesHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { success } = useToast();
  const financesRef = useRef(null);
  const profileRef = useRef(null);
  const financesTimeoutRef = useRef(null);  const profileTimeoutRef = useRef(null);
  
  // Update navigation state
  const updateNavigationState = useCallback(async () => {
    if (window.electronAPI && window.electronAPI.canGoBack && window.electronAPI.canGoForward) {
      try {
        const backState = await window.electronAPI.canGoBack();
        const forwardState = await window.electronAPI.canGoForward();
        setCanGoBack(backState);
        setCanGoForward(forwardState);
      } catch {
        // Fallback for browser or when Electron API is not available
        setCanGoBack(window.history.length > 1);
        setCanGoForward(false); // Browser API doesn't provide forward state
      }
    } else {
      // Browser fallback or Electron API not available
      setCanGoBack(window.history.length > 1);
      setCanGoForward(false);
    }
  }, []);
    const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };  // Feature pages mapping for display names
  const featurePages = useMemo(() => ({
    '/lorry-receipts': 'Lorry Receipts',
    '/trucks': 'Trucks',
    '/drivers': 'Drivers',
    '/companies': 'Companies',
    '/quotations': 'Quotations',
    '/invoices': 'Invoices',
    '/dashboard': 'Dashboard'
  }), []);// Check if the current page is a feature page or account settings
  const isFeaturePage = Object.keys(featurePages).includes(location.pathname);
  const isAccountPage = location.pathname === '/settings' || location.pathname === '/profile';
  const shouldShowPageName = isFeaturePage || isAccountPage;    // Update current page title when route changes
  useEffect(() => {
    if (isFeaturePage) {
      setCurrentPage(featurePages[location.pathname]);    } else if (location.pathname === '/home') {
      setCurrentPage('Home');
    } else if (location.pathname === '/dashboard') {
      setCurrentPage('Dashboard');    } else if (location.pathname === '/profile' || location.pathname === '/settings') {
      setCurrentPage('Settings');
    } else if (location.pathname === '/logout') {
      setCurrentPage('Log Out');
    } else {
      setCurrentPage('');
    }
    
    // Update navigation state for electron
    if (window.electronAPI) {
      updateNavigationState();
    }  }, [location.pathname, isFeaturePage, featurePages, updateNavigationState]);  
  // Navigation handlers
  const handleGoBack = useCallback(async () => {
    if (window.electronAPI && window.electronAPI.navigateBack) {
      try {
        const success = await window.electronAPI.navigateBack();
        if (success) {
          updateNavigationState();
        }
      } catch (error) {
        console.error('Error navigating back:', error);
        // Fallback to browser navigation
        window.history.back();
      }
    } else {      // Browser fallback
      window.history.back();
    }
  }, [updateNavigationState]);
  
  const handleGoForward = useCallback(async () => {
    if (window.electronAPI && window.electronAPI.navigateForward) {
      try {
        const success = await window.electronAPI.navigateForward();
        if (success) {
          updateNavigationState();
        }
      } catch (error) {
        console.error('Error navigating forward:', error);
        // Fallback to browser navigation
        window.history.forward();
      }    } else {
      // Browser fallback
      window.history.forward();
    }
  }, [updateNavigationState]);
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (financesTimeoutRef.current) clearTimeout(financesTimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      document.body.style.overflow = '';
    };
  }, []);
    // Reset dropdown states and body overflow when route changes
  useEffect(() => {
    setIsFinancesDropdownOpen(false);
    setIsProfileDropdownOpen(false);
    setIsFinancesHovered(false);
    setIsProfileHovered(false);
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Alt+Left (Back) and Alt+Right (Forward)
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleGoBack();
      } else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        handleGoForward();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGoBack, handleGoForward]);
  
  // Handle clicks outside to close dropdowns when clicked elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (financesRef.current && !financesRef.current.contains(event.target)) {
        if (isFinancesDropdownOpen) {
          setIsFinancesDropdownOpen(false);
        }
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (isProfileDropdownOpen) {
          setIsProfileDropdownOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFinancesDropdownOpen, isProfileDropdownOpen]);
  
  // Combined state for both hover and click
  const showFinancesDropdown = isFinancesDropdownOpen || isFinancesHovered;
  const showProfileDropdown = isProfileDropdownOpen || isProfileHovered;
  
  const handleFinancesMouseEnter = () => {
    if (financesTimeoutRef.current) clearTimeout(financesTimeoutRef.current);
    setIsFinancesHovered(true);
  };
  
  const handleFinancesMouseLeave = () => {
    financesTimeoutRef.current = setTimeout(() => {
      setIsFinancesHovered(false);
    }, 200); // 300ms delay before closing
  };
  
  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setIsProfileHovered(true);
  };
  
  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 200); // 300ms delay before closing
  };
  
  const handleFinancesClick = () => {
    setIsFinancesDropdownOpen(!isFinancesDropdownOpen);
    if (isFinancesDropdownOpen) {
      setIsFinancesHovered(false);
    }
  };
  
  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isProfileDropdownOpen) {
      setIsProfileHovered(false);
    }
  };
  
  // Toggle mobile finances dropdown
  const toggleFinancesDropdown = () => {
    setIsFinancesDropdownOpen(!isFinancesDropdownOpen);
  };
  
  // Ensure body scrolling is properly restored
  useEffect(() => {
    if (!isMobileMenuOpen) {
        document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);
  
  // Toggle mobile menu and prevent body scrolling when menu is open
  const toggleMobileMenu = () => {
    const newMenuState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newMenuState);
    
    // Prevent scrolling when menu is open
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  return (
    <div className="w-full fixed top-0 left-0 flex justify-center pt-4 z-50">
      <div 
        className="w-[95%] rounded-4xl bg-[#170D1C]/50 px-6 py-4 relative flex items-center"
        style={{ backdropFilter: 'blur(10px)' }}
      >        {/* Logo and Navigation - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white text-2xl font-bold mr-6">
            MoveSure
          </Link>
          
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              className={`p-2 rounded-lg transition-all duration-200 ${
                canGoBack 
                  ? 'text-white hover:bg-white/20 hover:scale-105' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              title="Go Back (Alt+Left)"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              className={`p-2 rounded-lg transition-all duration-200 ${
                canGoForward 
                  ? 'text-white hover:bg-white/20 hover:scale-105' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              title="Go Forward (Alt+Right)"
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navbar Layout */}
        <div className="md:hidden flex items-center justify-between w-full">          {/* Logo - Mobile */}
          <div className="flex items-center">
            <Link to="/" className="text-white text-lg font-bold">
              MoveSure
            </Link>
          </div>
          
          {/* Current page title for mobile - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            {currentPage && (
              <h2 className="text-white text-base font-medium">
                {currentPage}
              </h2>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="text-white focus:outline-none p-2 relative z-[100] bg-gray-700/70 rounded"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon 
              icon={faBars} 
              className="h-5 w-5" 
            />
          </button>
        </div>        {/* Desktop Navigation Links */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8">
          <NavLink to="/dashboard" text="Dashboard" />
          
          {/* Services Dropdown Menu */}
          <div 
            ref={financesRef}
            className="relative" 
            onMouseEnter={handleFinancesMouseEnter}
            onMouseLeave={handleFinancesMouseLeave}
          >
            <button 
              className="flex items-center text-white hover:text-gray-300 transition-colors py-2"
              onClick={handleFinancesClick}
            >
              Services
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`ml-1 h-4 w-4 transition-transform duration-300 ${showFinancesDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
              <div className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-[14em] rounded-2xl shadow-lg bg-[#170D1C]/80 z-50 transition-all duration-300 ease-in-out 
                           origin-top ${showFinancesDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>              <div className="py-1">
                <DropdownItem to="/lorry-receipts" text="Lorry Receipts" icon={<FontAwesomeIcon icon={faReceipt} className="mr-2" />} />
                <DropdownItem to="/trucks" text="Trucks" icon={<FontAwesomeIcon icon={faTruck} className="mr-2" />} />
                <DropdownItem to="/drivers" text="Drivers" icon={<FontAwesomeIcon icon={faUser} className="mr-2" />} />
                <DropdownItem to="/companies" text="Companies" icon={<FontAwesomeIcon icon={faBuilding} className="mr-2" />} />
                <DropdownItem to="/quotations" text="Quotations" icon={<FontAwesomeIcon icon={faCalculator} className="mr-2" />} />
                <DropdownItem to="/invoices" text="Invoices" icon={<FontAwesomeIcon icon={faFileText} className="mr-2" />} />
              </div>
            </div>
          </div>
        </div>        <div className="hidden md:flex items-center ml-auto space-x-8">
          {/* Active Page Indicator - desktop only */}
          {shouldShowPageName && (
            <div className="text-white font-medium">
              <span className="text-md">{currentPage}</span>
            </div>
          )}          {/* User Name Display - visible on desktop */}
          <div className="text-white font-medium">
            <span className="text-sm">Welcome, {user?.name || 'User'}</span>
          </div>

          {/* Profile Link and Dropdown - visible on desktop */}
          <div 
            ref={profileRef}
            className="relative"
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <button 
              className="text-white rounded-full bg-gray-700 p-2 hover:bg-gray-600 transition-colors"
              onClick={handleProfileClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            
            <div className={`absolute right-0 top-full mt-1 w-48 rounded-2xl shadow-lg bg-[#170D1C]/80 z-50 transition-all duration-300 ease-in-out 
                          origin-top ${showProfileDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>              <div className="py-0.5">
                <DropdownItem 
                  to="/settings" 
                  text="Settings" 
                  icon={<FontAwesomeIcon icon={faCog} className="mr-2" />}
                /><DropdownItem 
                  to="/logout" 
                  text="Log Out" 
                  icon={<FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />}
                  className='hover:bg-red-500'
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div className={`fixed inset-0 bg-[#170D1C]/95 z-30 transition-all duration-300 md:hidden ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`} style={{ backdropFilter: 'blur(5px)' }}>
        {/* Close button in the top-right corner */}
        <button 
          className="absolute top-6 right-6 text-white hover:text-gray-300 focus:outline-none bg-[#2D1F3A] p-3 rounded-xl shadow-lg"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
        </button>          <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
          
          {/* Mobile Navigation Buttons */}
          <div className={`flex items-center space-x-4 transform transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
          }`} style={{ transitionDelay: '50ms' }}>
            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              className={`p-3 rounded-xl transition-all duration-200 ${
                canGoBack 
                  ? 'text-white bg-[#2D1F3A] hover:bg-[#3D2F4A]' 
                  : 'text-gray-500 bg-gray-800 cursor-not-allowed'
              }`}
              title="Go Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              className={`p-3 rounded-xl transition-all duration-200 ${
                canGoForward 
                  ? 'text-white bg-[#2D1F3A] hover:bg-[#3D2F4A]' 
                  : 'text-gray-500 bg-gray-800 cursor-not-allowed'
              }`}
              title="Go Forward"
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5" />
            </button>
          </div>
          
          <Link 
            to="/dashboard" 
            className={`text-white text-xl font-medium transform transition-all duration-500 ease-out ${
              isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`} 
            style={{ transitionDelay: '100ms' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          
          {/* Mobile Services Submenu */}
          <div className={`flex flex-col items-center transform transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
          }`} style={{ transitionDelay: '150ms' }}>
            <button 
              className="text-white text-xl font-medium mb-2 flex items-center bg-[#2D1F3A] px-4 py-2 rounded-xl"
              onClick={toggleFinancesDropdown}
            >
              Services
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`ml-2 h-5 w-5 transition-transform duration-300 ${isFinancesDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>            <div className={`flex flex-col space-y-3 items-center bg-[#2D1F3A]/70 rounded-lg w-full py-3 px-4 mt-2 transition-all duration-300 ${
              isFinancesDropdownOpen ? 'max-h-96 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0 overflow-hidden'
            }`}>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '50ms' }}>
                <MobileNavLink to="/lorry-receipts" text="Lorry Receipts" icon={faReceipt} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '75ms' }}>
                <MobileNavLink to="/trucks" text="Trucks" icon={faTruck} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '100ms' }}>
                <MobileNavLink to="/drivers" text="Drivers" icon={faUser} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '125ms' }}>
                <MobileNavLink to="/companies" text="Companies" icon={faBuilding} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '150ms' }}>
                <MobileNavLink to="/quotations" text="Quotations" icon={faCalculator} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className={`transform transition-all duration-300 ease-out ${
                isFinancesDropdownOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`} style={{ transitionDelay: '175ms' }}>
                <MobileNavLink to="/invoices" text="Invoices" icon={faFileText} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
            {/* Mobile Account Links */}
          <div className={`pt-6 border-t border-gray-700 w-2/3 flex flex-col items-center space-y-4 transform transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>        		   {/* User Name Display - Mobile */}
            <div className="text-white text-center">
              <span className="text-sm font-medium">Welcome, {user?.name}</span>
            </div>
            <MobileNavLink to="/settings" text="Settings" icon={faCog} onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink 
              to="/logout" 
              text="Log Out" 
              icon={faSignOutAlt} 
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                handleLogout();
              }} 
              className="text-red-400" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const NavLink = ({ to, text }) => (
  <Link 
    to={to} 
    className="text-white hover:text-gray-300 transition-colors"
  >
    {text}
  </Link>
);

const DropdownItem = ({ to, text, icon, className = '', onClick }) => (
  <Link 
    to={to} 
    className={`flex items-center m-2 px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-2xl transition-colors ${className}`}
    onClick={onClick}
  >
    {icon}
    {text}
  </Link>
);

const MobileNavLink = ({ to, text, icon, onClick, className = '' }) => (
  <Link 
    to={to} 
    className={`flex items-center text-white transition-colors ${className}`}
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} className="mr-2" />
    {text}
  </Link>
);

export default Navbar;
