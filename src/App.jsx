import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login";

export default function App() {
  const { isAdmin, logout } = useAuth();
  return (
    <div className="app">
      <aside>
        <h1>Shop Admin</h1>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
        <div className="side-foot">
          {isAdmin ? <button onClick={logout}>Log out</button> : <NavLink to="/login">Admin login</NavLink>}
        </div>
      </aside>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={isAdmin ? <Navigate to="/" /> : <Login />} />
        </Routes>
      </main>
    </div>
  );
}
