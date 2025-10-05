import React from 'react';
import { useMapEvents } from 'react-leaflet';

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

export default MapClickHandler;
