import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import SingleBook from "../pages/books/SingleBook";
import UpdateBook from "../pages/books/UpdateBook";
import AddBook from "../pages/books/AddBook";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import WishlistPage from "../pages/books/WishlistPage";
import OrderPage from "../pages/books/OrderPage";
import OrderDetail from "../pages/books/OrderDetail";

import Login from "../components/Login";
import Register from "../components/Register";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../layouts/DashboardLayout";
import Inventory from "../pages/dashboard/Inventory";
import ManageUsers from "../pages/dashboard/ManageUsers";
import AddBlog from "../pages/dashboard/AddBlog";
import BlogPage from "../pages/blog/BlogPage";
import SingleBlogPage from "../pages/blog/SingleBlogPage";
import UserSettings from "../pages/dashboard/UserSettings";
import ComposeEmail from "../pages/dashboard/ComposeEmail";
import ManageOrders from "../pages/dashboard/ManageOrders";
import UserOrders from "../pages/dashboard/UserOrders";
import SalesIntelligence from "../pages/dashboard/SalesIntelligence";

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fee' }}>
          <h1>Fatal React Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <ErrorBoundary><App /></ErrorBoundary>,
        children: [
            { path: "/", element: <Home /> },
            { path: "/orders", element: <PrivateRoute><OrderPage /></PrivateRoute> },
            { path: "/orders/:id", element: <PrivateRoute><OrderDetail /></PrivateRoute> },
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
        element: <ErrorBoundary><DashboardLayout /></ErrorBoundary>,
        children: [
            { index: true, element: <Inventory /> },
            { path: "add-book", element: <AddBook /> },
            { path: "edit/:id", element: <UpdateBook /> },
            { path: "add-blog", element: <AddBlog /> },
            { path: "manage-users", element: <ManageUsers /> },
            { path: "users/:userId/orders", element: <UserOrders /> },
            { path: "compose-email", element: <ComposeEmail /> },
            { path: "orders", element: <ManageOrders /> },
            { path: "sales", element: <SalesIntelligence /> },
        ]
    },
]);


export default router;