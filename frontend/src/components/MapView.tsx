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

// Custom Leaflet DivIcon generator
const createCategoryIcon = (category: ResourceCategory, isSelected: boolean) => {
  let color = '#d75a6c'; // brand
  let symbol = '🏠';

  switch (category) {
    case 'public_transport':
      color = '#38bdf8'; // sky
      symbol = '🚇';
      break;
    case 'hospital':
      color = '#f43f5e'; // rose
      symbol = '🏥';
      break;
    case 'pharmacy':
      color = '#10b981'; // emerald
      symbol = '💊';
      break;
    case 'police_or_public_support':
      color = '#6366f1'; // indigo
      symbol = '👮';
      break;
    case 'women_support':
      color = '#ec4899'; // pink
      symbol = '🤝';
      break;
    case 'women_hostel':
    default:
      color = '#e11d48'; // red/brand
      symbol = '🏨';
      break;
  }

  const size = isSelected ? 42 : 34;
  const border = isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.8)';

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
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${symbol}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Component to dynamically pan map when selected resource changes
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
  center = [26.8528, 80.9463] // Default Lucknow center
}) => {
  const mapCenter: [number, number] = selectedResource && selectedResource.latitude && selectedResource.longitude
    ? [selectedResource.latitude, selectedResource.longitude]
    : center;

  return (
    <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Modern dark-themed CartoDB tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={mapCenter} />

        {/* Proximity Circle if selected */}
        {selectedResource && selectedResource.latitude && selectedResource.longitude && (
          <Circle
            center={[selectedResource.latitude, selectedResource.longitude]}
            radius={2000}
            pathOptions={{
              color: '#d75a6c',
              fillColor: '#d75a6c',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 8'
            }}
          />
        )}

        {/* Category Pins */}
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
                <div className="p-1 space-y-2 max-w-xs text-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold uppercase tracking-wider">
                      {res.category.replace(/_/g, ' ')}
                    </span>
                    <FreshnessBadge level={res.freshness} />
                  </div>
                  <h4 className="font-semibold text-sm leading-tight text-slate-900">{res.name}</h4>
                  <p className="text-xs text-slate-600 truncate">{res.address || res.locality}</p>
                  {res.primary_contact && (
                    <p className="text-xs font-mono text-slate-800">📞 {res.primary_contact}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 font-mono">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
          Verified Map Layers
        </span>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Hostels</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Metro / Bus</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Hospitals</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 24x7 Chemist</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Support / 1090</span>
        </div>
      </div>
    </div>
  );
};
