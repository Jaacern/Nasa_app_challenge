import React from 'react';
import { Circle } from 'react-leaflet';

// Componente de prueba que muestra círculos que cambian con velocidad y ángulo
const VelocityTestCircles = ({ impactLocation, impactAngle, impactVelocity, asteroidData }) => {
  if (!impactLocation || !impactAngle || !impactVelocity || !asteroidData) {
    return null;
  }

  // Usar las mismas fórmulas físicas que ImpactCircle
  const asteroidDiameter = asteroidData?.calculatedProperties?.averageDiameter || 1000;
  const asteroidVelocity = impactVelocity * 1000; // Convertir a m/s
  const impactAngleDegrees = impactAngle;
  
  // Fórmulas físicas de la NASA
  const g = 9.80665;
  const vEsc = 11186;
  const v = Math.sqrt(asteroidVelocity * asteroidVelocity + vEsc * vEsc);
  const vn = v * Math.sin(impactAngleDegrees * Math.PI / 180);
  
  if (vn <= 0 || asteroidDiameter <= 0) return null;
  
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
  const craterRadiusMeters = Df / 2;
  
  const affectedRadiusMeters = craterRadiusMeters * 15; // 15x el cráter
  
  console.log('VelocityTestCircles - Real-time calculations:', {
    velocity_km_s: impactVelocity,
    angle_deg: impactAngleDegrees,
    crater_radius_km: craterRadiusMeters / 1000,
    affected_radius_km: affectedRadiusMeters / 1000
  });

  return (
    <>
      {/* Círculo del área afectada - cambia con velocidad */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={affectedRadiusMeters}
        pathOptions={{
          color: '#ff0000',
          fillColor: '#ff0000',
          fillOpacity: 0.1,
          weight: 2,
          opacity: 0.6,
          dashArray: '10, 5'
        }}
      />
      
      {/* Círculo del cráter - cambia con velocidad */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={craterRadiusMeters}
        pathOptions={{
          color: '#ff4400',
          fillColor: '#ff4400',
          fillOpacity: 0.3,
          weight: 3,
          opacity: 0.8
        }}
      />
      
      {/* Círculo de prueba pequeño fijo para referencia */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={5000} // 5km fijo
        pathOptions={{
          color: '#00ff00',
          fillColor: '#00ff00',
          fillOpacity: 0.2,
          weight: 2,
          opacity: 1
        }}
      />
    </>
  );
};

export default VelocityTestCircles;
