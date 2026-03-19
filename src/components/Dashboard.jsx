import React from 'react';
import './Dashboard.css';
import TopNav from '../components/common/TopNav';  
import MoneyCard from './common/MoneyCard';
import RecentInvoice from './RecentInvoice';
import FollowUp from './common/FollowUp';
import InfoSlider from './common/InfoCard/InfoSlider';

const Dashboard = () => {
  return (
    <div className="dashboard ">
      <TopNav />                                     

      <main className="dashboard-main">
        <MoneyCard />  
        <InfoSlider/>   
      </main>

      <RecentInvoice />
      <FollowUp/>
    </div>
  );
};

export default Dashboard;