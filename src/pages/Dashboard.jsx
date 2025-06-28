import React, { useState, useEffect } from "react";
import FeatureCard from "../components/common/FeatureCard";
import Button from "../components/common/Button";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        if (response.success) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    const refreshMasterData = async () => {
      try {
        await dashboardService.refreshMasterData();
      } catch (error) {
        console.error('Error refreshing master data:', error);
        // Don't show error toast for this as it's a background operation
      }
    };

    const initializeDashboard = async () => {
      await loadDashboardStats();
      await refreshMasterData();
    };
    
    initializeDashboard();
  }, [toast]);

  const reloadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = () => {
    navigate("/quotations/create");
  };

  const handleNavigate = (route) => {
    navigate(`/${route}`);
  };

  return (
    <div className="p-4 sm:p-6 text-primary-400">
      <div className="max-w-7xl mx-auto">
        {/* Header + Quick Actions side-by-side */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-3 mt-0 gap-3">
          {/* Header */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 mb-1">
                  Dashboard
                </h1>
                <p className="text-primary-400/70 text-base leading-tight">
                  Welcome back! Here's an overview of your logistics operations.
                </p>
              </div>
              <Button
                text="Refresh"
                onClick={reloadStats}
                bgColor="#f0f9ff"
                hoverBgColor="#e0f2fe"
                className="text-[#47034b] text-sm px-3 py-2 font-medium"
                icon={<span className="text-lg">🔄</span>}
                disabled={loading}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 w-full max-w-xl shadow-md">
            <h3 className="text-sm font-semibold text-[#C5677B] mb-2">
              Quick Actions
            </h3>
            <div className="flex gap-2 w-full">
              <Button
                text="New Quotation"
                onClick={handleCreateQuotation}
                bgColor="#C5677B"
                hoverBgColor="#C599B6"
                className="text-[#47034b] text-base px-2 py-1 font-semibold flex-1"
                icon={<span className="text-xl">📋</span>}
              />
              <Button
                text="Create LR"
                onClick={() => handleNavigate("lorry-receipts/create")}
                bgColor="#C599B6"
                hoverBgColor="#E6B2BA"
                className="text-[#47034b] text-base px-2 py-1 font-semibold flex-1"
                icon={<span className="text-xl">🧾</span>}
              />
              <Button
                text="Add Company"
                onClick={() => handleNavigate("companies")}
                bgColor="#E6B2BA"
                hoverBgColor="#FAD0C4"
                className="text-[#47034b] text-base px-2 py-1 font-semibold flex-1"
                icon={<span className="text-xl">🏢</span>}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch mt-10">
          {/* --- Quotations --- */}
          <FeatureCard
            title="Quotations"
            icon={faFileInvoice}
            bgColor="bg-gradient-to-br from-primary-400 to-primary-300"
            iconBgColor="bg-primary-50"
            iconTextColor="text-[#47034b]"
          >
            <div className="space-y-2">
              <div className="bg-white/50 p-2 rounded-lg">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Total Quotations</span>
                  <span className="text-lg font-bold">{dashboardStats.quotations.total}</span>
                </div>
              </div>
              <Button
                text="View"
                onClick={() => handleNavigate("quotations")}
                bgColor="#FFF7F3"
                hoverBgColor="#FAD0C4"
                className="text-[#47034b] text-base font-semibold"
                height="h-8"
                width="w-full"
              />
            </div>
          </FeatureCard>

          {/* --- Lorry Receipts --- */}
          <FeatureCard
            title="Lorry Receipts"
            icon={faTruck}
            bgColor="bg-gradient-to-br from-primary-350 to-primary-200"
            iconBgColor="bg-primary-50"
            iconTextColor="text-[#47034b]"
          >
            <div className="space-y-2">
              <div className="bg-white/50 p-2 rounded-lg">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Total Receipts</span>
                  <span className="text-lg font-bold">{dashboardStats.lorryReceipts.total}</span>
                </div>
              </div>
              <Button
                text="View"
                onClick={() => handleNavigate("lorry-receipts")}
                bgColor="#FFF7F3"
                hoverBgColor="#FAD0C4"
                className="text-[#47034b] text-base font-semibold"
                height="h-8"
                width="w-full"
              />
            </div>
          </FeatureCard>

          {/* --- Invoices --- */}
          <FeatureCard
            title="Invoices"
            icon={faReceipt}
            bgColor="bg-gradient-to-br from-primary-300 to-primary-100"
            iconBgColor="bg-primary-50"
            iconTextColor="text-[#47034b]"
          >
            <div className="space-y-2">
              <div className="bg-white/50 p-2 rounded-lg">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Total Invoices</span>
                  <span className="text-lg font-bold">{dashboardStats.invoices.total}</span>
                </div>
              </div>
              <Button
                text="View"
                onClick={() => handleNavigate("invoices")}
                bgColor="#FFF7F3"
                hoverBgColor="#FAD0C4"
                className="text-[#47034b] text-base font-semibold"
                height="h-8"
                width="w-full"
              />
            </div>
          </FeatureCard>

          {/* --- Master Data --- */}
          <FeatureCard
            title="Master Data"
            icon={faCogs}
            bgColor="bg-gradient-to-br from-primary-200 to-primary-400"
            iconBgColor="bg-primary-50"
            iconTextColor="text-[#47034b]"
            className="col-span-1 md:col-span-2 lg:col-span-3 text-center"
            width="w-full max-w-full"
          >
            <div className="space-y-2">
              <div className="bg-white/50 p-2 rounded-lg">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-base">{dashboardStats.master.trucks}</div>
                    <div className="opacity-90">Trucks</div>
                  </div>
                  <div>
                    <div className="font-bold text-base">{dashboardStats.master.drivers}</div>
                    <div className="opacity-90">Drivers</div>
                  </div>
                  <div>
                    <div className="font-bold text-base">{dashboardStats.master.customers}</div>
                    <div className="opacity-90">Companiies</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <Button
                  text="Manage Trucks"
                  onClick={() => handleNavigate("trucks")}
                  bgColor="#FFF7F3"
                  hoverBgColor="#FAD0C4"
                  className="text-[#47034b] text-base font-semibold"
                  width="w-auto"
                  height="h-7"
                  icon={<span className="text-xl">🚛</span>}
                />
                <Button
                  text="Manage Drivers"
                  onClick={() => handleNavigate("drivers")}
                  bgColor="#FFF7F3"
                  hoverBgColor="#FAD0C4"
                  className="text-[#47034b] text-base font-semibold"
                  width="w-auto"
                  height="h-7"
                  icon={<span className="text-xl">👨‍💼</span>}
                />
                <Button
                  text="Manage Companies"
                  onClick={() => handleNavigate("companies")}
                  bgColor="#FFF7F3"
                  hoverBgColor="#FAD0C4"
                  className="text-[#47034b] text-base font-semibold"
                  width="w-auto"
                  height="h-7"
                  icon={<span className="text-xl">🏢</span>}
                />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
