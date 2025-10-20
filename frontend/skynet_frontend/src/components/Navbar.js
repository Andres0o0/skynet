import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/storage"; // 👈

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();  // 👈 lectura segura

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          Skynet
        </Link>

        <div className="d-flex align-items-center">
          {user?.role === "admin" && (
            <Link className="nav-link text-white me-3" to="/users">
              Usuarios
            </Link>
          )}

          {user?.role !== "tecnico" && (
            <Link className="nav-link text-white me-3" to="/dashboard">
              Clientes
            </Link>
          )}

          <Link className="nav-link text-white me-3" to="/visits">
            Visitas
          </Link>

          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
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
