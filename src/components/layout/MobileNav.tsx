import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tv, Grid, Heart, History } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { label: 'Live TV', path: '/', icon: Tv },
    { label: 'Categories', path: '/categories', icon: Grid },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'History', path: '/history', icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050507]/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1 safe-bottom shadow-2xl">
      <div className="grid grid-cols-4 items-center h-14">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
