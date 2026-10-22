import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_URL;


const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ orderStatus: "Processing" });

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/savedorders`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Orders load karne mein masla hua:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const reset = () => {
    setForm({ orderStatus: "Processing" });
    setEditId(null);
  };

  const getItem = (o) => (o.items && o.items.length > 0 ? o.items[0] : null);

  const submit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editId) return;

    const token = sessionStorage.getItem("adminToken");

    try {
      await axios.put(`${API_URL}/update-order/${editId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      reset();
      loadOrders();
    } catch (err) {
      console.error("Update error details:", err.response?.data);
      alert(err.response?.data?.error || "Update karne mein masla hua!");
    }
  };


  return (
    <>
      <h2>Orders Management</h2>

      {!isAdmin && (
        <p className="muted note">
          <Link to="/login">Log in as admin</Link> to update or delete orders.
        </p>
      )}

     
      {isAdmin && editId && (
        <form className="panel row" onSubmit={submit}>
          <h3>Update Order Status</h3>
          <select 
            value={form.orderStatus} 
            onChange={(e) => setForm({ orderStatus: e.target.value })}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="primary" type="submit">Save Changes</button>
          <button type="button" onClick={reset}>Cancel</button>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const item = getItem(o);
              const productName = item?.name || "Product";
              const price = Number(item?.price || o.totalAmount || 0);
              const qty = Number(item?.quantity || 1);
              const total = item?.price ? price * qty : Number(o.totalAmount || 0);
              const currentStatus = o.orderStatus || o.status || "pending";

              return (
                <tr key={o._id}>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}</td>
                  
                 
                  <td>{typeof o.customer === "object" ? (o.customer?.name || "N/A") : (o.customer || "N/A")}</td>
                  
                
                  <td>{productName}</td>
                  
                
                  <td>{qty}</td>
                  
                 
                  <td>Rs {total.toLocaleString()}</td>
                  
              
                  <td><span className={"tag " + currentStatus}>{currentStatus}</span></td>
                  
                  {isAdmin && (
                    <td className="actions">
                      <button onClick={() => { 
                        setEditId(o._id); 
                        setForm({ orderStatus: currentStatus }); 
                      }}>Edit Status</button>
                      <button className="danger" onClick={() => remove(o._id)}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
            {!orders.length && (
              <tr>
                <td colSpan="7" className="muted">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}