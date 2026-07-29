"use client";

import React from "react";
import Link from "next/link";
import { Frame } from "lucide-react";

interface LogoProps {
  href?: string;
  className?: string;
  isAdmin?: boolean;
}

export function Logo({ href = "/", className = "", isAdmin = false }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200 bg-background border border-border/50 flex items-center justify-center">
        <img
          src="/assets/images/logo.png"
          alt="Maja Posters Logo"
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            // Fallback if image fails to load
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-none tracking-tight text-foreground">
          Maja <span className="text-brand-600">Posters</span>
        </span>
        {isAdmin && (
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-0.5">
            CMS Admin
          </span>
        )}
      </div>
    </Link>
  );
}
