import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const AUTH_PATHS = ['/login', '/signup'];

const AppShell = ({ children }) => {
  const location = useLocation();
  const hideNavbar = AUTH_PATHS.includes(location.pathname);

  return (
  <>
    {!hideNavbar && <Navbar />}
    {children}
  </>
  );
};

export default AppShell;
