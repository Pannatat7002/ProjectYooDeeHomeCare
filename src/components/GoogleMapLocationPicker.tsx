'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, ExternalLink, Loader2 } from 'lucide-react';

interface GoogleMapLocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, formattedAddress?: string) => void;
    currentAddress?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

export default function GoogleMapLocationPicker({
    lat,
    lng,
    onChange,
    currentAddress,
}: GoogleMapLocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const autocompleteRef = useRef<any>(null);

    // API Key from env or localStorage
    const [apiKey, setApiKey] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Local coordinates for manual input
    const [localLat, setLocalLat] = useState<string>(lat ? lat.toString() : '13.7563');
    const [localLng, setLocalLng] = useState<string>(lng ? lng.toString() : '100.5018');

    // Search state (Fallback mode)
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);

    // Sync when props change from external
    useEffect(() => {
        if (lat !== undefined && !isNaN(lat)) {
            setLocalLat(lat.toString());
        }
        if (lng !== undefined && !isNaN(lng)) {
            setLocalLng(lng.toString());
        }
        if (markerRef.current && mapInstanceRef.current && lat && lng) {
            const newPos = { lat: Number(lat), lng: Number(lng) };
            markerRef.current.setPosition(newPos);
            mapInstanceRef.current.panTo(newPos);
        }
    }, [lat, lng]);

    // Check API Key
    useEffect(() => {
        const checkKey = () => {
            const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
            const savedKey = typeof window !== 'undefined' ? localStorage.getItem('google_maps_api_key') : null;
            const effectiveKey = envKey || savedKey || '';
            setApiKey(effectiveKey);
        };
        checkKey();

        window.addEventListener('storage', checkKey);
        return () => window.removeEventListener('storage', checkKey);
    }, []);

    // Load Google Maps Script if API key is present
    useEffect(() => {
        if (!apiKey) {
            setIsLoaded(false);
            return;
        }

        const existingScript = document.getElementById('google-maps-picker-script') as HTMLScriptElement;
        if (existingScript) {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
            }
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-picker-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=th`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                setLoadError(null);
            }
        };

        script.onerror = () => {
            setLoadError('ไม่สามารถโหลด Google Maps JS API ได้ (กำลังใช้โหมดแผนที่มาตรฐาน)');
            setIsLoaded(false);
        };

        document.head.appendChild(script);
    }, [apiKey]);

    // Initialize interactive Google Map when script is loaded
    useEffect(() => {
        if (!isLoaded || !mapRef.current || !window.google?.maps) return;

        const initialLat = Number(localLat) || 13.7563;
        const initialLng = Number(localLng) || 100.5018;
        const centerPos = { lat: initialLat, lng: initialLng };

        const map = new window.google.maps.Map(mapRef.current, {
            center: centerPos,
            zoom: initialLat === 13.7563 && initialLng === 100.5018 ? 12 : 16,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
        });
        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
            position: centerPos,
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
            title: 'ลากหมุดเพื่อปรับตำแหน่ง',
        });
        markerRef.current = marker;

        const geocoder = new window.google.maps.Geocoder();

        const updatePosition = (position: { lat: number; lng: number }) => {
            setLocalLat(position.lat.toFixed(6));
            setLocalLng(position.lng.toFixed(6));

            geocoder.geocode({ location: position }, (results: any, status: string) => {
                const address = status === 'OK' && results[0] ? results[0].formatted_address : undefined;
                onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)), address);
            });
        };

        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) {
                updatePosition({ lat: pos.lat(), lng: pos.lng() });
            }
        });

        map.addListener('click', (e: any) => {
            const clickedPos = e.latLng;
            if (clickedPos) {
                marker.setPosition(clickedPos);
                updatePosition({ lat: clickedPos.lat(), lng: clickedPos.lng() });
            }
        });

        if (searchInputRef.current && window.google.maps.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                componentRestrictions: { country: 'th' },
                fields: ['geometry', 'name', 'formatted_address'],
            });
            autocomplete.bindTo('bounds', map);
            autocompleteRef.current = autocomplete;

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) {
                    return;
                }

                const newLocation = place.geometry.location;
                map.setCenter(newLocation);
                map.setZoom(17);
                marker.setPosition(newLocation);

                const newLat = Number(newLocation.lat().toFixed(6));
                const newLng = Number(newLocation.lng().toFixed(6));
                setLocalLat(newLat.toString());
                setLocalLng(newLng.toString());
                onChange(newLat, newLng, place.formatted_address || place.name);
            });
        }
    }, [isLoaded]);

    // Handle manual Lat/Lng input submit
    const handleApplyManualCoords = () => {
        const parsedLat = parseFloat(localLat);
        const parsedLng = parseFloat(localLng);
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
            alert('กรุณากรอกตัวเลขพิกัด Latitude และ Longitude ให้ถูกต้อง');
            return;
        }

        const newPos = { lat: parsedLat, lng: parsedLng };
        onChange(parsedLat, parsedLng);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.panTo(newPos);
            mapInstanceRef.current.setZoom(16);
            markerRef.current.setPosition(newPos);
        }
    };

    // Quick geolocation button
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ไม่รองรับ Geolocation');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLat = Number(pos.coords.latitude.toFixed(6));
                const newLng = Number(pos.coords.longitude.toFixed(6));
                setLocalLat(newLat.toString());
                setLocalLng(newLng.toString());
                onChange(newLat, newLng);

                if (mapInstanceRef.current && markerRef.current) {
                    const newPos = { lat: newLat, lng: newLng };
                    mapInstanceRef.current.panTo(newPos);
                    mapInstanceRef.current.setZoom(16);
                    markerRef.current.setPosition(newPos);
                }
            },
            (err) => {
                alert('ไม่สามารถดึงตำแหน่งปัจจุบันได้: ' + err.message);
            }
        );
    };

    // Fallback search using open geocoder
    const handleFallbackSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setShowResultsDropdown(true);
        try {
            const q = encodeURIComponent(searchQuery.trim() + ' ประเทศไทย');
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=th`, {
                headers: { 'Accept-Language': 'th' }
            });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setSearchResults(data.map(item => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                })));
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSearchResult = (result: { name: string; lat: number; lng: number }) => {
        const newLat = Number(result.lat.toFixed(6));
        const newLng = Number(result.lng.toFixed(6));
        setLocalLat(newLat.toString());
        setLocalLng(newLng.toString());
        onChange(newLat, newLng, result.name);
        setShowResultsDropdown(false);
        setSearchQuery(result.name);

        if (mapInstanceRef.current && markerRef.current) {
            const newPos = { lat: newLat, lng: newLng };
            mapInstanceRef.current.panTo(newPos);
            mapInstanceRef.current.setZoom(16);
            markerRef.current.setPosition(newPos);
        }
    };

    const parsedLat = parseFloat(localLat) || 13.7563;
    const parsedLng = parseFloat(localLng) || 100.5018;
    const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${parsedLat},${parsedLng}&hl=th&z=16&output=embed`;
    const googleMapsExternalUrl = `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">ค้นหาและปักหมุดตำแหน่ง (Google Maps)</h4>
                        <p className="text-xs text-gray-500">พิมพ์ค้นหาสถานที่ หรือระบุพิกัด Lat, Lng เพื่อแสดงระยะทางที่แม่นยำ</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
                        title="ใช้ตำแหน่งปัจจุบันของอุปกรณ์นี้"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                        ใช้ตำแหน่งปัจจุบัน
                    </button>
                    <a
                        href={googleMapsExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                        title="เปิดดูตำแหน่งนี้ใน Google Maps"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        ดูบน Google Maps
                    </a>
                </div>
            </div>

            {/* Search Box */}
            {isLoaded ? (
                // Google Places Autocomplete (when API key is loaded)
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="พิมพ์ค้นหาชื่อศูนย์, ซอย หรือถนน..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                        }}
                    />
                </div>
            ) : (
                // Instant Search Form (Works immediately without API key)
                <div className="relative">
                    <form onSubmit={handleFallbackSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="พิมพ์ค้นหาสถานที่หรือที่อยู่ เช่น ซอยติวานนท์ 38/1, เมืองทองธานี..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                        >
                            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                            ค้นหา
                        </button>
                    </form>

                    {/* Results Dropdown */}
                    {showResultsDropdown && searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-52 overflow-y-auto">
                            {searchResults.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectSearchResult(item)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-0 flex items-start gap-2"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Map Preview Container */}
            <div className="relative w-full h-[280px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {isLoaded ? (
                    // Interactive Google Map (with draggable pin)
                    <div ref={mapRef} className="w-full h-full" />
                ) : (
                    // Direct Google Map Embed (Free, no API key required, always works)
                    <iframe
                        title="Google Maps Location Preview"
                        src={googleMapsEmbedUrl}
                        width="100%"
                        height="100%"
                        className="border-0 w-full h-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                )}
            </div>

            {/* Coordinate Inputs (Lat / Long) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        ละติจูด (Latitude)
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={localLat}
                        onChange={(e) => setLocalLat(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md font-mono text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="เช่น 13.929415"
                    />
                </div>
                <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        ลองจิจูด (Longitude)
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={localLng}
                        onChange={(e) => setLocalLng(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md font-mono text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="เช่น 100.532570"
                    />
                </div>
                <div className="sm:col-span-2">
                    <button
                        type="button"
                        onClick={handleApplyManualCoords}
                        className="w-full py-1.5 px-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
                    >
                        ปรับพิกัด
                    </button>
                </div>
            </div>
        </div>
    );
}
