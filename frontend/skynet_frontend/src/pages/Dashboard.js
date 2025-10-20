// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, createClient, updateClient, deleteClient } from "../services/clientService";
import { getUser } from "../utils/storage"; // 👈

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: "", address: "", latitude: "", longitude: "", email: "" });
  const [editingClient, setEditingClient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
     const storedUser = getUser(); 
    if (!storedUser) navigate("/");
    else {
      if (storedUser.role === "tecnico") navigate("/visits");
      else {
        setUser(storedUser);
        loadClients();
      }
    }
  }, [navigate]);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error("Error loadClients:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      } else setError("Error al cargar los clientes");
    }
  };

  const handleChange = (e) => setNewClient({ ...newClient, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditingClient({ ...editingClient, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClient(newClient);
      setNewClient({ name: "", address: "", latitude: "", longitude: "", email: "" });
      await loadClients();
    } catch (err) {
      console.error(err);
      setError("Error al crear cliente");
    }
  };

  const handleEditSubmit = async (id) => {
    try {
      await updateClient(id, editingClient);
      setEditingClient(null);
      await loadClients();
    } catch (err) {
      console.error(err);
      setError("Error al actualizar cliente");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar cliente?")) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar cliente");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Visitas</h3>
      <h5>Usuario {user?.name} </h5>
      <h5>Rol: {user?.role?.toUpperCase()}</h5>

      <h4 className="mt-4">Clientes registrados</h4>
      {error && <p className="text-danger">{error}</p>}

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              {editingClient?.id === c.id ? (
                <>
                  <td><input name="name" value={editingClient.name} onChange={handleEditChange} className="form-control" /></td>
                  <td><input name="email" value={editingClient.email} onChange={handleEditChange} className="form-control" /></td>
                  <td><input name="address" value={editingClient.address} onChange={handleEditChange} className="form-control" /></td>
                  <td><input name="latitude" value={editingClient.latitude} onChange={handleEditChange} className="form-control" /></td>
                  <td><input name="longitude" value={editingClient.longitude} onChange={handleEditChange} className="form-control" /></td>
                  <td>
                    {user?.role === "admin" && (
                      <>
                        <button onClick={() => handleEditSubmit(c.id)} className="btn btn-success btn-sm me-2">Guardar</button>
                        <button onClick={() => setEditingClient(null)} className="btn btn-secondary btn-sm">Cancelar</button>
                      </>
                    )}
                  </td>
                </>
              ) : (
                <>
                  <td>{c.name}</td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.address}</td>
                  <td>{c.latitude}</td>
                  <td>{c.longitude}</td>
                  <td>
                    {user?.role === "admin" && (
                      <>
                        <button onClick={() => setEditingClient(c)} className="btn btn-warning btn-sm me-2">Editar</button>
                        <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm">Eliminar</button>
                      </>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {user?.role === "admin" && (
        <>
          <h5 className="mt-5">Agregar nuevo cliente</h5>
          <form onSubmit={handleSubmit} className="mt-3 row g-2">
            <div className="col-md-3"><input name="name" value={newClient.name} onChange={handleChange} placeholder="Nombre" className="form-control" required /></div>
            <div className="col-md-3"><input name="email" value={newClient.email} onChange={handleChange} placeholder="Email" className="form-control" /></div>
            <div className="col-md-3"><input name="address" value={newClient.address} onChange={handleChange} placeholder="Dirección" className="form-control" required /></div>
            <div className="col-md-1"><input name="latitude" value={newClient.latitude} onChange={handleChange} placeholder="Lat." className="form-control" /></div>
            <div className="col-md-1"><input name="longitude" value={newClient.longitude} onChange={handleChange} placeholder="Long." className="form-control" /></div>
            <div className="col-md-1"><button type="submit" className="btn btn-success w-100">Agregar</button></div>
          </form>
        </>
      )}
    </div>
  );
}

export default Dashboard;
