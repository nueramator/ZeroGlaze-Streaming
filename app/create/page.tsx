'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TokenCreationForm } from '@/components/streamer/TokenCreationForm';

export default function CreateTokenPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Create Your Token
            </h1>
            <p className="text-gray-400">
              Launch your own token in minutes and start earning from trades
            </p>
          </div>

          <TokenCreationForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
