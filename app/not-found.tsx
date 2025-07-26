import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
} 