import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit'

/**
 * UI Slice - Manages non-server state
 * 
 * Handles:
 * - Modal states (create post, image viewer, etc.)
 * - Dropdown states (notifications, user menu)
 * - Loading overlays
 * - Toast notifications
 */

interface UIState {
  isCreatePostModalOpen: boolean;
  isNotificationDropdownOpen: boolean;
  isUserMenuOpen: boolean;
  selectedImageForView: string | null;
}

const initialState: UIState = {
  isCreatePostModalOpen: false,
  isNotificationDropdownOpen: false,
  isUserMenuOpen: false,
  selectedImageForView: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Create Post Modal
    openCreatePostModal: (state) => {
      state.isCreatePostModalOpen = true;
    },
    closeCreatePostModal: (state) => {
      state.isCreatePostModalOpen = false;
    },
    toggleCreatePostModal: (state) => {
      state.isCreatePostModalOpen = !state.isCreatePostModalOpen;
    },
    
    // Notification Dropdown
    openNotificationDropdown: (state) => {
      state.isNotificationDropdownOpen = true;
      state.isUserMenuOpen = false; // Close other dropdowns
    },
    closeNotificationDropdown: (state) => {
      state.isNotificationDropdownOpen = false;
    },
    toggleNotificationDropdown: (state) => {
      state.isNotificationDropdownOpen = !state.isNotificationDropdownOpen;
      if (state.isNotificationDropdownOpen) {
        state.isUserMenuOpen = false;
      }
    },
    
    // User Menu
    openUserMenu: (state) => {
      state.isUserMenuOpen = true;
      state.isNotificationDropdownOpen = false; // Close other dropdowns
    },
    closeUserMenu: (state) => {
      state.isUserMenuOpen = false;
    },
    toggleUserMenu: (state) => {
      state.isUserMenuOpen = !state.isUserMenuOpen;
      if (state.isUserMenuOpen) {
        state.isNotificationDropdownOpen = false;
      }
    },
    
    // Close all dropdowns/modals
    closeAllDropdowns: (state) => {
      state.isNotificationDropdownOpen = false;
      state.isUserMenuOpen = false;
    },
    
    // Image Viewer
    openImageViewer: (
  state,
  action: PayloadAction<string>
) => {
      state.selectedImageForView = action.payload;
    },
    closeImageViewer: (state) => {
      state.selectedImageForView = null;
    },
  },
});

export const {
  openCreatePostModal,
  closeCreatePostModal,
  toggleCreatePostModal,
  openNotificationDropdown,
  closeNotificationDropdown,
  toggleNotificationDropdown,
  openUserMenu,
  closeUserMenu,
  toggleUserMenu,
  closeAllDropdowns,
  openImageViewer,
  closeImageViewer,
} = uiSlice.actions;

export default uiSlice.reducer;
