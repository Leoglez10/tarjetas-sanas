# 🛠️ Guía Técnica: Tarjetas Sanas

**Documentación para Desarrolladores y Mantenimiento**

Este proyecto es una aplicación Web Fullstack para gestión financiera familiar.

---

## 🏗️ Arquitectura

### Backend (API)
- **Tecnología:** Node.js + Express
- **Ubicación:** Raíz del proyecto (`server.js`)
- **Base de Datos:** PostgreSQL (vía Supabase)
- **Driver:** `pg` (node-postgres)
- **Seguridad:** CORS habilitado, variables de entorno en `.env`.

**Estructura de Endpoints:**
- `GET /api/usuarios`: Lista usuarios activos.
- `GET /api/tarjetas/:id_usuario`: Obtiene tarjetas por usuario.
- `POST /api/compras`: Registra gastos.
- `GET /api/analisis-financiero/:id_usuario`: **Lógica Core**. Calcula totales, porcentaje de uso y genera alertas (Semáforo).

### Frontend (Cliente)
- **Tecnología:** React + Vite
- **Ubicación:** Carpeta `/client`
- **Estilos:** Tailwind CSS (para diseño rápido y responsive).
- **Gráficos:** Chart.js (para visualizar gastos).
- **Iconos:** Lucide-React.

---

## 🔧 Configuración y Despliegue

### Requisitos Previos
- Node.js (v18 o superior)
- Archivo `.env` con `DATABASE_URL` de Supabase.

### Pasos para correr localmente
1. **Backend:**
   ```bash
   npm install
   node server.js
   ```
   (Corre en puerto 3000 por defecto)

2. **Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   (Corre en `http://localhost:5173` y hace proxy al 3000)

---

## 🧠 Lógica de Negocio Clave

### Cálculo de Semáforo Financiero
Ubicado en `server.js` -> `/api/analisis-financiero`.
- **Verde (<30% uso):** Uso saludable.
- **Amarillo (30-70% uso):** Precaución.
- **Rojo (>70% uso):** Riesgo de sobreendeudamiento.

### Simulación de Intereses
Ubicado en `/api/simular-intereses`.
Calcula interés simple mensual basado en Tasa Anual / 12.
*Nota:* Es una aproximación educativa, no legal/bancaria exacta.

---

## 🚀 Mantenimiento Futuro

A. **Agregar nuevos reportes:**
   1. Crear query SQL en backend.
   2. Exponer endpoint `/api/reportes/nuevo`.
   3. Consumir en Frontend y agregar gráfica en `Dashboard.jsx`.

B. **Cambiar base de datos:**
   Solo modificar `DATABASE_URL` y asegurar que el esquema SQL coincida (ver tablas en Supabase).
