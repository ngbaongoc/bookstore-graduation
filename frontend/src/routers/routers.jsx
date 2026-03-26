import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import SingleBook from "../pages/books/SingleBook";
import UpdateBook from "../pages/books/UpdateBook";
import AddBook from "../pages/books/AddBook";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import WishlistPage from "../pages/books/WishlistPage";

import Login from "../components/Login";
import Register from "../components/Register";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ELogisticsDashboard from "../pages/dashboard/ELogisticsDashboard";
import ManageUsers from "../pages/dashboard/ManageUsers";
import AddBlog from "../pages/dashboard/AddBlog";
import BlogPage from "../pages/blog/BlogPage";
import SingleBlogPage from "../pages/blog/SingleBlogPage";
import UserSettings from "../pages/dashboard/UserSettings";
import ComposeEmail from "../pages/dashboard/ComposeEmail";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/orders", element: <PrivateRoute><p>Orders Page</p></PrivateRoute> },
            { path: "/about", element: <div>About</div> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/checkout", element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
            { path: "/settings", element: <PrivateRoute><UserSettings /></PrivateRoute> },
            { path: "/wishlist", element: <WishlistPage /> },
            { path: "/books/:id", element: <SingleBook /> },
            { path: "/blog", element: <BlogPage /> },
            { path: "/blog/:id", element: <SingleBlogPage /> },
        ]
    },
    // Admin login
    {
        path: "/admin/login",
        element: <AdminLogin />
    },
    // Admin dashboard & management — protected, uses DashboardLayout with sidebar
    {
        path: "/admin",
        element: <DashboardLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "e-logistics", element: <ELogisticsDashboard /> },
            { path: "add-book", element: <AddBook /> },
            { path: "edit/:id", element: <UpdateBook /> },
            { path: "add-blog", element: <AddBlog /> },
            { path: "manage-users", element: <ManageUsers /> },
            { path: "compose-email", element: <ComposeEmail /> },
            { path: "orders", element: <p>Orders Page</p> },
        ]
    },
]);


export default router;