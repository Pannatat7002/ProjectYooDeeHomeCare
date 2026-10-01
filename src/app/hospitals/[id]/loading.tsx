export default function HospitalLoading() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto max-w-4xl px-4 pt-10 pb-16 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-28 mb-6"></div>
                <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="h-32 bg-gray-100 rounded-xl"></div>
                    <div className="h-32 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="h-14 bg-gray-200 rounded-xl w-64"></div>
            </div>
        </div>
    );
}
