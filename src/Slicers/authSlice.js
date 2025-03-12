import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  isAuthenticated: !!localStorage.getItem('authToken'), 
  role: localStorage.getItem('role') || 'user', 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role; 
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = 'user'; 
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

