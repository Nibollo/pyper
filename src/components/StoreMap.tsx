'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Store } from '@/types';

// Custom Marker Icon with pulsing effect
const createCustomIcon = (isSelected: boolean) => L.divIcon({
    className: 'custom-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 ${isSelected ? 'bg-primary/40' : 'bg-primary/20'} rounded-full animate-ping"></div>
            <div class="relative w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[14px] text-white font-bold">store</span>
            </div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
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

// (Store interface removed as it's now imported from @/types)

interface StoreMapProps {
    stores: Store[];
    selectedStoreId?: string | null;
}

export default function StoreMap({ stores, selectedStoreId }: StoreMapProps) {
    const selectedStore = selectedStoreId ? stores.find(s => s.id === selectedStoreId) : null;

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={PY_CENTER}
                zoom={PY_ZOOM}
                scrollWheelZoom={true}
                className="h-full w-full"
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
                            icon={createCustomIcon(selectedStoreId === store.id)}
                        >
                            <Popup className="premium-popup">
                                <div className="p-2 min-w-[200px]">
                                    {store.image_url && (
                                        <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-slate-50 border border-slate-100 shadow-sm relative">
                                            <img 
                                                src={store.image_url} 
                                                alt={store.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight leading-tight">{store.name}</h4>
                                        <div className="flex items-start gap-1.5 mt-1 border-t border-slate-50 pt-2">
                                            <span className="material-symbols-outlined text-[14px] text-slate-400 mt-0.5">location_on</span>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{store.address}</p>
                                        </div>
                                        
                                        {store.whatsapp && (
                                            <a
                                                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all shadow-md shadow-green-500/20 active:scale-95 translate-y-0 hover:-translate-y-0.5"
                                            >
                                                <span className="material-symbols-outlined text-xs">chat</span>
                                                CONTACTAR
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            <style jsx global>{`
                .premium-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 1.25rem;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(8px);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .premium-popup .leaflet-popup-tip {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
            `}</style>
        </div>
    );
}
