import React from 'react';
import AdminPanel from './components/AdminPanel';
import BuildingMap from './components/BuildingMap';

export default function App() {
  return (
    <div>
      <h1>Apartment Management</h1>
      <AdminPanel />
      <BuildingMap />
    </div>
  );
}