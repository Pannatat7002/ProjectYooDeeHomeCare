export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative pt-24 pb-20 px-4 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 min-h-[520px] flex items-center">
        <div className="relative z-10 container max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Title Skeletons */}
          <div className="h-10 md:h-12 bg-gray-600/60 rounded-2xl w-3/4 max-w-xl mb-4"></div>
          <div className="h-5 md:h-6 bg-gray-600/40 rounded-xl w-1/2 max-w-md mb-8"></div>

          {/* Search Box Skeleton */}
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-[2rem] shadow-lg border border-white/40">
            <div className="flex flex-col gap-4">
              {/* Row 1: Search Input */}
              <div className="h-12 md:h-14 bg-gray-200/80 rounded-2xl w-full"></div>

              {/* Row 2: Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
                <div className="grid grid-cols-2 lg:flex gap-2 w-full lg:w-auto">
                  <div className="hidden lg:block h-11 w-28 bg-gray-200/80 rounded-xl"></div>
                  <div className="col-span-2 lg:col-span-1 h-11 w-full lg:w-44 bg-gray-200/80 rounded-xl"></div>
                  <div className="h-11 w-full lg:w-36 bg-gray-200/80 rounded-xl"></div>
                  <div className="h-11 w-full lg:w-36 bg-gray-200/80 rounded-xl"></div>
                </div>
                <div className="h-11 w-full lg:w-32 bg-blue-300/80 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Section 1: Featured / Partner Centers */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="h-48 md:h-52 bg-gray-200 w-full relative">
                  <div className="absolute top-3 left-3 h-6 w-20 bg-gray-300 rounded-full"></div>
                </div>
                <div className="p-5 flex flex-col gap-3 flex-grow">
                  <div className="h-6 bg-gray-200 rounded-md w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
                    <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                    <div className="h-9 w-24 bg-blue-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: All Centers Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-56 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-20 bg-gray-200 rounded-md"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="h-48 md:h-52 bg-gray-200 w-full"></div>
                <div className="p-5 flex flex-col gap-3 flex-grow">
                  <div className="h-6 bg-gray-200 rounded-md w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
                    <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
                    <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="h-6 w-28 bg-gray-200 rounded-md"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
