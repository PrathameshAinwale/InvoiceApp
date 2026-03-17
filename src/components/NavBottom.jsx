import React from 'react'
import { FiPlus } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { FaFile } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import './NavBottom.css'

const NavBottom = () => {
  return (
      <div className='bottom-nav'>
        <ul>
            <li><IoMdHome/></li>
            <li><FaFile/></li>
            <li style={{ position: "relative" }}>
  <div className="circle"></div><FiPlus className="plus" /></li>
            <li><IoStatsChart/></li>
            <li><IoSettingsSharp/></li>
        </ul>
      </div>
  )
}

export default NavBottom
