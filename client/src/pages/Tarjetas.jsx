import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Loader, X } from 'lucide-react';
import axios from 'axios';

const Tarjetas = () => {
    const [tarjetas, setTarjetas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        tipo: 'credito',
        tasa_interes_anual: 36
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tarjetasRes, usuariosRes] = await Promise.all([
                    axios.get('/api/tarjetas'),
                    axios.get('/api/usuarios')
                ]);
                setTarjetas(tarjetasRes.data);
                setUsuarios(usuariosRes.data);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/tarjetas', formData);
            setTarjetas([...tarjetas, res.data]);
            setShowModal(false);
            setFormData({ tipo: 'credito', tasa_interes_anual: 36 });
        } catch (error) {
            console.error('Error al crear tarjeta:', error);
            alert('Error al crear la tarjeta');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-emerald-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Tarjetas</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Tarjeta
                </button>
            </div>

            {tarjetas.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tarjetas</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza registrando tu primera tarjeta de crédito o débito.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tarjetas.map((tarjeta) => (
                        <div key={tarjeta.id_tarjeta} className={`overflow-hidden shadow rounded-xl border relative transition-all hover:shadow-lg ${
                            tarjeta.tipo === 'credito' 
                                ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white' 
                                : 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white'
                        }`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <CreditCard className="w-10 h-10 opacity-80" />
                                    <span className="text-xs uppercase tracking-wider opacity-80">
                                        {tarjeta.tipo}
                                    </span>
                                </div>
                                <p className="text-lg tracking-widest mb-4 font-mono">**** **** **** {tarjeta.ultimos4}</p>
                                <h3 className="text-xl font-bold">{tarjeta.alias}</h3>
                                <p className="text-sm opacity-80">{tarjeta.banco}</p>

                                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="opacity-70 block">Límite</span>
                                        <span className="font-bold">${Number(tarjeta.limite_credito).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="opacity-70 block">Corte/Pago</span>
                                        <span className="font-bold">{tarjeta.fecha_corte_dia}/{tarjeta.fecha_pago_dia}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Nueva Tarjeta */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-medium">Nueva Tarjeta</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dueño</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    onChange={(e) => setFormData({ ...formData, id_usuario: Number(e.target.value) })}
                                >
                                    <option value="">¿De quién es esta tarjeta?</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Banco</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: BBVA, Banamex"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    >
                                        <option value="credito">Crédito</option>
                                        <option value="debito">Débito</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alias</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Azul BBVA"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Últimos 4 dígitos</label>
                                    <input
                                        type="text"
                                        maxLength="4"
                                        required
                                        placeholder="1234"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, ultimos4: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Límite de Crédito</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="50000"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    onChange={(e) => setFormData({ ...formData, limite_credito: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Día de Corte</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        placeholder="15"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, fecha_corte_dia: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Día de Pago</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        placeholder="5"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        onChange={(e) => setFormData({ ...formData, fecha_pago_dia: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tasa de Interés Anual (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    defaultValue="36"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    onChange={(e) => setFormData({ ...formData, tasa_interes_anual: Number(e.target.value) })}
                                />
                                <p className="text-xs text-gray-500 mt-1">La tasa mensual se calculará automáticamente</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                                >
                                    Guardar Tarjeta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tarjetas;
