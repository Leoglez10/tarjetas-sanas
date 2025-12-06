import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, DollarSign, Wallet, Menu, X } from 'lucide-react';

const Layout = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const openGastoModal = () => {
        navigate('/movimientos');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white shadow-lg border-b-2 border-emerald-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                                    💳 Tarjetas Sanas
                                </span>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                                <Link 
                                    to="/" 
                                    className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/tarjetas" 
                                    className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Mis Tarjetas
                                </Link>
                                <Link 
                                    to="/movimientos" 
                                    className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Movimientos
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={openGastoModal}
                                className="hidden sm:inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Registrar Movimiento
                            </button>
                            <button 
                                className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link 
                                to="/" 
                                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 block px-3 py-2 rounded-lg text-sm font-medium"
                                onClick={() => setMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link 
                                to="/tarjetas" 
                                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 block px-3 py-2 rounded-lg text-sm font-medium"
                                onClick={() => setMenuOpen(false)}
                            >
                                Mis Tarjetas
                            </Link>
                            <Link 
                                to="/movimientos" 
                                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 block px-3 py-2 rounded-lg text-sm font-medium"
                                onClick={() => setMenuOpen(false)}
                            >
                                Movimientos
                            </Link>
                            <button 
                                onClick={() => { openGastoModal(); setMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                            >
                                Registrar Movimiento
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
                    <p>💡 Tarjetas Sanas - Economía Saludable Familiar 2025</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
