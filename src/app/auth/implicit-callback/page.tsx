'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ImplicitCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleImplicitAuth = async () => {
      try {
        // Get the URL fragment (everything after #)
        const hash = window.location.hash;
        
        if (!hash) {
          setStatus('No authentication data found');
          setTimeout(() => router.push('/login?error=Authentication failed'), 2000);
          return;
        }

        // Parse the fragment parameters
        const fragment = new URLSearchParams(hash.substring(1));
        const access_token = fragment.get('access_token');
        const refresh_token = fragment.get('refresh_token');
        const expires_in = fragment.get('expires_in');

        if (!access_token) {
          setStatus('No access token found');
          setTimeout(() => router.push('/login?error=Authentication failed'), 2000);
          return;
        }

        setStatus('Setting up your session...');

        // Set the session using the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        if (error) {
          console.error('Session setup error:', error);
          setStatus('Failed to set up session');
          setTimeout(() => router.push('/login?error=Authentication failed'), 2000);
          return;
        }

        if (data.user) {
          setStatus('Creating your hero profile...');
          
          // Create/update user profile
          try {
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                email: data.user.email!,
                username: data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0],
              }, {
                onConflict: 'id',
                ignoreDuplicates: false
              });

            if (profileError) {
              console.warn('Profile creation warning:', profileError);
              // Don't fail for profile issues
            }
          } catch (profileError) {
            console.warn('Profile handling error:', profileError);
          }

          setStatus('Welcome to Herofy! Redirecting...');
          toast.success('Successfully signed in! Welcome, Hero! 🎉');
          
          // Clean the URL and redirect
          window.history.replaceState({}, document.title, '/dashboard');
          router.push('/dashboard');
        } else {
          setStatus('Authentication failed');
          setTimeout(() => router.push('/login?error=Authentication failed'), 2000);
        }

      } catch (error) {
        console.error('Implicit auth error:', error);
        setStatus('An unexpected error occurred');
        setTimeout(() => router.push('/login?error=Authentication failed'), 2000);
      }
    };

    handleImplicitAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Setting Up Your Hero Account
        </h1>
        
        <p className="text-gray-600 mb-4">
          {status}
        </p>
        
        <div className="text-sm text-gray-500">
          Please wait while we complete your authentication...
        </div>
      </div>
    </div>
  );
}