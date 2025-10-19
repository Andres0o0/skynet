import { getAllClients, insertClient, updateClient, deleteClient } from "../models/clients.model.js";

// ✅ Obtener todos los clientes
export async function getClients(req, res) {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
}

// ✅ Crear nuevo cliente
export async function createClient(req, res) {
  try {
    console.log("📨 Datos recibidos en backend:", req.body);
    const { name, address, latitude, longitude, email } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Nombre y dirección son obligatorios" });
    }

    await insertClient(name, address, latitude, longitude, email);
    res.status(201).json({ message: "Cliente creado correctamente" });
  } catch (error) {
    console.error("❌ Error al crear cliente:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// ✅ Editar cliente existente
export async function editClient(req, res) {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, email } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const updated = await updateClient(id, name, address, latitude, longitude, email);
    res.json({ message: "Cliente actualizado correctamente", updated });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
}

// ✅ Eliminar cliente
export async function removeClient(req, res) {
  try {
    const { id } = req.params;
    await deleteClient(id);
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
}
