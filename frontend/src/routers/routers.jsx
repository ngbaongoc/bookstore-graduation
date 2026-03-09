import { createBrowserRouter, } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import SingleBook from "../pages/books/SingleBook";
import UpdateBook from "../pages/books/UpdateBook";
import AddBook from "../pages/books/AddBook";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import WishlistPage from "../pages/books/WishlistPage";

/* This page session is used to add page */


const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/orders",
                element: <div> Orders</div>
            },
            {
                path: "/about",
                element: <div>About</div>
            },
            {
                path: "/books/:id",
                element: <SingleBook />
            },
            {
                path: "/books/edit/:id",
                element: <UpdateBook />
            },
            {
                path: "/add-book",
                element: <AddBook />
            },
            {
                path: "/cart",
                element: <CartPage />
            },
            {
                path: "/checkout",
                element: <CheckoutPage />
            },
            {
                path: "/wishlist",
                element: <WishlistPage />
            },
        ]
    },
]);

export default router;