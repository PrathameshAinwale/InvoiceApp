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
        <div className="stats-grid">
          <MoneyCard
            title="Incoming Money"
            amount={125000}
            type="incoming"
            trend={12.5}
          />
          <MoneyCard
            title="Pending Money"
            amount={45000}
            type="pending"
            trend={-3.2}
          />
        </div>
      </main>

      <RecentInvoice />
      <FollowUp/>
    </div>
  );
};

export default Dashboard;