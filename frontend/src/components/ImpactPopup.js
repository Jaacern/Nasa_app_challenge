import React from 'react';
import { Popup } from 'react-leaflet';

// Componente para mostrar información detallada del impacto en un popup
const ImpactPopup = ({ impactLocation, simulationResults }) => {
  if (!impactLocation || !simulationResults) {
    return null;
  }

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Number(num).toFixed(0);
  };

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

  return (
    <Popup>
      <div style={{ minWidth: '250px', fontFamily: 'Arial, sans-serif' }}>
        <h6 style={{ margin: '0 0 10px 0', color: '#333' }}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          Impact Simulation Results
        </h6>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>Impact Energy:</strong><br/>
          <span style={{ color: '#ff6600' }}>
            {formatNumber(simulationResults.energy || 0)} Joules
          </span><br/>
          <small style={{ color: '#666' }}>
            TNT Equivalent: {formatNumber(simulationResults.tntEquivalent || 0)} tons
          </small>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong>Crater:</strong><br/>
          <span style={{ color: '#ff6600' }}>
            Diameter: {(simulationResults.craterDiameter || 0).toFixed(1)} km
          </span><br/>
          <small style={{ color: '#666' }}>
            Depth: {(simulationResults.craterDepth || 0).toFixed(1)} km
          </small>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong>Impact Severity:</strong><br/>
          <span className={`badge bg-${getSeverityBadgeColor(simulationResults.severity)}`}>
            {simulationResults.severity || 'Unknown'}
          </span>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong>Affected Area:</strong><br/>
          <span style={{ color: '#ff6600' }}>
            {formatNumber(simulationResults.affectedArea || 0)} km²
          </span>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong>Estimated Casualties:</strong><br/>
          <span style={{ color: '#ff0000' }}>
            {formatNumber(simulationResults.estimatedCasualties || 0)}
          </span>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <strong>Economic Impact:</strong><br/>
          <span style={{ color: '#ff6600' }}>
            ${formatNumber(simulationResults.economicImpact || 0)}
          </span>
        </div>

        {simulationResults.mitigationStrategies && (
          <div>
            <strong>Recommended Actions:</strong><br/>
            <small style={{ color: '#666' }}>
              {simulationResults.mitigationStrategies.slice(0, 3).map((strategy, index) => (
                <div key={index} style={{ marginTop: '4px' }}>
                  {index + 1}. {strategy}
                </div>
              ))}
              {simulationResults.mitigationStrategies.length > 3 && (
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                  ...and {simulationResults.mitigationStrategies.length - 3} more
                </div>
              )}
            </small>
          </div>
        )}
      </div>
    </Popup>
  );
};

export default ImpactPopup;
