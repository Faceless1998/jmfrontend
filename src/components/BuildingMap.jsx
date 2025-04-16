import React, { useEffect } from 'react';
import axios from 'axios';

export default function BuildingMap() {
  useEffect(() => {
    axios.get('http://localhost:5000/apartments')
      .then(res => {
        res.data.forEach(({ block, floor, apartmentNumber, status }) => {
          const el = document.querySelector(`[data-block="${block}"][data-floor="${floor}"][data-apartment="${apartmentNumber}"]`);
          if (el) {
            el.classList.remove('active', 'sold', 'reserved');
            el.classList.add(status);
          }
        });
      });
  }, []);

  return (
    <svg id="buildingMap">
      <path data-block="A" data-floor="1" data-apartment="101" className="apartment" d="M10,10 L50,10 L50,50 L10,50 Z"/>
      <path data-block="A" data-floor="1" data-apartment="102" className="apartment" d="M60,10 L100,10 L100,50 L60,50 Z"/>
    </svg>
  );
}