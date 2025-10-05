import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 🌍 Textured Earth sphere with clouds
const EarthSphere = () => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const [earthColorMap, earthNormalMap, earthClouds] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png'
  ]);

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial map={earthColorMap} normalMap={earthNormalMap} roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.52, 48, 48]} />
        <meshPhongMaterial map={earthClouds} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
};

// 🌀 Orbit path ellipse ring
const OrbitRing = ({ a, b }) => {
  const points = useMemo(() => {
    const segments = 160;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(t) * a, 0, Math.sin(t) * b]);
    }
    return pts;
  }, [a, b]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#7a7a7a" linewidth={1} />
    </line>
  );
};

// ☄️ One orbiting asteroid marker con órbita
const OrbitingAsteroid = React.forwardRef(({ asteroid, index, isSelected, displayOptions = {} }, refProp) => {
  const ref = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState({ x: 0, y: 0, z: 0 });
  const [orbitalData, setOrbitalData] = React.useState({});

  const avgDiameter = asteroid?.calculatedProperties?.averageDiameter ||
    asteroid?.estimated_diameter?.meters?.estimated_diameter_max || 200;
  const velocityKps = Number(
    asteroid?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second
  ) || asteroid?.calculatedProperties?.averageVelocity || 10;

  const missKm = Number(asteroid?.close_approach_data?.[0]?.miss_distance?.kilometers) || 3.8e5;
  const aSemi = useMemo(() => Math.max(1.2, Math.min(12, missKm / 12000)), [missKm]);
  const bSemi = useMemo(() => {
    const vNorm = Math.max(1, Math.min(50, velocityKps)) / 50;
    const factor = 0.55 + 0.35 * (0.3 + (index % 7) / 10) * (1 - vNorm);
    return Math.max(0.6, Math.min(aSemi, aSemi * factor));
  }, [aSemi, velocityKps, index]);

  const size = Math.max(0.05, Math.min(0.25, (avgDiameter / 1000) * 0.08));

  const epochMs = Number(asteroid?.close_approach_data?.[0]?.epoch_date_close_approach) || 0;
  const phase = useMemo(() => {
    const base = (epochMs / 1e7) % (Math.PI * 2);
    return base + (index % 16) * (Math.PI / 8);
  }, [epochMs, index]);

  const idSeed = (asteroid?.neo_reference_id || String(asteroid?._id || index))
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const inclination = ((idSeed % 45) - 22.5) * (Math.PI / 180);
  const omega = ((idSeed % 360) * Math.PI) / 180;
  const argPeriapsis = (((idSeed * 3) % 360) * Math.PI) / 180;

  const angularSpeed = useMemo(() => {
    const v = Math.max(1, Math.min(50, velocityKps));
    return (v / 50) * 0.7 / Math.max(0.8, (aSemi + bSemi) / 2);
  }, [velocityKps, aSemi, bSemi]);

  // Calcular proximidad orbital con la Tierra
  const calculateEarthProximity = useMemo(() => {
    const earthRadius = 1.5; // Radio de la Tierra en la escala del modelo (actualizado)
    const asteroidDistance = Math.sqrt(currentPosition.x**2 + currentPosition.y**2 + currentPosition.z**2);
    const proximityKm = (asteroidDistance - earthRadius) * 6371; // Convertir a km reales
    const proximityAU = proximityKm / 149597870.7; // Convertir a unidades astronómicas
    
    return {
      distanceKm: proximityKm,
      distanceAU: proximityAU,
      isClose: proximityKm < 1000000, // Menos de 1 millón de km
      isVeryClose: proximityKm < 100000, // Menos de 100,000 km
      dangerLevel: proximityKm < 100000 ? 'HIGH' : proximityKm < 1000000 ? 'MEDIUM' : 'LOW'
    };
  }, [currentPosition]);

  // Calcular datos orbitales en tiempo real
  const calculateOrbitalData = useMemo(() => {
    const orbitalPeriod = asteroid?.calculatedProperties?.orbitalPeriod || 
      asteroid?.orbital_data?.orbital_period || null;
    
    const eccentricity = asteroid?.orbital_data?.eccentricity || 0.1;
    const semiMajorAxis = asteroid?.orbital_data?.semi_major_axis || aSemi;
    const perihelionDistance = semiMajorAxis * (1 - eccentricity);
    const aphelionDistance = semiMajorAxis * (1 + eccentricity);
    
    return {
      period: orbitalPeriod,
      eccentricity: eccentricity,
      semiMajorAxis: semiMajorAxis,
      perihelionDistance: perihelionDistance,
      aphelionDistance: aphelionDistance,
      currentVelocity: velocityKps,
      currentDistance: calculateEarthProximity.distanceKm
    };
  }, [asteroid, aSemi, velocityKps, calculateEarthProximity]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const theta = phase + t * angularSpeed;
    const x = Math.cos(theta) * aSemi;
    const z = Math.sin(theta) * bSemi;
    
    // Actualizar posición actual
    setCurrentPosition({ x, y: 0, z });
    
    // Actualizar datos orbitales
    setOrbitalData(calculateOrbitalData);
    
    if (ref.current) ref.current.position.set(x, 0, z);
    if (refProp?.current) refProp.current.position.set(x, 0, z);
  });

  const diameterM = useMemo(() => {
    if (asteroid?.calculatedProperties?.averageDiameter)
      return asteroid.calculatedProperties.averageDiameter;
    const minM = asteroid?.estimated_diameter?.meters?.estimated_diameter_min;
    const maxM = asteroid?.estimated_diameter?.meters?.estimated_diameter_max;
    if (minM && maxM) return (Number(minM) + Number(maxM)) / 2;
    return undefined;
  }, [asteroid]);

  const velocityKmS = Number(
    asteroid?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second
  ) || asteroid?.calculatedProperties?.averageVelocity;

  const kineticEnergyJ = useMemo(() => {
    if (asteroid?.calculatedProperties?.kineticEnergy)
      return asteroid.calculatedProperties.kineticEnergy;
    const mass = asteroid?.calculatedProperties?.mass;
    const vms = velocityKmS ? Number(velocityKmS) * 1000 : undefined;
    if (mass && vms) return 0.5 * mass * vms * vms;
    return undefined;
  }, [asteroid, velocityKmS]);

  // Renderizar órbita elíptica
  return (
    <group ref={groupRef} rotation={[inclination, omega, argPeriapsis]}>
      <OrbitRing a={aSemi} b={bSemi} />
      <mesh
        ref={ref}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color={hovered ? '#e0b089' : '#b38b6d'} roughness={0.9} metalness={0.05} />
        <Html position={[0, 0.25 + size * 2, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            border: `1px solid ${calculateEarthProximity.dangerLevel === 'HIGH' ? '#ff4444' : calculateEarthProximity.dangerLevel === 'MEDIUM' ? '#ffaa00' : '#444'}`,
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            opacity: hovered ? 1 : 0.8
          }}>
            {/* Nombre del asteroide - siempre visible si está habilitado */}
            {displayOptions.name && (
              <div style={{ fontWeight: 600, marginBottom: 6, color: calculateEarthProximity.dangerLevel === 'HIGH' ? '#ff6666' : '#fff' }}>
                {asteroid?.name || asteroid?.neo_reference_id || 'Asteroid'}
                {displayOptions.riskLevel && calculateEarthProximity.dangerLevel === 'HIGH' && (
                  <span style={{ color: '#ff4444', marginLeft: '8px' }}>⚠️ HIGH RISK</span>
                )}
              </div>
            )}
            
            {/* Información básica */}
            <div style={{ opacity: 0.9 }}>
              {displayOptions.diameter && (
                <div><b>Diameter:</b> {diameterM ? `${diameterM.toFixed(0)} m` : 'N/A'}</div>
              )}
              {displayOptions.velocity && (
                <div><b>Velocity:</b> {velocityKmS ? `${velocityKmS.toFixed(2)} km/s` : 'N/A'}</div>
              )}
              {displayOptions.kineticEnergy && (
                <div><b>Kinetic Energy:</b> {kineticEnergyJ ? `${kineticEnergyJ.toExponential(2)} J` : 'N/A'}</div>
              )}
              
              {/* Separador solo si hay información de proximidad */}
              {(displayOptions.distanceToEarth || displayOptions.distanceAU || displayOptions.riskLevel) && (
                <>
                  <hr style={{ margin: '4px 0', borderColor: '#555' }} />
                  <div style={{ color: calculateEarthProximity.isVeryClose ? '#ff6666' : calculateEarthProximity.isClose ? '#ffaa00' : '#66ff66' }}>
                    {displayOptions.distanceToEarth && (
                      <div><b>Distance to Earth:</b> {calculateEarthProximity.distanceKm.toFixed(0)} km</div>
                    )}
                    {displayOptions.distanceAU && (
                      <div><b>Distance (AU):</b> {calculateEarthProximity.distanceAU.toFixed(6)} AU</div>
                    )}
                    {displayOptions.riskLevel && (
                      <div><b>Risk Level:</b> {calculateEarthProximity.dangerLevel}</div>
                    )}
                  </div>
                </>
              )}
              
              {/* Separador solo si hay información orbital */}
              {(displayOptions.orbitalPeriod || displayOptions.eccentricity || displayOptions.semiMajorAxis) && (
                <>
                  <hr style={{ margin: '4px 0', borderColor: '#555' }} />
                  <div style={{ color: '#88ccff' }}>
                    {displayOptions.orbitalPeriod && (
                      <div><b>Orbital Period:</b> {orbitalData.period ? `${orbitalData.period.toFixed(1)} days` : 'N/A'}</div>
                    )}
                    {displayOptions.eccentricity && (
                      <div><b>Eccentricity:</b> {orbitalData.eccentricity ? orbitalData.eccentricity.toFixed(3) : 'N/A'}</div>
                    )}
                    {displayOptions.semiMajorAxis && (
                      <div><b>Semi-Major Axis:</b> {orbitalData.semiMajorAxis ? `${orbitalData.semiMajorAxis.toFixed(2)} AU` : 'N/A'}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Html>
        {isSelected && (
          <mesh position={[0, size * 2.7, 0]}>
            <coneGeometry args={[size * 1.2, size * 2.2, 3]} />
            <meshStandardMaterial color="#ffeb3b" emissive="#fff200" emissiveIntensity={0.7} />
          </mesh>
        )}
      </mesh>
    </group>
  );
});

// 🌌 Fondo estrellado mejorado
const StarsBackground = () => {
  const starsRef = useRef();
  
  // Crear geometría de estrellas
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // Posiciones esféricas aleatorias
      const radius = 50 + Math.random() * 20; // Radio entre 50-70
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Colores de estrellas (blanco, azul, amarillo)
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        // Estrellas blancas
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.9) {
        // Estrellas azules
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else {
        // Estrellas amarillas
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.7;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  return (
    <group>
      {/* Fondo espacial base */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#000005" side={1} />
      </mesh>
      
      {/* Estrellas */}
      <points ref={starsRef} geometry={starsGeometry}>
        <pointsMaterial 
          size={0.5} 
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
        />
      </points>
      
      {/* Nebulosa/galaxia de fondo */}
      <mesh position={[30, 20, -40]}>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial 
          color="#1a0a2e" 
          transparent={true} 
          opacity={0.3}
          side={2}
        />
      </mesh>
      
      {/* Nebulosa adicional */}
      <mesh position={[-25, -15, -35]}>
        <planeGeometry args={[30, 25]} />
        <meshBasicMaterial 
          color="#16213e" 
          transparent={true} 
          opacity={0.2}
          side={2}
        />
      </mesh>
    </group>
  );
};

// 🎥 Escena principal
const Scene = ({ asteroids = [], selectedAsteroid, displayOptions = {} }) => {
  const asteroidRef = useRef();
  const { camera } = useThree();

  // Seguir asteroide si está activado
  useFrame(() => {
    if (window.followAsteroid && asteroids.length === 1 && asteroidRef.current) {
      const pos = asteroidRef.current.position;
      camera.position.set(pos.x + 2.5, pos.y + 2.5, pos.z + 6);
      camera.lookAt(pos.x, pos.y, pos.z);
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-6, -4, -4]} intensity={0.3} color="#ff6b35" />

      <StarsBackground />
      <group>
        <EarthSphere />
        {asteroids?.map((a, i) => (
          <OrbitingAsteroid
            key={a._id || i}
            asteroid={a}
            index={i}
            isSelected={selectedAsteroid && asteroids.length === 1 && (a._id === selectedAsteroid._id)}
            ref={asteroids.length === 1 ? asteroidRef : undefined}
            displayOptions={displayOptions}
          />
        ))}
      </group>

      <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
    </>
  );
};

// 🪐 Contenedor principal con Canvas
const OrbitView = ({ asteroids = [], selectedAsteroid, displayOptions = {} }) => (
  <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
    <Canvas shadows camera={{ position: [0, 3, 10], fov: 50 }}>
      <Scene asteroids={asteroids} selectedAsteroid={selectedAsteroid} displayOptions={displayOptions} />
    </Canvas>
  </div>
);

export default OrbitView;
