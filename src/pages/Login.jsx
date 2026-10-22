import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

  
    const result = await login(f.email, f.password);

    setLoading(false);

    if (result.success) {
      nav("/"); 
    } else {
      setError(result.error || "Wrong email or password. Try again.");
    }
  };

  return (
    <div className="login panel">
      <h2>Admin login</h2>
      <form onSubmit={submit}>
        <input 
          type="email" 
          placeholder="Admin Email" 
          value={f.email} 
          onChange={(e) => setF({ ...f, email: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={f.password} 
          onChange={(e) => setF({ ...f, password: e.target.value })} 
          required 
        />
        {error && <p className="err">{error}</p>}
        <button className="primary" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="muted">Use your registered admin email & password</p>
    </div>
  );
}