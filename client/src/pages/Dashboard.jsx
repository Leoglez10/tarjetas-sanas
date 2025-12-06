import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CreditCard, Activity, Users } from 'lucide-react';
import axios from 'axios';

const StatCard = ({ title, value, trend, trendLabel, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {color === 'green' && <ArrowUp className="h-6 w-6 text-emerald-500" />}
                    {color === 'red' && <ArrowDown className="h-6 w-6 text-rose-500" />}
                    {color === 'blue' && <CreditCard className="h-6 w-6 text-sky-500" />}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-lg font-medium text-gray-900">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
                <span className={`font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trendLabel}
                </span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [analisis, setAnalisis] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Cargar Usuarios al iniciar
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
                setLoading(false);
            }
        };
        fetchUsuarios();
    }, []);

    // 2. Cargar Análisis cada vez que cambia el usuario seleccionado
    useEffect(() => {
        if (!usuarioSeleccionado) return;

        const fetchAnalisis = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/analisis-financiero/${usuarioSeleccionado}`);
                setAnalisis(res.data);
            } catch (error) {
                console.error("Error cargando análisis:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalisis();
    }, [usuarioSeleccionado]);

    if (!usuarioSeleccionado && loading) return <div className="p-10 text-center">Cargando familia...</div>;

    return (
        <div className="space-y-6">
            {/* Selector de Usuario */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Hola, {usuarios.find(u => u.id_usuario === usuarioSeleccionado)?.nombre || 'Familia'} 👋
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Aquí está tu reporte financiero en tiempo real.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <select
                        value={usuarioSeleccionado || ''}
                        onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    >
                        {usuarios.map(u => (
                            <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Calculando tus finanzas...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Deuda Total del Mes"
                            value={`$${Number(analisis?.resumen?.total_deuda_mes || 0).toLocaleString()}`}
                            trend={analisis?.resumen?.uso_credito_global_porcentaje < 30 ? "up" : "down"}
                            trendLabel={`${analisis?.resumen?.uso_credito_global_porcentaje}% del límite usado`}
                            color="blue"
                        />
                        {/* Aquí podríamos agregar más tarjetas calculadas si el backend devuelve más datos */}
                    </div>

                    {/* Semáforo y Alertas */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                            Diagnóstico Financiero
                        </h3>

                        <div className="space-y-4">
                            {analisis?.alertas?.length === 0 && (
                                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-emerald-700">
                                                ¡Todo se ve excelente! No tienes alertas críticas por el momento.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {analisis?.alertas?.map((alerta, idx) => (
                                <div key={idx} className={`border-l-4 p-4 ${alerta.nivel === 'critico' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}`}>
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className={`text-sm font-bold ${alerta.nivel === 'critico' ? 'text-red-700' : 'text-yellow-700'}`}>
                                                {alerta.mensaje}
                                            </p>
                                            <p className={`text-sm mt-1 ${alerta.nivel === 'critico' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                💡 {alerta.accion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {analisis?.consejos?.map((consejo, idx) => (
                                <div key={`consejo-${idx}`} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                    <p className="text-sm text-blue-700">{consejo}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
