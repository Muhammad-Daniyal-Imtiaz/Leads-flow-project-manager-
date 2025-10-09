'use client';

import { useState, useEffect } from 'react';

interface User {
  userid: number;
  email: string;
  name: string;
  role: string;
  linkedin_profile?: string;
  instagram_profile?: string;
  phone_number?: string;
  country?: string;
  company_email?: string;
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [instagramProfile, setInstagramProfile] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Function to store user in localStorage
  const storeUserInLocalStorage = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Function to get user from localStorage
  const getUserFromLocalStorage = (): User | null => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  };

  // Function to clear user from localStorage
  const clearUserFromLocalStorage = () => {
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Check if user exists in localStorage on component mount
    const storedUser = getUserFromLocalStorage();
    if (storedUser) {
      setUser(storedUser);
    } else {
      checkAuthStatus();
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const successParam = urlParams.get('success');

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (successParam) {
      setSuccess(getSuccessMessage(successParam));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
        storeUserInLocalStorage(data.user);
      } else {
        setUser(null);
        clearUserFromLocalStorage();
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      clearUserFromLocalStorage();
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    window.location.href = '/api/auth/google';
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

    if (!isLogin && (!name || !email)) {
      setError('Please fill in all required fields');
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
          phone_number: isLogin ? undefined : phoneNumber,
          country: isLogin ? undefined : country,
          company_email: isLogin ? undefined : companyEmail,
          linkedin_profile: isLogin ? undefined : linkedinProfile,
          instagram_profile: isLogin ? undefined : instagramProfile,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setSuccess('Signed in successfully!');
          setUser(data.user);
          storeUserInLocalStorage(data.user);
          setEmail('');
          setPassword('');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          setSuccess(data.message || 'Signup successful! Please check your email for verification.');
          // If immediate session was created (email confirmation not required)
          if (data.user) {
            setUser(data.user);
            storeUserInLocalStorage(data.user);
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
          }
          // Reset form fields
          setEmail('');
          setPassword('');
          setName('');
          setPhoneNumber('');
          setCountry('');
          setCompanyEmail('');
          setLinkedinProfile('');
          setInstagramProfile('');
          setIsLogin(true);
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Authentication error:', err);
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
        clearUserFromLocalStorage();
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      console.error('Signout error:', err);
      setError('Signout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: { [key: string]: string } = {
      'no_code': 'Authentication failed: No authorization code received.',
      'auth_failed': 'Authentication failed: Invalid credentials.',
      'session_error': 'Session creation failed.',
      'server_error': 'Server error during authentication.',
      'email_exists': 'Email already exists. Please sign in instead.',
      'invalid_credentials': 'Invalid email or password.',
      'weak_password': 'Password should be at least 6 characters.',
      'email_not_confirmed': 'Please check your email to verify your account before signing in.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  };

  const getSuccessMessage = (successCode: string) => {
    const successMessages: { [key: string]: string } = {
      'email_confirmed': 'Email confirmed successfully! You can now sign in.',
    };
    
    return successMessages[successCode] || 'Operation successful';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {user ? 'User Profile' : (isLogin ? 'Sign in to your account' : 'Create a new account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              <p className="font-medium">Success</p>
              <p className="text-sm mt-1">{success}</p>
            </div>
          )}

          {user ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-semibold text-blue-600">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Welcome, {user.name}!</h3>
                <p className="text-sm text-gray-500">You are currently logged in</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-sm text-gray-900">{user.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 text-sm text-gray-900 break-all">{user.email}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1 text-sm text-gray-900">{user.role}</div>
                </div>

                {user.phone_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <div className="mt-1 text-sm text-gray-900">{user.phone_number}</div>
                  </div>
                )}

                {user.country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <div className="mt-1 text-sm text-gray-900">{user.country}</div>
                  </div>
                )}

                {user.company_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Email</label>
                    <div className="mt-1 text-sm text-gray-900 break-all">{user.company_email}</div>
                  </div>
                )}

                {user.createdat && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdat).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleSignout}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
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
                    className={`py-2 px-4 rounded-md text-sm font-medium ${isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailPasswordAuth}>
                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                        Company Email
                      </label>
                      <input
                        id="companyEmail"
                        name="companyEmail"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700">
                        LinkedIn Profile
                      </label>
                      <input
                        id="linkedinProfile"
                        name="linkedinProfile"
                        type="url"
                        value={linkedinProfile}
                        onChange={(e) => setLinkedinProfile(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="instagramProfile" className="block text-sm font-medium text-gray-700">
                        Instagram Profile
                      </label>
                      <input
                        id="instagramProfile"
                        name="instagramProfile"
                        type="url"
                        value={instagramProfile}
                        onChange={(e) => setInstagramProfile(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignin}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}