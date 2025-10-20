import { useState, useEffect } from "react";

function Settings() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="container mt-4">
      <h3>⚙️ Ajustes del Sistema</h3>
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkModeSwitch"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <label className="form-check-label" htmlFor="darkModeSwitch">
          Activar modo oscuro
        </label>
      </div>
    </div>
  );
}

export default Settings;
