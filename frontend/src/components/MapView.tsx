import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ResourceDetail, ResourceCategory } from '../types';
import { FreshnessBadge } from './FreshnessBadge';

interface Props {
  resources: ResourceDetail[];
  selectedResource: ResourceDetail | null;
  onSelectResource: (res: ResourceDetail) => void;
  center?: [number, number];
}

// Custom Leaflet DivIcon generator with warm, elegant markers
const createCategoryIcon = (category: ResourceCategory, isSelected: boolean) => {
  let color = '#8b2e46'; // wine brand
  let symbol = '🏨';

  switch (category) {
    case 'public_transport':
      color = '#0284c7'; // sky
      symbol = '🚇';
      break;
    case 'hospital':
      color = '#dc2626'; // medical red
      symbol = '🏥';
      break;
    case 'pharmacy':
      color = '#059669'; // emerald
      symbol = '💊';
      break;
    case 'police_or_public_support':
      color = '#4f46e5'; // indigo
      symbol = '👮';
      break;
    case 'women_support':
      color = '#db2777'; // rose pink
      symbol = '🤝';
      break;
    case 'women_hostel':
    default:
      color = '#8b2e46'; // deep wine
      symbol = '🏨';
      break;
  }

  const size = isSelected ? 42 : 34;
  const border = isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.95)';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${border};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '18px' : '14px'};
        box-shadow: 0 4px 14px rgba(78, 20, 33, 0.25);
      ">
        ${symbol}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Pan map smoothly when target changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
};

export const MapView: React.FC<Props> = ({
  resources,
  selectedResource,
  onSelectResource,
  center = [26.8528, 80.9463] // Lucknow central coordinate
}) => {
  const mapCenter: [number, number] = selectedResource && selectedResource.latitude && selectedResource.longitude
    ? [selectedResource.latitude, selectedResource.longitude]
    : center;

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-warm-300 shadow-sm relative bg-warm-100">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Crisp, clean, warm-toned CartoDB Voyager tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={mapCenter} />

        {/* Proximity Safety Zone Radius if selected */}
        {selectedResource && selectedResource.latitude && selectedResource.longitude && (
          <Circle
            center={[selectedResource.latitude, selectedResource.longitude]}
            radius={2000}
            pathOptions={{
              color: '#8b2e46',
              fillColor: '#8b2e46',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 8'
            }}
          />
        )}

        {/* Category Resource Pins */}
        {resources.map((res) => {
          if (!res.latitude || !res.longitude) return null;
          const isSelected = selectedResource?.id === res.id;
          const icon = createCategoryIcon(res.category, isSelected);

          return (
            <Marker
              key={`${res.category}-${res.id}`}
              position={[res.latitude, res.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectResource(res)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 space-y-2 max-w-xs text-stone-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-700 uppercase tracking-wider">
                      {res.category.replace(/_/g, ' ')}
                    </span>
                    <FreshnessBadge level={res.freshness} />
                  </div>
                  <h4 className="font-bold text-sm leading-tight text-stone-900">{res.name}</h4>
                  <p className="text-xs text-stone-600 truncate">{res.address || res.locality}</p>
                  {res.primary_contact && (
                    <p className="text-xs font-semibold text-rosewood-700">📞 {res.primary_contact}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Warm Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-warm-300 shadow-md text-xs space-y-2">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
          Safety Mesh Layers
        </span>
        <div className="flex items-center gap-3 text-xs text-stone-700 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8b2e46]" /> Stays</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Metro</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Hospitals</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Chemist</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-600" /> 1090 Desks</span>
        </div>
      </div>
    </div>
  );
};
