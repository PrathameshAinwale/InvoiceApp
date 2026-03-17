import React from 'react'
import { FiPlus } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { FaFile } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import './NavBottom.css'
import {useNavigate} from "react-router-dom";

const NavBottom = () => {
  const navigate = useNavigate();
  return (
      <div className='bottom-nav'>
        <ul>
            <li onClick={() => navigate("/")}><IoMdHome/></li>
            <li onClick={() => navigate("/invoice")}><FaFile/></li>
            <li style={{ position: "relative" }}>
            <div className="circle"></div>
            <FiPlus className="plus" onClick={() => navigate("/createinvoice")}/></li>
            <li onClick={()=>navigate ("/sales")}><IoStatsChart/></li>
            <li onClick={()=> navigate ("/profile")}><IoSettingsSharp/></li>
        </ul>
      </div>
  )
}

export default NavBottom
