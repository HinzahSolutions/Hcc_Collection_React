
import React, { useState, useEffect } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { NavLink } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import { MdDashboard } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { FaUserTie, FaTasks } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../Slicers/authSlice';
import '../Css/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const conformrole = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');
<<<<<<< HEAD
  const location = useLocation();
=======
>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d


  const toggleSidebar = () => {
    setIsOpen(!isOpen);

  };

  const closenav = () => {
    setIsOpen(!isOpen)
  }


  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <>
      <div className="sidebar-toggle-btn d-flex justify-content-between">
        <div className="head">
          <h1 className='headertext'>HCC</h1>
          {conformrole === "Admin" ? (
            <button className="button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              {isOpen ? <IoMdCloseCircleOutline /> : <GiHamburgerMenu />}
            </button>) : (<span></span>)}
        </div>
<<<<<<< HEAD
=======

>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
        <header>
          <div className="header-content">
            <div className="header-menu">
              <div className="user">
<<<<<<< HEAD
=======

>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
                <div onClick={handleLogout}><p style={{ color: 'white', textDecoration: 'underline', cursor: 'pointer', fontSize: '35px' }}><IoIosLogOut /></p></div>
              </div>
            </div>
          </div>
        </header>
      </div>



      {conformrole === "Admin" ? (
        <div>
          <Navbar variant="dark" className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ position: 'fixed' }}>
            <div className="sidebar-content">
<<<<<<< HEAD
              <>
                <div className={isOpen ? 'profile' : 'noneprofile'}>
                  <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
                  <h4 className='text-dark fs-5'>
                    {userName ? (userName.length > 15 ? userName.slice(0, 15) + "..." : userName) : "NAME"}
                  </h4>
                  <small></small>
                </div>
                <div>
                  <ul style={{ paddingLeft: '0px' }} className={isOpen ? '' : 'noneprofile'}>
                    <li>
                      <NavLink to="/" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><MdDashboard /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Dashboard</p>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/client"
                        onClick={closenav}
                        className={({ isActive, isPending }) =>
                          location.pathname.startsWith("/client")
                            ? "nav-link active"
                            : "nav-link"
                        }
                      >
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/employee"
                        onClick={closenav}
                        className={({ isActive, isPending }) =>
                          location.pathname.startsWith("/employee")
                            ? "nav-link active"
                            : "nav-link"
                        }
                      >
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><FaUserTie /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Employee</p>
                        </div>
                      </NavLink>

=======

              <>
                <div className={isOpen ? 'profile' : 'noneprofile'}>
                  <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
                  <h4>{userName || "NAME"}</h4>
                  <small>{conformrole === 'admin' ? 'Admin' : 'User'}</small>
                </div>
                <div>
                  <ul style={{ paddingLeft: '0px' }} className={isOpen ? '' : 'noneprofile'}>
                    <li>
                      <NavLink to="/" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><MdDashboard /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Dashboard</p>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/client" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
                        </div>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/employee" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><FaUserTie /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Employee</p>
                        </div>
                      </NavLink>
>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
                    </li>
                    <li>
                      <NavLink to="/alldata" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <div className="navtext">
                          <span className={isOpen ? 'spans' : 'hiddenspans'}><FaTasks /></span>
                          <p className={isOpen ? 'p' : 'hiddenp'}>Alldata</p>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </>
<<<<<<< HEAD
            </div>
          </Navbar>
          <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
            <div className="content-inner">
            </div>
          </div>
        </div>
      ) : (
        <div>
=======

            </div>
          </Navbar>

          <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
            <div className="content-inner">

            </div>
          </div>
        </div>

      ) : (
        <div>

>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
          <></>
        </div>
      )}
    </>
  );
};

export default Sidebar;



