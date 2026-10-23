import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import axios from "axios";

const empty = { name: "", price: "", stock: "", image: null };

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Products() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/getallproducts`);

      const allProducts = [...(res.data.productss || []), ...(res.data.newproducts || [])];
      setItems(allProducts);
    } catch (err) {
      console.log("Products load karne mein masla hua:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const set = (k) => (e) =>
    setForm({
      ...form,
      [k]: e.target.type === "file" ? e.target.files[0] : e.target.value
    });

  const reset = () => { 
    setForm(empty); 
    setEditId(null); 

    const fileInput = document.getElementById("productImageInput");
    if (fileInput) fileInput.value = "";
  };

  
  const submit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const token = sessionStorage.getItem("adminToken");

    try {
     
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editId) {
       
        await axios.put(`${API_URL}/update-product/${editId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      } else {
      
        await axios.post(`${API_URL}/create-product`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      }

      reset();
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Action fail ho gaya!");
    }
  };

  
  const remove = async (id) => {
    if (!isAdmin || !confirm("Delete this product?")) return;

    const token = sessionStorage.getItem("adminToken");

    try {
      await axios.delete(`${API_URL}/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Delete karne mein masla hua!");
    }
  };

  return (
    <>
      <h2>Products</h2>
      {isAdmin ? (
        <form className="panel row" onSubmit={submit}>
          <input placeholder="Product name" value={form.name} onChange={set("name")} required />
          <input type="number" min="0" placeholder="Price (Rs)" value={form.price} onChange={set("price")} required />
          <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={set("stock")} required />
          <input
            id="productImageInput"
            type="file"
            accept="image/*"
            onChange={set("image")}
            required={!editId} 
          />
          <button className="primary">{editId ? "Save changes" : "Add product"}</button>
          {editId && <button type="button" onClick={reset}>Cancel</button>}
        </form>
      ) : (
        <p className="muted note"><Link to="/login">Log in as admin</Link> to add, edit or delete products.</p>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const prodId = p._id || p.id;
              return (
                <tr key={prodId}>
                  <td>
                    {p.image && (
                      <img src={p.image} alt="Product" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                    )}
                  </td>
                  <td>{p.name || p.title}</td>
                  <td>Rs {Number(p.price || 0).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  {isAdmin && (
                    <td className="actions">
                      <button onClick={() => { setEditId(prodId); setForm(p); }}>Edit</button>
                      <button className="danger" onClick={() => remove(prodId)}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
            {!items.length && <tr><td colSpan="5" className="muted">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}