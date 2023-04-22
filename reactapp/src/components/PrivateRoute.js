import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, ...rest }) => {
    return (localStorage.getItem('auth') ? <Outlet /> : <Navigate to="/error" />)
}

export default PrivateRoute;