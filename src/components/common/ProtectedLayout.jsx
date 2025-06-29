import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Navbar from './Navbar.jsx';
import Layout from './Layout.jsx';

const ProtectedLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <ProtectedRoute>
      <Navbar />
      <Layout>
        <Outlet />
      </Layout>
      {/* Render footer outside Layout only for Dashboard */}
      {isDashboard && (
        <footer className="relative bg-gray-900 w-full">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          ></div>
          
          {/* Low Opacity Overlay */}
          <div className="absolute inset-0 from-amber-400 to-orange-400 bg-gradient-to-r opacity-75"></div>

          {/* Footer Content */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              {/* Motivating Message */}
              <div className=" text-red-900">
                <h3 className="text-3xl font-bold mb-4">Delivering Success, One Mile at a Time</h3>
                <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
                  Every journey begins with a single step, every shipment with trust, and every success with dedication. 
                  Together, we're not just moving goods – we're moving dreams, ambitions, and the future of commerce.
                </p>
                <div className="mt-8">
                  <p className="text-lg font-semibold text-red-900">
                    "Excellence in Motion, Trust in Every Delivery"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
