Información de Despliegue – SkyNet S.A.
Dominio principal

    URL pública: https://skynetgt.online
    
    Proveedor: GoDaddy
    
    Configuración DNS:
    
    Tipo: CNAME
    
    Host: @ → apunta al servicio de Render (frontend)
    
    TTL: Automático
    
    El dominio redirige al frontend desplegado en Render.

Frontend (Interfaz web)

    Framework: React.js
    
    Servicio de alojamiento: Render.com
    
    Repositorio GitHub:
    https://github.com/usuario/skynet_frontend
    
    Dirección de despliegue:
    https://skynet-frontend.onrender.com
    
    Descripción:
    
    Interfaz para los roles de administrador, supervisor y técnico.
    
    Permite login, gestión de clientes, visitas, usuarios y configuración.
    
    Se conecta al backend mediante la variable de entorno .env:
    
    REACT_APP_API_URL=https://skynet-backend-production.up.railway.app/api
    
Backend (API REST)

    Tecnología: Node.js + Express
    
    Base de datos: PostgreSQL
    
    Alojamiento: Railway.app
    
    Repositorio GitHub:
    https://github.com/usuario/skynet_backend
    
    Endpoint principal:
    https://skynet-backend-production.up.railway.app
    
    Rutas destacadas:
    
    /api/login – Autenticación
    
    /api/users – Gestión de usuarios
    
    /api/clients – Gestión de clientes
    
    /api/visit – Gestión de visitas
    
    /api/reports – Generación de reportes PDF
    
    Variables de entorno (.env):
    
    DATABASE_URL=postgresql://usuario:contraseña@host:puerto/db
    JWT_SECRET=claveSecreta
    FRONTEND_URL=https://skynetgt.online
    RESEND_API_KEY=tu_api_key
    
Base de datos

    Motor: PostgreSQL
    
    Proveedor: Railway
    
    Esquema: public
    
    Tablas principales:
    
    users – credenciales, roles y datos de acceso
    
    clients – datos de clientes y ubicación
    
    visits – visitas técnicas y horarios
    
    reports – rutas de los reportes PDF generados
    
    Conexión: protegida por SSL
    
    Respaldo: Railway gestiona copias automáticas diarias
    
Servicio de correos

    Proveedor: Resend.com
    
    Uso: Envío de correos con reportes PDF tras finalizar una visita
    
    Integración: archivo utils/email.js en el backend
    
    Autenticación: API Key configurada en RESEND_API_KEY
    
    Plantilla de correo:
    
    Asunto: “Reporte de visita completada - SkyNet S.A.”
    
    Cuerpo: contiene los datos del cliente, técnico, fecha y estado de la visita.
    
Reportes PDF

    Generador: PDFKit
    
    Ruta temporal de archivos: /backend/reports/reporte_visita_[id].pdf
    
    Contenido:
    
    Datos de cliente, técnico y visita
    
    Fecha programada, check-in y check-out
    
    Estado de la visita
    
    Mensaje institucional de cierre

Seguridad

    Autenticación basada en tokens JWT.
    
    Cifrado de contraseñas mediante bcrypt.
    
    Conexiones HTTPS activadas por Render y Railway.
    
    Control de acceso por roles (Administrador, Supervisor y Técnico).

Control de versiones

    Repositorios separados para backend y frontend.
    
    Control de versiones con Git y GitHub.
    
    Despliegue continuo (CI/CD) mediante Render y Railway enlazados a GitHub.
    
    Versionado por etapas del cronograma de desarrollo.
