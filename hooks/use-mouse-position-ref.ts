import { useEffect, useRef, RefObject } from "react";

export function useMousePositionRef(containerRef: RefObject<HTMLDivElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate coordinates relative to container center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      positionRef.current.x = e.clientX - centerX;
      positionRef.current.y = e.clientY - centerY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [containerRef]);

  return positionRef;
}
