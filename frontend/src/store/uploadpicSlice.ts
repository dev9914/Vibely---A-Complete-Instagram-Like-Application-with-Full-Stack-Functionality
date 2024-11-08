import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
}

const uploadpicSlice = createSlice({
    name: "upload",
    initialState,
    reducers: { 
        opened: (state, action) => {
            state.status = true;
        },
        closed: (state, action) => {
            state.status = false;
        }
    }
})

export const {opened, closed} = uploadpicSlice.actions;

export default uploadpicSlice.reducer;