export default function CenterDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12 animate-pulse">
      {/* Breadcrumb / Back button skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="h-5 w-44 bg-gray-200 rounded-lg"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Section: Title, Badges, Rating, Price */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-24 bg-blue-100 rounded-full"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 sm:h-10 w-3/4 max-w-lg bg-gray-200 rounded-xl"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-28 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
            <div className="h-8 w-36 bg-blue-100 rounded-xl"></div>
          </div>
        </div>

        {/* Gallery Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-72 sm:h-96 md:h-[440px] bg-gray-200 rounded-2xl"></div>
          <div className="hidden lg:grid grid-rows-3 gap-4">
            <div className="bg-gray-200 rounded-xl"></div>
            <div className="bg-gray-200 rounded-xl"></div>
            <div className="bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Quick Action Bar Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>

        {/* Main 2-Column Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-6 w-36 bg-gray-200 rounded-md"></div>
              <div className="space-y-2.5">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-11/12 bg-gray-200 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Services Tags */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-6 w-44 bg-gray-200 rounded-md"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Room Types / Packages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-6 w-52 bg-gray-200 rounded-md"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-36 bg-gray-100 rounded-xl border border-gray-200/60 p-4 space-y-3">
                  <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded-md mt-4"></div>
                </div>
                <div className="h-36 bg-gray-100 rounded-xl border border-gray-200/60 p-4 space-y-3">
                  <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded-md mt-4"></div>
                </div>
              </div>
            </div>

            {/* Map Skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
              <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>

          {/* Right Column: Sticky Contact Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5 sticky top-24">
              <div className="h-6 w-48 bg-gray-200 rounded-md mx-auto"></div>
              <div className="h-4 w-56 bg-gray-200 rounded-md mx-auto"></div>
              <div className="space-y-3 pt-2">
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-blue-500/80 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
