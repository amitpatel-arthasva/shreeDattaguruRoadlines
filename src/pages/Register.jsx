import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '/src/components/common/Button';
import Card from '/src/components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/ToastSystem';
import Logo from '/src/assets/images/Logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    
    // Special handling for phone numbers
    if (name === 'phone') {
      // Only allow numbers, limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numbersOnly.slice(0, 10) }));
    }
    // Special handling for email
    else if (name === 'email') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    }
    // Handle password fields
    else if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Default handling for other fields
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      return; // Prevent double submission
    }
    
    try {
      // Validate all required fields
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        error('Please fill in all required fields');
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
        error('Password must be at least 6 characters long');
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        error('Passwords do not match');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        error('Please enter a valid email address');
        return;
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
        error('Please enter a valid 10-digit phone number');
        return;
      }

      setLoading(true);

      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phonenumber: formData.phone.replace(/[^0-9]/g, ''), // Remove non-numeric characters
        password: formData.password
      };

      console.log('Attempting registration with:', { ...registrationData, password: '[REDACTED]' });

      await register(registrationData);
      success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-dvh flex items-center justify-center py-8 bg-gradient-to-br from-orange-50 to-amber-50">
      <Card 
        className="max-w-4xl w-full shadow-xl mx-4 md:flex md:flex-row"
        padding="p-8"
        bgColor="bg-gradient-to-br from-orange-400 to-red-400"
      >
        {/* Left side - Logo at top left and text centered vertically */}
        <div className="md:w-1/2 md:pr-8 flex flex-col mb-8 md:mb-0 relative">
          {/* Logo positioned at the top left */}
          <div className="w-88 absolute left-1/2 -translate-x-1/2">
            <img src={Logo} alt="ShreeDattaguruLogo" />
          </div>
          
          {/* Vertically centered text content */}
          <div className="text-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-300 mt-2">Sign up to get started</p>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="md:w-1/2 md:pl-8 md:border-l md:border-orange-300">
          <form onSubmit={handleSubmit} className="space-y-4">            <div>
              <label htmlFor="name" className="block text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border border-white/20"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white mb-2">
                Email <span className="text-orange-200">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className={`w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border ${
                  formData.email ? 'border-white/20' : 'border-orange-300/50'
                }`}
                placeholder="your@email.com"
              />
              <small className="text-orange-200 text-xs mt-1">Enter a valid email address</small>
            </div>

            <div>
              <label htmlFor="phone" className="block text-white mb-2">
                Phone Number <span className="text-orange-200">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength="10"
                autoComplete="tel"
                className={`w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border ${
                  formData.phone && formData.phone.length === 10 ? 'border-white/20' : 'border-orange-300/50'
                }`}
                placeholder="10-digit phone number"
              />
              <small className="text-orange-200 text-xs mt-1">Enter a 10-digit phone number</small>
            </div>

            <div>
              <label htmlFor="password" className="block text-white mb-2">
                Password <span className="text-orange-200">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border ${
                  formData.password && formData.password.length >= 6 ? 'border-white/20' : 'border-orange-300/50'
                }`}
                placeholder="Create a password (min. 6 characters)"
              />
              <small className="text-orange-200 text-xs mt-1">Password must be at least 6 characters long</small>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white mb-2">
                Confirm Password <span className="text-orange-200">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border ${
                  formData.confirmPassword && formData.confirmPassword === formData.password 
                    ? 'border-white/20' 
                    : 'border-orange-300/50'
                }`}
                placeholder="Confirm your password"
              />
              {passwordError ? (
                <small className="text-red-400 text-xs mt-1">{passwordError}</small>
              ) : (
                <small className="text-orange-200 text-xs mt-1">Re-enter your password to confirm</small>
              )}
            </div>

            <div className="flex items-center text-sm mt-4">
              <input 
                type="checkbox" 
                id="termsConditions" 
                className="mr-2 w-4 h-4 accent-orange-400" 
                required 
              />
              <label htmlFor="termsConditions" className="text-white text-sm">
                I agree to the{' '}
                <a href="/terms" className="text-orange-200 hover:text-white transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-orange-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>            

            <button
              type="submit"
              disabled={loading || !formData.name || !formData.email || !formData.phone || 
                       !formData.password || !formData.confirmPassword || 
                       formData.password !== formData.confirmPassword}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-500 hover:to-red-500 
                       text-white text-base font-medium rounded-full transition-all duration-200 transform 
                       hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:transform-none disabled:hover:scale-100 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  CREATING ACCOUNT...
                </span>
              ) : "CREATE ACCOUNT"}
            </button>

            <div className="text-center mt-6">
              <p className="text-white">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-200 hover:text-white transition-colors">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Register;