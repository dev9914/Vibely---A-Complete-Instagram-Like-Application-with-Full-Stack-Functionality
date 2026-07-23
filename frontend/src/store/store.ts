import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authSlice from "./authSlice";
import commentSlice from "./commentSlice";
import uiSlice from "./uiSlice";

const store = configureStore({
    reducer: {
        // RTK Query API reducer
        [api.reducerPath]: api.reducer,
        
        // Existing slices
        auth: authSlice,
        comment: commentSlice,
        ui: uiSlice
    },
    // Add RTK Query middleware for caching, invalidation, polling, etc.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store