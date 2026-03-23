import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";  // ✅ ADD THIS
import Dashboard from "../components/Dashboard";
import Invoice from "../pages/Invoice/Invoice";
import CreateInvoice from "../pages/CreateInvoice/CreateInvoice";
import Sales from "../pages/Sales/Sales";
import Profile from "../pages/Profile/Profile";
import Products from "../pages/Products/Products";
import Customers from "../pages/Customer/Customers";
import FollowUps from "../pages/FollowUps/FollowUps";
import NavBottom from "../components/NavBottom";
import PreviewInvoice from "../pages/PreviewInvoice/PreviewInvoice";
import ProductsForm from "../pages/Products//ProdcutsForm/ProductsForm";
import CustomerForm from "../pages/Customer/CustomerForm/CustomerForm";
import CustomerDetails from "../pages/Customer/CustomerDetails/CustomerDetails";
import Login from "../pages/Login/Login";
import Signup from "../pages/Login/Signup";

const AppRouter = () => {
  return (
    <>
      <Routes>
        {/* ✅ Public routes */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Protected routes */}
        <Route path="/"                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/invoice"           element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/createinvoice"     element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
        <Route path="/editinvoice/:id"   element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
        <Route path="/sales"             element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/products"          element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/customers"         element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/follow-up"         element={<ProtectedRoute><FollowUps /></ProtectedRoute>} />
        <Route path="/invoice/:id"       element={<ProtectedRoute><PreviewInvoice /></ProtectedRoute>} />
        <Route path="/productform"       element={<ProtectedRoute><ProductsForm /></ProtectedRoute>} />
        <Route path="/product/edit/:id"  element={<ProtectedRoute><ProductsForm /></ProtectedRoute>} />
        <Route path="/addcustomer"       element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/editcustomer/:id"  element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/customer/:id"      element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
      </Routes>
      <NavBottom />
    </>
  );
};

export default AppRouter;