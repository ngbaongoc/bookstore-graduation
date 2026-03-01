import { createBrowserRouter, } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";

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
        ]
    },
]);

export default router;