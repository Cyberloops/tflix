import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useChannels } from './hooks/useChannels';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { WatchPage } from './pages/WatchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RecentPage } from './pages/RecentPage';
import { AddChannelModal } from './components/channels/AddChannelModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { DatabaseManagerModal } from './components/common/DatabaseManagerModal';
import { AccessGateModal } from './components/auth/AccessGateModal';
import { AdminPortalModal } from './components/admin/AdminPortalModal';
import { TFlixLogo } from './components/common/TFlixLogo';
import { ShieldCheck, Database, Lock, KeyRound } from 'lucide-react';

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Authentication & Entry Code Security Hook
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    code: userCode,
    planTier,
    verifyCode,
    logout
  } = useAuth();

  const {
    allChannels,
    filteredChannels,
    featuredChannels,
    favoriteChannels,
    recentChannels,
    searchQuery,
    setSearchQuery,
    isFavorite,
    toggleFavorite,
    recordWatch,
    clearRecent,
    addChannel,
    removeChannel,
    resetChannels,
    reloadChannels,
    dbStatus,
  } = useChannels();

  // Global key listener for '?' to open shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#050507] text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased selection:bg-red-600/30 selection:text-red-200">
        {/* Top Bar Navigation */}
        <Navbar
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onOpenAccessModal={() => setIsAccessModalOpen(true)}
          dbStatus={dbStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userCode={userCode}
          planTier={planTier}
          isAuthenticated={isAuthenticated}
        />

        {/* Main Content Area */}
        <main className="flex-1 pb-16 md:pb-6">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  channels={allChannels}
                  featuredChannels={featuredChannels}
                  favoriteChannels={favoriteChannels}
                  recentChannels={recentChannels}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onDeleteChannel={removeChannel}
                  searchQuery={searchQuery}
                  filteredChannels={filteredChannels}
                  dbStatus={dbStatus}
                  onOpenDbModal={() => setIsDbModalOpen(true)}
                />
              }
            />

            <Route
              path="/categories"
              element={
                <CategoriesPage
                  channels={allChannels}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onDeleteChannel={removeChannel}
                />
              }
            />

            <Route
              path="/watch/:id"
              element={
                <WatchPage
                  channels={allChannels}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  recordWatch={recordWatch}
                />
              }
            />

            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  favoriteChannels={favoriteChannels}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onDeleteChannel={removeChannel}
                />
              }
            />

            <Route
              path="/history"
              element={
                <RecentPage
                  recentChannels={recentChannels}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onClearRecent={clearRecent}
                  onDeleteChannel={removeChannel}
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav />

        {/* Modals & Entry Gate */}
        
        {/* ACCESS SECURITY GATE: Shown if user has not entered a valid code, or clicks enter pass */}
        <AccessGateModal
          isOpen={(!isAuthenticated && !isAuthLoading) || isAccessModalOpen}
          onVerify={async (code) => {
            const res = await verifyCode(code);
            if (res.success) {
              setIsAccessModalOpen(false);
            }
            return res;
          }}
          onOpenAdmin={() => {
            setIsAccessModalOpen(false);
            setIsAdminModalOpen(true);
          }}
        />

        {/* ADMIN PORTAL MODAL */}
        <AdminPortalModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onCodeGenerated={(newCode) => {
            // Pre-fill or notify
          }}
          onChannelsChanged={reloadChannels}
        />

        <AddChannelModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddChannel={addChannel}
        />

        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        <DatabaseManagerModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          dbStatus={dbStatus}
          onResetChannels={resetChannels}
        />

        {/* Footer with cybertech by cyberloops copyright */}
        <footer className="border-t border-neutral-900 bg-[#030305] py-8 px-4 text-xs text-neutral-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TFlixLogo size="sm" showSubtitle={true} />
              <span className="text-neutral-700">|</span>
              <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted OTT Broadcast</span>
              </span>
            </div>

            <p className="text-neutral-500 text-center text-[11px]">
              © {new Date().getFullYear()} cybertech by cyberloops. All rights reserved.
            </p>

            <div className="flex items-center gap-3 text-neutral-400">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
              >
                <Lock className="w-3 h-3 text-red-500" />
                <span>Admin Login</span>
              </button>
              <span className="text-neutral-700">·</span>
              <button
                onClick={() => setIsAccessModalOpen(true)}
                className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>{isAuthenticated ? 'Pass Details' : 'Enter Pass'}</span>
              </button>
              <span className="text-neutral-700">·</span>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[11px]">SQLite DB</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
