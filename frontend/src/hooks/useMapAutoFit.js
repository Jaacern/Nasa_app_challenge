import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Hook personalizado para auto-encuadrar el mapa cuando se agregan círculos grandes
const useMapAutoFit = (craterRadiusMeters, impactLocation) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !impactLocation || !craterRadiusMeters) return;

    // Calcular metros por píxel en la ubicación actual
    const lat = impactLocation.lat;
    const zoom = map.getZoom();
    const metersPerPixel = (40075016.686 * Math.cos(lat * Math.PI / 180)) / (256 * Math.pow(2, zoom));
    
    // Calcular radio en píxeles
    const radiusPixels = craterRadiusMeters / metersPerPixel;
    
    // Obtener tamaño del mapa
    const mapSize = map.getSize();
    const maxPixels = 0.4 * Math.min(mapSize.x, mapSize.y); // 40% del lado menor
    
    // Si el círculo es muy grande, auto-encuadrar
    if (radiusPixels > maxPixels) {
      const bounds = [
        [impactLocation.lat - craterRadiusMeters / 111000, impactLocation.lng - craterRadiusMeters / (111000 * Math.cos(lat * Math.PI / 180))],
        [impactLocation.lat + craterRadiusMeters / 111000, impactLocation.lng + craterRadiusMeters / (111000 * Math.cos(lat * Math.PI / 180))]
      ];
      
      map.fitBounds(bounds, { 
        padding: [20, 20],
        animate: true,
        duration: 1.0
      });
    }
  }, [map, craterRadiusMeters, impactLocation]);
};

export default useMapAutoFit;
