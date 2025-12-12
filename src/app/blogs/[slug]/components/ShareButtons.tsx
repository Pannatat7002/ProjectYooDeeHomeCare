'use client';

import { Share2 } from 'lucide-react';

export default function ShareButtons() {
    return (
        <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-blue-600" /> แบ่งปันบทความนี้
            </h3>
            <div className="flex flex-wrap gap-3">
                {/* Facebook */}
                <button
                    onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=' + window.location.href, '_blank')}
                    className="flex items-center px-4 py-2 bg-[#1877F2] text-white rounded-xl hover:bg-[#1864D9] transition-colors font-semibold text-sm shadow-md"
                >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.438c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.234 2.686.234v2.953H15.83c-1.493 0-1.956.925-1.956 1.874v2.285h3.332l-.532 3.47h-2.8V23.927C19.612 23.027 24 18.063 24 12.073z" /></svg>
                    Facebook
                </button>
                {/* Twitter */}
                <button
                    onClick={() => window.open('https://twitter.com/intent/tweet?url=' + window.location.href, '_blank')}
                    className="flex items-center px-4 py-2 bg-[#1DA1F2] text-white rounded-xl hover:bg-[#1A91DA] transition-colors font-semibold text-sm shadow-md"
                >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 4.354a9.99 9.99 0 01-2.827.776 4.975 4.975 0 002.162-2.723 9.966 9.966 0 01-3.13 1.196 4.957 4.957 0 00-8.455 4.505A14.04 14.04 0 011.815 3.1a4.957 4.957 0 001.536 6.57A4.925 4.925 0 011.66 9.29c0 0 .001 0 .001 0A4.965 4.965 0 005.617 14.37a4.955 4.955 0 01-2.23.084 4.965 4.965 0 004.607 3.442A9.975 9.975 0 010 19.821a14.06 14.06 0 007.579 2.21A14.04 14.04 0 0021.99 7.425v-.5a10.02 10.02 0 002.01-2.571z" /></svg>
                    Twitter
                </button>
                {/* Line */}
                <button
                    onClick={() => window.open('https://social-plugins.line.me/lineit/share?url=' + window.location.href, '_blank')}
                    className="flex items-center px-4 py-2 bg-[#06C755] text-white rounded-xl hover:bg-[#05B34C] transition-colors font-semibold text-sm shadow-md"
                >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm-1.077 4.56a.715.715 0 00-.737.564c-.21 1.092-.564 2.478-.65 3.468-.052.551-.497.585-.815.228-.752-.865-1.993-2.128-3.048-2.128-1.554 0-2.433 1.13-2.433 2.68 0 1.258.825 2.158 1.488 2.753.385.344.385.748.243 1.055-.308.647-1.12 2.607-1.42 3.868-.23 1.026.046 1.77 1.066 1.77 1.065 0 1.75-.41 2.383-1.464.296-.48.267-.783.564-.783 0 0 1.954.025 3.32.025 1.57 0 2.213-.67 2.213-2.17 0-1.745-1.614-2.887-3.037-3.69-.153-.082-.547-.197-.547-.638 0-.968.96-2.583 1.037-3.23.11-.796-.108-1.758-1.09-1.758z" /></svg>
                    Line
                </button>
                {/* Copy Link */}
                <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm shadow-md"
                    onClick={() => {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            alert('คัดลอกลิงก์แล้ว!');
                        }
                    }}
                >
                    Copy Link
                </button>
            </div>
        </div>
    );
}
