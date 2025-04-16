import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../index.css';

export default function AdminPanel() {
  const [apartments, setApartments] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [localUpdates, setLocalUpdates] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/apartments')
      .then(res => {
        const filtered = res.data.filter(apt => ['A', 'B', 'C'].includes(apt.block));
        setApartments(filtered);
      })
      .catch(err => console.error('Error fetching apartments:', err));
  }, []);

  const handleSelectChange = (aptId, value) => {
    setLocalUpdates(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], status: value }
    }));
  };

  const handlePriceChange = (aptId, value) => {
    setLocalUpdates(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], price: value }
    }));
  };

  const handleSqmChange = (aptId, value) => {
    setLocalUpdates(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], squareMeter: value }
    }));
  };

  const confirmUpdate = (apartment) => {
    const updatedApartment = localUpdates[apartment._id] || {};
    const { status, price, squareMeter } = updatedApartment;

    if (
      (status === undefined || status === apartment.status) &&
      (price === undefined || Number(price) === Number(apartment.price)) &&
      (squareMeter === undefined || Number(squareMeter) === Number(apartment.squareMeter))
    ) {
      console.log("No changes detected.");
      return;
    }

    axios.post('http://localhost:5000/apartments/update', {
      _id: apartment._id,
      status,
      price,
      squareMeter,
    })
      .then(res => {
        setApartments(prev =>
          prev.map(a => (a._id === res.data._id ? res.data : a))
        );
        setLocalUpdates(prev => {
          const updated = { ...prev };
          delete updated[apartment._id];
          return updated;
        });
      })
      .catch(err => {
        console.error("Error updating apartment:", err.response?.data || err.message);
      });
  };

  const uniqueFloors = Array.from(
    new Set(apartments.filter(a => a.block === selectedBlock).map(a => a.floor))
  ).sort((a, b) => a - b);

  const visibleApartments = apartments.filter(
    a => a.block === selectedBlock && a.floor === selectedFloor
  );

  return (
    <div className="admin-wrapper">
      <div className="block-tabs">
        {['A', 'B', 'C'].map(block => (
          <button
            key={block}
            className={`block-tab ${selectedBlock === block ? 'selected' : ''}`}
            onClick={() => {
              setSelectedBlock(block);
              setSelectedFloor(null);
            }}
          >
            Block {block}
          </button>
        ))}
      </div>

      {selectedBlock && (
        <div className="floor-buttons">
          {uniqueFloors.map(floor => (
            <button
              key={floor}
              className={`floor-button ${selectedFloor === floor ? 'selected' : ''}`}
              onClick={() => setSelectedFloor(floor)}
            >
              Floor {floor}
            </button>
          ))}
        </div>
      )}

      {selectedFloor && (
        <div className="group-section">
          <h2 className="group-title">
            Block {selectedBlock} - Floor {selectedFloor}
          </h2>
          <div className="apartment-grid">
            {visibleApartments.map(apt => {
              const pendingData = localUpdates[apt._id] || {};
              const pendingStatus = pendingData.status ?? apt.status;
              const pendingPrice = pendingData.price ?? apt.price;
              const pendingSqm = pendingData.squareMeter ?? apt.squareMeter;

              const hasChanged =
                pendingStatus !== apt.status ||
                Number(pendingPrice) !== Number(apt.price) ||
                Number(pendingSqm) !== Number(apt.squareMeter);

              return (
                <div key={apt._id} className="apartment-card">
                  <div><strong>{apt.apartmentNumber}</strong></div>

                  <div>
                    <label>Status:</label>
                    <select
                      value={pendingStatus}
                      onChange={(e) => handleSelectChange(apt._id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>

                  <div>
                    <label>Price:</label>
                    <input
                      type="number"
                      value={pendingPrice}
                      onChange={(e) => handlePriceChange(apt._id, e.target.value)}
                      placeholder="Price"
                    />
                  </div>

                  <div>
                    <label>Square Meter:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pendingSqm}
                      onChange={(e) => handleSqmChange(apt._id, e.target.value)}
                      placeholder="m²"
                    />
                  </div>

                  {hasChanged && (
                    <button onClick={() => confirmUpdate(apt)}>Confirm</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
