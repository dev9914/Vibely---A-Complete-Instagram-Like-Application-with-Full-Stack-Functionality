import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean; // true = must be logged in, false = must be logged out (guest only)
}

/**
 * ProtectedRoute Component
 * 
 * Handles route protection with two modes:
 * - requireAuth=true (default): Only authenticated users can access
 * - requireAuth=false: Only guests can access (redirects to home if logged in)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireAuth = true 
}) => {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    
    // Also check localStorage as backup
    const hasToken = (): boolean => {
        const token = localStorage.getItem("token");
        const tokenExpiry = localStorage.getItem("tokenExpiry");

        if (token && tokenExpiry) {
            if (Date.now() > parseInt(tokenExpiry)) {
                // Token expired, clear storage
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("tokenExpiry");
                return false;
            }
            return true;
        }
        return !!token;
    };

    const isLoggedIn = isAuthenticated || hasToken();

    // Protected route - user must be authenticated
    if (requireAuth && !isLoggedIn) {
        // Save the attempted location for redirect after login
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Guest-only route - user must NOT be authenticated
    if (!requireAuth && isLoggedIn) {
        // Redirect to home if already logged in
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;