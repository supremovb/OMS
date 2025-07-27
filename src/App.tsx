import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import { AdminDashboard, CashierDashboard } from "./dashboard";
import ProfilePage from "./dashboard/ProfilePage";
import AppSidebar from "./dashboard/AppSidebar";
import UserManagementPage from "./dashboard/users/UserManagementPage";
import EmployeeManagementPage from "./dashboard/employees/EmployeeManagementPage";
import ServiceManagementPage from "./dashboard/services/ServiceManagementPage";
import PaymentServicesPage from "./dashboard/payment/PaymentServicesPage";
import LoyaltyProgramPage from "./dashboard/LoyaltyProgramPage";
import DailySummaryPage from "./dashboard/DailySummaryPage";
import SalesTransactionsPage from "./dashboard/SalesTransactionsPage";
import ChemicalsInventoryPage from "./dashboard/ChemicalsInventoryPage";
import ReportsAnalyticsPage from "./dashboard/ReportsAnalyticsPage";
import CommissionsPage from "./dashboard/CommissionsPage";

// Helper to check authentication from localStorage
function isAuthenticated() {
  return !!localStorage.getItem("role") && !!localStorage.getItem("userInfo");
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

// ProfilePage wrapper with sidebar and working logout/profile
function ProfileWithSidebar() {
  const userInfo = localStorage.getItem("userInfo");
  const user = userInfo ? JSON.parse(userInfo) : null;
  const role = localStorage.getItem("role") as "admin" | "cashier" | null;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleProfile = () => {
    // Already on profile, do nothing
  };

  if (!user || !role) return <Navigate to="/login" replace />;

  return (
    <AppSidebar role={role} onLogout={handleLogout} onProfile={handleProfile}>
      <ProfilePage user={user} onBack={() => navigate(-1)} />
    </AppSidebar>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                // Pass user info for initials
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagementPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute>
              <EmployeeManagementPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <ServiceManagementPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chemicals"
          element={
            <ProtectedRoute>
              <ChemicalsInventoryPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loyalty-program"
          element={
            <ProtectedRoute>
              <LoyaltyProgramPage
                role="admin"
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <ReportsAnalyticsPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute>
              <CashierDashboard
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/payment-services"
          element={
            <ProtectedRoute>
              <PaymentServicesPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
                cashierUsername={JSON.parse(localStorage.getItem("userInfo") || "{}").username || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/loyalty-program"
          element={
            <ProtectedRoute>
              <LoyaltyProgramPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/daily-summary"
          element={
            <ProtectedRoute>
              <DailySummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/sales-transactions"
          element={
            <ProtectedRoute>
              <SalesTransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales-transactions"
          element={
            <ProtectedRoute>
              <SalesTransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commissions"
          element={
            <ProtectedRoute>
              <CommissionsPage
                onLogout={() => {
                  localStorage.removeItem("role");
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                onProfile={() => {
                  window.location.href = "/profile";
                }}
                firstName={JSON.parse(localStorage.getItem("userInfo") || "{}").firstName || ""}
                lastName={JSON.parse(localStorage.getItem("userInfo") || "{}").lastName || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileWithSidebar />
            </ProtectedRoute>
          }
        />
        {/* Default route: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;