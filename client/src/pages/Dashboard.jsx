import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CreditCard, Activity, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const StatCard = ({ title, value, trend, trendLabel, color, icon: Icon }) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-2xl transition-all hover:shadow-xl border border-gray-100">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs font-semibold mt-3 ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
            {trendLabel}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [tarjetas, setTarjetas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get('/api/usuarios');
        setUsuarios(res.data);
        if (res.data.length > 0) {
          setUsuarioSeleccionado(res.data[0].id_usuario);
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (!usuarioSeleccionado) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [tarjetasRes, comprasRes, pagosRes, ingresosRes, analisisRes] = await Promise.all([
          axios.get(`/api/tarjetas/${usuarioSeleccionado}`),
          axios.get('/api/compras'),
          axios.get('/api/pagos'),
          axios.get(`/api/ingresos/${usuarioSeleccionado}`),
          axios.get(`/api/analisis-financiero/${usuarioSeleccionado}`)
        ]);

        const tarjetasData = tarjetasRes.data;
        const comprasData = comprasRes.data.filter(c => tarjetasData.some(t => t.id_tarjeta === c.id_tarjeta));
        const pagosData = pagosRes.data.filter(p => tarjetasData.some(t => t.id_tarjeta === p.id_tarjeta));
        const ingresosData = ingresosRes.data;

        setTarjetas(tarjetasData);
        setCompras(comprasData);
        setPagos(pagosData);
        setIngresos(ingresosData);
        setAnalisis(analisisRes.data);

        // Calcular estadísticas
        const totalCompras = comprasData.reduce((sum, c) => sum + parseFloat(c.monto), 0);
        const totalPagos = pagosData.reduce((sum, p) => sum + parseFloat(p.monto), 0);
        const totalIngresos = ingresosData.reduce((sum, i) => sum + parseFloat(i.monto), 0);

        setEstadisticas({
          totalCompras,
          totalPagos,
          totalIngresos,
          saldoNeto: totalIngresos - totalCompras,
          utilidadPagos: totalIngresos - (totalCompras - totalPagos)
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [usuarioSeleccionado]);

  // Datos para gráficas
  const gastosPorCategoria = compras.reduce((acc, c) => {
    const cat = acc.find(x => x.name === c.categoria);
    if (cat) {
      cat.value += parseFloat(c.monto);
    } else {
      acc.push({ name: c.categoria, value: parseFloat(c.monto) });
    }
    return acc;
  }, []);

  const gastosPorTarjeta = tarjetas.map(t => {
    const gastosT = compras
      .filter(c => c.id_tarjeta === t.id_tarjeta)
      .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    return {
      name: t.alias,
      gastos: gastosT,
      limite: parseFloat(t.limite_credito),
      disponible: parseFloat(t.limite_credito) - gastosT
    };
  });

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  const usuarioNombre = usuarios.find(u => u.id_usuario === usuarioSeleccionado)?.nombre || 'Usuario';

  if (!usuarioSeleccionado && loading) return <div className="p-10 text-center text-gray-500">Cargando familia...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">¡Hola, {usuarioNombre}! 👋</h1>
            <p className="text-emerald-100 mt-2 text-lg">Tu reporte financiero actualizado en tiempo real</p>
          </div>
          <select
            value={usuarioSeleccionado || ''}
            onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
            className="block px-4 py-3 text-gray-900 bg-white rounded-lg font-medium hover:bg-gray-50 cursor-pointer"
          >
            {usuarios.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-gray-500 mt-4">Calculando tu situación financiera...</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Gastos del Mes"
              value={`$${Number(estadisticas?.totalCompras || 0).toLocaleString()}`}
              trend="down"
              trendLabel={`${compras.length} compras registradas`}
              color="bg-red-500"
              icon={ArrowDown}
            />
            <StatCard
              title="Pagos Realizados"
              value={`$${Number(estadisticas?.totalPagos || 0).toLocaleString()}`}
              trend="up"
              trendLabel={`${pagos.length} pagos`}
              color="bg-green-500"
              icon={ArrowUp}
            />
            <StatCard
              title="Ingresos"
              value={`$${Number(estadisticas?.totalIngresos || 0).toLocaleString()}`}
              trend="up"
              trendLabel={`${ingresos.length} fuentes`}
              color="bg-blue-500"
              icon={TrendingUp}
            />
            <StatCard
              title="Saldo Neto"
              value={`$${Number(estadisticas?.saldoNeto || 0).toLocaleString()}`}
              trend={estadisticas?.saldoNeto >= 0 ? "up" : "down"}
              trendLabel={estadisticas?.saldoNeto >= 0 ? "Positivo ✓" : "Negativo ⚠"}
              color={estadisticas?.saldoNeto >= 0 ? "bg-emerald-500" : "bg-orange-500"}
              icon={CreditCard}
            />
          </div>

          {/* Sección de Alertas */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
              <Activity className="w-6 h-6 mr-3 text-emerald-600" />
              Diagnóstico Financiero
            </h2>

            <div className="space-y-4">
              {analisis?.alertas?.length === 0 ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900">¡Todo se ve excelente!</h3>
                      <p className="text-sm text-green-700 mt-1">No tienes alertas críticas en este momento. Sigue así.</p>
                    </div>
                  </div>
                </div>
              ) : (
                analisis?.alertas?.map((alerta, idx) => (
                  <div key={idx} className={`border-l-4 p-6 rounded-lg ${alerta.nivel === 'critico' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}`}>
                    <div className="flex items-start">
                      <AlertTriangle className={`w-6 h-6 mr-3 flex-shrink-0 mt-0.5 ${alerta.nivel === 'critico' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div>
                        <h3 className={`font-bold ${alerta.nivel === 'critico' ? 'text-red-900' : 'text-yellow-900'}`}>
                          {alerta.mensaje}
                        </h3>
                        <p className={`text-sm mt-1 ${alerta.nivel === 'critico' ? 'text-red-700' : 'text-yellow-700'}`}>
                          💡 {alerta.accion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {analisis?.consejos?.map((consejo, idx) => (
                <div key={`consejo-${idx}`} className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">{consejo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gastos por Categoría */}
            {gastosPorCategoria.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Gastos por Categoría</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gastosPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gastosPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Uso por Tarjeta */}
            {gastosPorTarjeta.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Uso de Tarjetas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorTarjeta}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                    <Bar dataKey="disponible" fill="#10b981" name="Disponible" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabla de Tarjetas */}
          {tarjetas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen de Tarjetas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tarjeta</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Límite</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Gastado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">% Uso</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gastosPorTarjeta.map((t, idx) => {
                      const porcentaje = (t.gastos / t.limite) * 100;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{t.name}</td>
                          <td className="px-6 py-4 text-gray-700">${t.limite.toLocaleString()}</td>
                          <td className="px-6 py-4 text-red-600 font-semibold">${t.gastos.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  porcentaje > 70 ? 'bg-red-600' : porcentaje > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1">{porcentaje.toFixed(1)}%</span>
                          </td>
                          <td className="px-6 py-4 text-green-600 font-semibold">${t.disponible.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
