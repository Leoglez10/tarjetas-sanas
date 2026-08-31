<div align="center">

# Tarjetas Sanas

### Aplicación web familiar para controlar tarjetas de crédito, medir la deuda real y anticipar los intereses antes de que se acumulen

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)

</div>

> Este README es el punto de entrada del proyecto. Explica qué es, cómo levantarlo y cómo está organizado, y enlaza a las guías detalladas que ya existen en el repositorio.
> Si solo quieres usar la aplicación, ve a [Cómo se usa](#cómo-se-usa) o a la [`GUIA_USUARIO.md`](GUIA_USUARIO.md).
> Si vas a tocar el código, ve a [Arquitectura](#arquitectura) y [Estructura del proyecto](#estructura-del-proyecto).

> ⚠️ **Aviso de seguridad antes de usar este repositorio**
> `GUIA_BACKEND.md` incluye una cadena de conexión de PostgreSQL con usuario y contraseña reales.
> Esa credencial debe considerarse comprometida y rotarse en Supabase. Ver [Seguridad](#seguridad).

---

## Índice

- [Qué es](#qué-es)
- [Relación con el repositorio healty-card](#relación-con-el-repositorio-healty-card)
- [Para quién es](#para-quién-es)
- [Qué hace hoy](#qué-hace-hoy)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [API](#api)
- [Reglas de negocio implementadas](#reglas-de-negocio-implementadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo se usa](#cómo-se-usa)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Seguridad](#seguridad)
- [Solución de problemas](#solución-de-problemas)
- [Documentación relacionada](#documentación-relacionada)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Qué es

**Tarjetas Sanas** es una aplicación web para que una familia lleve, en un solo lugar, el control de sus tarjetas bancarias: cuánto se debe, en qué se gasta y qué tan cerca se está del límite de crédito.

Su diferencia con una hoja de cálculo es el **análisis automático**: además de guardar movimientos, el backend calcula la deuda real de cada tarjeta, los intereses que generará si no se paga, el porcentaje del límite utilizado y una proyección de la deuda a 3, 6 y 12 meses si no se abona nada.

No se conecta con ningún banco. Todos los movimientos se capturan a mano y se guardan en una base de datos PostgreSQL propia.

---

## Relación con el repositorio healty-card

Este repositorio y [`Leoglez10/healty-card`](https://github.com/Leoglez10/healty-card) son **dos implementaciones del mismo producto**, no dos proyectos distintos.

| | `tarjetas-sanas` (este repositorio) | `healty-card` |
|---|---|---|
| Primer commit | 5 dic 2025, 22:55 | 5 dic 2025, 23:49 |
| Cliente | **JavaScript (JSX)** | TypeScript (TSX) |
| Navegación | React Router 7, tres rutas | Estado local con pestañas |
| Vite / Express | Vite 7 / Express 5 | Vite 6 / Express 4 |
| Estilos | Tailwind CSS v4 vía plugin de Vite | Tailwind desde CDN |
| API | Solo lectura y alta (`GET` / `POST`) | Alta, edición y borrado (`GET` / `POST` / `PUT` / `DELETE`) |
| Base del análisis | Tabla `ingresos` del mes en curso | Campo `presupuesto_mensual` del usuario |
| Extras del backend | Proyección de deuda, presupuesto inteligente, historial de 12 meses | Presupuesto editable desde el dashboard |
| Documentación | Seis guías extensas | Tres guías de backend y despliegue |

En resumen: **este es el repositorio original**, en JavaScript, y conserva la documentación más completa del dominio y del análisis financiero. `healty-card` es la reescritura posterior, con el cliente tipado en TypeScript y una API que además permite editar y borrar registros.

---

## Para quién es

| Rol | Qué puede hacer |
|---|---|
| Integrante de la familia | Registrar tarjetas, compras, pagos e ingresos; consultar el dashboard y las alertas |
| Persona que administra la app | Crear la base de datos, configurar `DATABASE_URL` y desplegar el servidor |
| Desarrollador | Levantar el proyecto en local y ampliar la API o la interfaz |

> ⚠️ La aplicación **no tiene autenticación**. Se elige un usuario de una lista y cualquiera con acceso a la URL ve y modifica los datos de todos. Ver [Limitaciones conocidas](#limitaciones-conocidas).

---

## Qué hace hoy

Funcionalidades verificadas en el código:

- ✅ Selección del usuario activo desde una lista (sin contraseña).
- ✅ Alta de tarjetas con banco, alias, tipo, últimos 4 dígitos, límite, días de corte y pago, y tasa de interés anual (la mensual se deriva automáticamente).
- ✅ Registro de compras con categoría y marca de meses sin intereses.
- ✅ Registro de pagos con tipo, método y notas.
- ✅ Registro de ingresos por fuente.
- ✅ **Validación de crédito disponible**: una compra que supere el crédito restante de la tarjeta se rechaza.
- ✅ **Validación de pago**: no se puede pagar más de lo que se debe.
- ✅ Análisis financiero por usuario: ingresos y gastos del mes, saldo neto, deuda total, intereses mensuales, uso global del crédito y nivel de riesgo.
- ✅ Alertas graduadas por tarjeta (crítico, alerta, consejo) y recomendaciones de gasto.
- ✅ Proyección de deuda a 3, 6 y 12 meses si no se realizan pagos.
- ✅ Simulador de intereses mes a mes para una compra hipotética.
- ✅ Dashboard con gráficas (Recharts) y navegación entre Dashboard, Tarjetas y Movimientos.
- 🧪 Endpoints `/api/presupuesto/:id_usuario` y `/api/historial/:id_usuario`: implementados y funcionales, pero **ninguna pantalla los consume todavía**.

---

## Arquitectura

El repositorio contiene **dos aplicaciones Node.js separadas** que se ejecutan juntas:

```text
Navegador
   │
   ▼
client/  ← React 19 + Vite + Tailwind 4   (interfaz)
   │  axios hacia /api/...
   ▼
server.js  ← Express 5 + pool de pg       (API REST y lógica financiera)
   │
   ▼
PostgreSQL                                (datos)
```

- La **raíz del repositorio es el backend**: `package.json` (nombre interno `tarjetas-sanas-api`) y `server.js`, que abre el pool de PostgreSQL directamente, sin módulo aparte.
- La carpeta **`client/` es el frontend**, con su propio `package.json` y sus propias dependencias.

Cómo se comunican, según el modo de ejecución:

| Modo | Frontend | Backend | Cómo llegan las peticiones a la API |
|---|---|---|---|
| Desarrollo | Servidor de Vite en `http://localhost:5173` | `http://localhost:3000` | El proxy de `client/vite.config.js` reenvía `/api` al puerto 3000 |
| Producción | Compilado en `client/dist/` | `http://localhost:3000` | Express sirve `client/dist` como estático y responde `/api` en el mismo puerto |

En producción hay **un solo puerto**: `server.js` sirve la interfaz compilada y la API a la vez, y devuelve `client/dist/index.html` para cualquier ruta que no empiece por `/api` (necesario para React Router).

Toda la lógica financiera vive en el backend, en funciones auxiliares de `server.js`: `calcularDeudaTarjeta`, `calcularCreditoDisponible`, `obtenerIngresosMensuales`, `obtenerGastosMensuales` y `calcularInteresPendiente`. El cliente solo presenta lo que la API calcula.

---

## Requisitos

- **Node.js 18 o superior** (declarado en `engines` del `package.json` de la raíz).
- **npm** (el repositorio incluye `package-lock.json` en la raíz y en `client/`).
- Una **base de datos PostgreSQL** accesible por cadena de conexión, con las tablas descritas en [Base de datos](#base-de-datos).

---

## Instalación y ejecución

```bash
git clone https://github.com/Leoglez10/tarjetas-sanas.git
cd tarjetas-sanas
```

### 1. Instalar dependencias

```bash
npm install                 # backend (raíz)
npm install --prefix client # frontend
```

### 2. Crear el archivo `.env` en la raíz

```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_bd
PORT=3000
```

`.env` está en `.gitignore` y no debe subirse al repositorio.

### 3. Modo desarrollo (dos terminales)

```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — interfaz
npm run dev --prefix client
```

Abre `http://localhost:5173`. El proxy de Vite envía las llamadas `/api` al puerto 3000.

Al arrancar, el servidor imprime si encontró la variable de entorno:

```text
Servidor listo en http://localhost:3000
DATABASE_URL configurado: Sí
```

> 💡 `npm run dev` en la raíz ejecuta `node server.js`, igual que `npm start`: **no recarga automáticamente al guardar cambios**. Para recarga automática puedes usar `node --watch server.js`.

### 4. Modo producción local (un solo puerto)

```bash
npm run build   # instala las dependencias del cliente y genera client/dist
npm start       # sirve API + interfaz en el puerto 3000
```

Abre `http://localhost:3000`.

> ⚠️ Si ejecutas `npm start` sin haber compilado el cliente, la API responderá, pero cualquier ruta que no sea `/api` fallará porque `client/dist/index.html` no existe.

### Scripts disponibles

| Script | Dónde | Qué hace |
|---|---|---|
| `npm start` | raíz | `node server.js` — API y frontend compilado |
| `npm run dev` | raíz | `node server.js` (idéntico a `start`, sin recarga automática) |
| `npm run build` | raíz | `cd client && npm install && npm run build` |
| `npm run dev` | `client/` | Servidor de desarrollo de Vite (puerto 5173) |
| `npm run build` | `client/` | Compila la interfaz en `client/dist` |
| `npm run lint` | `client/` | ESLint sobre el código del cliente |
| `npm run preview` | `client/` | Previsualiza el build de Vite |

> El proyecto **no tiene tests configurados**. El único linter es el de `client/` (`eslint.config.js`).

---

## Variables de entorno

Se leen con `dotenv` desde el `.env` de la raíz. No existe `.env.example` en el repositorio.

| Variable | Obligatoria | Dónde se usa | Descripción |
|---|---|---|---|
| `DATABASE_URL` | Sí | `server.js` | Cadena de conexión a PostgreSQL. El pool se abre con `ssl: { rejectUnauthorized: false }` |
| `PORT` | No | `server.js` | Puerto del servidor Express. Por defecto `3000` |

> Nunca publiques valores reales de estas variables en el repositorio ni en la documentación.

---

## Base de datos

PostgreSQL, con cinco tablas. El repositorio **no incluye migraciones ni un archivo `.sql`**: el esquema hay que crearlo a mano.

Columnas verificadas en las consultas de `server.js`:

| Tabla | Columnas usadas por el código |
|---|---|
| `usuarios` | `id_usuario`, `nombre`, `rol`, `activo` |
| `tarjetas` | `id_tarjeta`, `id_usuario`, `banco`, `tipo`, `alias`, `ultimos4`, `limite_credito`, `fecha_corte_dia`, `fecha_pago_dia`, `tasa_interes_anual`, `tasa_interes_mensual` |
| `compras` | `id_compra`, `id_tarjeta`, `fecha`, `monto`, `categoria`, `descripcion`, `es_msi`, `meses_msi` |
| `pagos` | `id_pago`, `id_tarjeta`, `fecha`, `monto`, `tipo_pago`, `metodo`, `notas` |
| `ingresos` | `id_ingreso`, `id_usuario`, `fecha`, `monto`, `fuente` |

> ⚠️ **El esquema SQL de `DOCUMENTACION_COMPLETA.md` y `GUIA_BACKEND.md` no coincide con el código.** Esos documentos definen `ultimos_digitos`, `fecha_corte` y `fecha_pago`, y una tabla `usuarios` con `email` y `telefono`. El código actual usa `ultimos4`, `fecha_corte_dia`, `fecha_pago_dia`, `tasa_interes_anual`, y espera `rol` y `activo` en `usuarios`. Si creas la base de datos, sigue los nombres de esta tabla.

### Dónde viven los datos y cómo respaldarlos

Todos los datos están en la base PostgreSQL remota indicada por `DATABASE_URL`; la aplicación no guarda nada en el equipo del usuario y no incluye ninguna función de backup o restauración. Los respaldos dependen del proveedor de la base de datos (por ejemplo, los backups automáticos de Supabase) o de `pg_dump` ejecutado por fuera del proyecto.

---

## API

Base: `/api`. Todas las respuestas son JSON. No hay autenticación ni cabeceras obligatorias más allá de `Content-Type: application/json` en las peticiones con cuerpo.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/ping` | Comprobación de que el servidor responde |
| `GET` | `/api/usuarios` | Lista de usuarios |
| `POST` | `/api/usuarios` | Crea un usuario (`nombre`, `rol`, `activo`) |
| `GET` | `/api/tarjetas` | Todas las tarjetas |
| `GET` | `/api/tarjetas/:id_usuario` | Tarjetas de un usuario |
| `POST` | `/api/tarjetas` | Crea una tarjeta y deriva la tasa mensual de la anual |
| `GET` | `/api/compras` | Todas las compras |
| `GET` | `/api/compras/:id_tarjeta` | Compras de una tarjeta |
| `POST` | `/api/compras` | Registra una compra validando el crédito disponible |
| `GET` | `/api/pagos` | Todos los pagos |
| `GET` | `/api/pagos/:id_tarjeta` | Pagos de una tarjeta |
| `POST` | `/api/pagos` | Registra un pago validando que no exceda la deuda |
| `GET` | `/api/ingresos` | Todos los ingresos |
| `GET` | `/api/ingresos/:id_usuario` | Ingresos de un usuario |
| `POST` | `/api/ingresos` | Registra un ingreso |
| `GET` | `/api/analisis-financiero/:id_usuario` | Resumen, alertas, consejos, riesgo y proyección de deuda |
| `POST` | `/api/simular-intereses` | Simulación mes a mes del interés de una compra |
| `GET` | `/api/presupuesto/:id_usuario` | Relación deuda/ingresos y recomendaciones de gasto |
| `GET` | `/api/historial/:id_usuario` | Ingresos, gastos y saldo de los últimos 12 meses |

Ejemplo:

```bash
curl http://localhost:3000/api/ping
# {"mensaje":"API funcionando correctamente"}
```

Códigos de respuesta usados: `200`, `201`, `400` (datos faltantes, crédito insuficiente o pago mayor a la deuda), `404` (recurso inexistente), `500` (error del servidor).

> ⚠️ **La API no expone `PUT` ni `DELETE`.** Una vez registrado un movimiento, no puede corregirse ni eliminarse desde la aplicación; solo directamente en la base de datos.

Para el detalle de peticiones y respuestas de cada endpoint, ver [`DOCUMENTACION_COMPLETA.md`](DOCUMENTACION_COMPLETA.md) y [`SISTEMA_INTELIGENTE.md`](SISTEMA_INTELIGENTE.md), teniendo en cuenta las divergencias señaladas en este README.

---

## Reglas de negocio implementadas

Todas viven en `server.js` y se calculan al vuelo; no hay tablas de resultados.

**Deuda por tarjeta**
`deuda = suma de compras − suma de pagos` de esa tarjeta.

**Crédito disponible**
`límite de crédito − deuda`. Una compra que supere ese disponible se rechaza con `400` e indica cuánto falta.

**Pago máximo**
Un pago mayor a la deuda actual se rechaza con `400` e indica la deuda real.

**Semáforo y alertas por tarjeta**

| Uso del límite | Estado | Efecto |
|---|---|---|
| Menos de 30 % | 🟢 verde | Sin aviso |
| 30 % a 50 % | 🟡 amarillo | Consejo con el interés mensual estimado |
| Más de 50 % | 🟠 alerta | Recomienda pagar el total antes del corte |
| Más de 70 % | 🔴 crítico | Recomienda dejar de usar la tarjeta |

**Nivel de riesgo del usuario**
Se evalúa con el saldo neto del mes (ingresos − gastos) y la relación deuda/ingresos: `muy_alto` si se gasta más de lo que se ingresa, `alto` si el margen es menor al 20 % de los ingresos o la deuda duplica los ingresos mensuales, y `bajo` en el resto de los casos.

**Gasto máximo recomendado**
El 70 % de los ingresos del mes en curso.

**Intereses y proyección**
El interés mensual de una tarjeta es `deuda × tasa_interes_mensual / 100`. La proyección a 3, 6 y 12 meses suma ese interés de forma lineal. El simulador de `/api/simular-intereses`, en cambio, sí acumula interés compuesto mes a mes.

Estos cálculos son orientativos y deliberadamente simplificados: no consideran fechas de corte reales, pagos mínimos bancarios ni el tratamiento contable de los meses sin intereses.

---

## Estructura del proyecto

```text
tarjetas-sanas/
├── server.js                    ← ⭐ API REST, pool de PostgreSQL y toda la lógica financiera
├── package.json                 ← Dependencias y scripts del BACKEND
├── client/                      ← Aplicación de frontend (proyecto npm independiente)
│   ├── package.json             ← Dependencias y scripts del FRONTEND
│   ├── vite.config.js           ← Plugin de Tailwind y proxy /api → localhost:3000
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx             ← Punto de entrada de React
│       ├── App.jsx              ← Rutas de React Router
│       ├── index.css            ← Importa Tailwind y define los estilos base
│       ├── components/
│       │   └── Layout.jsx       ← Barra de navegación y pie de página
│       └── pages/
│           ├── Dashboard.jsx    ← ⭐ Resumen, alertas y gráficas
│           ├── Tarjetas.jsx     ← Alta y listado de tarjetas
│           └── Movimientos.jsx  ← Compras, pagos e ingresos
├── DOCUMENTACION_COMPLETA.md    ← Documentación general del sistema
├── SISTEMA_INTELIGENTE.md       ← Detalle del análisis financiero v2.0
├── GUIA_BACKEND.md              ← Guía del backend (ver advertencias)
├── GUIA_TECNICA.md              ← Resumen técnico y mantenimiento
├── GUIA_USUARIO.md              ← Manual para la familia
└── ESTADO_PROYECTO.md           ← Estado, métricas y hoja de ruta
```

> 💡 Regla rápida:
> - Pantallas → `client/src/pages/`
> - Navegación y layout → `client/src/components/Layout.jsx`
> - Endpoints, cálculos y alertas → `server.js`
> - Estilos globales → `client/src/index.css`

---

## Cómo se usa

Para el manual completo dirigido a la familia, ver [`GUIA_USUARIO.md`](GUIA_USUARIO.md). En resumen:

**Elegir de quién son los datos.** El dashboard y la pantalla de movimientos incluyen un selector con los usuarios existentes. No hay contraseña.

**Registrar una tarjeta.** Sección *Mis Tarjetas* → *Agregar tarjeta*. Se pide banco, alias, tipo, límite, días de corte y pago, y la tasa de interés **anual** (el sistema calcula la mensual dividiendo entre 12).

**Registrar una compra.** Sección *Movimientos*, pestaña *Compras*. Si el monto supera el crédito disponible de la tarjeta, la aplicación lo rechaza y muestra cuánto falta.

**Registrar un pago.** Sección *Movimientos*, pestaña *Pagos*. No se acepta un pago mayor a la deuda; la respuesta indica la deuda restante y el crédito que queda libre.

**Registrar ingresos.** Sección *Movimientos*, pestaña *Ingresos*. Es un paso importante: **el análisis del dashboard se basa en los ingresos del mes en curso**. Sin ingresos registrados, el saldo neto y las recomendaciones de gasto quedan en cero.

**Interpretar el dashboard.** El semáforo indica qué tan usado está el crédito de cada tarjeta; las alertas y la proyección de deuda muestran cuánto crecerá el saldo si no se paga.

---

## Limitaciones conocidas

- **Sin autenticación ni autorización.** Cualquiera con acceso a la URL puede leer y modificar los datos de toda la familia.
- **CORS completamente abierto** (`app.use(cors())`), sin restricción de origen.
- **Sin edición ni borrado.** La API solo tiene `GET` y `POST`; un movimiento mal capturado solo puede corregirse en la base de datos.
- **Sin migraciones.** El esquema hay que crearlo y mantenerlo a mano, y las guías del repositorio traen nombres de columnas antiguos.
- **Sin tests y sin CI.** No existe carpeta `.github/workflows`.
- **`calcularDeudaTarjeta` usa un `FULL OUTER JOIN` entre `compras` y `pagos`.** Cuando una tarjeta tiene varias compras y varios pagos, el join multiplica filas y las sumas quedan infladas, por lo que la deuda calculada puede ser incorrecta. Es el punto a revisar antes de confiar en las cifras con datos reales.
- **El análisis solo considera el mes en curso.** Ingresos y gastos se filtran desde el día 1 del mes actual, mientras que la deuda acumula el histórico completo.
- **Endpoints sin usar.** `/api/presupuesto/:id_usuario` y `/api/historial/:id_usuario` funcionan pero ninguna pantalla los consume.
- **Dependencias declaradas y no utilizadas.** En la raíz, `@supabase/supabase-js`, `tailwindcss`, `postcss` y `autoprefixer`; en `client/`, `chart.js`, `react-chartjs-2`, `framer-motion`, `clsx` y `tailwind-merge`. Las gráficas se dibujan únicamente con Recharts.
- **`client/index.html` conserva el título y el idioma de la plantilla de Vite** (`<title>client</title>`, `lang="en"`), pese a que toda la interfaz está en español.
- **Sin capturas de pantalla** en el repositorio *(pendiente)*.
- Las guías del repositorio mencionan un despliegue en `tarjetas-sanas.onrender.com`. **Ese despliegue no puede verificarse desde el código** y puede no estar activo.

---

## Seguridad

> ⚠️ **Credenciales expuestas en el historial del repositorio**
>
> `GUIA_BACKEND.md` contiene una cadena de conexión completa a una base de datos PostgreSQL de Supabase, con usuario y contraseña legibles.
>
> Acciones recomendadas:
> 1. Rotar la contraseña de la base de datos en Supabase.
> 2. Sustituir esos valores por marcadores de posición, como ya hace `DOCUMENTACION_COMPLETA.md`.
> 3. Considerar limpiar el historial de Git (por ejemplo, con `git filter-repo`), ya que la credencial sigue siendo accesible en commits anteriores.
> 4. Añadir un `.env.example` con marcadores en lugar de valores reales.

Otros puntos a tener en cuenta antes de exponer esta aplicación en internet:

- No hay autenticación: **cualquier visitante tiene acceso total de lectura y escritura** a datos financieros familiares.
- No hay validación de entradas ni límite de peticiones.
- La conexión a PostgreSQL usa `ssl: { rejectUnauthorized: false }`, que cifra el tráfico pero **no verifica el certificado del servidor**.
- `cors()` sin opciones acepta peticiones de cualquier origen.

El archivo `.env` está correctamente ignorado por Git y no hay ningún `.env` versionado en el repositorio.

---

## Solución de problemas

| Problema | Causa probable | Qué hacer |
|---|---|---|
| El servidor arranca pero toda petición devuelve error 500 | `DATABASE_URL` ausente o incorrecta | Revisar el mensaje `DATABASE_URL configurado:` al arrancar y comparar `GET /api/ping` (no toca la base) con `GET /api/usuarios` (sí la toca) |
| El selector de usuarios aparece vacío | La tabla `usuarios` está vacía | Crear un usuario con `POST /api/usuarios` |
| Error `column ... does not exist` | El esquema sigue los nombres antiguos de las guías | Usar los nombres de columna de la sección [Base de datos](#base-de-datos) |
| En `http://localhost:5173` las llamadas a `/api` fallan | El backend no está corriendo o cambió de puerto | Levantar `npm run dev` en la raíz y revisar el proxy de `client/vite.config.js` |
| `npm start` devuelve error al abrir cualquier ruta | Falta compilar el frontend | Ejecutar `npm run build` |
| "Crédito insuficiente" al registrar una compra | El monto supera el límite menos la deuda de esa tarjeta | Registrar antes el pago correspondiente o revisar el límite de la tarjeta |
| El dashboard muestra saldo neto 0 | No hay ingresos registrados en el mes en curso | Registrar los ingresos del mes en *Movimientos* |
| El puerto 3000 está ocupado | Otro proceso lo está usando | Cambiar `PORT` en `.env` y actualizar el proxy en `client/vite.config.js` |

---

## Documentación relacionada

| Documento | Propósito | Estado |
|---|---|---|
| [`GUIA_USUARIO.md`](GUIA_USUARIO.md) | Manual para la familia, sin tecnicismos | Vigente |
| [`GUIA_TECNICA.md`](GUIA_TECNICA.md) | Resumen de arquitectura, despliegue y mantenimiento | Vigente |
| [`SISTEMA_INTELIGENTE.md`](SISTEMA_INTELIGENTE.md) | Detalle del análisis financiero: deuda real, intereses, riesgo y proyecciones | Vigente, es la referencia del comportamiento actual |
| [`DOCUMENTACION_COMPLETA.md`](DOCUMENTACION_COMPLETA.md) | Documentación general: arquitectura, base de datos, endpoints y ejemplos | Parcialmente desactualizada: nombres de columnas del esquema |
| [`GUIA_BACKEND.md`](GUIA_BACKEND.md) | Guía extensa del backend con ejemplos de peticiones | Parcialmente desactualizada, además contiene credenciales reales |
| [`ESTADO_PROYECTO.md`](ESTADO_PROYECTO.md) | Estado de funcionalidades, métricas y hoja de ruta | Instantánea de diciembre de 2025 |
| [`client/README.md`](client/README.md) | Plantilla original de Vite | Histórico; no describe este proyecto |

Versión en TypeScript del mismo producto: [`Leoglez10/healty-card`](https://github.com/Leoglez10/healty-card).

---

## Licencia

El repositorio **no incluye un archivo `LICENSE`**. El campo `license` del `package.json` de la raíz declara `ISC`, pero sin archivo de licencia esa declaración no tiene efecto práctico. Proyecto personal y de uso familiar.

---

## Autor

<div align="center">

### Desarrollado por **Leonardo González**

[![GitHub](https://img.shields.io/badge/GitHub-Leoglez10-181717?logo=github&logoColor=white)](https://github.com/Leoglez10)

[Reportar un problema](https://github.com/Leoglez10/tarjetas-sanas/issues)

</div>
