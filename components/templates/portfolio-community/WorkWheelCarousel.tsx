"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

interface WorkWheelCarouselProps {
  id: string;
  children: ReactNode;
}

export default function WorkWheelCarousel({ id, children }: WorkWheelCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scrollByDelta(delta: number) {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;

    scroller.scrollBy({
      left: delta,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scroller = scrollerRef.current;
    if (!wrapper || !scroller) return;
    const currentScroller = scroller;

    function handleWheel(event: WheelEvent) {
      if (currentScroller.scrollWidth <= currentScroller.clientWidth) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;

      event.preventDefault();
      scrollByDelta(delta);
    }

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByDelta(420);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByDelta(-420);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="mt-16"
      aria-roledescription="carousel"
      aria-label="Projetos"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={scrollerRef}
        id={id}
        className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-6 [scrollbar-width:thin] lg:gap-12"
      >
        {children}
      </div>
    </div>
  );
}
