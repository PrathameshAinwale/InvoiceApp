import React from 'react'
import { FiPlus } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { FaFile } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import './NavBottom.css'
import { useNavigate, useLocation } from "react-router-dom";

const NavBottom = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ← check which path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className='bottom-nav'>
      <ul>
        <li
          onClick={() => navigate("/")}
          className={isActive("/") ? "active" : ""}
        >
          <IoMdHome size={25} />
        </li>

        <li
          onClick={() => navigate("/invoice")}
          className={isActive("/invoice") ? "active" : ""}
        >
          <FaFile size={20} />
        </li>

        <li style={{ position: "relative" }}>
          <div className={`circle ${isActive("/createinvoice")? "active": ""}`}></div>
          <FiPlus className={`plus ${isActive("/createinvoice")? "active": ""}`} onClick={() => navigate("/createinvoice")} />
        </li>

        <li
          onClick={() => navigate("/sales")}
          className={isActive("/sales") ? "active" : ""}
        >
          <IoStatsChart size={20} />
        </li>

        <li
          onClick={() => navigate("/profile")}
          className={isActive("/profile") ? "active" : ""}
        >
          <IoSettingsSharp size={20} />
        </li>
      </ul>
    </div>
  );
};

export default NavBottom;