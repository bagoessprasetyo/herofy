import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorMessage = errorDescription || error || 'Authentication failed';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
  }

  // Handle implicit flow (access_token in URL fragment)
  // This is common with some OAuth providers
  if (!code) {
    // For implicit flow, we need to handle this on the client side
    // Redirect to our implicit handler
    return NextResponse.redirect(`${origin}/auth/implicit-callback${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
  }

  // Handle authorization code flow
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Token exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
    }

    if (!data?.user) {
      console.error('No user data received after token exchange');
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
    }

    console.log('OAuth authentication successful for user:', data.user.email);
    
    // For OAuth users, ensure they have a profile
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
        console.warn('Profile creation/update warning:', profileError);
        // Don't fail the login for profile issues
      }
    } catch (profileError) {
      console.warn('Profile handling error:', profileError);
      // Continue with login even if profile creation fails
    }

    // Determine redirect URL
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }

  } catch (error) {
    console.error('Unexpected auth callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`);
  }
}