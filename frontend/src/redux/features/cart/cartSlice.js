import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
    cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItemIndex = state.cartItems.findIndex(item => item._id === action.payload._id);
            if (existingItemIndex < 0) {
                state.cartItems.push({ ...action.payload, quantity: 1 });
            } else {
                state.cartItems[existingItemIndex].quantity += 1;
            }
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Book Added",
                showConfirmButton: false,
                timer: 1500
            });
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find(item => item._id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        }
    }
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
