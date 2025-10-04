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

  const loadAsteroids = async () => {
    try {
      setLoading(true);
      setError('');
      // Pull a reasonable number to keep render light
      const { data } = await api.get('/api/asteroids?limit=99&sortBy=close_approach_data.0.epoch_date_close_approach&sortOrder=asc');
      setAsteroids(data.asteroids || []);
    } catch (e) {
      console.error('Failed to load asteroids', e);
      setError(e?.response?.data?.error || 'Failed to load asteroids');
    } finally {
      setLoading(false);
    }
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
          <Col>
            <h2 className="mb-0">Earth Orbit Viewer</h2>
            <small className="text-muted">Animated orbits derived from close approach data</small>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={loadAsteroids} disabled={loading}>
              {loading ? (
                <><Spinner size="sm" className="me-2" />Refreshing...</>
              ) : (
                <>Refresh</>
              )}
            </Button>
          </Col>
        </Row>

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
            />
          </Card.Body>
        </Card>

        <div className="text-muted" style={{ fontSize: 12 }}>
          Note: Orbits are simplified for visualization and do not represent exact trajectories.
        </div>
      </Container>
    </div>
  );
};

export default OrbitViewer;


