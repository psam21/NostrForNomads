import React from 'react';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-purple-800 text-white">
      <div className="border-t border-purple-600">
        <div className="container-width py-6">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2 text-purple-100 text-sm">
              <Globe className="w-4 h-4" />
              <span>Decentralized with <a href="https://en.wikipedia.org/wiki/Nostr" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Nostr</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
