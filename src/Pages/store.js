import { configureStore } from '@reduxjs/toolkit';
import clientReducer from '../Slicers/clientSlice';
import employeeReducer from '../Slicers/employeeSlice';
import authReducer from '../Slicers/authSlice';

const store = configureStore({
  reducer: {
    clients: clientReducer,
    employees: employeeReducer,
    auth: authReducer,
  },
});

export default store;