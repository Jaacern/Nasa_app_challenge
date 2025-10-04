import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';

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
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial map={earthColorMap} normalMap={earthNormalMap} roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.015, 48, 48]} />
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
const OrbitingAsteroid = React.forwardRef(({ asteroid, index, isSelected }, refProp) => {
  const ref = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = React.useState(false);

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

  const size = Math.max(0.03, Math.min(0.15, (avgDiameter / 1000) * 0.05));

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

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const theta = phase + t * angularSpeed;
    const x = Math.cos(theta) * aSemi;
    const z = Math.sin(theta) * bSemi;
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
        {hovered && (
          <Html position={[0, 0.25 + size * 2, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '6px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              border: '1px solid #444',
              maxWidth: '260px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {asteroid?.name || asteroid?.neo_reference_id || 'Asteroid'}
              </div>
              <div style={{ opacity: 0.9 }}>
                <div><b>Diameter:</b> {diameterM ? `${diameterM.toFixed(0)} m` : 'N/A'}</div>
                <div><b>Velocity:</b> {velocityKmS ? `${velocityKmS.toFixed(2)} km/s` : 'N/A'}</div>
                <div><b>Kinetic Energy:</b> {kineticEnergyJ ? `${kineticEnergyJ.toExponential(2)} J` : 'N/A'}</div>
              </div>
            </div>
          </Html>
        )}
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

// 🌌 Fondo estrellado
const StarsBackground = () => (
  <mesh>
    <sphereGeometry args={[60, 32, 32]} />
    <meshBasicMaterial color="#000010" side={1} />
  </mesh>
);

// 🎥 Escena principal
const Scene = ({ asteroids = [], selectedAsteroid }) => {
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
          />
        ))}
      </group>

      <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
    </>
  );
};

// 🪐 Contenedor principal con Canvas
const OrbitView = ({ asteroids = [], selectedAsteroid }) => (
  <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
    <Canvas shadows camera={{ position: [0, 3, 10], fov: 50 }}>
      <Scene asteroids={asteroids} selectedAsteroid={selectedAsteroid} />
    </Canvas>
  </div>
);

export default OrbitView;
