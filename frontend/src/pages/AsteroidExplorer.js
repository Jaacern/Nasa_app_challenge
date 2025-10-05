import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { useTranslation } from '../hooks/useTranslation';

const AsteroidExplorer = () => {
  const { fetchAsteroids, searchAsteroids, loading } = useSimulation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [asteroids, setAsteroids] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    hazardous: '',
    minSize: '',
    maxSize: '',
    sortBy: 'calculatedProperties.averageDiameter',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    loadAsteroids();
  }, [filters, pagination.currentPage]);

  const loadAsteroids = async () => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await fetchAsteroids(params);
      setAsteroids(data.asteroids || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to load asteroids:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const results = await searchAsteroids(searchQuery.trim(), 20);
        setAsteroids(results);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: results.length });
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadAsteroids();
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const formatDiameter = (asteroid) => {
    const diameter = asteroid.calculatedProperties?.averageDiameter;
    if (!diameter) return t('unknown');
    
    if (diameter >= 1000) {
      return `${(diameter / 1000).toFixed(2)} km`;
    } else {
      return `${diameter.toFixed(0)} m`;
    }
  };

  const formatVelocity = (asteroid) => {
    const velocity = asteroid.calculatedProperties?.averageVelocity;
    return velocity ? `${velocity.toFixed(2)} km/s` : t('unknown');
  };

  const formatEnergy = (asteroid) => {
    const energy = asteroid.calculatedProperties?.kineticEnergy;
    if (!energy) return t('unknown');
    
    if (energy >= 1e15) {
      return `${(energy / 1e15).toExponential(2)} PJ`;
    } else if (energy >= 1e12) {
      return `${(energy / 1e12).toFixed(2)} TJ`;
    } else {
      return `${(energy / 1e9).toFixed(2)} GJ`;
    }
  };

  return (
    <Container className="py-5" style={{ marginTop: '100px' }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>
                <i className="bi bi-search me-2"></i>
                {t('asteroidExplorer')}
              </h1>
              <p className="text-muted">{t('browseNasaDatabase')}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="glass-effect">
            <Card.Body>
              {/* Search Bar */}
              <Form onSubmit={handleSearch} className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder={t('searchAsteroids')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="primary" disabled={loading}>
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>

              {/* Filters */}
              <Row>
                <Col xs={12} sm={6} lg={3} className="mb-3">
                  <Form.Label>{t('hazardLevel')}</Form.Label>
                  <Form.Select
                    className='text-white bg-dark'
                    value={filters.hazardous}
                    onChange={(e) => handleFilterChange('hazardous', e.target.value)}
                  >
                    <option value="">{t('allAsteroids')}</option>
                    <option value="true">{t('potentiallyHazardous')}</option>
                    <option value="false">{t('nonHazardous')}</option>
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6} lg={3} className="mb-3">
                  <Form.Label>{t('minSize')}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('minDiameter')}
                    value={filters.minSize}
                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                  />
                </Col>

                <Col xs={12} sm={6} lg={3} className="mb-3">
                  <Form.Label>{t('maxSize')}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('maxDiameter')}
                    value={filters.maxSize}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                  />
                </Col>

                <Col xs={12} sm={6} lg={3} className="mb-3">
                  <Form.Label>{t('sortBy')}</Form.Label>
                  <Form.Select
                    className='text-white bg-dark'
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                  >
                    <option value="calculatedProperties.averageDiameter-desc">{t('sizeLargestFirst')}</option>
                    <option value="calculatedProperties.averageDiameter-asc">{t('sizeSmallestFirst')}</option>
                    <option value="calculatedProperties.kineticEnergy-desc">{t('energyHighestFirst')}</option>
                    <option value="calculatedProperties.averageVelocity-desc">{t('velocityFastestFirst')}</option>
                    <option value="name-asc">{t('nameAZ')}</option>
                    <option value="lastUpdated-desc">{t('recentlyUpdated')}</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results */}
      <Row>
        <Col>
          <Card className="glass-effect">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                {t('asteroids')} ({pagination.totalItems || 0})
              </h5>
              {loading && <div className="loading-spinner"></div>}
            </Card.Header>

            <Card.Body className="p-0">
              {asteroids.length > 0 ? (
                <div className="table-responsive">
                  <Table responsive variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th className="d-none d-md-table-cell">{t('name')}</th>
                        <th className="d-table-cell d-md-none">Asteroid</th>
                        <th className="d-none d-lg-table-cell">{t('diameter')}</th>
                        <th className="d-none d-lg-table-cell">{t('velocity')}</th>
                        <th className="d-none d-lg-table-cell">{t('kineticEnergy')}</th>
                        <th className="d-none d-sm-table-cell">{t('hazardLevel')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asteroids.map((asteroid) => (
                        <tr key={asteroid._id}>
                          <td>
                            <div>
                              <strong className="text-truncate d-block" style={{ maxWidth: '200px' }}>
                                {asteroid.name}
                              </strong>
                              <small className="text-muted d-none d-md-block">
                                ID: {asteroid.neo_reference_id}
                              </small>
                              <div className="d-block d-lg-none small">
                                <div><strong>{t('diameter')}:</strong> {formatDiameter(asteroid)}</div>
                                <div><strong>{t('velocity')}:</strong> {formatVelocity(asteroid)}</div>
                                <div><strong>{t('kineticEnergy')}:</strong> {formatEnergy(asteroid)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            <strong>{formatDiameter(asteroid)}</strong>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            {formatVelocity(asteroid)}
                          </td>
                          <td className="d-none d-lg-table-cell">
                            {formatEnergy(asteroid)}
                          </td>
                          <td className="d-none d-sm-table-cell">
                            {asteroid.is_potentially_hazardous_asteroid ? (
                              <Badge bg="warning" text="dark">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {t('hazardous')}
                              </Badge>
                            ) : (
                              <Badge bg="success">
                                <i className="bi bi-check-circle me-1"></i>
                                {t('safe')}
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1 gap-md-2 flex-wrap">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => window.open(asteroid.nasa_jpl_url, '_blank')}
                                disabled={!asteroid.nasa_jpl_url}
                                className="flex-fill flex-md-grow-0"
                              >
                                <i className="bi bi-info-circle"></i>
                                <span className="d-none d-md-inline ms-1">Info</span>
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/simulator', { 
                                  state: { asteroidId: asteroid._id }
                                })}
                                className="flex-fill flex-md-grow-0"
                              >
                                <i className="bi bi-play-circle"></i>
                                <span className="d-none d-md-inline ms-1">Simulate</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-search display-1 text-muted"></i>
                  <h4 className="mt-3">{t('noAsteroidsFound')}</h4>
                  <p className="text-muted">
                    {t('tryAdjustingCriteria')}
                  </p>
                </div>
              )}
            </Card.Body>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card.Footer>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    {t('page')} {pagination.currentPage} {t('of')} {pagination.totalPages}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </Button>
                  </div>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AsteroidExplorer;
