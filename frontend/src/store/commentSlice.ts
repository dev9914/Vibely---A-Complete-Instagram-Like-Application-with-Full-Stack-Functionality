import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false
}

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: { 
        yes: (state, action) => {
            state.status = true;
        },
        no: (state, action) => {
            state.status = false;
        }
    }
})

export const {yes, no} = commentSlice.actions;

export default commentSlice.reducer