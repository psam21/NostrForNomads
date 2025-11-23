'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchMeetupByDTag } from '@/services/business/MeetService';
import { ContentNotFound } from '@/components/generic/ContentNotFound';
import { MeetupDetail } from '@/components/pages/MeetupDetail';
import { Loader2 } from 'lucide-react';
import type { MeetupEvent } from '@/types/meetup';

export default function MeetupPage() {
  const params = useParams();
  const [meetup, setMeetup] = useState<MeetupEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadMeetup() {
      try {
        const id = params.id as string;
        const decodedId = decodeURIComponent(id);
        const meetupData = await fetchMeetupByDTag('', decodedId);

        if (!meetupData) {
          setError(true);
        } else {
          setMeetup(meetupData);
        }
      } catch (err) {
        console.error('Error loading meetup:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadMeetup();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading meetup...</p>
        </div>
      </div>
    );
  }

  if (error || !meetup) {
    return <ContentNotFound />;
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container-width py-10">
        <MeetupDetail meetup={meetup} />
      </div>
    </div>
  );
}
