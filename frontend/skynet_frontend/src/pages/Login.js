import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === "admin" || data.user.role === "supervisor") {
      navigate("/dashboard");
    } else if (data.user.role === "tecnico") {
      navigate("/visits"); // 👈 va directo a sus visitas
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    setError(err.error || "Credenciales inválidas");
  }
    
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="text-center mb-4">Iniciar Sesión</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger text-center">{error}</p>}
        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;
