import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="font-bold text-2xl text-blue-900">ThaiCareCenter</Link>
                <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600">สำหรับผู้ดูแล</Link>
            </div>
        </header>
    );
}
