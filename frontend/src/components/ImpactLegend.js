import React from 'react';
import { Card, Badge } from 'react-bootstrap';

// Componente para mostrar la leyenda de colores del impacto
const ImpactLegend = ({ simulationResults }) => {
  if (!simulationResults) {
    return null;
  }

  // Debug: Log para ver qué datos están llegando
  console.log('ImpactLegend - simulationResults:', simulationResults);
  console.log('ImpactLegend - severity:', simulationResults.severity);

  const severity = simulationResults.severity || 'UNKNOWN';
  
  const getSeverityInfo = (severityLevel) => {
    switch (severityLevel?.toUpperCase()) {
      case 'MINIMAL':
        return {
          color: '#00ff00',
          description: 'Daño mínimo - Estructuras menores afectadas'
        };
      case 'LOW':
        return {
          color: '#ffff00',
          description: 'Daño bajo - Edificios dañados, evacuación local'
        };
      case 'MODERATE':
        return {
          color: '#ff8800',
          description: 'Daño moderado - Destrucción significativa'
        };
      case 'HIGH':
        return {
          color: '#ff4400',
          description: 'Daño alto - Destrucción masiva, evacuación regional'
        };
      case 'SEVERE':
        return {
          color: '#ff0000',
          description: 'Daño severo - Destrucción total, emergencia nacional'
        };
      case 'CATASTROPHIC':
        return {
          color: '#880000',
          description: 'Daño catastrófico - Extinción masiva posible'
        };
      default:
        return {
          color: '#ff6600',
          description: 'Severidad desconocida'
        };
    }
  };

  const severityInfo = getSeverityInfo(severity);

  return (
    <Card className="glass-effect impact-legend" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, minWidth: '200px' }}>
      <Card.Header className="py-2">
        <h6 className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          Impact Zones
        </h6>
      </Card.Header>
      <Card.Body className="py-2">
        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#ffffff', 
                borderRadius: '50%', 
                marginRight: '8px',
                border: '1px solid #333'
              }}
            ></div>
            <small><strong>Impact Point</strong></small>
          </div>
          <small className="text-muted">Punto exacto de impacto</small>
        </div>

        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: severityInfo.color, 
                borderRadius: '50%', 
                marginRight: '8px',
                opacity: 0.4
              }}
            ></div>
            <small><strong>Crater Zone</strong></small>
          </div>
          <small className="text-muted">Zona del cráter - Destrucción total</small>
        </div>

        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: severityInfo.color, 
                borderRadius: '50%', 
                marginRight: '8px',
                opacity: 0.25
              }}
            ></div>
            <small><strong>Severe Damage</strong></small>
          </div>
          <small className="text-muted">Daño severo - Destrucción masiva</small>
        </div>

        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: severityInfo.color, 
                borderRadius: '50%', 
                marginRight: '8px',
                opacity: 0.15
              }}
            ></div>
            <small><strong>Moderate Damage</strong></small>
          </div>
          <small className="text-muted">Daño moderado - Estructuras dañadas</small>
        </div>

        <div className="mb-2">
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: severityInfo.color, 
                borderRadius: '50%', 
                marginRight: '8px',
                opacity: 0.05,
                border: `2px dashed ${severityInfo.color}`
              }}
            ></div>
            <small><strong>Affected Area</strong></small>
          </div>
          <small className="text-muted">Área afectada - Impacto general</small>
        </div>

        <hr className="my-2" />
        
        <div>
          <div className="d-flex align-items-center mb-1">
            <Badge bg={severityInfo.color === '#00ff00' ? 'success' : 
                      severityInfo.color === '#ffff00' ? 'warning' : 
                      severityInfo.color === '#ff8800' ? 'warning' : 
                      severityInfo.color === '#ff4400' ? 'danger' : 
                      severityInfo.color === '#ff0000' ? 'danger' : 'dark'}>
              {simulationResults.severity || 'Unknown'}
            </Badge>
          </div>
          <small className="text-muted">{severityInfo.description}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ImpactLegend;
