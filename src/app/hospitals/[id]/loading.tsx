export default function HospitalLoading() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto max-w-4xl px-4 pt-6 pb-12 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="rounded-2xl h-[340px] sm:h-[440px] bg-gray-100 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
        </div>
    );
}
