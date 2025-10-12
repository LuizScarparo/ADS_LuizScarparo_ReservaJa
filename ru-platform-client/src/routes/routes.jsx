import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import LoginScreen from "../screens/login/LoginScreen";
import RegisterScreen from "../screens/register/RegisterScreen";
import ForgotPassword from "../screens/forgot-password/ForgotPassword";
import ForgotPasswordMail from "../screens/forgot-password-email/ForgotPasswordEmail";
import ChangePassword from "../screens/change-password/ChangePassword";
import HomeScreen from "../screens/home/HomeScreen";
import AboutScreen from "../screens/about/AboutScreen";
import MyReservationsScreen from "../screens/my-reservations/MyReservationsScreen";
import ManageReservationsScreen from "../screens/manage-reservations/ManageReservationsScreen";
import { useAuth } from "../context/authContext";

const ProtectedRoute = ({ isAllowed }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }
    else if (!isAllowed.includes(user.role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Router>
            <Routes>
                {/* Public routes (all) */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-password-feedback" element={<ForgotPasswordMail />} />
                <Route path="/reset-password/:userId/:token" element={<ChangePassword />} />

                {/* Protected routes (auth) */}
                <Route element={
                    <ProtectedRoute isAllowed={["admin", "student", "teacher", "employee", "visitor"]} />
                }>
                    <Route path="/about" element={<MainLayout><AboutScreen/></MainLayout>} />
                    <Route path="/home" element={<MainLayout><HomeScreen/></MainLayout>} />
                    <Route path="/my-reservations" element={<MainLayout><MyReservationsScreen/></MainLayout>} />
                </Route>

                {/* Private routes (admin) */}
                <Route element={
                    <ProtectedRoute isAllowed={["admin"]} />
                }>
                    <Route path="/manage-reservations" element={<MainLayout><ManageReservationsScreen/></MainLayout>} />
                </Route>
            </Routes>
        </Router>
    )
}

export default AppRoutes;
