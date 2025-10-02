'use client';

import { useState } from 'react';
import { Rocket, BarChart3, Target, Users, ArrowRight, Shield, Zap, Star, ChevronDown, Play, Award, TrendingUp, CheckCircle, Sparkles, Menu, X, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './Context/AuthContext'; // Correct import path

export default function Home() {
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLoadProjects = () => {
    router.push('/Comp');
  };

  const handleSignIn = () => {
    router.push('/loginn');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3ef] to-[#d1ebdb]/30">
      {/* Header with professional color scheme */}
      <header className="bg-[#305759] text-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">LeadsFlow 180</h1>
              <span className="ml-4 px-3 py-1 bg-white text-[#305759] rounded-full text-sm font-medium">
                Project Tracker
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              <a href="/dash" className="hover:text-[#d1ebdb] transition-colors font-medium">Dashboard</a>
              <a href="/Comp" className="hover:text-[#d1ebdb] transition-colors font-medium">Projects</a>
              <a href="#" className="hover:text-[#d1ebdb] transition-colors font-medium">Analytics</a>
              <a href="#" className="hover:text-[#d1ebdb] transition-colors font-medium">Team</a>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-[#d1ebdb]">Welcome, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSignIn}
                    className="text-white/80 hover:text-white transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleLoadProjects}
                    className="bg-white text-[#305759] px-5 py-2.5 rounded-lg font-medium hover:bg-[#e7f3ef] transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >
                    <Rocket className="w-4 h-4" />
                    Load Projects
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-white/20">
              <nav className="flex flex-col space-y-3">
                <a href="/dash" className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors font-medium">Dashboard</a>
                <a href="/Comp" className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors font-medium">Projects</a>
                <a href="#" className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors font-medium">Analytics</a>
                <a href="#" className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors font-medium">Team</a>
                
                {user ? (
                  <>
                    <div className="py-2 px-4 text-[#d1ebdb] font-medium">Welcome, {user.name}</div>
                    <button 
                      onClick={handleLogout}
                      className="py-2 px-4 text-left hover:bg-white/10 rounded-lg transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSignIn}
                      className="py-2 px-4 text-left hover:bg-white/10 rounded-lg transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleLoadProjects}
                      className="py-2 px-4 text-left hover:bg-white/10 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Load Projects
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Rest of your component remains exactly the same... */}
      <main>
        {projectsLoaded ? (
          <div className="container mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-[#305759] mb-8">Project Dashboard</h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-lg text-[#192524]">Your projects will appear here once loaded.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section 
              className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#305759]/70 to-[#192524]/60"></div>
              
              <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center min-h-screen py-12 text-white">
                  <div className="mb-10 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight mb-6">
                      Manage your Projects
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                      With Professional Precision
                    </h2>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10">
                      LeadsFlow 180 provides all the tools your marketing team needs to plan, execute, and track successful campaigns with enterprise-grade security and scalability.
                    </p>
                  </div>

                  <div className="w-24 h-1 bg-[#d1ebdb] mb-10"></div>

                  <div className="flex flex-col sm:flex-row gap-6 mb-16">
                    <button 
                      onClick={handleLoadProjects}
                      className="bg-[#d1ebdb] text-[#305759] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white transition-all duration-300 flex items-center gap-3 shadow-md"
                    >
                      <span>Launch Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-[#305759] transition-all duration-300 flex items-center gap-3">
                      <Play className="w-5 h-5" />
                      <span>Watch Demo</span>
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2">Real-time Project Dashboard</h3>
                    <p className="text-lg">Track all your marketing campaigns in one place</p>
                  </div>
                </div>
                
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="flex flex-col items-center text-white animate-bounce">
                    <span className="text-sm mb-2">Scroll to explore</span>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-b from-[#e7f3ef] to-[#d1ebdb]/50 relative">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-[#192524] mb-6">
                    Everything You Need to <span className="text-[#305759]">Succeed</span>
                  </h2>
                  <p className="text-xl text-[#192524]">
                    LeadsFlow 180 provides all the tools your marketing team needs to plan, execute, and track successful campaigns.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* ... rest of your features section ... */}
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#305759] relative overflow-hidden">
              {/* ... rest of your stats section ... */}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      {!projectsLoaded && (
        <footer className="bg-[#192524] text-white py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-6 h-6 text-[#d1ebdb]" />
              <h3 className="text-2xl font-bold">LeadsFlow 180</h3>
            </div>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              The leading project management solution for marketing teams looking to maximize efficiency and results.
            </p>
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} LeadsFlow 180. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}