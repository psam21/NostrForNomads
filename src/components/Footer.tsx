import React from 'react';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="border-t border-primary-800">
        <div className="container-width py-6">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2 text-primary-200 text-sm">
              <Globe className="w-4 h-4" />
              <span>Decentralized with <a href="https://en.wikipedia.org/wiki/Nostr" target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:text-accent-300 underline">Nostr</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
