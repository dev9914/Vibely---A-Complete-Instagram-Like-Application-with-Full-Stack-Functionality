import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authSlice from "./authSlice";
import commentSlice from "./commentSlice";
import uiSlice from "./uiSlice";
import messagingSlice from "./messagingSlice";

const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth: authSlice,
        comment: commentSlice,
        ui: uiSlice,
        messaging: messagingSlice,
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