import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard     from '../components/Dashboard';
import Invoice       from '../pages/Invoice/Invoice';
import CreateInvoice from '../pages/CreateInvoice/CreateInvoice';
import Sales         from '../pages/Sales/Sales';
import Profile       from '../pages/Profile/Profile';
import Products      from '../pages/Products/Products';
import Customers     from '../pages/Customer/Customers';
import FollowUps     from '../pages/FollowUps/FollowUps';
import NavBottom     from '../components/NavBottom';
import PreviewInvoice from '../pages/PreviewInvoice/PreviewInvoice';

const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/invoice"       element={<Invoice />} />
        <Route path="/createinvoice" element={<CreateInvoice />} />
        <Route path="/sales"         element={<Sales />} />
        <Route path="/profile"       element={<Profile />} />
        <Route path="/products"      element={<Products />} />
        <Route path="/customers"     element={<Customers />} />
        <Route path="/follow-up"     element={<FollowUps />} />
        <Route path='invoice/:id'    element={<PreviewInvoice/>}/>
      </Routes>
      <NavBottom />
    </>
  );
};

export default AppRouter;