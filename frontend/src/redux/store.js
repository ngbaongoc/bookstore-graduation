import { configureStore } from '@reduxjs/toolkit'
import booksApi from './features/books/booksApi'
import ordersApi from './features/orders/ordersApi'
import cartReducer from './features/cart/cartSlice'
import wishlistReducer from './features/wishlist/wishlistSlice'
import { reviewsApi } from './features/reviews/reviewsApi'
import { blogsApi } from './features/blogs/blogsApi'
import usersApi from './features/users/usersApi'
import inventoryApi from './features/inventory/inventoryApi'
import { statsApi } from './features/stats/statsApi'

export const store = configureStore({
    reducer: {
        [booksApi.reducerPath]: booksApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        [reviewsApi.reducerPath]: reviewsApi.reducer,
        [blogsApi.reducerPath]: blogsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
        [inventoryApi.reducerPath]: inventoryApi.reducer,
        [statsApi.reducerPath]: statsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            booksApi.middleware,
            ordersApi.middleware,
            reviewsApi.middleware,
            blogsApi.middleware,
            usersApi.middleware,
            inventoryApi.middleware,
            statsApi.middleware
        ),
})
