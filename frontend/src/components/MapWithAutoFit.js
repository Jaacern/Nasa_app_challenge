import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import ImpactCircle from './ImpactCircle';
import ImpactLegend from './ImpactLegend';
import MapClickHandler from './MapClickHandler';
import TestCircles from './TestCircles';
import VelocityTestCircles from './VelocityTestCircles';
import useMapAutoFit from '../hooks/useMapAutoFit';

// Componente interno que usa el hook dentro del MapContainer
const MapContent = ({ 
  impactLocation, 
  simulationResults, 
  selectedAsteroid, 
  impactAngle, 
  impactVelocity,
  onLocationSelect 
}) => {
  // Calcular radio del cráter para auto-encuadre
  const craterRadiusMeters = React.useMemo(() => {
    if (!selectedAsteroid || !impactVelocity || !impactAngle) return 0;
    
    const asteroidDiameter = selectedAsteroid?.calculatedProperties?.averageDiameter || 1000;
    const asteroidVelocity = impactVelocity * 1000; // Convertir a m/s
    
    // Fórmulas físicas simplificadas para el cálculo
    const g = 9.80665;
    const vEsc = 11186;
    const v = Math.sqrt(asteroidVelocity * asteroidVelocity + vEsc * vEsc);
    const vn = v * Math.sin(impactAngle * Math.PI / 180);
    
    if (vn <= 0 || asteroidDiameter <= 0) return 0;
    
    const rho_i = 3200; // Densidad del asteroide
    const rho_t = 2650; // Densidad del terreno
    const Y = 1e7; // Resistencia del terreno
    
    // Régimen de gravedad
    const Dt_g = Math.pow(rho_i / rho_t, 1/3) * Math.pow(g, -0.17) *
                 Math.pow(vn, 0.44) * Math.pow(asteroidDiameter, 0.78);
    
    // Régimen de resistencia
    const Dt_s = Math.pow(rho_i / rho_t, 0.4) * Math.pow(Y, -0.22) *
                 Math.pow(vn, 0.79) * Math.pow(asteroidDiameter, 0.26);
    
    const Dt = Math.max(Dt_g, Dt_s);
    const Df = Dt < 3200 ? 1.25 * Dt : 1.3 * Dt;
    
    return Df / 2; // Radio en metros
  }, [selectedAsteroid, impactVelocity, impactAngle]);

  // Usar el hook de auto-encuadre (ahora dentro del MapContainer)
  useMapAutoFit(craterRadiusMeters, impactLocation);

  // Crear icono personalizado para el marcador de impacto
  const impactIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: #ff0000;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 10px rgba(255,0,0,0.8);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  console.log('MapContent - Rendering with props:', {
    impactLocation,
    simulationResults,
    selectedAsteroid,
    impactAngle,
    impactVelocity
  });

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <Marker 
        position={[impactLocation.lat, impactLocation.lng]} 
        icon={impactIcon}
      />
      {/* Círculos de prueba - siempre visibles */}
      <TestCircles impactLocation={impactLocation} />
      
      {/* Círculos que cambian con velocidad y ángulo en tiempo real */}
      {impactLocation && selectedAsteroid && impactAngle && impactVelocity && (
        <VelocityTestCircles 
          impactLocation={impactLocation}
          impactAngle={impactAngle}
          impactVelocity={impactVelocity}
          asteroidData={selectedAsteroid}
        />
      )}
      
      {/* Mostrar círculo de impacto si hay parámetros válidos */}
      {impactLocation && selectedAsteroid && impactAngle && impactVelocity && (
        <>
          <ImpactCircle 
            impactLocation={impactLocation}
            simulationResults={simulationResults?.results || simulationResults}
            asteroidData={selectedAsteroid}
            impactAngle={impactAngle}
            impactVelocity={impactVelocity}
          />
        </>
      )}
    </>
  );
};

// Componente wrapper principal
const MapWithAutoFit = ({ 
  impactLocation, 
  simulationResults, 
  selectedAsteroid, 
  impactAngle, 
  impactVelocity,
  onLocationSelect 
}) => {
  return (
    <>
      <MapContainer
        center={impactLocation ? [impactLocation.lat, impactLocation.lng] : [0, 0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <MapContent
          impactLocation={impactLocation}
          simulationResults={simulationResults}
          selectedAsteroid={selectedAsteroid}
          impactAngle={impactAngle}
          impactVelocity={impactVelocity}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
      {/* Mostrar leyenda si hay resultados de simulación */}
      {simulationResults && (
        <ImpactLegend simulationResults={simulationResults?.results || simulationResults} />
      )}
    </>
  );
};

export default MapWithAutoFit;