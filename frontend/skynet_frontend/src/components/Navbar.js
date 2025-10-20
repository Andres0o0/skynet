import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
const userData = localStorage.getItem("user");
const user = userData ? JSON.parse(userData) : null;
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Título o logo */}
        <Link className="navbar-brand fw-bold" to="/dashboard">
          Skynet
        </Link>

        {/* Menú dinámico */}
        <div className="d-flex align-items-center">
          {/* 🔹 Visible solo para admin */}
          {user?.role === "admin" && (
            <Link className="nav-link text-white me-3" to="/users">
              Usuarios
            </Link>
          )}

          {/* 🔹 Visible para admin y supervisor */}
          {user?.role !== "tecnico" && (
            <Link className="nav-link text-white me-3" to="/dashboard">
              Clientes
            </Link>
          )}

          {/* 🔹 Visible para todos */}
          <Link className="nav-link text-white me-3" to="/visits">
            Visitas
          </Link>

          {/* 🔹 Botón de cerrar sesión */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>

       

        </div>
           <li className="nav-link text-white">
  <a className="nav-link" href="/settings">⚙️</a>
</li>
      </div>
    </nav>
  );
}

export default Navbar;
