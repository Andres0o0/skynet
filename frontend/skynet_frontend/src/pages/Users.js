import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userAdminService";

function Users() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "tecnico",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/dashboard");
    } else {
      setUser(storedUser);
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("Error al cargar usuarios");
    }
  };

  const handleChange = (e) =>
    setNewUser({ ...newUser, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setNewUser({ name: "", email: "", password: "", role: "tecnico" });
      loadUsers();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError("Error al crear usuario");
    }
  };

  const handleEditSubmit = async (id) => {
    try {
      await updateUser(id, editingUser);
      setEditingUser(null);
      loadUsers();
    } catch {
      setError("Error al actualizar usuario");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    await deleteUser(id);
    loadUsers();
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Usuarios</h3>
        <h5>Usuario {user?.name} </h5>
      <h5>Rol: {user?.role?.toUpperCase()}</h5>

      {error && <p className="text-danger">{error}</p>}

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              {editingUser?.id === u.id ? (
                <>
                  <td>
                    <input
                      name="name"
                      value={editingUser.name}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      name="email"
                      value={editingUser.email}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <select
                      name="role"
                      value={editingUser.role}
                      onChange={handleEditChange}
                      className="form-control"
                    >
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="tecnico">Técnico</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditSubmit(u.id)}
                      className="btn btn-success btn-sm me-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      onClick={() => setEditingUser(u)}
                      className="btn btn-warning btn-sm me-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-5">Agregar Nuevo Usuario</h5>
      <form onSubmit={handleSubmit} className="mt-3 row g-2">
        <div className="col-md-3">
          <input
            name="name"
            value={newUser.name}
            onChange={handleChange}
            placeholder="Nombre"
            className="form-control"
            required
          />
        </div>
        <div className="col-md-3">
          <input
            name="email"
            value={newUser.email}
            onChange={handleChange}
            placeholder="Correo"
            type="email"
            className="form-control"
            required
          />
        </div>
        <div className="col-md-3">
          <input
            name="password"
            value={newUser.password}
            onChange={handleChange}
            placeholder="Contraseña"
            type="password"
            className="form-control"
            required
          />
        </div>
        <div className="col-md-2">
          <select
            name="role"
            value={newUser.role}
            onChange={handleChange}
            className="form-control"
          >
            <option value="tecnico">Técnico</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-1">
          <button type="submit" className="btn btn-success w-100">
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Users;
