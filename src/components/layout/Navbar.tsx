import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, HelpCircle, X, Database, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { DbStatusInfo } from '../../services/api';
import { TFlixLogo } from '../common/TFlixLogo';
import { PlanTier } from '../../types';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenDbModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAccessModal: () => void;
  dbStatus: DbStatusInfo | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userCode: string | null;
  planTier: PlanTier | null;
  isAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenShortcutsModal,
  onOpenDbModal,
  onOpenAdminModal,
  onOpenAccessModal,
  dbStatus,
  searchQuery,
  onSearchChange,
  userCode,
  planTier,
  isAuthenticated,
}) => {
  const location = useLocation();

  const navLinks = [
    { label: 'Live TV', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Favorites', path: '/favorites' },
    { label: 'History', path: '/history' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050507]/95 backdrop-blur-md border-b border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group whitespace-nowrap shrink-0"
        >
          <TFlixLogo size="md" showSubtitle={true} />
        </Link>

        {/* Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-white border-b-2 border-red-600 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search bar & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick search input */}
          <div className="relative hidden sm:block w-36 md:w-52">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search TFLIX..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#0d0f15] text-xs text-neutral-200 placeholder-neutral-500 pl-9 pr-7 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Entry Pass Status Button */}
          <button
            onClick={onOpenAccessModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all shadow-sm ${
              isAuthenticated
                ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/60 hover:bg-red-900/80 border-red-700/60 text-red-300 animate-pulse'
            }`}
            title="Inspect TFLIX Entry Pass"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">
              {isAuthenticated ? `${(planTier || 'VIP').toUpperCase()} PASS` : 'ENTER CODE'}
            </span>
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdminModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0d0f15] hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors"
            title="Admin Login & Code Generator"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden lg:inline">Admin</span>
          </button>

          {/* SQLite DB Status Indicator */}
          <button
            onClick={onOpenDbModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d0f15] hover:bg-neutral-800/80 border border-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors"
            title="Inspect SQLite Database Engine"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline font-mono">SQLite DB</span>
          </button>

          {/* Keyboard shortcut hint */}
          <button
            onClick={onOpenShortcutsModal}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-xl transition-colors hidden xl:flex items-center justify-center"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Add Channel Modal */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
            title="Add Custom Live Stream"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Stream</span>
          </button>
        </div>
      </div>
    </header>
  );
};
