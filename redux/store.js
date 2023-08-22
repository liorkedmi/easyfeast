import basketReducer from "@/redux/features/basketSlice";
import bookingReducer from "@/redux/features/bookingSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    basket: basketReducer,
    booking: bookingReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
