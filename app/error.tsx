'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">An error occurred while loading this page.</p>
        <button
          onClick={reset}
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 