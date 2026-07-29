'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, ReactNode } from 'react';

import './Dock.css';

interface DockItemProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  mouseX: any
  spring: any
  distance: number
  magnification: number
  baseItemSize: number
  label: string
}

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  label
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: 80
    };
    return val - rect.x - (rect.width || 80) / 2;
  });

  // Calculate dynamic scale factor between 1.0 and 1.35 based on distance
  const targetScale = useTransform(mouseDistance, [-distance, 0, distance], [1, 1.35, 1]);
  const scale = useSpring(targetScale, spring);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        originY: 1
      }}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {children}
    </motion.div>
  );
}

interface DockProps {
  items: Array<{
    label: string
    onClick?: () => void
    className?: string
  }>
  className?: string
  spring?: any
  magnification?: number
  distance?: number
  panelHeight?: number
  dockHeight?: number
  baseItemSize?: number
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 1.35,
  distance = 150,
  panelHeight = 44,
  dockHeight = 44,
  baseItemSize = 44
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="dock-outer">
      <motion.div
        onMouseMove={({ pageX }) => {
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            <span className="text-[11px] font-extrabold tracking-wide uppercase px-3 py-1.5 block select-none">
              {item.label}
            </span>
          </DockItem>
        ))}
      </motion.div>
    </div>
  );
}
