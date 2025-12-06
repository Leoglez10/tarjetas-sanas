const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend compilado
app.use(express.static(path.join(__dirname, 'client', 'dist')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
});

app.get('/api/ping', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente' });
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id_usuario');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { nombre, rol, activo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, rol, activo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, rol, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.get('/api/tarjetas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarjetas ORDER BY id_tarjeta');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    res.status(500).json({ error: 'Error al obtener tarjetas' });
  }
});

app.get('/api/tarjetas/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM tarjetas WHERE id_usuario = $1 ORDER BY id_tarjeta',
      [id_usuario]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tarjetas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener tarjetas' });
  }
});

app.post('/api/tarjetas', async (req, res) => {
  const { id_usuario, banco, tipo, alias, ultimos4, limite_credito, fecha_corte_dia, fecha_pago_dia, tasa_interes_anual } = req.body;
  try {
    const tasa_interes_mensual = (tasa_interes_anual / 12).toFixed(4);
    const result = await pool.query(
      'INSERT INTO tarjetas (id_usuario, banco, tipo, alias, ultimos4, limite_credito, fecha_corte_dia, fecha_pago_dia, tasa_interes_anual, tasa_interes_mensual) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id_usuario, banco, tipo, alias, ultimos4, limite_credito, fecha_corte_dia, fecha_pago_dia, tasa_interes_anual, tasa_interes_mensual]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tarjeta:', error);
    res.status(500).json({ error: 'Error al crear tarjeta' });
  }
});

app.get('/api/compras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compras ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

app.get('/api/compras/:id_tarjeta', async (req, res) => {
  const { id_tarjeta } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM compras WHERE id_tarjeta = $1 ORDER BY fecha DESC',
      [id_tarjeta]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener compras de tarjeta:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

app.post('/api/compras', async (req, res) => {
  const { id_tarjeta, fecha, monto, categoria, descripcion, es_msi, meses_msi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO compras (id_tarjeta, fecha, monto, categoria, descripcion, es_msi, meses_msi) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id_tarjeta, fecha || new Date().toISOString().split('T')[0], monto, categoria, descripcion, es_msi ?? false, meses_msi || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: 'Error al registrar compra' });
  }
});

app.get('/api/pagos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pagos ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

app.get('/api/pagos/:id_tarjeta', async (req, res) => {
  const { id_tarjeta } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM pagos WHERE id_tarjeta = $1 ORDER BY fecha DESC',
      [id_tarjeta]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pagos de tarjeta:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

app.post('/api/pagos', async (req, res) => {
  const { id_tarjeta, fecha, monto, tipo_pago, metodo, notas } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pagos (id_tarjeta, fecha, monto, tipo_pago, metodo, notas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id_tarjeta, fecha || new Date().toISOString().split('T')[0], monto, tipo_pago || 'parcial', metodo, notas]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

app.get('/api/ingresos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingresos ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

app.get('/api/ingresos/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ingresos WHERE id_usuario = $1 ORDER BY fecha DESC',
      [id_usuario]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingresos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

app.post('/api/ingresos', async (req, res) => {
  const { id_usuario, fecha, monto, fuente } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ingresos (id_usuario, fecha, monto, fuente) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, fecha || new Date().toISOString().split('T')[0], monto, fuente]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
});

app.get('/api/analisis-financiero/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    // 1. Obtener tarjetas del usuario
    const tarjetasResult = await pool.query('SELECT * FROM tarjetas WHERE id_usuario = $1', [id_usuario]);
    const tarjetas = tarjetasResult.rows;

    // 2. Obtener gastos del usuario en el mes actual (aproximación simple)
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1);
    const comprasResult = await pool.query(
      `SELECT c.*, t.alias, t.limite_credito 
       FROM compras c 
       JOIN tarjetas t ON c.id_tarjeta = t.id_tarjeta 
       WHERE t.id_usuario = $1 AND c.fecha >= $2`,
      [id_usuario, fechaInicioMes.toISOString().split('T')[0]]
    );
    const comprasMes = comprasResult.rows;

    let alertas = [];
    let consejos = [];
    let totalDeuda = 0;
    let totalLimite = 0;

    // Análisis por tarjeta
    for (const tarjeta of tarjetas) {
      // Calcular gastos de esta tarjeta
      const gastosTarjeta = comprasMes
        .filter(c => c.id_tarjeta === tarjeta.id_tarjeta)
        .reduce((sum, c) => sum + parseFloat(c.monto), 0);

      const usoPorcentaje = (gastosTarjeta / tarjeta.limite_credito) * 100;
      totalDeuda += gastosTarjeta;
      totalLimite += parseFloat(tarjeta.limite_credito);

      // Lógica de Semáforo Financiero
      if (usoPorcentaje > 70) {
        alertas.push({
          nivel: 'critico',
          mensaje: `¡Cuidado! Tu tarjeta ${tarjeta.alias} está al ${usoPorcentaje.toFixed(1)}% de su límite.`,
          accion: 'Deja de usarla inmediatamente y planifica pagos.'
        });
      } else if (usoPorcentaje > 30) {
        alertas.push({
          nivel: 'precaucion',
          mensaje: `Tu tarjeta ${tarjeta.alias} ha superado el 30% de uso recomendado (${usoPorcentaje.toFixed(1)}%).`,
          accion: 'Intenta pagar el total para no generar intereses.'
        });
      }
    }

    // Análisis Global
    const usoGlobal = totalLimite > 0 ? (totalDeuda / totalLimite) * 100 : 0;
    if (usoGlobal < 15 && totalDeuda > 0) {
      consejos.push("¡Excelente manejo! Tu uso de crédito es bajo, esto mejora tu historial crediticio.");
    }

    res.json({
      resumen: {
        total_deuda_mes: totalDeuda,
        uso_credito_global_porcentaje: usoGlobal.toFixed(1),
      },
      alertas,
      consejos
    });

  } catch (error) {
    console.error('Error en análisis financiero:', error);
    res.status(500).json({ error: 'Error al realizar análisis financiero' });
  }
});

app.post('/api/simular-intereses', (req, res) => {
  const { monto_compra, tasa_anual, meses_pago } = req.body;

  if (!monto_compra || !tasa_anual) {
    return res.status(400).json({ error: 'Faltan datos para la simulación' });
  }

  // Fórmulas simples para fines educativos
  const tasaMensual = (tasa_anual / 100) / 12;
  // Cálculo de interés simple aproximado si no paga el total (revolving)
  // Ojo: Esto es una simplificación extrema para familias, no una tabla de amortización bancaria exacta.

  const interesPrimerMes = monto_compra * tasaMensual;
  const pagoMinimoEstimado = (monto_compra * 0.05) + interesPrimerMes; // 5% + intereses (común en bancos)

  let escenario = {
    interes_mensual_estimado: interesPrimerMes.toFixed(2),
    tasa_mensual_aplicada: (tasaMensual * 100).toFixed(2) + '%',
    mensaje: ''
  };

  if (tasa_anual > 40) {
    escenario.mensaje = "¡Alerta! Esta tasa es muy alta. Evita endeudarte con esta tarjeta si no puedes pagar el total a fin de mes.";
    escenario.color = "rojo";
  } else {
    escenario.mensaje = "Tasa moderada, pero recuerda que el interés compuesto crece rápido.";
    escenario.color = "amarillo";
  }

  res.json(escenario);
});

// Todas las rutas que no sean /api/* sirven el frontend
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
  console.log(`DATABASE_URL configurado: ${process.env.DATABASE_URL ? 'Sí' : 'No'}`);
});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Promesa rechazada no manejada:', err);
});
