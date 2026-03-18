import React from 'react';
import './Dashboard.css';
import TopNav from '../components/common/TopNav';  
import MoneyCard from './common/MoneyCard';
import RecentInvoice from './RecentInvoice';
import FollowUp from './common/FollowUp';

const Dashboard = () => {
  return (
    <div className="dashboard ">
      <TopNav />                                     

      <main className="dashboard-main">
        <MoneyCard />     
      </main>

      <RecentInvoice />
      <FollowUp/>
    </div>
  );
};

export default Dashboard;