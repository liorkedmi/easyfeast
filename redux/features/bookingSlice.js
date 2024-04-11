import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  datetime: null,
  shopper: null,
  numberOfMeals: null,
  numberOfExtras: null,
  portionSize: null,
  clientAddress: null,
};

const FIELD_BOOKING_TIMESTAMP = "Booking Date and Arrival Time";
const FIELD_SHOPPER = "Who Shops?";

export const booking = createSlice({
  name: "booking",
  initialState,
  reducers: {
    reset: () => initialState,
    setCurrentBooking: (state, action) => {
      const {
        booking,
        numberOfMeals,
        numberOfExtras,
        portionSize,
        clientAddress,
        clientNameForChef,
        clientName,
        clientRole,
        chefName,
        chefEmail,
      } = action.payload;

      console.log("Booking", action.payload);

      state.id = booking.id;
      state.datetime = booking.fields[FIELD_BOOKING_TIMESTAMP];
      state.shopper = booking.fields[FIELD_SHOPPER];
      state.numberOfMeals = numberOfMeals;
      state.numberOfExtras = numberOfExtras;
      state.portionSize = portionSize;
      state.clientAddress = clientAddress;
      state.clientNameForChef = clientNameForChef;
      state.clientName = clientName;
      state.clientRole = clientRole;
      state.chefName = chefName;
      state.chefEmail = chefEmail;
    },
  },
});

export const { reset, setCurrentBooking } = booking.actions;
export default booking.reducer;
