'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GoogleMapLocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, formattedAddress?: string) => void;
    currentAddress?: string;
}

declare global {
    interface Window {
        google: any;
        gm_authFailure?: () => void;
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

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

    // Check API Key from Next.js public env or localStorage
    useEffect(() => {
        const checkKey = () => {
            const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                process.env.CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                '';
            const savedKey = typeof window !== 'undefined' ? localStorage.getItem('google_maps_api_key') : null;
            const effectiveKey = (envKey || savedKey || '').trim();
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

        // Catch authentication errors (e.g. invalid key, referrer restrictions)
        window.gm_authFailure = () => {
            console.warn('[Google Maps] Authentication failed. Falling back to standard mode.');
            setLoadError('Google Maps API Key ไม่ผ่านการตรวจสอบจาก Google (กำลังใช้โหมดแผนที่มาตรฐาน)');
            setIsLoaded(false);
        };

        if (window.google?.maps?.places) {
            setIsLoaded(true);
            setLoadError(null);
            return;
        }

        const existingScript = document.getElementById('google-maps-picker-script') as HTMLScriptElement;
        if (existingScript) {
            const handleLoad = () => {
                if (window.google && window.google.maps) {
                    setIsLoaded(true);
                    setLoadError(null);
                }
            };
            existingScript.addEventListener('load', handleLoad);
            return () => existingScript.removeEventListener('load', handleLoad);
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
            const latStr = position.lat.toFixed(6);
            const lngStr = position.lng.toFixed(6);
            setLocalLat(latStr);
            setLocalLng(lngStr);

            geocoder.geocode({ location: position }, (results: any, status: string) => {
                const address = status === 'OK' && results[0] ? results[0].formatted_address : undefined;
                onChange(Number(latStr), Number(lngStr), address);
                if (address) {
                    setStatusMessage(`ปักหมุดแล้ว: ${address}`);
                    setTimeout(() => setStatusMessage(null), 4000);
                }
            });
        };

        // Drag marker to adjust
        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) {
                updatePosition({ lat: pos.lat(), lng: pos.lng() });
            }
        });

        // Click map anywhere to reposition marker
        map.addListener('click', (e: any) => {
            const clickedPos = e.latLng;
            if (clickedPos) {
                marker.setPosition(clickedPos);
                updatePosition({ lat: clickedPos.lat(), lng: clickedPos.lng() });
            }
        });

        // Places Autocomplete
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
                const addr = place.formatted_address || place.name;
                onChange(newLat, newLng, addr);
                setStatusMessage(`พบสถานที่: ${addr}`);
                setTimeout(() => setStatusMessage(null), 4000);
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
        setStatusMessage(`อัปเดตพิกัด (${parsedLat}, ${parsedLng}) เรียบร้อย`);
        setTimeout(() => setStatusMessage(null), 3000);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.panTo(newPos);
            mapInstanceRef.current.setZoom(16);
            markerRef.current.setPosition(newPos);
        }
    };

    // Quick geolocation button
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLat = Number(pos.coords.latitude.toFixed(6));
                const newLng = Number(pos.coords.longitude.toFixed(6));
                setLocalLat(newLat.toString());
                setLocalLng(newLng.toString());
                onChange(newLat, newLng);
                setStatusMessage('ระบุตำแหน่งปัจจุบันของอุปกรณ์สำเร็จ');
                setTimeout(() => setStatusMessage(null), 3000);

                if (mapInstanceRef.current && markerRef.current) {
                    const newPos = { lat: newLat, lng: newLng };
                    mapInstanceRef.current.panTo(newPos);
                    mapInstanceRef.current.setZoom(16);
                    markerRef.current.setPosition(newPos);
                }
            },
            () => {
                alert('ไม่สามารถระบุตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือลองใหม่อีกครั้ง');
            }
        );
    };

    // Unified Search handler (works in both Interactive and Fallback modes)
    const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const query = (searchQuery || searchInputRef.current?.value || '').trim();
        if (!query) return;

        setIsSearching(true);

        // If interactive Google Maps is loaded, try Google Geocoder first
        if (isLoaded && window.google?.maps?.Geocoder && mapInstanceRef.current && markerRef.current) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
                { address: query, componentRestrictions: { country: 'TH' } },
                async (results: any, status: string) => {
                    if (status === 'OK' && results[0]?.geometry?.location) {
                        const loc = results[0].geometry.location;
                        mapInstanceRef.current.panTo(loc);
                        mapInstanceRef.current.setZoom(17);
                        markerRef.current.setPosition(loc);

                        const newLat = Number(loc.lat().toFixed(6));
                        const newLng = Number(loc.lng().toFixed(6));
                        setLocalLat(newLat.toString());
                        setLocalLng(newLng.toString());
                        const addr = results[0].formatted_address;
                        onChange(newLat, newLng, addr);
                        setStatusMessage(`พบสถานที่: ${addr}`);
                        setTimeout(() => setStatusMessage(null), 4000);
                        setIsSearching(false);
                    } else {
                        // Fallback to internal geocode API
                        await executeFallbackSearch(query);
                    }
                }
            );
            return;
        }

        // Standard / Fallback mode search
        await executeFallbackSearch(query);
    };

    const executeFallbackSearch = async (query: string) => {
        setIsSearching(true);
        setShowResultsDropdown(true);
        try {
            const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch geocode');
            const data = await res.json();
            if (data && Array.isArray(data.results) && data.results.length > 0) {
                setSearchResults(data.results);
            } else {
                setSearchResults([]);
                setStatusMessage('ไม่พบสถานที่ตรงกับคำค้นหา กรุณาระบุชื่อสถานที่ให้ชัดเจนยิ่งขึ้น');
                setTimeout(() => setStatusMessage(null), 4000);
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
        if (searchInputRef.current) {
            searchInputRef.current.value = result.name;
        }

        setStatusMessage(`เลือกพิกัด: ${result.name}`);
        setTimeout(() => setStatusMessage(null), 4000);

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
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">ค้นหาและปักหมุดตำแหน่ง (Google Maps)</h4>
                            {isLoaded ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Interactive Pin
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                    Standard Map
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isLoaded
                                ? 'คลิกหรือลากหมุดบนแผนที่เพื่อขยับตำแหน่ง หรือพิมพ์ค้นหาด้านล่าง'
                                : 'พิมพ์ค้นหาสถานที่ หรือระบุพิกัด Lat, Lng เพื่อคำนวณระยะทางโรงพยาบาล'}
                        </p>
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

            {/* Error or Alert banner if load failed */}
            {loadError && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{loadError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setLoadError(null)}
                        className="text-amber-500 hover:text-amber-800 shrink-0 font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Status Feedback Message */}
            {statusMessage && (
                <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 p-2 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Unified Search Box */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSearch(e);
                                }
                            }}
                            placeholder="พิมพ์ค้นหาชื่อศูนย์, ซอย หรือสถานที่ เช่น ซอยติวานนท์ 38/1, แจ้งวัฒนะ..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={(e) => handleSearch(e)}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        ค้นหา
                    </button>
                </div>

                {/* Results Dropdown (for fallback and external geocode results) */}
                {showResultsDropdown && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto">
                        <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                            <span>ผลการค้นหาสถานที่ ({searchResults.length})</span>
                            <button
                                type="button"
                                onClick={() => setShowResultsDropdown(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ปิด
                            </button>
                        </div>
                        {searchResults.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSearchResult(item)}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-0 flex items-start gap-2 transition-colors"
                            >
                                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{item.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Preview Container */}
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {isLoaded ? (
                    // Interactive Google Map (Draggable pin & Click-to-pin)
                    <div ref={mapRef} className="w-full h-full" />
                ) : (
                    // Direct Google Map Embed (Always accessible)
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

            {/* Instruction Tip */}
            <div className="text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200/60 flex items-center justify-between">
                <span>
                    {isLoaded
                        ? '💡 คุณสามารถคลิกจุดใดก็ได้บนแผนที่ หรือลากหมุดสีแดงเพื่อขยับพิกัดได้อย่างอิสระ'
                        : '💡 โหมดแผนที่มาตรฐาน: พิมพ์ค้นหาด้านบน หรือกรอกตัวเลขพิกัดด้านล่างแล้วกด "ปรับพิกัด"'}
                </span>
                <span className="font-mono text-gray-400 text-[10px]">
                    {parsedLat.toFixed(4)}, {parsedLng.toFixed(4)}
                </span>
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleApplyManualCoords();
                            }
                        }}
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleApplyManualCoords();
                            }
                        }}
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
