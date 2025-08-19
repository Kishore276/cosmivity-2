


import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarLink, useSidebar } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Video,
  FileText,
  User,
  ClipboardEdit,
  Settings,
} from "lucide-react";


export function SidebarContent() {
    const { open } = useSidebar();
    const navItems = [
        { href: "/dashboard", icon: <LayoutDashboard className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Dashboard" },
        { href: "/rooms", icon: <Video className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Rooms" },
        { href: "/practice", icon: <ClipboardEdit className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Practice" },
        { href: "/resume", icon: <FileText className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Resume" },
        { href: "/profile", icon: <User className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Portfolio" },
        { href: "/profile/settings", icon: <Settings className="text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0" />, label: "Settings" },
    ];
    
    return (
        <div className="flex flex-col h-full text-foreground">
            <div className="flex flex-col flex-1">
                <nav className="mt-8 flex flex-col gap-2 px-4">
                    {navItems.map((item, idx) => (
                    <SidebarLink key={idx} link={item} />
                    ))}
                </nav>
            </div>
        </div>
    )
}
