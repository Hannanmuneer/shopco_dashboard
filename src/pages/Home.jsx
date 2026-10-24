import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
console.log("MY API URL IS:", API_URL, "/product-sales");

export default function Home() {
  const [stats, setStats] = useState({
    units: 0,
    revenue: 0,
    orders: 0,
    products: 0,
    sold: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      
      const salesRes = await axios.get(`${API_URL}/product-sales`);
      const allProducts = salesRes.data.products || [];
      const totalUnitsSold = salesRes.data.totalItemsSold || 0;

  
      const ordersRes = await axios.get(`${API_URL}/api/savedorders`);
      const ordersList = ordersRes.data.orders || [];

      
      const totalRevenue = ordersList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

     
      setStats({
        units: totalUnitsSold,
        revenue: totalRevenue,
        orders: ordersList.length,
        products: allProducts.length,
        sold: allProducts.map(p => ({ name: p.name || p.title, sold: p.sold || 0 }))
      });

    } catch (err) {
      console.log("Dashboard data load karne mein masla hua:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="panel muted" style={{ textAlign: "center", padding: "40px" }}>Loading dashboard stats...</div>;
  }

  return (
    <>
      <h2>Sales overview</h2>
      <div className="stats">
        <div><span>{stats.units}</span>units sold</div>
        <div><span>Rs {stats.revenue.toLocaleString()}</span>revenue</div>
        <div><span>{stats.orders}</span>orders</div>
        <div><span>{stats.products}</span>products</div>
      </div>
      <section className="panel">
        <h3>Units sold per product</h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={stats.sold}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" tick={{ fill: "var(--mute)" }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--mute)" }} />
              <Tooltip />
              <Bar dataKey="sold" name="Units sold" fill="var(--acc)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}