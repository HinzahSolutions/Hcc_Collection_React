
// import React, { useState, useEffect } from 'react';
// import { GiHamburgerMenu } from "react-icons/gi";
// import { NavLink } from 'react-router-dom';
// import { Navbar } from 'react-bootstrap';
// import { MdDashboard } from "react-icons/md";
// import { IoIosLogOut } from "react-icons/io";
// import { HiUsers } from "react-icons/hi2";
// import { FaUserTie, FaTasks } from "react-icons/fa";
// import { IoMdCloseCircleOutline } from "react-icons/io";
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { logout } from '../Slicers/authSlice';
// import '../Css/sidebar.css';

// const Sidebar = () => {
//   const [isOpen, setIsOpen] = useState(true);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const conformrole = localStorage.getItem('role');
//   const userName = localStorage.getItem('userName');
//   const location = useLocation();


//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);

//   };

//   const closenav = () => {
//     setIsOpen(true)
//   }
  


//   const handleLogout = () => {
//     dispatch(logout());
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userName');
//     navigate('/login');
//   };

//   return (
//     <>
//       <div className="sidebar-toggle-btn d-flex justify-content-between">
//         <div className="head">
//           <h1 className='headertext'>HCC</h1>
//           {conformrole === "Admin" ? (
//             <button className="button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
//               {isOpen ? <IoMdCloseCircleOutline /> : <GiHamburgerMenu />}
//             </button>) : (<span></span>)}
//         </div>
//         <header>
//           <div className="header-content">
//             <div className="header-menu">
//               <div className="user">
//                 <div onClick={handleLogout}><p style={{ color: 'white', textDecoration: 'underline', cursor: 'pointer', fontSize: '35px' }}><IoIosLogOut /></p></div>
//               </div>
//             </div>
//           </div>
//         </header>
//       </div>



//       {conformrole === "Admin" ? (
//         <div>
//           <Navbar variant="dark" className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ position: 'fixed' }}>
//             <div className="sidebar-content">
//               <>
//                 <div className={isOpen ? 'profile' : 'noneprofile'}>
//                   <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
//                   <h4 className='text-dark fs-5'>
//                     {userName ? (userName.length > 15 ? userName.slice(0, 15) + "..." : userName) : "NAME"}
//                   </h4>
//                   <small></small>
//                 </div>
//                 <div>
//                   <ul style={{ paddingLeft: '0px' }} className={isOpen ? '' : 'noneprofile'}>
//                     <li>
//                       <NavLink to="/" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
//                         <div className="navtext">
//                           <span className={isOpen ? 'spans' : 'hiddenspans'}><MdDashboard /></span>
//                           <p className={isOpen ? 'p' : 'hiddenp'}>Dashboard</p>
//                         </div>
//                       </NavLink>
//                     </li>
//                     <li>
//                       <NavLink
//                         to="/client"
//                         onClick={closenav}
//                         className={({ isActive, isPending }) =>
//                           location.pathname.startsWith("/client")
//                             ? "nav-link active"
//                             : "nav-link"
//                         }
//                       >
//                         <div className="navtext">
//                           <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
//                           <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
//                         </div>
//                       </NavLink>
//                     </li>
//                     <li>
//                       <NavLink
//                         to="/employee"
//                         onClick={closenav}
//                         className={({ isActive, isPending }) =>
//                           location.pathname.startsWith("/employee")
//                             ? "nav-link active"
//                             : "nav-link"
//                         }
//                       >
//                         <div className="navtext">
//                           <span className={isOpen ? 'spans' : 'hiddenspans'}><FaUserTie /></span>
//                           <p className={isOpen ? 'p' : 'hiddenp'}>Employee</p>
//                         </div>
//                       </NavLink>

//                     </li>
//                     <li>
//                       <NavLink to="/alldata" onClick={closenav} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
//                         <div className="navtext">
//                           <span className={isOpen ? 'spans' : 'hiddenspans'}><FaTasks /></span>
//                           <p className={isOpen ? 'p' : 'hiddenp'}>Alldata</p>
//                         </div>
//                       </NavLink>
//                     </li>
//                   </ul>
//                 </div>
//               </>
//             </div>
//           </Navbar>
//           <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
//             <div className="content-inner">
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <Navbar variant="dark" className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ position: 'fixed' }}>
//             <div className="sidebar-content">
//               <>
//                 <div className={isOpen ? 'profile' : 'noneprofile'}>
//                   <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
//                   <h4 className='text-dark fs-5'>
//                     {userName ? (userName.length > 15 ? userName.slice(0, 15) + "..." : userName) : "NAME"}
//                   </h4>
//                   <small></small>
//                 </div>
//                 <div>
//                   <ul style={{ paddingLeft: '0px' }} className={isOpen ? '' : 'noneprofile'}>
                 
//                     <li>
//                       <NavLink
//                         to="/client"
//                         onClick={closenav}
//                         className={({ isActive, isPending }) =>
//                           location.pathname.startsWith("/client")
//                             ? "nav-link active"
//                             : "nav-link"
//                         }
//                       >
//                         <div className="navtext">
//                           <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
//                           <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
//                         </div>
//                       </NavLink>
//                     </li>
                    
                   
//                   </ul>
//                 </div>
//               </>
//             </div>
//           </Navbar>
//           <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
//             <div className="content-inner">
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Sidebar;



import React, { useState } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import { MdDashboard } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { FaUserTie, FaTasks } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { logout } from '../Slicers/authSlice';
import '../Css/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const conformrole = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');
  console.log("feahfbshbv",conformrole)

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closenav = () => {
    setIsOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  let sidebarContent;

  if (conformrole === "Admin") {
    sidebarContent = (
      <div>
        <Navbar variant="dark" className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ position: 'fixed' }}>
          <div className="sidebar-content">
            <div className={isOpen ? 'profile' : 'noneprofile'}>
              <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
              <h4 className='text-dark fs-5'>
                {userName ? (userName.length > 15 ? userName.slice(0, 15) + "..." : userName) : "NAME"}
              </h4>
            </div>
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
                <NavLink to="/client" onClick={closenav} className={({ isActive }) => location.pathname.startsWith("/client") ? "nav-link active" : "nav-link"}>
                  <div className="navtext">
                    <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
                    <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
                  </div>
                </NavLink>
              </li>
              <li>
                <NavLink to="/employee" onClick={closenav} className={({ isActive }) => location.pathname.startsWith("/employee") ? "nav-link active" : "nav-link"}>
                  <div className="navtext">
                    <span className={isOpen ? 'spans' : 'hiddenspans'}><FaUserTie /></span>
                    <p className={isOpen ? 'p' : 'hiddenp'}>Employee</p>
                  </div>
                </NavLink>
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
        </Navbar>
        <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
          <div className="content-inner"></div>
        </div>
      </div>
    );
  } else if (conformrole === "Dtp") {
    sidebarContent = (
      <div>
        <Navbar variant="dark" className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ position: 'fixed' }}>
          <div className="sidebar-content">
            <div className={isOpen ? 'profile' : 'noneprofile'}>
              <div className="profile-img bg-img" style={{ backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")' }}></div>
              <h4 className='text-dark fs-5'>
                {userName ? (userName.length > 15 ? userName.slice(0, 15) + "..." : userName) : "NAME"}
              </h4>
            </div>
            <ul style={{ paddingLeft: '0px' }} className={isOpen ? '' : 'noneprofile'}>
              <li>
                <NavLink to="/client" onClick={closenav} className={({ isActive }) => location.pathname.startsWith("/client") ? "nav-link active" : "nav-link"}>
                  <div className="navtext">
                    <span className={isOpen ? 'spans' : 'hiddenspans'}><HiUsers /></span>
                    <p className={isOpen ? 'p' : 'hiddenp'}>Client Order</p>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </Navbar>
        <div className={`content-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
          <div className="content-inner"></div>
        </div>
      </div>
    );
  } else {
    sidebarContent = <></>;
  }

  return (
    <>
      <div className="sidebar-toggle-btn d-flex justify-content-between">
        <div className="head">
          <h1 className='headertext'>HCC</h1>
          {/* {conformrole === "Admin" || conformrole === "Dtp" && (
            <button className="button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              {isOpen ? <IoMdCloseCircleOutline /> : <GiHamburgerMenu />}
            </button>
          )} */}
          {(conformrole === "Admin" || conformrole === "Dtp") && (
  <button className="button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
    {isOpen ? <IoMdCloseCircleOutline /> : <GiHamburgerMenu />}
  </button>
)}
        </div>
        <header>
          <div className="header-content">
            <div className="header-menu">
              <div className="user">
                <div onClick={handleLogout}>
                  <p style={{ color: 'white', textDecoration: 'underline', cursor: 'pointer', fontSize: '35px' }}>
                    <IoIosLogOut />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {sidebarContent}
    </>
  );
};

export default Sidebar;
