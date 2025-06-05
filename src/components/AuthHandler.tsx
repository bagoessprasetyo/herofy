'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle OAuth tokens in URL hash (implicit flow)
    const handleImplicitAuth = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token=')) {
        try {
          const fragment = new URLSearchParams(hash.substring(1));
          const access_token = fragment.get('access_token');
          const refresh_token = fragment.get('refresh_token');

          if (access_token) {
            // Set the session using the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token || '',
            });

            if (!error && data.user) {
              // Create/update user profile
              try {
                await supabase
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
              } catch (profileError) {
                console.warn('Profile creation warning:', profileError);
              }

              // Clean URL and redirect
              window.history.replaceState({}, document.title, '/dashboard');
              toast.success('Successfully signed in! Welcome, Hero! 🎉');
              router.push('/dashboard');
            }
          }
        } catch (error) {
          console.error('Auth handler error:', error);
        }
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleImplicitAuth();
    }
  }, [router]);

  return null; // This component doesn't render anything
}