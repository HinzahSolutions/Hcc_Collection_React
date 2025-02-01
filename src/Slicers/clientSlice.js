// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   users: [],
//   selectedClient:'',
//   searchQuery: '',
//   selectclentid:null,
// };

// const clientSlice = createSlice({
//   name: 'clients',
//   initialState,
//   reducers: {
//     setUsers: (state, action) => {
//       state.users
//       = action.payload;
//     },
//     setSelectedClient: (state, action) => {
//       state.selectedClient = action.payload;
//     },
//     setSearchQuery: (state, action) => {
//       state.searchQuery = action.payload;
//     },
//     setSelectedClientId: (state, action) => {
//       state.selectclentid = action.payload;
//     },
//   },
// });

// export const { setUsers, setSelectedClient, setSearchQuery, setSelectedClientId,selectclentid  } = clientSlice.actions;

// export default clientSlice.reducer;

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

