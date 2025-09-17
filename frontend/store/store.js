// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import callReducer from "../store/slice.js";




 export const store = configureStore({
  reducer: {
     call:callReducer
  }
});


