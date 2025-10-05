import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import OrbitView from '../components/3D/OrbitView';
import api from '../utils/api';

const OrbitViewer = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [selectedAsteroidId, setSelectedAsteroidId] = useState('all');
  const [hazardFilter, setHazardFilter] = useState('all'); // 'all', 'hazardous', 'nonhazardous'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orbitalStats, setOrbitalStats] = useState({
    totalAsteroids: 0,
    hazardousCount: 0,
    closestDistance: 0,
    averageVelocity: 0,
    riskLevels: { HIGH: 0, MEDIUM: 0, LOW: 0 }
  });
  
  // Estado para controlar qué información mostrar
  const [displayOptions, setDisplayOptions] = useState({
    name: true,
    diameter: false,
    velocity: false,
    kineticEnergy: false,
    distanceToEarth: false,
    distanceAU: false,
    riskLevel: false,
    orbitalPeriod: false,
    eccentricity: false,
    semiMajorAxis: false
  });

  const loadAsteroids = async () => {
    try {
      setLoading(true);
      setError('');
      // Pull a reasonable number to keep render light
      const { data } = await api.get('/api/asteroids?limit=99&sortBy=close_approach_data.0.epoch_date_close_approach&sortOrder=asc');
      const asteroidData = data.asteroids || [];
      setAsteroids(asteroidData);
      
      // Calcular estadísticas orbitales
      calculateOrbitalStats(asteroidData);
    } catch (e) {
      console.error('Failed to load asteroids', e);
      setError(e?.response?.data?.error || 'Failed to load asteroids');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrbitalStats = (asteroidList) => {
    if (!asteroidList.length) return;

    const hazardousCount = asteroidList.filter(a => a.is_potentially_hazardous_asteroid).length;
    
    // Calcular distancia más cercana
    const distances = asteroidList.map(a => {
      const missKm = Number(a?.close_approach_data?.[0]?.miss_distance?.kilometers) || 3.8e5;
      return missKm;
    });
    const closestDistance = Math.min(...distances);
    
    // Calcular velocidad promedio
    const velocities = asteroidList.map(a => {
      const velocityKps = Number(a?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second) || 10;
      return velocityKps;
    });
    const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    
    // Calcular niveles de riesgo basados en distancia
    const riskLevels = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    distances.forEach(distance => {
      if (distance < 100000) riskLevels.HIGH++;
      else if (distance < 1000000) riskLevels.MEDIUM++;
      else riskLevels.LOW++;
    });

    setOrbitalStats({
      totalAsteroids: asteroidList.length,
      hazardousCount,
      closestDistance,
      averageVelocity,
      riskLevels
    });
  };

  useEffect(() => {
    loadAsteroids();
  }, []);

  // Filtrar asteroides según peligrosidad y selección
  const filteredAsteroids = asteroids.filter(a => {
    if (hazardFilter === 'hazardous') return a.is_potentially_hazardous_asteroid;
    if (hazardFilter === 'nonhazardous') return !a.is_potentially_hazardous_asteroid;
    return true;
  });
  const visibleAsteroids = selectedAsteroidId === 'all'
    ? filteredAsteroids
    : filteredAsteroids.filter(a => String(a._id) === String(selectedAsteroidId));

  return (
    <div className="py-4" style={{
      minHeight: '100vh',
      marginTop: '70px', // Compensa la altura del navbar
      background: 'radial-gradient(ellipse at center, #111 60%, #000 100%)',
      backgroundImage: `url('https://raw.githubusercontent.com/microsoft/Azure-3D-Toolkit/main/docs/assets/stars-bg.png')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center',
    }}>
      <Container>
        <Row className="mb-3 align-items-center">
          <Col xs={12} sm={8}>
            <h2 className="mb-0 h3 h2-md">Earth Orbit Viewer</h2>
            <small className="text-muted d-none d-sm-block">Real-time orbital data with NASA asteroid proximity tracking</small>
          </Col>
          <Col xs={12} sm={4} className="mt-2 mt-sm-0">
            <Button variant="primary" onClick={loadAsteroids} disabled={loading} className="w-100 w-sm-auto">
              {loading ? (
                <><Spinner size="sm" className="me-2" />Refreshing...</>
              ) : (
                <>Refresh</>
              )}
            </Button>
          </Col>
        </Row>

        {/* Panel de estadísticas orbitales en tiempo real */}
        {asteroids.length > 0 && (
          <Row className="mb-3">
            <Col md={12}>
              <Card className="bg-dark text-light border-secondary">
                <Card.Body className="py-2">
                  <Row className="text-center">
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-primary">
                        <strong className="h6">{orbitalStats.totalAsteroids}</strong>
                        <br />
                        <small>Total</small>
                      </div>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-danger">
                        <strong className="h6">{orbitalStats.hazardousCount}</strong>
                        <br />
                        <small>Hazardous</small>
                      </div>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-warning">
                        <strong className="h6">{(orbitalStats.closestDistance / 1000).toFixed(0)}k</strong>
                        <br />
                        <small>Closest</small>
                      </div>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-info">
                        <strong className="h6">{orbitalStats.averageVelocity.toFixed(1)}</strong>
                        <br />
                        <small>Avg Speed</small>
                      </div>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-success">
                        <strong className="h6">{orbitalStats.riskLevels.LOW}</strong>
                        <br />
                        <small>Low Risk</small>
                      </div>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="mb-2 mb-md-0">
                      <div className="text-warning">
                        <strong className="h6">{orbitalStats.riskLevels.MEDIUM}</strong>
                        <br />
                        <small>Medium Risk</small>
                      </div>
                    </Col>
                  </Row>
                  {orbitalStats.riskLevels.HIGH > 0 && (
                    <Row className="mt-2">
                      <Col className="text-center">
                        <div className="text-danger">
                          <strong>⚠️ {orbitalStats.riskLevels.HIGH} HIGH RISK ASTEROIDS DETECTED</strong>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Panel de opciones de información */}
        {asteroids.length > 0 && (
          <Row className="mb-3">
            <Col md={12}>
              <Card className="bg-dark text-light border-secondary">
                <Card.Header className="py-2">
                  <h6 className="mb-0">📊 Opciones de Información a Mostrar</h6>
                </Card.Header>
                <Card.Body className="py-2">
                  <Row>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name-check"
                          checked={displayOptions.name}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, name: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="name-check">
                          Nombre del Asteroide
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="diameter-check"
                          checked={displayOptions.diameter}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, diameter: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="diameter-check">
                          Diámetro
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="velocity-check"
                          checked={displayOptions.velocity}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, velocity: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="velocity-check">
                          Velocidad
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="kinetic-check"
                          checked={displayOptions.kineticEnergy}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, kineticEnergy: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="kinetic-check">
                          Energía Cinética
                        </label>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="distance-earth-check"
                          checked={displayOptions.distanceToEarth}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, distanceToEarth: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="distance-earth-check">
                          Distancia a la Tierra (km)
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="distance-au-check"
                          checked={displayOptions.distanceAU}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, distanceAU: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="distance-au-check">
                          Distancia (AU)
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="risk-level-check"
                          checked={displayOptions.riskLevel}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, riskLevel: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="risk-level-check">
                          Nivel de Riesgo
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="orbital-period-check"
                          checked={displayOptions.orbitalPeriod}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, orbitalPeriod: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="orbital-period-check">
                          Período Orbital
                        </label>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="eccentricity-check"
                          checked={displayOptions.eccentricity}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, eccentricity: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="eccentricity-check">
                          Excentricidad
                        </label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="semi-major-check"
                          checked={displayOptions.semiMajorAxis}
                          onChange={(e) => setDisplayOptions(prev => ({ ...prev, semiMajorAxis: e.target.checked }))}
                        />
                        <label className="form-check-label text-light" htmlFor="semi-major-check">
                          Eje Semi-Mayor
                        </label>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => setDisplayOptions({
                            name: true,
                            diameter: false,
                            velocity: false,
                            kineticEnergy: false,
                            distanceToEarth: false,
                            distanceAU: false,
                            riskLevel: false,
                            orbitalPeriod: false,
                            eccentricity: false,
                            semiMajorAxis: false
                          })}
                        >
                          Solo Nombre
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => setDisplayOptions({
                            name: true,
                            diameter: true,
                            velocity: true,
                            kineticEnergy: false,
                            distanceToEarth: true,
                            distanceAU: false,
                            riskLevel: true,
                            orbitalPeriod: false,
                            eccentricity: false,
                            semiMajorAxis: false
                          })}
                        >
                          Básico
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => setDisplayOptions({
                            name: true,
                            diameter: true,
                            velocity: true,
                            kineticEnergy: true,
                            distanceToEarth: true,
                            distanceAU: true,
                            riskLevel: true,
                            orbitalPeriod: true,
                            eccentricity: true,
                            semiMajorAxis: true
                          })}
                        >
                          Completo
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtros de peligrosidad y órbita/asteroide */}
        {asteroids.length > 0 && (
          <Row className="mb-3">
            <Col md={3}>
              <label htmlFor="hazard-filter" className="form-label">Filtrar por peligrosidad:</label>
              <select
                id="hazard-filter"
                className="form-select"
                value={hazardFilter}
                onChange={e => {
                  setHazardFilter(e.target.value);
                  setSelectedAsteroidId('all'); // Reinicia selección al cambiar filtro
                }}
              >
                <option value="all">Todos</option>
                <option value="hazardous">Peligrosos</option>
                <option value="nonhazardous">No peligrosos</option>
              </select>
            </Col>
            <Col md={5}>
              <label htmlFor="asteroid-select" className="form-label">Selecciona órbita/asteroide:</label>
              <select
                id="asteroid-select"
                className="form-select"
                value={selectedAsteroidId}
                onChange={e => setSelectedAsteroidId(e.target.value)}
              >
                <option value="all">Todas</option>
                {filteredAsteroids.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.name || a.neo_reference_id || a._id}
                  </option>
                ))}
              </select>
            </Col>
          </Row>
        )}

        <Card className="mb-3">
          <Card.Body>
            {error && (
              <div className="alert alert-warning py-2 mb-3">{error}</div>
            )}
            <OrbitView 
              asteroids={visibleAsteroids}
              selectedAsteroid={visibleAsteroids.length === 1 ? visibleAsteroids[0] : null}
              displayOptions={displayOptions}
            />
          </Card.Body>
        </Card>

        <div className="text-muted" style={{ fontSize: 12 }}>
          <strong>Real-time NASA Data:</strong> Orbital calculations use actual NASA asteroid data including proximity, velocity, and risk assessment. 
          Distances and velocities are calculated from real close approach data. Risk levels: HIGH (&lt;100k km), MEDIUM (&lt;1M km), LOW (&gt;1M km).
        </div>
      </Container>
    </div>
  );
};

export default OrbitViewer;


