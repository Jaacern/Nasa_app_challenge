import React from 'react';
import { Circle, Popup } from 'react-leaflet';

// === Constantes Tierra ===
const g = 9.80665; // m/s^2
const vEsc = 11186; // m/s (velocidad de escape de la Tierra)
const KG = 1.0; // Constante empírica régimen gravedad
const KS = 1.0; // Constante empírica régimen resistencia
const R_EARTH = 6371000; // Radio de la Tierra en metros

// Tipos de terreno con sus propiedades
const TERRAIN = {
  agua: { rho_t: 1000, Y: 5e5 },
  sedimento: { rho_t: 2000, Y: 5e5 },
  roca: { rho_t: 2650, Y: 1e7 }
};

// Función para convertir grados a radianes
const toRad = (degrees) => degrees * Math.PI / 180;

// Función para calcular metros por píxel en Web Mercator
const metersPerPixel = (lat, zoom) => {
  return (40075016.686 * Math.cos(toRad(lat))) / (256 * Math.pow(2, zoom));
};

// Función principal: π-scaling → radio final (m)
const craterRadius = ({ d_m, vinf_kms, alpha_deg, rho_i = 3200, terrain = "roca" }) => {
  const { rho_t, Y } = TERRAIN[terrain] || TERRAIN.roca;
  const vinf = vinf_kms * 1000; // Convertir km/s a m/s
  const v = Math.sqrt(vinf * vinf + vEsc * vEsc); // Velocidad de impacto total
  const vn = v * Math.sin(toRad(alpha_deg)); // Componente normal
  
  if (vn <= 0 || d_m <= 0) return 0;

  // Régimen de gravedad (impactos grandes)
  const Dt_g = KG * Math.pow(rho_i / rho_t, 1/3) * Math.pow(g, -0.17) *
               Math.pow(vn, 0.44) * Math.pow(d_m, 0.78);

  // Régimen de resistencia (impactos pequeños/material fuerte)
  const Dt_s = KS * Math.pow(rho_i / rho_t, 0.4) * Math.pow(Y, -0.22) *
               Math.pow(vn, 0.79) * Math.pow(d_m, 0.26);

  // Tomar el mayor de los dos regímenes
  const Dt = Math.max(Dt_g, Dt_s);
  
  // Diámetro final (cráteres simples vs complejos)
  const Df = Dt < 3200 ? 1.25 * Dt : 1.3 * Dt;
  
  return Df / 2; // Radio final en metros
};

// Área plana (m²)
const areaPlanar = (Rm) => Math.PI * Rm * Rm;

// Área geodésica (m²) - más precisa para cráteres grandes
const areaGeodesic = (Rm) => {
  const theta = Rm / R_EARTH;
  return 2 * Math.PI * R_EARTH * R_EARTH * (1 - Math.cos(theta));
};

// Componente mejorado para mostrar el círculo de impacto con fórmulas físicas
const ImpactCircle = ({ impactLocation, simulationResults, asteroidData, impactAngle, impactVelocity }) => {
  console.log('ImpactCircle - Props received:', {
    impactLocation,
    simulationResults,
    asteroidData,
    impactAngle,
    impactVelocity
  });

  if (!impactLocation || !asteroidData || !impactAngle || !impactVelocity) {
    console.log('ImpactCircle - Missing required props:', {
      hasImpactLocation: !!impactLocation,
      hasAsteroidData: !!asteroidData,
      hasImpactAngle: !!impactAngle,
      hasImpactVelocity: !!impactVelocity
    });
    return null;
  }

  // Debug: Log para ver qué datos están llegando
  console.log('ImpactCircle - simulationResults:', simulationResults);
  console.log('ImpactCircle - asteroidData:', asteroidData);
  console.log('ImpactCircle - impactAngle:', impactAngle);
  console.log('ImpactCircle - impactVelocity:', impactVelocity);

  // Extraer datos del asteroide
  const asteroidDiameter = asteroidData?.calculatedProperties?.averageDiameter || 
                          asteroidData?.estimated_diameter?.meters?.estimated_diameter_max || 
                          simulationResults?.craterDiameter * 1000 || 1000; // m
  
  const asteroidVelocity = impactVelocity || 
                          asteroidData?.calculatedProperties?.averageVelocity * 1000 || 
                          20000; // m/s por defecto
  
  const impactAngleDegrees = impactAngle || 45; // grados desde horizontal
  
  // Calcular radio del cráter usando fórmulas físicas
  const craterRadiusMeters = craterRadius({
    d_m: asteroidDiameter,
    vinf_kms: asteroidVelocity / 1000, // Convertir a km/s
    alpha_deg: impactAngleDegrees,
    rho_i: 3200, // Densidad típica de asteroide rocoso
    terrain: "roca" // Tipo de terreno
  });

  // Calcular área afectada basada en el radio del cráter (más realista)
  // El área afectada típicamente es 10-50 veces el radio del cráter
  const affectedRadiusMultiplier = 15; // Factor multiplicador para área afectada
  const affectedRadiusMeters = craterRadiusMeters * affectedRadiusMultiplier;
  
  const craterRadiusKm = craterRadiusMeters / 1000;
  const affectedRadiusKm = affectedRadiusMeters / 1000;
  
  // Debug: Log de cálculos físicos
  console.log('ImpactCircle - Physics calculations:');
  console.log('  asteroidDiameter (m):', asteroidDiameter);
  console.log('  asteroidVelocity (m/s):', asteroidVelocity);
  console.log('  impactAngle (deg):', impactAngleDegrees);
  console.log('  craterRadiusMeters:', craterRadiusMeters);
  console.log('  craterRadiusKm:', craterRadiusKm);
  console.log('  affectedRadiusKm:', affectedRadiusKm);
  console.log('  Velocity impact on crater size:', {
    velocity_km_s: asteroidVelocity / 1000,
    angle_deg: impactAngleDegrees,
    crater_radius_km: craterRadiusKm,
    affected_radius_km: affectedRadiusKm
  });

  // Sistema de colores basado en severidad con gradientes
  const getSeverityColors = (severityLevel) => {
    switch (severityLevel?.toUpperCase()) {
      case 'MINIMAL':
        return {
          outer: '#00ff00', // Verde claro
          middle: '#88ff88', // Verde medio
          inner: '#ccffcc', // Verde claro
          crater: '#00cc00' // Verde oscuro
        };
      case 'LOW':
        return {
          outer: '#ffff00', // Amarillo
          middle: '#ffff88', // Amarillo claro
          inner: '#ffffcc', // Amarillo muy claro
          crater: '#cccc00' // Amarillo oscuro
        };
      case 'MODERATE':
        return {
          outer: '#ff8800', // Naranja
          middle: '#ffaa44', // Naranja claro
          inner: '#ffcc88', // Naranja muy claro
          crater: '#cc6600' // Naranja oscuro
        };
      case 'HIGH':
        return {
          outer: '#ff4400', // Rojo-naranja
          middle: '#ff6644', // Rojo-naranja claro
          inner: '#ffaa88', // Rojo-naranja muy claro
          crater: '#cc2200' // Rojo-naranja oscuro
        };
      case 'SEVERE':
        return {
          outer: '#cc0000', // Rojo oscuro
          middle: '#ff4400', // Rojo medio
          inner: '#ff8844', // Rojo claro
          crater: '#cc4400' // Rojo muy oscuro
        };
      case 'CATASTROPHIC':
        return {
          outer: '#880000', // Rojo muy oscuro
          middle: '#cc0000', // Rojo oscuro
          inner: '#ff4400', // Rojo medio
          crater: '#660000' // Rojo extremo
        };
      default:
        return {
          outer: '#666666', // Gris
          middle: '#888888', // Gris medio
          inner: '#aaaaaa', // Gris claro
          crater: '#444444' // Gris oscuro
        };
    }
  };

  const severity = simulationResults?.severity || simulationResults?.results?.severity || 'UNKNOWN';
  const colors = getSeverityColors(severity);

  // Función para formatear números
  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Number(num).toFixed(0);
  };

  // Función para obtener el color del badge de severidad
  const getSeverityBadgeColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'MINIMAL': return 'success';
      case 'LOW': return 'warning';
      case 'MODERATE': return 'warning';
      case 'HIGH': return 'danger';
      case 'SEVERE': return 'danger';
      case 'CATASTROPHIC': return 'dark';
      default: return 'secondary';
    }
  };

  console.log('ImpactCircle - About to render circles with data:', {
    craterRadiusKm,
    affectedRadiusKm,
    severity,
    colors
  });

  // Calcular radios REALES usando las fórmulas físicas de la NASA
  const realCraterRadiusMeters = craterRadiusMeters; // Ya calculado arriba con fórmulas físicas
  const realAffectedRadiusMeters = affectedRadiusMeters; // Ya calculado arriba
  
  console.log('ImpactCircle - REAL calculated radii:', {
    realCraterRadiusMeters,
    realAffectedRadiusMeters,
    craterRadiusKm,
    affectedRadiusKm
  });

  return (
    <>
      {/* Círculo exterior - área de impacto general (usando radio REAL) */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={realAffectedRadiusMeters} // Radio REAL calculado físicamente
        pathOptions={{
          color: colors.outer,
          fillColor: colors.outer,
          fillOpacity: 0.05,
          weight: 1,
          opacity: 0.4,
          dashArray: '10, 5'
        }}
      />
      
      {/* Círculo medio - área de daño moderado (70% del área afectada REAL) */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={realAffectedRadiusMeters * 0.7} // 70% del radio REAL
        pathOptions={{
          color: colors.middle,
          fillColor: colors.middle,
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5'
        }}
      />
      
      {/* Círculo interior - área de daño severo (40% del área afectada REAL) */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={realAffectedRadiusMeters * 0.4} // 40% del radio REAL
        pathOptions={{
          color: colors.inner,
          fillColor: colors.inner,
          fillOpacity: 0.25,
          weight: 2,
          opacity: 0.7
        }}
      />
      
      {/* Círculo del cráter - área de destrucción total (radio REAL del cráter) */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={realCraterRadiusMeters} // Radio REAL del cráter calculado físicamente
        pathOptions={{
          color: colors.crater,
          fillColor: colors.crater,
          fillOpacity: 0.4,
          weight: 3,
          opacity: 0.9
        }}
      />
      
      {/* Círculo de prueba MUY VISIBLE - para verificar que funciona */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={10000} // 10km de radio fijo para prueba
        pathOptions={{
          color: '#ff0000',
          fillColor: '#ff0000',
          fillOpacity: 0.5,
          weight: 5,
          opacity: 1
        }}
      />
      
      {/* Círculo de prueba pequeño - para verificar que funciona */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={5000} // 5km de radio fijo para prueba
        pathOptions={{
          color: '#00ff00',
          fillColor: '#00ff00',
          fillOpacity: 0.3,
          weight: 3,
          opacity: 1
        }}
      />
      
      {/* Círculo central - punto de impacto exacto con popup */}
      <Circle
        center={[impactLocation.lat, impactLocation.lng]}
        radius={1000} // 1km de radio fijo para el punto central
        pathOptions={{
          color: '#ffffff',
          fillColor: '#ffffff',
          fillOpacity: 0.8,
          weight: 2,
          opacity: 1
        }}
      >
        <Popup>
          <div style={{ minWidth: '300px', fontFamily: 'Arial, sans-serif' }}>
            <h6 style={{ margin: '0 0 10px 0', color: '#333' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Impact Simulation Results (Physics-Based)
            </h6>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Impact Energy:</strong><br/>
              <span style={{ color: '#ff6600' }}>
                {formatNumber(simulationResults?.energy || 0)} Joules
              </span><br/>
              <small style={{ color: '#666' }}>
                TNT Equivalent: {formatNumber(simulationResults?.tntEquivalent || 0)} tons
              </small>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Crater (Physics):</strong><br/>
              <span style={{ color: '#ff6600' }}>
                Radius: {craterRadiusKm.toFixed(2)} km
              </span><br/>
              <small style={{ color: '#666' }}>
                Diameter: {(craterRadiusKm * 2).toFixed(2)} km
              </small>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Affected Area:</strong><br/>
              <span style={{ color: '#ff6600' }}>
                Radius: {affectedRadiusKm.toFixed(2)} km
              </span><br/>
              <small style={{ color: '#666' }}>
                Area: {(Math.PI * affectedRadiusKm * affectedRadiusKm).toFixed(0)} km²
              </small>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Impact Severity:</strong><br/>
              <span className={`badge bg-${getSeverityBadgeColor(severity)}`}>
                {severity || 'Unknown'}
              </span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Affected Area:</strong><br/>
              <span style={{ color: '#ff6600' }}>
                Radius: {affectedRadiusKm.toFixed(2)} km
              </span><br/>
              <small style={{ color: '#666' }}>
                Area: {(Math.PI * affectedRadiusKm * affectedRadiusKm).toFixed(0)} km²
              </small>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Estimated Casualties:</strong><br/>
              <span style={{ color: '#ff0000' }}>
                {formatNumber(simulationResults?.estimatedCasualties || 0)}
              </span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Economic Impact:</strong><br/>
              <span style={{ color: '#ff0000' }}>
                ${formatNumber(simulationResults?.economicImpact || 0)}
              </span>
            </div>

            <hr style={{ margin: '10px 0' }} />
            
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              <strong>Physics Parameters:</strong><br/>
              Asteroid Diameter: {(asteroidDiameter / 1000).toFixed(2)} km<br/>
              Impact Velocity: {(asteroidVelocity / 1000).toFixed(1)} km/s<br/>
              Impact Angle: {impactAngleDegrees}°<br/>
              Terrain: Rock (ρ=2650 kg/m³, Y=10⁷ Pa)<br/>
              <strong>Calculated Radii:</strong><br/>
              Crater Radius: {craterRadiusKm.toFixed(2)} km<br/>
              Affected Radius: {affectedRadiusKm.toFixed(2)} km<br/>
              Multiplier: {affectedRadiusMultiplier}x
            </div>

            {simulationResults?.mitigationStrategies && (
              <div style={{ marginTop: '10px' }}>
                <strong>Mitigation Strategies:</strong><br/>
                <ul style={{ fontSize: '0.8em', margin: '5px 0', paddingLeft: '15px' }}>
                  {simulationResults?.mitigationStrategies?.slice(0, 3).map((strategy, index) => (
                    <li key={index}>{strategy}</li>
                  ))}
                  {simulationResults?.mitigationStrategies?.length > 3 && (
                    <li>...and {simulationResults?.mitigationStrategies?.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Popup>
      </Circle>
    </>
  );
};

export default ImpactCircle;