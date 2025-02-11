
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [],
  employeeId: '',
  selectedEmployee: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      
      state.employees = Array.isArray(action.payload) ? action.payload : [];
    },
    setEmployeeId: (state, action) => {
      state.employeeId = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
      sessionStorage.setItem('selectedEmployee', JSON.stringify(action.payload)); 
    },
  },
});

export const { setEmployees, setEmployeeId, setSelectedEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;

