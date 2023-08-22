import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const basket = createSlice({
  name: "basket",
  initialState,
  reducers: {
    reset: () => initialState,
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      const id = action.payload;

      for (let i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) {
          state.items.splice(i, 1);
        }
      }
    },
    submit: (state, action) => {
      //
    },
  },
});

// Selectors
export const selectIngredients = createSelector(
  [(state) => state.basket.items],
  (items) => {
    let shoppingList = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].shoppingList) {
        for (let j = 0; j < items[i].shoppingList.length; j++) {
          if (shoppingList.indexOf(items[i].shoppingList[j]) === -1) {
            shoppingList.push(items[i].shoppingList[j]);
          }
        }
      }
    }

    return shoppingList;
  }
);

export const selectNotes = createSelector(
  [(state) => state.basket.items],
  (items) => {
    let notes = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items[i].requiredSelections.length; j++) {
        if (notes.indexOf(items[i].requiredSelections[j]) === -1) {
          notes.push(items[i].requiredSelections[j]);
        }
      }

      for (let j = 0; j < items[i].customizations.length; j++) {
        if (notes.indexOf(items[i].customizations[j]) === -1) {
          notes.push(items[i].customizations[j]);
        }
      }

      if (items[i].additionalRequests) {
        if (notes.indexOf(items[i].additionalRequests) === -1) {
          notes.push(items[i].additionalRequests);
        }
      }
    }

    return notes;
  }
);

export const { reset, addItem, removeItem, submit } = basket.actions;
export default basket.reducer;
