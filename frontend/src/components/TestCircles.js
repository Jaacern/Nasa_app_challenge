import React from 'react';
import { Circle } from 'react-leaflet';

// Componente de prueba simple que siempre muestra círculos
const TestCircles = ({ impactLocation }) => {
  console.log('TestCircles - Component called with:', impactLocation);
  
  if (!impactLocation) {
    console.log('TestCircles - No impact location, returning null');
    return null;
  }

  console.log('TestCircles - About to render circles at:', impactLocation);

  return (
    <>
      {/* Círculo rojo grande - MUY VISIBLE */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={20000} // 20km - muy grande para ser visible
        pathOptions={{
          color: '#ff0000',
          fillColor: '#ff0000',
          fillOpacity: 0.4,
          weight: 6,
          opacity: 1
        }}
      />
      
      {/* Círculo azul mediano */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={10000} // 10km
        pathOptions={{
          color: '#0000ff',
          fillColor: '#0000ff',
          fillOpacity: 0.3,
          weight: 4,
          opacity: 1
        }}
      />
      
      {/* Círculo verde pequeño */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={5000} // 5km
        pathOptions={{
          color: '#00ff00',
          fillColor: '#00ff00',
          fillOpacity: 0.5,
          weight: 3,
          opacity: 1
        }}
      />
    </>
  );
};

export default TestCircles;
