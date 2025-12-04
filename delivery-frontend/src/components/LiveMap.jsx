import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom car icon for driver markers
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097150.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const LiveMap = ({ drivers }) => {
  const defaultCenter = [6.9271, 79.8612]; // Colombo, Sri Lanka
  const defaultZoom = 13;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Driver Markers */}
      {drivers && drivers.length > 0 && drivers.map((driver) => {
        // Only render marker if driver has valid coordinates
        if (driver.currentLatitude && driver.currentLongitude) {
          return (
            <Marker
              key={driver.id}
              position={[driver.currentLatitude, driver.currentLongitude]}
              icon={carIcon}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Driver: {driver.user?.email || 'Unknown'}</strong>
                  <br />
                  <span>Vehicle: {driver.vehiclePlateNumber || 'N/A'}</span>
                  <br />
                  <span style={{ color: driver.isAvailable ? 'green' : 'red' }}>
                    {driver.isAvailable ? '● Online' : '● Offline'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default LiveMap;
