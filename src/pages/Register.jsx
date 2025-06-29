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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear password error when user types in either password field
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      error('Please fill in all required fields');
      return;
    }

    setLoading(true);
      try {      
		const registrationData = {
			name: formData.name,
			email: formData.email,
			phonenumber: formData.phone, // Note: backend expects 'phonenumber' not 'phone'
			password: formData.password
      };

      await register(registrationData);
      success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
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
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border border-white/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border border-white/20"
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border border-white/20"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border border-white/20"
                placeholder="Confirm your password"
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center text-sm mt-4">
              <input type="checkbox" id="termsConditions" className="mr-2" required />              <label htmlFor="termsConditions" className="text-white">
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
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-500 hover:to-red-500 text-white text-base font-medium rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? "CREATING ACCOUNT..." : "REGISTER"}
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