import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Plus, X, Loader } from 'lucide-react';
import axios from 'axios';

const Movimientos = () => {
  const [tab, setTab] = useState('compras');
  const [compras, setCompras] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comprasRes, pagosRes, ingresosRes, tarjetasRes, usuariosRes] = await Promise.all([
          axios.get('/api/compras'),
          axios.get('/api/pagos'),
          axios.get('/api/ingresos'),
          axios.get('/api/tarjetas'),
          axios.get('/api/usuarios')
        ]);
        setCompras(comprasRes.data);
        setPagos(pagosRes.data);
        setIngresos(ingresosRes.data);
        setTarjetas(tarjetasRes.data);
        setUsuarios(usuariosRes.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'compras') {
        const res = await axios.post('/api/compras', formData);
        setCompras([res.data, ...compras]);
      } else if (tab === 'pagos') {
        const res = await axios.post('/api/pagos', formData);
        setPagos([res.data, ...pagos]);
      } else {
        const res = await axios.post('/api/ingresos', formData);
        setIngresos([res.data, ...ingresos]);
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el registro');
    }
  };

  const openModal = () => {
    setFormData({});
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  const tabs = [
    { id: 'compras', label: 'Compras', icon: ShoppingCart, color: 'text-rose-500' },
    { id: 'pagos', label: 'Pagos', icon: DollarSign, color: 'text-emerald-500' },
    { id: 'ingresos', label: 'Ingresos', icon: TrendingUp, color: 'text-blue-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Movimientos</h2>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo {tab === 'compras' ? 'Gasto' : tab === 'pagos' ? 'Pago' : 'Ingreso'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <t.icon className={`w-5 h-5 mr-2 ${t.color}`} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Lista de Movimientos */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {tab === 'compras' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MSI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {compras.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No hay compras registradas</td></tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id_compra}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 font-medium">-${Number(c.monto).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.es_msi ? `${c.meses_msi} meses` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'pagos' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No hay pagos registrados</td></tr>
              ) : (
                pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.tipo_pago}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.metodo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">+${Number(p.monto).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.notas || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'ingresos' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingresos.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">No hay ingresos registrados</td></tr>
              ) : (
                ingresos.map((i) => (
                  <tr key={i.id_ingreso}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(i.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.fuente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">+${Number(i.monto).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para agregar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                {tab === 'compras' ? 'Registrar Compra' : tab === 'pagos' ? 'Registrar Pago' : 'Registrar Ingreso'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {tab === 'compras' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, id_tarjeta: Number(e.target.value) })}
                    >
                      <option value="">Selecciona una tarjeta</option>
                      {tarjetas.map((t) => (
                        <option key={t.id_tarjeta} value={t.id_tarjeta}>{t.alias} - {t.banco}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      <option value="Comida">Comida</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Compras">Compras</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => setFormData({ ...formData, es_msi: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Meses Sin Intereses</span>
                    </label>
                    {formData.es_msi && (
                      <select
                        className="border border-gray-300 rounded-md shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, meses_msi: Number(e.target.value) })}
                      >
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="18">18 meses</option>
                      </select>
                    )}
                  </div>
                </>
              )}

              {tab === 'pagos' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, id_tarjeta: Number(e.target.value) })}
                    >
                      <option value="">Selecciona una tarjeta</option>
                      {tarjetas.map((t) => (
                        <option key={t.id_tarjeta} value={t.id_tarjeta}>{t.alias} - {t.banco}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
                    >
                      <option value="total">Pago Total</option>
                      <option value="minimo">Pago Mínimo</option>
                      <option value="parcial">Pago Parcial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método</label>
                    <input
                      type="text"
                      placeholder="Transferencia, Efectivo, etc."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    />
                  </div>
                </>
              )}

              {tab === 'ingresos' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, id_usuario: Number(e.target.value) })}
                    >
                      <option value="">Selecciona quién recibió el ingreso</option>
                      {usuarios.map((u) => (
                        <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fuente</label>
                    <input
                      type="text"
                      placeholder="Sueldo, Freelance, Venta, etc."
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
                    />
                  </div>
                </>
              )}

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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimientos;
