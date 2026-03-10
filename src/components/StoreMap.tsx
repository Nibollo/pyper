'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Paraguay bounds/center
const PY_CENTER: [number, number] = [-23.4425, -58.4438];
const PY_ZOOM = 6;

// Component to handle map centering and zooming on selection
function MapController({ selectedStore, stores }: { selectedStore: any, stores: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (selectedStore && selectedStore.lat && selectedStore.lng) {
            map.flyTo([selectedStore.lat, selectedStore.lng], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [selectedStore, map]);

    return null;
}

interface Store {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    whatsapp?: string;
    image_url?: string;
}

interface StoreMapProps {
    stores: Store[];
    selectedStoreId?: string | null;
}

export default function StoreMap({ stores, selectedStoreId }: StoreMapProps) {
    const selectedStore = selectedStoreId ? stores.find(s => s.id === selectedStoreId) : null;

    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '1rem', overflow: 'hidden', zIndex: 1 }}>
            <MapContainer
                center={PY_CENTER}
                zoom={PY_ZOOM}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <MapController selectedStore={selectedStore} stores={stores} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stores.map((store) => (
                    store.lat && store.lng && (
                        <Marker
                            key={store.id}
                            position={[store.lat, store.lng]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    {store.image_url && (
                                        <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-slate-50 border border-slate-100">
                                            <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h4 className="font-bold text-sm mb-1">{store.name}</h4>
                                    <p className="text-[10px] text-slate-600 mb-2 leading-tight">{store.address}</p>
                                    {store.whatsapp && (
                                        <a
                                            href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                                        >
                                            <span className="material-symbols-outlined text-sm">chat</span>
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}
