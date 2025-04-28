import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    let isLoggedIn=  localStorage.getItem("user") ? true : false;
    return isLoggedIn ? <Outlet/>: <Navigate to='/login'/>;
}

export default ProtectedRoute;