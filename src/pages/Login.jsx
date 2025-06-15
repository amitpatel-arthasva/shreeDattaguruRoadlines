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
    <div className="w-full min-h-dvh flex items-center justify-center py-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card 
        className="max-w-4xl w-full shadow-xl mx-4 md:flex md:flex-row"
        padding="p-8"
        bgColor="bg-gradient-to-br from-primary-350 to-primary-200"
      >
        {/* Left side - Logo at top left and text centered vertically */}
        <div className="md:w-1/2 md:pr-8 flex flex-col mb-8 md:mb-0 relative">
          {/* Logo positioned at the top left */}
          <div className="mb-6 text-left">
            <img src={Logo} alt="Arthasva Logo" className="h-16" />
          </div>
          
          {/* Vertically centered text content */}
          <div className="text-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-300 mt-2">Log in to access your account</p>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="md:w-1/2 md:pl-8 md:border-l md:border-primary-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-200 mb-2">
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
                className="w-full px-4 py-3 bg-[var(--color-primary-400)] text-white placeholder-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-200 mb-2">
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
                className="w-full px-4 py-3 bg-[var(--color-primary-400)] text-white placeholder-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-primary-50">
                <input type="checkbox" className="mr-2" disabled={loading} />
                Remember me
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button 
              text={loading ? "LOGGING IN..." : "LOGIN"} 
              width="w-full"
              bgColor="var(--color-primary-350)" 
              hoverBgColor="var(--color-primary-300)" 
              className="!text-white text-base font-medium mt-6" 
              height="h-12"
              rounded="rounded-full"
              type="submit"
              onClick={loading ? () => {} : undefined}
            />

            <div className="text-center mt-6">
              <p className="text-primary-50">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
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