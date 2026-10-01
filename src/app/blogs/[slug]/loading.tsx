export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        {/* Back Link Skeleton */}
        <div className="h-5 w-32 bg-gray-200 rounded-md mb-6"></div>

        {/* Title & Date */}
        <div className="h-10 w-full max-w-2xl bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded-md mb-6"></div>

        {/* Author / Meta Row */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="w-full h-72 sm:h-96 bg-gray-200 rounded-2xl mb-8"></div>

        {/* Content Paragraphs */}
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mt-8 mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
