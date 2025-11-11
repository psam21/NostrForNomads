import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ContributionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContributionPage({ params }: ContributionPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-serif font-bold text-purple-800 mb-4">
            Contribution Details
          </h1>
          <p className="text-gray-600 mb-6">
            ID: {decodeURIComponent(id)}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Success!</strong> Your contribution has been published to Nostr relays.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              The detail page is being developed. For now, you can view your contribution in the{' '}
              <Link href="/explore" className="text-purple-600 hover:text-purple-700 underline">
                Explore feed
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

