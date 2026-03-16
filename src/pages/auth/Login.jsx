import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { loginWithEmail } from "../../services/firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa a tu cuenta para continuar tu investigación</p>
          </div>
          
          {error && <div className="auth-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Correo electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@academico.edu"
              />
            </div>
            <div className="form-group mb">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Ingresar a mi portal"}
            </button>
          </form>

          <div className="auth-footer">
            ¿No tienes una cuenta aún? <Link to="/register">Regístrate aquí</Link>
          </div>
        </div>
      </div>
      <div className="auth-right">
        {/* Placeholder for generated art */}
        <img src="/auth-art.webp" alt="Investigación Académica" className="auth-art" onError={(e) => e.target.style.display='none'} />
      </div>
    </div>
  );
};
