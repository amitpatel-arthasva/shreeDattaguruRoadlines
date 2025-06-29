import React, { useState, useEffect } from "react";
import FeatureCard from "../components/common/FeatureCard";
import Button from "../components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoice,
  faTruck,
  faReceipt,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import dashboardService from "../services/dashboardService";
import { useToast } from "../components/common/ToastSystem";

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [dashboardStats, setDashboardStats] = useState({
    quotations: { total: 0 },
    lorryReceipts: { total: 0 },
    invoices: { total: 0 },
    master: { trucks: 0, drivers: 0, customers: 0 },
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const response = await dashboardService.getDashboardStats();
        if (response.success) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      }
    };

    const refreshMasterData = async () => {
      try {
        await dashboardService.refreshMasterData();
      } catch (error) {
        console.error("Error refreshing master data:", error);
        // Don't show error toast for this as it's a background operation
      }
    };

    const initializeDashboard = async () => {
      await loadDashboardStats();
      await refreshMasterData();
    };

    initializeDashboard();
  }, [toast]);

  const handleCreateQuotation = () => {
    navigate("/quotations/create");
  };

  const handleNavigate = (route) => {
    navigate(`/${route}`);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">
              Welcome back! Here's an overview of your logistics operations.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleCreateQuotation}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faFileInvoice} className="h-4 w-4" />
              <span>New Quotation</span>
            </button>
            <button
              onClick={() => handleNavigate("lorry-receipts/create")}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />
              <span>Create LR</span>
            </button>
            <button
              onClick={() => handleNavigate("companies")}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faTruck} className="h-4 w-4" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Quotations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative w-full">
            <div className="absolute top-4 left-4 bg-purple-100 rounded-lg p-2">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="h-5 w-5 text-purple-600"
              />
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 pt-16">
              <h3 className="text-lg font-semibold text-white">Quotations</h3>
            </div>

            <div className="p-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Total Quotations
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardStats.quotations.total}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate("quotations")}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={handleCreateQuotation}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-2 rounded-lg text-sm font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="text-lg">+</span>
                  <span>Create Quotation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lorry Receipts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative w-full">
            <div className="absolute top-4 left-4 bg-pink-100 rounded-lg p-2">
              <FontAwesomeIcon
                icon={faTruck}
                className="h-5 w-5 text-pink-600"
              />
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 pt-16">
              <h3 className="text-lg font-semibold text-white">
                Lorry Receipts
              </h3>
            </div>

            <div className="p-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Receipts</span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardStats.lorryReceipts.total}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate("lorry-receipts")}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleNavigate("lorry-receipts/create")}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-2 rounded-lg text-sm font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="text-lg">+</span>
                  <span>Create Lorry Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative w-full">
            <div className="absolute top-4 left-4 bg-purple-100 rounded-lg p-2">
              <FontAwesomeIcon
                icon={faReceipt}
                className="h-5 w-5 text-purple-600"
              />
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 pt-16">
              <h3 className="text-lg font-semibold text-white">Invoices</h3>
            </div>

            <div className="p-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Invoices</span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardStats.invoices.total}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center h-28">
                {" "}
                {/* Adjust height as needed */}
                <button
                  onClick={() => handleNavigate("invoices")}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Data */}
        <div className="mt-12 mb-8 w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative w-full">
            <div className="absolute top-4 left-4 bg-purple-100 rounded-lg p-2">
              <FontAwesomeIcon
                icon={faCogs}
                className="h-5 w-5 text-purple-600"
              />
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 pt-16">
              <h3 className="text-lg font-semibold text-white">Master Data</h3>
            </div>

            <div className="p-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Resources</span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardStats.master.trucks +
                      dashboardStats.master.drivers +
                      dashboardStats.master.customers}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleNavigate("trucks")}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-3 rounded-lg text-xs font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-1"
                  >
                    <FontAwesomeIcon icon={faTruck} className="h-3 w-3" />
                    <span>Manage Trucks</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("drivers")}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-3 rounded-lg text-xs font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span className="text-sm">👨‍💼</span>
                    <span>Manage Drivers</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("companies")}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-3 rounded-lg text-xs font-medium hover:from-orange-500 hover:to-red-500 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span className="text-sm">🏢</span>
                    <span>Add Company</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
