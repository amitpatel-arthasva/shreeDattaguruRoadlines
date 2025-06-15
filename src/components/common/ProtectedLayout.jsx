import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Navbar from './Navbar.jsx';
import Layout from './Layout.jsx';

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Navbar />
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
