// frontend/src/pages/Visits.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerVisit,
  getVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  generateReport,
} from "../services/visitService";
import { getUsers } from "../services/userService";
import { getClients } from "../services/clientService";
import { getUser } from "../utils/storage"; // 👈
function Visits() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedVisit, setEditedVisit] = useState({});
  const [newVisit, setNewVisit] = useState({
    client_id: "",
    technician_id: "",
    scheduled_date: "",
    check_in: "",
    check_out: "",
    status: "pending",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getUser();
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(storedUser);
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      const [visitsData, clientsData, usersData] = await Promise.allSettled([
        getVisits(),
        getClients(),
        getUsers(),
      ]);

      const visitsResult =
        visitsData.status === "fulfilled" && Array.isArray(visitsData.value)
          ? visitsData.value
          : [];
      const clientsResult =
        clientsData.status === "fulfilled" && Array.isArray(clientsData.value)
          ? clientsData.value
          : [];
      const usersResult =
        usersData.status === "fulfilled" && Array.isArray(usersData.value)
          ? usersData.value
          : [];

      setVisits(visitsResult);
      setClients(clientsResult);
      // ✅ Asegura que el supervisor vea técnicos aunque el backend devuelva solo algunos usuarios
if (Array.isArray(usersResult) && usersResult.length > 0) {
  const techs = usersResult.filter((u) => u.role === "tecnico");
  setTechnicians(techs);
} else {
  // Si el backend no devuelve usuarios, carga solo los técnicos desde un endpoint separado (si existe)
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allUsers = await res.json();
    setTechnicians(allUsers.filter((u) => u.role === "tecnico"));
  } catch (error) {
    console.warn("No se pudieron cargar los técnicos:", error);
  }
}

      setError("");
    } catch (err) {
      console.error("❌ Error general en loadData():", err);
      setError("Error al cargar información");
    }
  };

  // ---------- Registros / check-in / check-out ----------
  const handleRegister = async (visit) => {
    try {
      await registerVisit(visit.id, {});
      await loadData();
    } catch (err) {
      console.error("Error en registro de visita:", err);
      setError("No se pudo registrar la visita");
    }
  };

  // ---------- CRUD ----------
  const handleEdit = (visit) => {
    setEditingId(visit.id);
    setEditedVisit({
      id: visit.id,
      client_id: visit.client_id,
      technician_id: visit.technician_id,
      scheduled_date: visit.scheduled_date
        ? visit.scheduled_date.slice(0, 16)
        : "",
      check_in: visit.check_in || "",
      check_out: visit.check_out || "",
      status: visit.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedVisit({});
  };

  const handleSave = async (id) => {
    try {
      const payload = {
        client_id: editedVisit.client_id,
        technician_id: editedVisit.technician_id,
        scheduled_date: editedVisit.scheduled_date || null, // ✅ usar valor local directo
        check_in: editedVisit.check_in || null,
        check_out: editedVisit.check_out || null,
        status: editedVisit.status,
      };
      await updateVisit(id, payload);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error("Error actualizando visita:", err);
      setError("Error al actualizar visita");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta visita?")) return;
    try {
      await deleteVisit(id);
      await loadData();
    } catch (err) {
      console.error("Error eliminando visita:", err);
      setError("Error al eliminar la visita");
    }
  };

  const handleGenerateReport = async (id) => {
    try {
      await generateReport(id);
    } catch (err) {
      console.error("Error generando reporte:", err);
      alert("No se pudo generar el reporte");
    }
  };

  const handleChangeEdit = (e) =>
    setEditedVisit({ ...editedVisit, [e.target.name]: e.target.value });
  const handleChangeNew = (e) =>
    setNewVisit({ ...newVisit, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newVisit }; // ✅ usar directamente la fecha del input
      await createVisit(payload);
      setNewVisit({
        client_id: "",
        technician_id: "",
        scheduled_date: "",
        check_in: "",
        check_out: "",
        status: "pending",
      });
      await loadData();
    } catch (err) {
      console.error("Error creando visita:", err);
      setError("Error al crear la visita");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Visitas</h3>
       <h5>Usuario {user?.name} </h5>
      <h5>Rol: {user?.role?.toUpperCase()}</h5>
      {error && <p className="text-danger">{error}</p>}

      <h4 className="mt-4">Visitas Registradas</h4>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Técnico</th>
            <th>Fecha programada</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visits.length > 0 ? (
            visits.map((v) => (
              <tr key={v.id}>
                {editingId === v.id ? (
                  <>
                    <td>
                      <select
                        name="client_id"
                        value={editedVisit.client_id}
                        className="form-control"
                        onChange={handleChangeEdit}
                      >
                        <option value="">Seleccionar cliente</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        name="technician_id"
                        value={editedVisit.technician_id}
                        className="form-control"
                        onChange={handleChangeEdit}
                      >
                        <option value="">Seleccionar técnico</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        name="scheduled_date"
                        className="form-control"
                        value={editedVisit.scheduled_date || ""}
                        onChange={handleChangeEdit}
                      />
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        name="check_in"
                        className="form-control"
                        value={editedVisit.check_in?.slice(0, 16) || ""}
                        onChange={handleChangeEdit}
                      />
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        name="check_out"
                        className="form-control"
                        value={editedVisit.check_out?.slice(0, 16) || ""}
                        onChange={handleChangeEdit}
                      />
                    </td>
                    <td>
                      <select
                        name="status"
                        value={editedVisit.status}
                        className="form-control"
                        onChange={handleChangeEdit}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En curso</option>
                        <option value="completed">Completada</option>
                      </select>
                    </td>
                    <td>
                      {(user?.role === "admin" ||
                        user?.role === "supervisor") && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleSave(v.id)}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancel}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    <td>{v.client_name}</td>
                    <td>{v.technician_name}</td>
                    <td>
                      {v.scheduled_date
                        ? new Date(v.scheduled_date).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {v.check_in
                        ? new Date(v.check_in).toLocaleString()
                        : "Pendiente"}
                    </td>
                    <td>
                      {v.check_out
                        ? new Date(v.check_out).toLocaleString()
                        : "Pendiente"}
                    </td>
                    <td>{v.status}</td>
                    <td>
                      {(user?.role === "admin" ||
                        user?.role === "supervisor") && (
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(v)}
                        >
                          Editar
                        </button>
                      )}
                      {user?.role === "admin" && (
                        <button
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => handleDelete(v.id)}
                        >
                          Eliminar
                        </button>
                      )}
                      {user?.role === "tecnico" &&
                        v.status !== "completed" && (
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleRegister(v)}
                          >
                            ⏱ Registrar
                          </button>
                        )}
                      <button
                        className="btn btn-secondary btn-sm me-2"
                        onClick={() => handleGenerateReport(v.id)}
                      >
                        📄 Reporte
                      </button>
                      {v.latitude && v.longitude && (
                        <>
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${v.latitude},${v.longitude}`,
                                "_blank"
                              )
                            }
                          >
                            📍 Ver mapa
                          </button>
                          {user?.role === "tecnico" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`,
                                  "_blank"
                                )
                              }
                            >
                              🚗 Cómo llegar
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay visitas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(user?.role === "admin" || user?.role === "supervisor") && (
        <>
          <h5 className="mt-5">Agregar Nueva Visita</h5>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row g-2">
              <div className="col-md-3">
                <select
                  name="client_id"
                  className="form-control"
                  value={newVisit.client_id}
                  onChange={handleChangeNew}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <select
                  name="technician_id"
                  className="form-control"
                  value={newVisit.technician_id}
                  onChange={handleChangeNew}
                  required
                >
                  <option value="">Seleccionar técnico</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  className="form-control"
                  value={newVisit.scheduled_date}
                  onChange={handleChangeNew}
                  required
                />
              </div>

              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100">
                  Agregar
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Visits;
