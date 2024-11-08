import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import uploadpicSlice from "./uploadpicSlice";
import commentSlice from "./commentSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        upload: uploadpicSlice,
        comment: commentSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store