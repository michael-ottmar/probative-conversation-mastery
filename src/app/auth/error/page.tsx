'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-center text-gray-600 mb-6">
          There was a problem signing you in. Please try again.
        </p>
        <Link
          href="/"
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}