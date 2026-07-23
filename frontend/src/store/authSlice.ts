import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Auth State Management
 * 
 * Centralized authentication state with proper token management
 */

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  coverImage?: string | null;
avatar?: string | null;
  followers: string[];
  following: string[];
  noOfFollower: number;
  noOfFollowing: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Check if token exists on initial load
const hasToken = (): boolean => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  if (!token) return false;

  if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    return false;
  }

  return true;
};

const initialState: AuthState = {
  isAuthenticated: hasToken(),
  user: null,
  isLoading: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set credentials after successful login/register
     */
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.isInitialized = true;
      
      // Calculate expiry (12 hours from now)
      const expirationTime = Date.now() + 12 * 60 * 60 * 1000;
      
      localStorage.setItem('token', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('tokenExpiry', expirationTime.toString());
    },

    /**
     * Update user data (e.g., after fetching current user)
     */
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isInitialized = true;
    },

    /**
     * Clear all auth state on logout
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isInitialized = true;
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    },

    /**
     * Set initialization status
     */
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },

    /**
     * Set loading status
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// Export actions
export const { setCredentials, setUser, logout, setInitialized, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;

export default authSlice.reducer;