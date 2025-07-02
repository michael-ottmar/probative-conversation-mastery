'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Probative Conversation Mastery
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master Blair Enns' methodology to move from vendor to expert in your client's mind
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Transform Your Entire Organization
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Unified Expertise</h3>
                <p className="text-gray-600">
                  Create coherent positioning across all teams, from umbrella to specialized units
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cross-Team Mastery</h3>
                <p className="text-gray-600">
                  Enable any team member to articulate the value of other teams effectively
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Positioning</h3>
                <p className="text-gray-600">
                  Build a unified narrative that positions your whole company as the expert
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started with Google
          </button>

          <div className="mt-12 text-sm text-gray-500">
            Based on "The Four Conversations" by Blair Enns
          </div>
        </div>
      </div>
    </main>
  );
}