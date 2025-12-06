# 🎯 Sistema Financiero Inteligente - Funcionalidades Avanzadas

**Versión:** 2.0 - Sistema Coherente Implementado  
**Fecha:** Diciembre 5, 2025

---

## 📋 Resumen de Mejoras

El backend ahora es **completamente coherente** con lógica financiera real. Cada acción tiene consecuencias inmediatas:

✅ Compra → Baja crédito disponible  
✅ No pago → Generan intereses automáticos  
✅ Pago → Restaura crédito disponible  
✅ Ingresos → Influyen en recomendación de gasto máximo  
✅ Gastos excesivos → Alertas de riesgo de insolvencia  

---

## 🏦 Funciones Principales Implementadas

### **1. COMPRAS CON VALIDACIÓN DE CRÉDITO**

**Endpoint:** `POST /api/compras`

**Flujo:**
1. Verificar que la tarjeta existe
2. Calcular crédito disponible actual (límite - deuda)
3. **Si la compra excede el disponible → RECHAZAR**
4. Si es válida → Restar del crédito disponible
5. Retornar estado actualizado

**Request:**
```json
{
  "id_tarjeta": 1,
  "descripcion": "Mercado Soriana",
  "monto": 450.50,
  "categoria": "Comida",
  "fecha": "2025-12-05"
}
```

**Response (201 - Éxito):**
```json
{
  "id_compra": 1,
  "id_tarjeta": 1,
  "descripcion": "Mercado Soriana",
  "monto": 450.50,
  "categoria": "Comida",
  "disponible_anterior": 50000.00,
  "disponible_ahora": 49549.50,
  "mensaje": "Compra registrada. Crédito disponible ahora: $49,549.50"
}
```

**Response (400 - Crédito insuficiente):**
```json
{
  "error": "Crédito insuficiente. Disponible: $500.00, Intenta gastar: $600.00",
  "disponible_actual": 500.00,
  "falta": 100.00
}
```

---

### **2. PAGOS CON ACTUALIZACIÓN DE DEUDA**

**Endpoint:** `POST /api/pagos`

**Flujo:**
1. Verificar que la tarjeta existe
2. Calcular deuda actual (compras - pagos anteriores)
3. **Si el pago excede la deuda → RECHAZAR**
4. Si es válida → Registrar el pago
5. Calcular nueva deuda y crédito disponible
6. Retornar estado actualizado

**Request:**
```json
{
  "id_tarjeta": 1,
  "tipo_pago": "parcial",
  "monto": 2500.00,
  "metodo": "Transferencia",
  "notas": "Pago mensual",
  "fecha": "2025-12-05"
}
```

**Response (201 - Éxito):**
```json
{
  "id_pago": 1,
  "id_tarjeta": 1,
  "tipo_pago": "parcial",
  "monto": 2500.00,
  "metodo": "Transferencia",
  "deuda_anterior": 5000.00,
  "deuda_restante": 2500.00,
  "credito_disponible": 47500.00,
  "mensaje": "Pago registrado. Deuda restante: $2,500.00, Crédito disponible: $47,500.00"
}
```

---

### **3. ANÁLISIS FINANCIERO INTEGRAL**

**Endpoint:** `GET /api/analisis-financiero/:id_usuario`

**Información Completa Retornada:**

#### **A. Resumen Financiero**
```json
{
  "usuario": "Leo",
  "resumen": {
    "ingresos_mes": 15000.00,
    "gastos_mes": 8500.75,
    "saldo_neto": 6499.25,
    "deuda_total": 8500.75,
    "interes_total_mensual": 212.52,
    "credito_disponible_total": 41499.25,
    "porcentaje_deuda_global": 17.01
  }
}
```

#### **B. Recomendaciones Inteligentes**
```json
{
  "recomendaciones": {
    "gasto_maximo_mes": 10500.00,
    "gasto_restante_disponible": 1999.25,
    "pago_recomendado_mes": 8713.27,
    "consejo": "Paga al menos los intereses para no crecer tu deuda"
  }
}
```

**Lógica:**
- `gasto_maximo_mes` = Ingresos × 70%
- `gasto_restante_disponible` = Gasto máximo - gasto actual
- `pago_recomendado_mes` = Deuda + Intereses (para no crecer deuda)

#### **C. Análisis por Tarjeta**
```json
{
  "tarjetas": [
    {
      "id_tarjeta": 1,
      "alias": "Visa Santander",
      "banco": "Santander",
      "limite": 50000.00,
      "deuda": 8500.75,
      "disponible": 41499.25,
      "porcentaje_uso": 17.01,
      "tasa_interes_mensual": 2.5,
      "interes_mensual": 212.52,
      "estado": "verde"
    }
  ]
}
```

**Estados:**
- 🟢 Verde: < 30% uso (saludable)
- 🟡 Amarillo: 30-70% uso (precaución)
- 🔴 Rojo: > 70% uso (crítico)

#### **D. Alertas Contextuales**

**Alerta por tarjeta sobrecargada:**
```json
{
  "nivel": "critico",
  "tarjeta": "Visa Santander",
  "mensaje": "🔴 CRÍTICO: Tu Visa Santander está al 85% de uso. DEJA DE USAR INMEDIATAMENTE.",
  "accion": "Paga el saldo completo para no generar más intereses.",
  "deuda": 42500.00,
  "interes_proximo_mes": 1062.50
}
```

**Alerta por gastos mayores a ingresos:**
```json
{
  "nivel": "critico",
  "mensaje": "🔴 RIESGO CRÍTICO: Estás gastando más de lo que ganas este mes.",
  "accion": "Reduce gastos inmediatamente. Riesgo de endeudamiento acelerado.",
  "deficit": 5000.00
}
```

**Alerta por deuda muy alta:**
```json
{
  "nivel": "alerta",
  "mensaje": "⚠️ Tu deuda total ($125,000) es 5 veces tus ingresos mensuales.",
  "accion": "Planifica pagos agresivos. Tu deuda crece con intereses cada mes.",
  "deuda_meses": 8.3
}
```

#### **E. Proyección de Deuda**

```json
{
  "proyeccion": {
    "deuda_actual": 8500.75,
    "interes_por_mes": 212.52,
    "deuda_3_meses_sin_pagar": 9137.81,
    "deuda_6_meses_sin_pagar": 9775.87,
    "deuda_12_meses_sin_pagar": 11051.99,
    "advertencia": "Si no pagas, la deuda crece exponencialmente cada mes."
  }
}
```

**Cálculo:**
- Mes 1: Deuda + (Deuda × tasa_mensual)
- Mes 2: Nueva_deuda + (Nueva_deuda × tasa_mensual)
- ... (crece exponencialmente)

---

### **4. SIMULADOR DE INTERESES AVANZADO**

**Endpoint:** `POST /api/simular-intereses`

**Request:**
```json
{
  "monto_compra": 5000,
  "tasa_anual": 25,
  "meses_pago": 12
}
```

**Response:**
```json
{
  "monto_original": 5000,
  "tasa_anual": 25,
  "tasa_mensual": 2.08,
  "interes_primer_mes": 104.17,
  "pago_minimo_estimado": 258.09,
  "interes_total_12_meses": 1659.01,
  "deuda_total_con_interes": 6659.01,
  "simulacion": [
    {
      "mes": 1,
      "interes_mes": 104.17,
      "deuda_acumulada": 5104.17
    },
    {
      "mes": 2,
      "interes_mes": 106.26,
      "deuda_acumulada": 5210.43
    },
    // ... 12 meses
  ],
  "advertencia": "🔴 ALERTA CRÍTICA: Esta tasa es MUY ALTA. Si no pagas el total al mes siguiente, la deuda crece exponencialmente.",
  "recomendacion": "Paga el total de la compra al mes siguiente. No esperes a que genere intereses."
}
```

---

### **5. PRESUPUESTO INTELIGENTE**

**Endpoint:** `GET /api/presupuesto/:id_usuario`

**Response:**
```json
{
  "gasto_total_mes": 8500.75,
  "gasto_maximo_recomendado": 10500.00,
  "gasto_restante": 1999.25,
  "deuda_total": 8500.75,
  "ingresos_mes": 15000.00,
  "relacion_deuda_ingresos": 0.57,
  "nivel_riesgo": "bajo",
  "recomendaciones": [
    "✅ Excelente: Tu deuda es menor a 1 mes de ingresos.",
    "✅ Gastos controlados: Solo el 56.7% de ingresos.",
    "Para estar seguro, guarda el 10-20% de tus ingresos en ahorros.",
    "Si tu deuda es alta, aumenta ingresos o reduce gastos drásticamente."
  ]
}
```

**Niveles de Riesgo:**
| Relación D/I | Riesgo | Interpretación |
|---|---|---|
| < 1 | Bajo | Deuda < 1 mes de ingresos (Seguro) |
| 1-3 | Medio | Deuda entre 1-3 meses de ingresos (Cuidado) |
| > 3 | Alto | Deuda > 3 meses de ingresos (Crítico) |

---

### **6. HISTORIAL Y TENDENCIAS**

**Endpoint:** `GET /api/historial/:id_usuario`

**Response (últimos 12 meses):**
```json
[
  {
    "periodo": "diciembre 2024",
    "gastos": 8500.75,
    "ingresos": 15000.00,
    "saldo": 6499.25
  },
  {
    "periodo": "noviembre 2024",
    "gastos": 7200.50,
    "ingresos": 15000.00,
    "saldo": 7799.50
  },
  // ... más meses
]
```

**Uso:**
- Ver tendencias de gastos
- Identificar patrones de consumo
- Detectar meses con déficit
- Planificar mejor para el futuro

---

## 💡 Ejemplos de Flujos Reales

### **Escenario 1: Leo hace una compra y después paga**

**1. Leo consulta su disponible inicial:**
```bash
GET /api/analisis-financiero/1
```
Respuesta: 
```
deuda_total: 0
credito_disponible: 50000
```

**2. Leo intenta comprar $60,000 (excede límite):**
```bash
POST /api/compras
{
  "id_tarjeta": 1,
  "monto": 60000,
  "descripcion": "Laptop cara"
}
```
Respuesta (400):
```json
{
  "error": "Crédito insuficiente. Disponible: $50,000, Intenta gastar: $60,000",
  "falta": 10000
}
```

**3. Leo compra correctamente $8,500:**
```bash
POST /api/compras
{
  "id_tarjeta": 1,
  "monto": 8500,
  "descripcion": "Laptop"
}
```
Respuesta (201):
```json
{
  "disponible_anterior": 50000,
  "disponible_ahora": 41500,
  "mensaje": "Compra registrada. Crédito disponible ahora: $41,500"
}
```

**4. Análisis actualizado:**
```bash
GET /api/analisis-financiero/1
```
Respuesta:
```json
{
  "deuda_total": 8500,
  "credito_disponible": 41500,
  "interes_mensual": 212.50,
  "proyeccion": {
    "deuda_3_meses_sin_pagar": 9137.81,
    "advertencia": "Si no pagas, la deuda crece..."
  }
}
```

**5. Leo paga $5,000:**
```bash
POST /api/pagos
{
  "id_tarjeta": 1,
  "monto": 5000,
  "tipo_pago": "parcial"
}
```
Respuesta (201):
```json
{
  "deuda_anterior": 8500,
  "deuda_restante": 3500,
  "credito_disponible": 46500,
  "mensaje": "Pago registrado. Deuda restante: $3,500"
}
```

**6. Nuevo análisis:**
```bash
GET /api/analisis-financiero/1
```
Respuesta:
```json
{
  "deuda_total": 3500,
  "credito_disponible": 46500,
  "interes_mensual": 87.50,
  "recomendacion": "Paga el resto para dejar de generar intereses"
}
```

---

### **Escenario 2: Mamá está en riesgo de insolvencia**

**Mamá tiene:**
- Ingresos mes: $10,000
- Gastos mes: $12,000 (¡más de lo que gana!)
- Deuda: $30,000
- Relación deuda-ingresos: 3.0

**Análisis:**
```bash
GET /api/analisis-financiero/2
```

Respuesta con ALERTAS:
```json
{
  "alertas": [
    {
      "nivel": "critico",
      "mensaje": "🔴 RIESGO CRÍTICO: Estás gastando más de lo que ganas este mes.",
      "deficit": 2000,
      "accion": "Reduce gastos inmediatamente."
    },
    {
      "nivel": "alerta",
      "mensaje": "⚠️ Tu deuda ($30,000) es 3 veces tus ingresos mensuales.",
      "accion": "Planifica pagos agresivos."
    }
  ],
  "riesgo": "muy_alto",
  "proyeccion": {
    "deuda_12_meses_sin_pagar": 42500,
    "advertencia": "Riesgo de insolvencia en 6 meses"
  }
}
```

---

## 📊 Matriz de Decisión

El sistema toma decisiones basadas en:

```
COMPRA
├─ ¿Existe tarjeta? NO → Error
├─ ¿Deuda <= Disponible? NO → Rechazar
└─ SÍ → Registrar y restar disponible

PAGO
├─ ¿Existe tarjeta? NO → Error
├─ ¿Pago <= Deuda? NO → Rechazar
└─ SÍ → Registrar y restaurar disponible

ANÁLISIS
├─ Calcular deuda real = Compras - Pagos
├─ Calcular intereses = Deuda × (Tasa/100)
├─ Calcular riesgo basado en:
│  ├─ % de deuda vs límite
│  ├─ Deuda vs ingresos mensuales
│  ├─ Gastos vs ingresos
│  └─ Proyección de deuda
├─ Generar alertas por cada condición
└─ Retornar recomendaciones
```

---

## 🔒 Validaciones Implementadas

| Acción | Validación | Error |
|--------|-----------|-------|
| Comprar | Tarjeta existe | 404 |
| Comprar | Crédito disponible >= monto | 400 |
| Pagar | Tarjeta existe | 404 |
| Pagar | Pago <= deuda | 400 |
| Analizar | Usuario existe | 404 |

---

## 📈 Métricas y Ratios Calculados

```javascript
// Deuda real
deuda_total = SUM(compras) - SUM(pagos)

// Crédito disponible
disponible = limite_credito - deuda_total

// Porcentaje de uso
uso_porcentaje = (deuda_total / limite_credito) × 100

// Interés mensual
interes_mensual = deuda × (tasa_anual / 100 / 12)

// Relación deuda-ingresos
ratio_d_i = deuda_total / ingresos_mes

// Gasto máximo recomendado
gasto_max = ingresos_mes × 0.70

// Pago recomendado
pago_recomendado = deuda + interes_mensual
```

---

## 🎯 Beneficios del Sistema

1. ✅ **Realista:** Dinero no aparece de la nada
2. ✅ **Educativo:** Muestra consecuencias de no pagar
3. ✅ **Preventivo:** Alertas antes de insolvencia
4. ✅ **Coherente:** Cada acción tiene efecto
5. ✅ **Recomendador:** Sugiere gastos seguros basados en ingresos
6. ✅ **Proyector:** Muestra deuda futura si no pagas
7. ✅ **Transparente:** Explica cálculos y decisiones

---

## 🚀 Próximas Mejoras

- [ ] Envío de notificaciones push cuando deuda es crítica
- [ ] Sugerencias automáticas de reducción de gastos
- [ ] Comparación entre usuarios (benchmarking)
- [ ] Objetivos de ahorro personalizados
- [ ] Integración con APIs de bancos reales
- [ ] Machine learning para detectar fraude
- [ ] Reportes PDF con historial completo

---

**Desarrollador:** Leo Glez  
**Última actualización:** Diciembre 5, 2025  
**Versión:** 2.0 - Sistema Inteligente Implementado ✅
