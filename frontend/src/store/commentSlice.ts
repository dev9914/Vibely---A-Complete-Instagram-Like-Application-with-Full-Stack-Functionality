import { createSlice } from "@reduxjs/toolkit";

interface CommentState {
  isCommentDialogOpen: boolean;
}

const initialState: CommentState = {
  isCommentDialogOpen: false,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    openCommentDialog: (state) => {
      state.isCommentDialogOpen = true;
    },
    closeCommentDialog: (state) => {
      state.isCommentDialogOpen = false;
    },
  },
});

export const {
  openCommentDialog,
  closeCommentDialog,
} = commentSlice.actions;

export default commentSlice.reducer;