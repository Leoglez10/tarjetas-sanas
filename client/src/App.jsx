import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tarjetas from './pages/Tarjetas';
import Movimientos from './pages/Movimientos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tarjetas" element={<Tarjetas />} />
          <Route path="movimientos" element={<Movimientos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
