'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthDebugPage() {
  const searchParams = useSearchParams();
  const [urlInfo, setUrlInfo] = useState<any>({});

  useEffect(() => {
    // Get all URL parameters
    const params = Object.fromEntries(searchParams.entries());
    
    // Get URL fragments (after #)
    const hash = window.location.hash;
    const fragment = new URLSearchParams(hash.substring(1));
    const fragmentParams = Object.fromEntries(fragment.entries());

    setUrlInfo({
      searchParams: params,
      fragmentParams,
      fullUrl: window.location.href,
      hash,
      pathname: window.location.pathname,
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">URL Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(urlInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Expected for OAuth:</strong> URL should contain 'code' parameter or access_token in fragment</p>
            <p><strong>If you see access_token in fragmentParams:</strong> OAuth is working but using implicit flow</p>
            <p><strong>If you see code in searchParams:</strong> OAuth is working with authorization code flow</p>
            <p><strong>If neither:</strong> OAuth redirect URL might be misconfigured</p>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/login" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}