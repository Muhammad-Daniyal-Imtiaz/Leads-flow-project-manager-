'use client';

import { useState, useEffect } from 'react';

interface User {
  userid: string;
  email: string;
  name?: string;
  role?: string;
  createdat?: string;
}

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const successParam = urlParams.get('success');

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      // Clean URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (successParam) {
      setSuccess(getSuccessMessage(successParam));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use window.location.href for reliable redirect
      window.location.href = '/api/auth/google';
    } catch (err: any) {
      setError('Failed to initiate Google sign-in');
      setLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: isLogin ? undefined : name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setSuccess('Signed in successfully!');
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setEmail('');
          setPassword('');
        } else {
          setSuccess('Signup successful! Please check your email for verification.');
          setEmail('');
          setPassword('');
          setName('');
          setIsLogin(true);
        }
      } else {
        setError(getErrorMessage(data.error));
      }
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        setSuccess('Signed out successfully!');
        setError(null);
        localStorage.removeItem('user');
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError('Signout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: { [key: string]: string } = {
      'no_code': 'Authentication failed: No authorization code received. Please check your Google Cloud Console configuration.',
      'auth_failed': 'Authentication failed. Please try again.',
      'session_error': 'Session creation failed. Please try again.',
      'pkce_error': 'Security configuration error. Please check your Google OAuth settings.',
      'no_session': 'Authentication incomplete. Please try again.',
      'no_redirect_url': 'Authentication configuration error.',
      'server_error': 'Server error during authentication. Please try again.',
      'unknown': 'Unknown authentication error. Please try again.',
      'email_exists': 'Email already exists. Please sign in instead.',
      'invalid_credentials': 'Invalid email or password.',
      'weak_password': 'Password should be at least 6 characters.',
      'invalid_email': 'Please enter a valid email address.',
      'email_not_confirmed': 'Please confirm your email before signing in.',
      'network_error': 'Network error. Please check your connection and try again.'
    };
    
    return errorMessages[errorCode] || `Error: ${errorCode}`;
  };

  const getSuccessMessage = (successCode: string) => {
    const successMessages: { [key: string]: string } = {
      'google_signin': 'Google signin successful!',
      'email_signin': 'Email signin successful!',
      'signup': 'Signup successful! Please check your email for verification.',
      'email_confirmed': 'Email confirmed successfully! You can now sign in.',
      'signed_out': 'Signed out successfully!'
    };
    
    return successMessages[successCode] || 'Operation successful';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // JSX remains the same as your original component
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {user ? 'User Profile' : (isLogin ? 'Sign in to your account' : 'Create a new account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {user ? 'You are successfully logged in' : (isLogin ? 'Please sign in to continue' : 'Create your account to get started')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-700 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              <p className="font-medium">Success</p>
              <p className="text-sm mt-1">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="mt-2 text-sm text-green-700 underline hover:text-green-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {user ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <div className="mt-1 text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                    {user.userid}
                  </div>
                </div>

                {user.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.name}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 text-sm text-gray-900 break-all">
                    {user.email}
                  </div>
                </div>

                {user.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.role}
                    </div>
                  </div>
                )}

                {user.createdat && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdat).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={handleSignout}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex bg-gray-100 rounded-md p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailPasswordAuth}>
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                    </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                      placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Forgot your password?
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </div>

                {!isLogin && (
                  <div className="text-sm text-gray-500">
                    <p>By creating an account, you agree to our <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</a>.</p>
                  </div>
                )}
              </form>

              {/* Only show Google sign-in button in login mode */}
              {isLogin && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleGoogleSignin}
                      disabled={loading}
                      className="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {loading ? 'Redirecting...' : 'Continue with Google'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}