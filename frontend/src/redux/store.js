import { configureStore } from '@reduxjs/toolkit'
import booksApi from './features/books/booksApi'
import ordersApi from './features/orders/ordersApi'
import cartReducer from './features/cart/cartSlice'
import wishlistReducer from './features/wishlist/wishlistSlice'

export const store = configureStore({
    reducer: {
        [booksApi.reducerPath]: booksApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(booksApi.middleware, ordersApi.middleware),
})
