import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '/src/components/common/Button';
import Card from '/src/components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/ToastSystem';
import Logo from '/src/assets/images/Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      error('Please fill in all fields');
      return;
    }

    setLoading(true);
      try {
      await login(formData);
      success('Login successful! Welcome back.');
      
      // Redirect to the page they were trying to visit or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Login failed. Please try again.');
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
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-300 mt-2">Log in to access your account</p>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="md:w-1/2 md:pl-8 md:border-l md:border-orange-300">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 border border-white/20"
                placeholder="your@email.com"
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
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 border border-white/20"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-500 hover:to-red-500 text-white text-base font-medium rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>

            <div className="text-center mt-6">
              <p className="text-white">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-200 hover:text-white transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
