import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  Video,
  FileText,
  User,
  ClipboardEdit,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/rooms", icon: Video, label: "Rooms" },
  { href: "/practice", icon: ClipboardEdit, label: "Practice" },
  { href: "/resume", icon: FileText, label: "Resume" },
  { href: "/profile", icon: User, label: "Portfolio" },
  { href: "/profile/settings", icon: Settings, label: "Settings" },
];

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResponsiveSidebar({ isOpen, onClose }: ResponsiveSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto shadow-sm">
          <div className="flex items-center justify-center flex-shrink-0 px-4 py-4 border-b border-border bg-card/50 overflow-hidden">
            <Logo size="sidebar" className="drop-shadow-sm max-w-full" />
          </div>
          <div className="mt-4 flex-grow flex flex-col">
            <nav className="flex-1 px-4 py-2 space-y-1">
              {navItems.map((item) => {
                // More precise matching logic
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' &&
                   item.href !== '/profile' &&
                   location.pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center p-4 border-b border-border overflow-hidden bg-white">
            <Logo size="md" className="drop-shadow-sm" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              // More precise matching logic
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' &&
                 item.href !== '/profile' &&
                 location.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Close Button */}
          <div className="p-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/80"
            >
              <X className="mr-3 h-5 w-5 flex-shrink-0" />
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
