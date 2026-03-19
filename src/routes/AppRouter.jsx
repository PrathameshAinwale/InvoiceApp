import React from "react";
import { Routes, Route } from "react-router-dom";
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/createinvoice" element={<CreateInvoice />} />
        <Route path="/editinvoice/:id" element={<CreateInvoice />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/follow-up" element={<FollowUps />} />
        <Route path="/invoice/:id" element={<PreviewInvoice />} />
        <Route path="/productform" element={<ProductsForm />} />
        <Route path="/product/edit/:id" element={<ProductsForm />} />
        <Route path="/addcustomer" element={<CustomerForm />} />
        <Route path="/editcustomer/:id" element={<CustomerForm />} />
        <Route path="/customer/:id" element={<CustomerDetails />} />
      </Routes>
      <NavBottom />
    </>
  );
};

export default AppRouter;
