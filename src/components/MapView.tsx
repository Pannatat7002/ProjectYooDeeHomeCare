interface MapViewProps {
    mapUrl: string;
}

export default function MapView({ mapUrl }: MapViewProps) {
    if (!mapUrl) return null;

    // Extract src from iframe string if user pasted full iframe tag
    const srcMatch = mapUrl.match(/src="([^"]+)"/);
    const url = srcMatch ? srcMatch[1] : mapUrl;

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-sm border">
            <iframe
                src={url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
}
