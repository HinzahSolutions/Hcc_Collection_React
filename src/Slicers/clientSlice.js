

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  selectedClient: '',  
  searchQuery: '',
  selectedClientId: null,  
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
      sessionStorage.setItem('selectedClient', JSON.stringify(action.payload));
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedClientId: (state, action) => {
      state.selectedClientId = action.payload;
    },
  },
});

// Export actions
export const { setUsers, setSelectedClient, setSearchQuery, setSelectedClientId } = clientSlice.actions;

// Reducer
export default clientSlice.reducer;

