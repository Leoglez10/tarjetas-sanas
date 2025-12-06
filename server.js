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

// ============ FUNCIONES AUXILIARES ============

// Calcula deuda pendiente de una tarjeta
async function calcularDeudaTarjeta(id_tarjeta) {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(c.monto), 0) as total_compras,
        COALESCE(SUM(p.monto), 0) as total_pagos
      FROM compras c
      FULL OUTER JOIN pagos p ON c.id_tarjeta = p.id_tarjeta
      WHERE c.id_tarjeta = $1 OR p.id_tarjeta = $1
    `, [id_tarjeta]);
    
    const { total_compras, total_pagos } = result.rows[0];
    return parseFloat(total_compras) - parseFloat(total_pagos);
  } catch (error) {
    console.error('Error calculando deuda:', error);
    return 0;
  }
}

// Calcula crédito disponible
async function calcularCreditoDisponible(id_tarjeta) {
  try {
    const tarjeta = await pool.query('SELECT limite_credito FROM tarjetas WHERE id_tarjeta = $1', [id_tarjeta]);
    if (tarjeta.rows.length === 0) return 0;
    
    const deuda = await calcularDeudaTarjeta(id_tarjeta);
    return parseFloat(tarjeta.rows[0].limite_credito) - deuda;
  } catch (error) {
    console.error('Error calculando disponible:', error);
    return 0;
  }
}

// Obtiene ingresos mensuales de un usuario
async function obtenerIngresosMensuales(id_usuario) {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM ingresos
      WHERE id_usuario = $1 AND fecha >= $2
    `, [id_usuario, inicioMes]);
    
    return parseFloat(result.rows[0].total);
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    return 0;
  }
}

// Obtiene gastos mensuales de un usuario
async function obtenerGastosMensuales(id_usuario) {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT COALESCE(SUM(c.monto), 0) as total
      FROM compras c
      JOIN tarjetas t ON c.id_tarjeta = t.id_tarjeta
      WHERE t.id_usuario = $1 AND c.fecha >= $2
    `, [id_usuario, inicioMes]);
    
    return parseFloat(result.rows[0].total);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return 0;
  }
}

// Calcula intereses pendientes
async function calcularInteresPendiente(id_tarjeta) {
  try {
    const tarjeta = await pool.query('SELECT tasa_interes_mensual FROM tarjetas WHERE id_tarjeta = $1', [id_tarjeta]);
    if (tarjeta.rows.length === 0) return 0;
    
    const deuda = await calcularDeudaTarjeta(id_tarjeta);
    const tasaMensual = parseFloat(tarjeta.rows[0].tasa_interes_mensual) / 100;
    
    return deuda * tasaMensual;
  } catch (error) {
    console.error('Error calculando intereses:', error);
    return 0;
  }
}

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
    // 1. Validar que la tarjeta existe
    const tarjeta = await pool.query('SELECT * FROM tarjetas WHERE id_tarjeta = $1', [id_tarjeta]);
    if (tarjeta.rows.length === 0) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    // 2. Verificar disponible
    const disponible = await calcularCreditoDisponible(id_tarjeta);
    if (monto > disponible) {
      return res.status(400).json({
        error: `Crédito insuficiente. Disponible: $${disponible.toFixed(2)}, Intenta gastar: $${monto}`,
        disponible_actual: disponible,
        falta: (monto - disponible).toFixed(2)
      });
    }

    // 3. Registrar compra
    const result = await pool.query(
      'INSERT INTO compras (id_tarjeta, fecha, monto, categoria, descripcion, es_msi, meses_msi) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id_tarjeta, fecha || new Date().toISOString().split('T')[0], monto, categoria || 'Otro', descripcion, es_msi ?? false, meses_msi || 1]
    );

    const compra = result.rows[0];
    const nuevoDisponible = disponible - monto;

    res.status(201).json({
      ...compra,
      disponible_anterior: disponible.toFixed(2),
      disponible_ahora: nuevoDisponible.toFixed(2),
      mensaje: `Compra registrada. Crédito disponible ahora: $${nuevoDisponible.toFixed(2)}`
    });
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
    // 1. Validar tarjeta
    const tarjeta = await pool.query('SELECT * FROM tarjetas WHERE id_tarjeta = $1', [id_tarjeta]);
    if (tarjeta.rows.length === 0) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    // 2. Obtener deuda actual
    const deudaActual = await calcularDeudaTarjeta(id_tarjeta);
    
    // 3. Validar que el pago no exceda la deuda
    if (monto > deudaActual) {
      return res.status(400).json({
        error: `No puedes pagar más de lo que debes. Deuda: $${deudaActual.toFixed(2)}, Intentas pagar: $${monto}`,
        deuda_actual: deudaActual.toFixed(2)
      });
    }

    // 4. Registrar pago
    const result = await pool.query(
      'INSERT INTO pagos (id_tarjeta, fecha, monto, tipo_pago, metodo, notas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id_tarjeta, fecha || new Date().toISOString().split('T')[0], monto, tipo_pago || 'parcial', metodo || 'No especificado', notas]
    );

    const pago = result.rows[0];
    const deudaRestante = deudaActual - monto;
    const disponibleAhora = parseFloat(tarjeta.rows[0].limite_credito) - deudaRestante;

    res.status(201).json({
      ...pago,
      deuda_anterior: deudaActual.toFixed(2),
      deuda_restante: deudaRestante.toFixed(2),
      credito_disponible: disponibleAhora.toFixed(2),
      mensaje: `Pago registrado. Deuda restante: $${deudaRestante.toFixed(2)}, Crédito disponible: $${disponibleAhora.toFixed(2)}`
    });
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
    // 1. Obtener usuario
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const usuario = usuarioResult.rows[0];

    // 2. Obtener todas sus tarjetas
    const tarjetasResult = await pool.query('SELECT * FROM tarjetas WHERE id_usuario = $1', [id_usuario]);
    const tarjetas = tarjetasResult.rows;

    // 3. Calcular finanzas globales
    const ingresosMes = await obtenerIngresosMensuales(id_usuario);
    const gastosMes = await obtenerGastosMensuales(id_usuario);
    const saldoNeto = ingresosMes - gastosMes;

    // 4. Análisis por tarjeta
    const analisisTarjetas = [];
    let deudaTotalGlobal = 0;
    let deudaConInteres = 0;
    let limiteTotalGlobal = 0;
    let interesGlobalMensual = 0;

    for (const tarjeta of tarjetas) {
      const deuda = await calcularDeudaTarjeta(tarjeta.id_tarjeta);
      const disponible = parseFloat(tarjeta.limite_credito) - deuda;
      const interesMensual = deuda * (parseFloat(tarjeta.tasa_interes_mensual) / 100);
      const usoPorcentaje = (deuda / parseFloat(tarjeta.limite_credito)) * 100;

      deudaTotalGlobal += deuda;
      deudaConInteres += deuda + interesMensual;
      limiteTotalGlobal += parseFloat(tarjeta.limite_credito);
      interesGlobalMensual += interesMensual;

      analisisTarjetas.push({
        id_tarjeta: tarjeta.id_tarjeta,
        alias: tarjeta.alias,
        banco: tarjeta.banco,
        limite: parseFloat(tarjeta.limite_credito),
        deuda: parseFloat(deuda.toFixed(2)),
        disponible: parseFloat(disponible.toFixed(2)),
        porcentaje_uso: parseFloat(usoPorcentaje.toFixed(2)),
        tasa_interes_mensual: parseFloat(tarjeta.tasa_interes_mensual),
        interes_mensual: parseFloat(interesMensual.toFixed(2)),
        estado: usoPorcentaje < 30 ? 'verde' : usoPorcentaje < 70 ? 'amarillo' : 'rojo'
      });
    }

    // 5. Calcular recomendación de gasto máximo
    const gastoMaximoRecomendado = ingresosMes * 0.7; // 70% de ingresos
    const gastoRestante = gastoMaximoRecomendado - gastosMes;

    // 6. Generar alertas y consejos
    const alertas = [];
    const consejos = [];
    let riesgoDeuda = 'bajo';

    // Alertas por tarjeta
    for (const tarjeta of analisisTarjetas) {
      if (tarjeta.porcentaje_uso > 70) {
        alertas.push({
          nivel: 'critico',
          tarjeta: tarjeta.alias,
          mensaje: `🔴 CRÍTICO: Tu ${tarjeta.alias} está al ${tarjeta.porcentaje_uso.toFixed(1)}% de uso. DEJA DE USAR INMEDIATAMENTE.`,
          accion: 'Paga el saldo completo para no generar más intereses.',
          deuda: tarjeta.deuda,
          interes_proximo_mes: tarjeta.interes_mensual
        });
      } else if (tarjeta.porcentaje_uso > 50) {
        alertas.push({
          nivel: 'alerta',
          tarjeta: tarjeta.alias,
          mensaje: `🟠 ATENCIÓN: Tu ${tarjeta.alias} está al ${tarjeta.porcentaje_uso.toFixed(1)}% de uso.`,
          accion: 'Considera pagar el total antes del corte para evitar intereses.',
          interes_proximo_mes: tarjeta.interes_mensual
        });
      } else if (tarjeta.porcentaje_uso > 30) {
        consejos.push(`⚠️ Tu ${tarjeta.alias} usa el ${tarjeta.porcentaje_uso.toFixed(1)}% del límite. Si no pagas, genera intereses: $${tarjeta.interes_mensual.toFixed(2)}/mes`);
      }
    }

    // Análisis de riesgo de deuda impagable
    if (saldoNeto < 0) {
      alertas.push({
        nivel: 'critico',
        mensaje: '🔴 RIESGO CRÍTICO: Estás gastando más de lo que ganas este mes.',
        accion: 'Reduce gastos inmediatamente. Riesgo de endeudamiento acelerado.',
        deficit: Math.abs(saldoNeto).toFixed(2)
      });
      riesgoDeuda = 'muy_alto';
    } else if (saldoNeto < ingresosMes * 0.2) {
      alertas.push({
        nivel: 'alerta',
        mensaje: '🟠 RIESGO ALTO: Apenas te sobra dinero después de gastos.',
        accion: 'Aumenta ingresos o reduce gastos para tener un margen de seguridad.',
        saldo_neto: saldoNeto.toFixed(2)
      });
      riesgoDeuda = 'alto';
    } else if (deudaTotalGlobal > ingresosMes * 2) {
      alertas.push({
        nivel: 'alerta',
        mensaje: `⚠️ Tu deuda total (${deudaTotalGlobal.toFixed(2)}) es el doble de tus ingresos mensuales.`,
        accion: 'Planifica pagos agresivos. Tu deuda crece con intereses cada mes.',
        deuda_meses: (deudaTotalGlobal / ingresosMes).toFixed(1)
      });
      riesgoDeuda = 'alto';
    } else {
      riesgoDeuda = 'bajo';
    }

    // Consejos positivos
    if (riesgoDeuda === 'bajo' && gastoRestante > 0) {
      consejos.push(`✅ Buen manejo. Aún puedes gastar $${gastoRestante.toFixed(2)} sin exceder el 70% de ingresos.`);
    }
    if (deudaTotalGlobal === 0) {
      consejos.push('🎉 ¡Excelente! No tienes deuda. Mantén este hábito.');
    }

    // 7. Proyección de deuda a 3 meses si no pagas
    const deudaProyectada3Meses = deudaTotalGlobal + (interesGlobalMensual * 3);
    const deudaProyectada6Meses = deudaTotalGlobal + (interesGlobalMensual * 6);
    const deudaProyectada12Meses = deudaTotalGlobal + (interesGlobalMensual * 12);

    res.json({
      usuario: usuario.nombre,
      resumen: {
        ingresos_mes: parseFloat(ingresosMes.toFixed(2)),
        gastos_mes: parseFloat(gastosMes.toFixed(2)),
        saldo_neto: parseFloat(saldoNeto.toFixed(2)),
        deuda_total: parseFloat(deudaTotalGlobal.toFixed(2)),
        interes_total_mensual: parseFloat(interesGlobalMensual.toFixed(2)),
        credito_disponible_total: parseFloat((limiteTotalGlobal - deudaTotalGlobal).toFixed(2)),
        porcentaje_deuda_global: parseFloat(((deudaTotalGlobal / limiteTotalGlobal) * 100).toFixed(2))
      },
      recomendaciones: {
        gasto_maximo_mes: parseFloat(gastoMaximoRecomendado.toFixed(2)),
        gasto_restante_disponible: parseFloat(Math.max(0, gastoRestante).toFixed(2)),
        pago_recomendado_mes: parseFloat((deudaTotalGlobal + interesGlobalMensual).toFixed(2)),
        consejo: deudaTotalGlobal === 0 ? '💚 Sin deuda - mantén este hábito' : 'Paga al menos los intereses para no crecer tu deuda'
      },
      tarjetas: analisisTarjetas,
      alertas,
      consejos,
      riesgo: riesgoDeuda,
      proyeccion: {
        deuda_actual: parseFloat(deudaTotalGlobal.toFixed(2)),
        interes_por_mes: parseFloat(interesGlobalMensual.toFixed(2)),
        deuda_3_meses_sin_pagar: parseFloat(deudaProyectada3Meses.toFixed(2)),
        deuda_6_meses_sin_pagar: parseFloat(deudaProyectada6Meses.toFixed(2)),
        deuda_12_meses_sin_pagar: parseFloat(deudaProyectada12Meses.toFixed(2)),
        advertencia: 'Si no pagas, la deuda crece exponencialmente cada mes.'
      }
    });

  } catch (error) {
    console.error('Error en análisis financiero:', error);
    res.status(500).json({ error: 'Error al realizar análisis financiero' });
  }
});

app.post('/api/simular-intereses', async (req, res) => {
  const { monto_compra, tasa_anual, meses_pago } = req.body;

  if (!monto_compra || !tasa_anual) {
    return res.status(400).json({ error: 'Faltan datos para la simulación' });
  }

  try {
    const tasaMensual = (tasa_anual / 100) / 12;
    const interesMensual = monto_compra * tasaMensual;
    
    // Simular deuda a través de los meses
    let deudaProyectada = monto_compra;
    let interesTotales = 0;
    const simulacion = [];

    for (let mes = 1; mes <= (meses_pago || 12); mes++) {
      const interesMes = deudaProyectada * tasaMensual;
      interesTotales += interesMes;
      deudaProyectada += interesMes;

      simulacion.push({
        mes,
        interes_mes: parseFloat(interesMes.toFixed(2)),
        deuda_acumulada: parseFloat(deudaProyectada.toFixed(2))
      });
    }

    const pagoMinimoEstimado = (monto_compra * 0.05) + interesMensual;

    let advertencia = '';
    if (tasa_anual > 40) {
      advertencia = '🔴 ALERTA CRÍTICA: Esta tasa es MUY ALTA. Si no pagas el total al mes siguiente, la deuda crece exponencialmente.';
    } else if (tasa_anual > 25) {
      advertencia = '🟠 Tasa alta. Ten cuidado: si solo pagas el mínimo, la deuda nunca disminuirá.';
    } else {
      advertencia = '⚠️ Tasa moderada, pero el interés compuesto sigue siendo peligroso.';
    }

    res.json({
      monto_original: monto_compra,
      tasa_anual,
      tasa_mensual: parseFloat((tasaMensual * 100).toFixed(2)),
      interes_primer_mes: parseFloat(interesMensual.toFixed(2)),
      pago_minimo_estimado: parseFloat(pagoMinimoEstimado.toFixed(2)),
      interes_total_12_meses: parseFloat(interesTotales.toFixed(2)),
      deuda_total_con_interes: parseFloat(deudaProyectada.toFixed(2)),
      simulacion: simulacion.slice(0, 12),
      advertencia,
      recomendacion: 'Paga el total de la compra al mes siguiente. No esperes a que genere intereses.'
    });
  } catch (error) {
    console.error('Error en simulación de intereses:', error);
    res.status(500).json({ error: 'Error en la simulación' });
  }
});

// ============ NUEVO: Presupuesto inteligente ============
app.get('/api/presupuesto/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  
  try {
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const ingresosMes = await obtenerIngresosMensuales(id_usuario);
    const gastosMes = await obtenerGastosMensuales(id_usuario);
    const tarjetasResult = await pool.query('SELECT * FROM tarjetas WHERE id_usuario = $1', [id_usuario]);

    let deudaTotal = 0;
    for (const tarjeta of tarjetasResult.rows) {
      deudaTotal += await calcularDeudaTarjeta(tarjeta.id_tarjeta);
    }

    const deuda_ingresos_ratio = ingresosMes > 0 ? (deudaTotal / ingresosMes).toFixed(2) : 0;

    // Recomendaciones basadas en ratio deuda-ingresos
    const recomendaciones = {
      gasto_total_mes: parseFloat(gastosMes.toFixed(2)),
      gasto_maximo_recomendado: parseFloat((ingresosMes * 0.7).toFixed(2)),
      gasto_restante: parseFloat(Math.max(0, (ingresosMes * 0.7) - gastosMes).toFixed(2)),
      deuda_total: parseFloat(deudaTotal.toFixed(2)),
      ingresos_mes: parseFloat(ingresosMes.toFixed(2)),
      relacion_deuda_ingresos: deuda_ingresos_ratio,
      nivel_riesgo: deuda_ingresos_ratio < 1 ? 'bajo' : deuda_ingresos_ratio < 3 ? 'medio' : 'alto',
      recomendaciones: [
        deuda_ingresos_ratio < 1 ? '✅ Excelente: Tu deuda es menor a 1 mes de ingresos.' : 
        deuda_ingresos_ratio < 3 ? '⚠️ Cuidado: Tu deuda es ' + deuda_ingresos_ratio + ' veces tus ingresos mensuales.' :
        '🔴 CRÍTICO: Tu deuda es ' + deuda_ingresos_ratio + ' veces tus ingresos. Riesgo de insolvencia.',
        
        gastosMes > (ingresosMes * 0.7) ? '🔴 Estás gastando ' + ((gastosMes / ingresosMes * 100).toFixed(1)) + '% de tus ingresos. REDUCE GASTOS.' :
        gastosMes > (ingresosMes * 0.5) ? '⚠️ Gastas el ' + ((gastosMes / ingresosMes * 100).toFixed(1)) + '% de ingresos. Aún hay margen.' :
        '✅ Gastos controlados: Solo el ' + ((gastosMes / ingresosMes * 100).toFixed(1)) + '% de ingresos.',
        
        'Para estar seguro, guarda el 10-20% de tus ingresos en ahorros.',
        'Si tu deuda es alta, aumenta ingresos o reduce gastos drásticamente.'
      ]
    };

    res.json(recomendaciones);
  } catch (error) {
    console.error('Error en presupuesto:', error);
    res.status(500).json({ error: 'Error al calcular presupuesto' });
  }
});

// ============ NUEVO: Historial y tendencias ============
app.get('/api/historial/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  
  try {
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Últimos 12 meses
    const historial = [];
    for (let i = 0; i < 12; i++) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
      const mesFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];

      const gastos = await pool.query(`
        SELECT COALESCE(SUM(c.monto), 0) as total
        FROM compras c
        JOIN tarjetas t ON c.id_tarjeta = t.id_tarjeta
        WHERE t.id_usuario = $1 AND c.fecha BETWEEN $2 AND $3
      `, [id_usuario, mesInicio, mesFin]);

      const ingresos = await pool.query(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM ingresos
        WHERE id_usuario = $1 AND fecha BETWEEN $2 AND $3
      `, [id_usuario, mesInicio, mesFin]);

      historial.unshift({
        periodo: fecha.toLocaleString('es-MX', { month: 'long', year: 'numeric' }),
        gastos: parseFloat(gastos.rows[0].total),
        ingresos: parseFloat(ingresos.rows[0].total),
        saldo: parseFloat(ingresos.rows[0].total) - parseFloat(gastos.rows[0].total)
      });
    }

    res.json(historial);
  } catch (error) {
    console.error('Error en historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
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
