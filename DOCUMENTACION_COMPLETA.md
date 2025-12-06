# 📊 Tarjetas Sanas - Documentación Completa

> **Aplicación web fullstack para gestión inteligente de tarjetas de crédito y finanzas familiares**

---

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [API REST](#api-rest)
5. [Funcionalidades del Frontend](#funcionalidades-del-frontend)
6. [Stack Tecnológico](#stack-tecnológico)
7. [Instalación y Despliegue](#instalación-y-despliegue)

---

## 🎯 Descripción General

**Tarjetas Sanas** es una plataforma web para que familias gestionen responsablemente sus tarjetas de crédito y débito. Permite:

- 💳 **Registrar y monitorear** múltiples tarjetas de crédito/débito
- 💰 **Rastrear gastos** por categoría y tarjeta
- 📊 **Visualizar** saldos, disponibles e intereses con gráficas interactivas
- 📈 **Analizar** hábitos de consumo con alertas de riesgo
- 👨‍👩‍👧 **Soporte multiusuario** para familias

**Objetivo:** Evitar sobreendeudamiento mediante análisis financiero en tiempo real y alertas visuales sobre límites de crédito.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Dashboard    │  │   Tarjetas   │  │  Movimientos   │  │
│  │  (Analytics)   │  │ (Management) │  │ (Transactions) │  │
│  └────────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ AXIOS HTTP/REST
┌────────────────────────────▼────────────────────────────────┐
│                  BACKEND (Node.js + Express)                 │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Routing  │ │ CRUD   │ │ Analytics│ │ Error Handling   │ │
│  │ Middleware│ │Routes │ │Calc     │ │ & Logging        │ │
│  └──────────┘ └────────┘ └──────────┘ └──────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ PostgreSQL Protocol
┌────────────────────────────▼────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                   │
│  ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐  │
│  │ Usuarios   │ │ Tarjetas │ │ Compras │ │ Pagos        │  │
│  └────────────┘ └──────────┘ └─────────┘ └──────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Ingresos, Análisis Financiero, Auditoría           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos Completa

### **Tabla: usuarios**
```sql
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100),
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| Campo | Tipo | Descripción |
|-------|------|------------|
| id_usuario | SERIAL | ID único del usuario |
| nombre | VARCHAR(100) | Nombre completo (ej: "Leo", "Mamá") |
| email | VARCHAR(100) | Correo electrónico |
| telefono | VARCHAR(20) | Número telefónico |
| fecha_registro | TIMESTAMP | Fecha de creación de la cuenta |

**Usuarios activos:** Papá, Mamá, Leo

---

### **Tabla: tarjetas**
```sql
CREATE TABLE tarjetas (
  id_tarjeta SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario),
  banco VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'crédito' | 'débito'
  alias VARCHAR(100),
  ultimos_digitos VARCHAR(4),
  limite_credito DECIMAL(12,2),
  tasa_interes_mensual DECIMAL(5,2), -- Ej: 2.5 = 2.5% mensual
  fecha_corte INTEGER, -- Día del mes 1-31
  fecha_pago INTEGER,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| Campo | Tipo | Descripción |
|-------|------|------------|
| id_tarjeta | SERIAL | ID único |
| id_usuario | INTEGER | Usuario propietario |
| banco | VARCHAR(100) | Banco emisor (Banco Azteca, Santander, etc.) |
| tipo | VARCHAR(50) | "crédito" o "débito" |
| alias | VARCHAR(100) | Nombre personalizado (ej: "Visa Santander") |
| ultimos_digitos | VARCHAR(4) | Últimos 4 dígitos (seguridad) |
| limite_credito | DECIMAL(12,2) | Límite de crédito disponible |
| tasa_interes_mensual | DECIMAL(5,2) | Tasa de interés (ej: 2.5% = 2.5) |
| fecha_corte | INTEGER | Día de corte del mes |
| fecha_pago | INTEGER | Día de pago del mes |

---

### **Tabla: compras**
```sql
CREATE TABLE compras (
  id_compra SERIAL PRIMARY KEY,
  id_tarjeta INTEGER REFERENCES tarjetas(id_tarjeta),
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100), -- Comida, Transporte, Entretenimiento, etc.
  fecha DATE DEFAULT CURRENT_DATE,
  es_msi BOOLEAN DEFAULT FALSE,
  meses_msi INTEGER, -- Meses sin intereses (3, 6, 12, 18)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| Campo | Tipo | Descripción |
|-------|------|------------|
| id_compra | SERIAL | ID único |
| id_tarjeta | INTEGER | Tarjeta usada |
| descripcion | VARCHAR(255) | Qué se compró |
| monto | DECIMAL(12,2) | Cantidad gastada |
| categoria | VARCHAR(100) | Categoría (🍔 Comida, 🚗 Transporte, 🎬 Entretenimiento, 💡 Servicios, 🛍️ Compras, 🏥 Salud) |
| fecha | DATE | Fecha de la compra |
| es_msi | BOOLEAN | ¿Tiene meses sin intereses? |
| meses_msi | INTEGER | Cuántos meses sin intereses |

---

### **Tabla: pagos**
```sql
CREATE TABLE pagos (
  id_pago SERIAL PRIMARY KEY,
  id_tarjeta INTEGER REFERENCES tarjetas(id_tarjeta),
  tipo_pago VARCHAR(50), -- 'total' | 'minimo' | 'parcial'
  monto DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(100), -- Transferencia, Efectivo, App, etc.
  notas TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| Campo | Tipo | Descripción |
|-------|------|------------|
| id_pago | SERIAL | ID único |
| id_tarjeta | INTEGER | Tarjeta pagada |
| tipo_pago | VARCHAR(50) | Tipo: "total", "mínimo", "parcial" |
| monto | DECIMAL(12,2) | Cantidad abonada |
| metodo | VARCHAR(100) | Cómo se pagó |
| notas | TEXT | Notas adicionales |
| fecha | DATE | Fecha del pago |

---

### **Tabla: ingresos**
```sql
CREATE TABLE ingresos (
  id_ingreso SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario),
  fuente VARCHAR(100) NOT NULL, -- Sueldo, Freelance, Bono, etc.
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| Campo | Tipo | Descripción |
|-------|------|------------|
| id_ingreso | SERIAL | ID único |
| id_usuario | INTEGER | Usuario que recibe ingreso |
| fuente | VARCHAR(100) | Origen del dinero |
| monto | DECIMAL(12,2) | Cantidad recibida |
| fecha | DATE | Fecha del ingreso |

---

### **Tabla: analisis_financiero (Cálculo Dinámico)**
No es tabla física, se calcula dinámicamente en el backend con:
- **Deuda Total:** Suma todas compras - todos pagos
- **Interés Estimado:** Deuda × tasa_interes_mensual / 100
- **Disponible:** Límite crédito - deuda total
- **Porcentaje Utilización:** (Deuda / Límite) × 100
- **Alertas:** 
  - 🟢 Verde: <30% de uso
  - 🟡 Amarillo: 30-70% de uso (precaución)
  - 🔴 Rojo: >70% de uso (crítico)

---

## 📡 API REST - Endpoints Completos

### **Base URL:** `https://tarjetas-sanas.onrender.com/api` (producción)

### 👥 **USUARIOS**

#### `GET /api/usuarios`
Obtiene lista de todos los usuarios
```json
[
  {"id_usuario": 1, "nombre": "Leo", "email": "leo@email.com"},
  {"id_usuario": 2, "nombre": "Mamá", "email": "mama@email.com"}
]
```

#### `POST /api/usuarios`
Crea un nuevo usuario
```json
{
  "nombre": "Papá",
  "email": "papa@email.com",
  "telefono": "123456789"
}
```

---

### 💳 **TARJETAS**

#### `GET /api/tarjetas/:id_usuario`
Obtiene tarjetas de un usuario específico
```json
[
  {
    "id_tarjeta": 1,
    "banco": "Santander",
    "tipo": "crédito",
    "alias": "Visa Oro",
    "limite_credito": 50000,
    "tasa_interes_mensual": 2.5,
    "fecha_corte": 10,
    "fecha_pago": 28
  }
]
```

#### `POST /api/tarjetas`
Registra una nueva tarjeta
```json
{
  "id_usuario": 1,
  "banco": "Banco Azteca",
  "tipo": "crédito",
  "alias": "MasterCard",
  "ultimos_digitos": "4567",
  "limite_credito": 30000,
  "tasa_interes_mensual": 2.8,
  "fecha_corte": 15,
  "fecha_pago": 5
}
```

---

### 🛒 **COMPRAS**

#### `GET /api/compras/:id_tarjeta`
Obtiene compras de una tarjeta
```json
[
  {
    "id_compra": 1,
    "descripcion": "Mercado Soriana",
    "monto": 450.50,
    "categoria": "Comida",
    "fecha": "2025-12-05",
    "es_msi": false
  }
]
```

#### `POST /api/compras`
Registra una nueva compra
```json
{
  "id_tarjeta": 1,
  "descripcion": "Gasolina",
  "monto": 350.00,
  "categoria": "Transporte",
  "fecha": "2025-12-05",
  "es_msi": false
}
```

---

### 💰 **PAGOS**

#### `GET /api/pagos/:id_tarjeta`
Obtiene pagos realizados
```json
[
  {
    "id_pago": 1,
    "tipo_pago": "total",
    "monto": 5000,
    "metodo": "Transferencia",
    "fecha": "2025-12-01"
  }
]
```

#### `POST /api/pagos`
Registra un pago
```json
{
  "id_tarjeta": 1,
  "tipo_pago": "parcial",
  "monto": 2500,
  "metodo": "Transferencia",
  "notas": "Pago quincenal"
}
```

---

### 📈 **INGRESOS**

#### `GET /api/ingresos/:id_usuario`
Obtiene ingresos de un usuario
```json
[
  {
    "id_ingreso": 1,
    "fuente": "Sueldo",
    "monto": 15000,
    "fecha": "2025-12-01"
  }
]
```

#### `POST /api/ingresos`
Registra un ingreso
```json
{
  "id_usuario": 1,
  "fuente": "Sueldo",
  "monto": 15000,
  "fecha": "2025-12-05"
}
```

---

### 📊 **ANÁLISIS FINANCIERO**

#### `GET /api/analisis-financiero/:id_usuario`
Obtiene análisis completo del usuario
```json
{
  "usuario": "Leo",
  "deuda_total": 8500.75,
  "disponible_total": 41499.25,
  "interes_estimado_mensual": 212.52,
  "tarjetas": [
    {
      "id_tarjeta": 1,
      "alias": "Visa Santander",
      "deuda": 8500.75,
      "disponible": 41499.25,
      "porcentaje_utilizado": 17.01,
      "estado": "verde",
      "alerta": null
    }
  ],
  "gastos_por_categoria": [
    {"categoria": "Comida", "monto": 3200, "porcentaje": 37.65},
    {"categoria": "Transporte", "monto": 2100, "porcentaje": 24.71},
    {"categoria": "Entretenimiento", "monto": 1500, "porcentaje": 17.65},
    {"categoria": "Servicios", "monto": 1200, "porcentaje": 14.12}
  ],
  "ingresos_mes": 15000,
  "gastos_mes": 8500.75,
  "saldo_neto": 6499.25,
  "recomendaciones": [
    "🎯 Saldo saludable. Mantén este nivel de gastos.",
    "💡 Considera aumentar pagos si hay intereses."
  ]
}
```

#### `POST /api/simular-intereses`
Simula costo de intereses
```json
{
  "monto": 5000,
  "tasa_mensual": 2.5,
  "meses": 12
}
```

**Respuesta:**
```json
{
  "monto_original": 5000,
  "tasa_mensual": 2.5,
  "meses": 12,
  "interes_total": 1639.80,
  "monto_final": 6639.80,
  "mensaje": "Educativo: No endeudarse es lo mejor. ¡Compra solo lo que puedas pagar!"
}
```

---

## 🎨 Funcionalidades del Frontend

### **1. Dashboard (Página Principal) 📊**
**Ubicación:** `/` | `src/pages/Dashboard.jsx`

**Características:**
- 📊 **Gráfico de Gastos:** PieChart mostrando distribución por categoría con colores personalizados
- 📈 **Gráfico de Tarjetas:** BarChart comparando deuda vs disponible por tarjeta
- 🔔 **Alertas Dinámicas:** Sistema de 3 niveles (verde/amarillo/rojo) basado en % utilización
- 👤 **Selector de Usuario:** Dropdown para cambiar entre miembros de la familia
- 📌 **Tarjetas de Estadísticas:** 
  - Total de Deuda
  - Dinero Disponible
  - Ingresos del Mes
  - Saldo Neto (Ingresos - Gastos)
- 💡 **Recomendaciones Personalizadas:** Consejos basados en situación financiera
- 🎨 **Diseño Responsivo:** Se adapta a desktop, tablet y móvil

**Datos Calculados:**
- Suma de todas las compras registradas
- Suma de todos los pagos realizados
- Deuda neta = compras - pagos
- Porcentaje de utilización por tarjeta
- Agrupación de gastos por categoría

---

### **2. Tarjetas (Gestión de Tarjetas) 💳**
**Ubicación:** `/tarjetas` | `src/pages/Tarjetas.jsx`

**Características:**
- 📋 **Grid de Tarjetas:** Visualización en tarjetas con gradientes (azul para crédito, verde para débito)
- ➕ **Botón "Nueva Tarjeta":** Abre modal para registrar tarjeta nueva
- 📌 **Información Visual:**
  - Nombre de banco
  - Alias personalizado
  - Últimos 4 dígitos
  - Límite de crédito
  - Tipo (Crédito/Débito)
  - Próxima fecha de corte
  - Próxima fecha de pago

**Modal de Registro:**
- Campo banco (texto)
- Campo tipo (dropdown: crédito/débito)
- Campo alias (texto)
- Campo últimos dígitos (solo 4 números)
- Campo límite (número decimal)
- Campo tasa de interés (porcentaje)
- Campo fecha de corte (día del mes)
- Campo fecha de pago (día del mes)
- Validación y confirmación

---

### **3. Movimientos (Transacciones) 💰**
**Ubicación:** `/movimientos` | `src/pages/Movimientos.jsx`

**Características:**
- 🛒 **Pestaña Compras:** Registro y tabla de gastos
- 💳 **Pestaña Pagos:** Registro y tabla de pagos realizados
- 💵 **Pestaña Ingresos:** Registro y tabla de ingresos recibidos
- ➕ **Botón Verde "Nuevo":** Abre modal para registrar movimiento del tipo seleccionado
- 📅 **Tabla Dinámica:** Muestra todos los registros con:
  - Fecha formateada
  - Descripción/Concepto
  - Categoría (solo compras)
  - Monto con símbolo (-, +)
  - Estado MSI (solo compras)

**Modal de Compras:**
- Selector de tarjeta (dropdown)
- Monto (decimal)
- Descripción (texto)
- Categoría (dropdown): Comida, Transporte, Entretenimiento, Servicios, Compras, Salud, Otro
- Checkbox MSI (Meses Sin Intereses)
- Selector de meses si es MSI

**Modal de Pagos:**
- Selector de tarjeta (dropdown)
- Monto (decimal)
- Tipo de pago (dropdown): Total, Mínimo, Parcial
- Método (texto): Transferencia, Efectivo, App, etc.
- Notas (opcional)

**Modal de Ingresos:**
- Selector de usuario (dropdown): ¿Quién recibió el ingreso?
- Monto (decimal)
- Fuente (texto): Sueldo, Freelance, Bono, etc.

---

### **4. Componentes Compartidos 🎨**
**Layout (`src/components/Layout.jsx`)**
- 📱 Navegación superior con logo y menú
- 🔲 Links a las 3 páginas principales (Dashboard, Tarjetas, Movimientos)
- ☰ Menú hamburguesa responsive para móvil
- 🎨 Diseño con gradientes y colores semánticos

---

## 💻 Stack Tecnológico

### **Frontend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.x | Framework UI principal |
| Vite | 7.2.6 | Bundler y dev server ultrarrápido |
| Tailwind CSS | 4.1.17 | Estilos y diseño responsivo |
| Recharts | 2.x | Gráficas interactivas (PieChart, BarChart) |
| Lucide React | Latest | Iconos en SVG |
| Axios | Latest | Cliente HTTP para API calls |
| React Router | 6.x | Navegación SPA |

### **Backend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | >=18.0.0 | Runtime JavaScript |
| Express.js | 5.2.1 | Framework web REST |
| PostgreSQL | 15+ | Base de datos relacional |
| node-postgres (pg) | Latest | Driver PostgreSQL |
| CORS | Latest | Control de origen cross-domain |
| dotenv | Latest | Gestión de variables de entorno |

### **Infraestructura & DevOps**
| Servicio | Función |
|----------|---------|
| Supabase | Base de datos PostgreSQL alojada en AWS |
| Render.com | Hosting del backend + frontend compilado |
| GitHub | Control de versión e integración CI/CD |
| npm | Gestor de paquetes |

---

## 🚀 Instalación y Despliegue

### **Requisitos Previos**
- Node.js >=18.0.0 instalado
- npm o yarn
- Git
- Cuenta en Supabase y Render.com
- Credenciales de base de datos

### **Instalación Local**

1. **Clonar repositorio:**
```bash
git clone https://github.com/Leoglez10/tarjetas-sanas.git
cd "tarjetas-sanas"
```

2. **Configurar variables de entorno** (crear archivo `.env` en raíz):
```
DATABASE_URL=postgresql://postgres.XXXXXXXXXXX:YYYYYYYYYY@aws-1-us-east-2.pooler.supabase.com:5432/postgres
PORT=3000
```

3. **Instalar dependencias backend:**
```bash
npm install
```

4. **Instalar dependencias frontend:**
```bash
cd client
npm install
cd ..
```

5. **Ejecutar en desarrollo:**

**Opción A - Con hot reload:**
```bash
# Terminal 1: Backend en puerto 3000
npm run dev

# Terminal 2: Frontend en puerto 5173
cd client && npm run dev
```

**Opción B - Solo backend (frontend en carpeta dist/):**
```bash
npm run dev
```

Acceder a:
- Frontend: `http://localhost:5173` (desarrollo)
- Backend: `http://localhost:3000/api`

6. **Build para producción:**
```bash
npm run build
```
Esto compila React en `client/dist/` y Express sirve los archivos estáticos automáticamente.

### **Despliegue en Render.com**

1. **Conectar GitHub a Render**
   - Ir a render.com
   - Conectar cuenta GitHub
   - Autorizar acceso al repositorio

2. **Crear servicio web**
   - Repository: `tarjetas-sanas`
   - Branch: `master`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node
   - Plan: Free (o recomendado)

3. **Configurar variables de entorno en Dashboard de Render:**
   - Ir a Settings → Environment
   - Agregar:
     ```
     DATABASE_URL=postgresql://postgres.XXXXXXXXXXX:YYYYYYYYYY@aws-1-us-east-2.pooler.supabase.com:5432/postgres
     PORT=3000
     ```

4. **Deploy automático**
   - Cada `git push` a `master` activa redeploy automático
   - Ver logs en Render Dashboard si hay errores

5. **URL en vivo:**
   ```
   https://tarjetas-sanas.onrender.com
   ```

---

## ✨ Características Implementadas

### ✅ Completado
- [x] **Backend API REST** con 15+ endpoints CRUD
- [x] **Base de datos relacional** en Supabase PostgreSQL
- [x] **Frontend React** con 3 páginas principales
- [x] **Gráficas interactivas** con Recharts (PieChart, BarChart)
- [x] **Soporte multiusuario** con selector dinámico
- [x] **Formularios funcionales** para registrar:
  - [x] Nuevas tarjetas
  - [x] Compras/gastos
  - [x] Pagos realizados
  - [x] Ingresos recibidos
- [x] **Cálculos financieros automáticos:**
  - [x] Deuda total por tarjeta
  - [x] Disponible
  - [x] Intereses estimados
  - [x] Porcentaje de utilización
- [x] **Sistema de alertas** por nivel de endeudamiento:
  - [x] Verde: <30% utilizado
  - [x] Amarillo: 30-70% utilizado
  - [x] Rojo: >70% utilizado
- [x] **Diseño responsivo** con Tailwind CSS
- [x] **Despliegue en Render** con CI/CD automático
- [x] **Control de versión** en GitHub

### 🚧 En Progreso / Mejorable
- [ ] Autenticación real (actualmente selector simple sin contraseña)
- [ ] Historial gráfico de períodos (últimos 3/6/12 meses)
- [ ] Exportar datos a PDF/Excel
- [ ] Notificaciones push/email para alertas críticas
- [ ] Integración con APIs reales de bancos
- [ ] Dashboard de presupuestos personalizados
- [ ] Optimización de bundle size
- [ ] Tests automatizados (Jest, Vitest)

---

## 📊 Métricas de Rendimiento

- **Bundle Size:** ~660 KB (minificado) | ~200 KB (gzip)
- **Tiempo de carga:** <2 segundos en conexión 4G
- **Componentes:** 5 páginas + 10+ componentes reutilizables
- **Endpoints API:** 15+ rutas REST
- **Tablas BD:** 5 tablas relacionales
- **Usuarios activos demo:** 3 (Leo, Mamá, Papá)

---

## 🔐 Consideraciones de Seguridad

⚠️ **Estado Actual:** Prototipo/MVP sin autenticación real

**Para Producción Real se requiere:**
1. Autenticación con contraseña o OAuth (Google/Microsoft)
2. JWT tokens para autorización
3. HTTPS obligatorio
4. Rate limiting en endpoints
5. Validación y sanitización de inputs
6. CORS restrictivo (solo dominios permitidos)
7. Encriptación de datos sensibles
8. Auditoría de accesos

---

## 💡 Ejemplos de Uso

### Flujo típico de un usuario:

1. **Leo abre la app en su navegador**
   - Dashboard carga automáticamente
   - Selector muestra "Leo" por defecto

2. **Leo ve su estado financiero:**
   - Deuda total: $8,500.75
   - Disponible: $41,499.25
   - Alerta 🟡 Amarilla: 17% utilizado (está bien)
   - Gráfico muestra 45% en Comida, 25% en Transporte

3. **Leo quiere registrar una compra en Soriana:**
   - Click en botón verde "Nuevo"
   - Selecciona tab "Compras"
   - Elige tarjeta "Visa Santander"
   - Ingresa $450.50
   - Describe "Mercado Soriana"
   - Selecciona categoría "Comida"
   - Click "Guardar" ✓
   - Tabla se actualiza automáticamente

4. **Leo va a Tarjetas para ver su Visa:**
   - Ve tarjeta con gradiente azul
   - Muestra datos: Santander, límite $50,000, corte día 10
   - Puede agregar nueva tarjeta con botón "Nueva"

---

## 🤝 Contribución

Para contribuir al proyecto:

```bash
# 1. Fork el repositorio
# 2. Crear rama para la feature
git checkout -b feature/nueva-caracteristica

# 3. Hacer cambios y commit
git add .
git commit -m "Describe tu cambio"

# 4. Push a tu fork
git push origin feature/nueva-caracteristica

# 5. Crear Pull Request en GitHub
```

---

## 📞 Contacto & Soporte

**Desarrollador:** Leo Glez  
**Email:** leo@email.com  
**GitHub:** https://github.com/Leoglez10/tarjetas-sanas  
**URL en Vivo:** https://tarjetas-sanas.onrender.com  
**Base de Datos:** Supabase (PostgreSQL)  

---

## 📜 Licencia

Proyecto personal | Uso educativo y familiar

---

**Última actualización:** Diciembre 5, 2025  
**Versión:** 1.0 - MVP Funcional en Producción ✅
