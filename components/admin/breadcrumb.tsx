"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link
        href="/admin"
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Admin</span>
      </Link>

      {segments.map((segment, index) => {
        if (segment === "admin" && index === 0) return null;
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formattedName = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-semibold text-foreground">{formattedName}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
