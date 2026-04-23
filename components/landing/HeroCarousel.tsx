"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { heroCarouselCards, type HeroCarouselCardItem } from "@/components/landing/heroCarouselCards";

function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const getServerSnapshot = () => false;

function getCardStyle(offset: number, mobile: boolean) {
  const absOffset = Math.abs(offset);

  if (absOffset > 2) {
    return {
      x: offset > 0 ? (mobile ? 240 : 760) : mobile ? -200 : -520,
      y: mobile ? 0 : offset * 22,
      scale: 0.56,
      opacity: 0,
      rotate: offset * (mobile ? 2 : 3),
      zIndex: 0,
    };
  }

  if (mobile) {
    if (offset === 0) {
      return { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, zIndex: 30 };
    }

    if (offset === 1) {
      return { x: 116, y: 0, scale: 0.82, opacity: 0.66, rotate: 2.6, zIndex: 20 };
    }

    if (offset === 2) {
      return { x: 182, y: 0, scale: 0.66, opacity: 0.3, rotate: 4.8, zIndex: 10 };
    }

    if (offset === -1) {
      return { x: -82, y: 0, scale: 0.76, opacity: 0.12, rotate: -2, zIndex: 10 };
    }

    return { x: -126, y: 0, scale: 0.64, opacity: 0.06, rotate: -4, zIndex: 0 };
  }

  if (offset === 0) {
    return { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, zIndex: 30 };
  }

  if (offset === 1) {
    return { x: 336, y: 24, scale: 0.84, opacity: 0.76, rotate: 2.7, zIndex: 20 };
  }

  if (offset === 2) {
    return { x: 604, y: 52, scale: 0.7, opacity: 0.56, rotate: 4.8, zIndex: 10 };
  }

  if (offset === -1) {
    return { x: -152, y: -10, scale: 0.8, opacity: 0.1, rotate: -2.1, zIndex: 10 };
  }

  return { x: -240, y: -20, scale: 0.68, opacity: 0.04, rotate: -4.6, zIndex: 0 };
}

export default function HeroCarousel() {
  const cards = heroCarouselCards;
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLockRef = useRef(0);
  const wheelIntentRef = useRef(0);
  const wheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerSnapshot);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot,
  );

  const activeCard = cards[activeIndex];

  const sectionStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: activeCard.stageBackground,
      boxShadow: `0 30px 90px ${activeCard.cardShadow}`,
    }),
    [activeCard.cardShadow, activeCard.stageBackground],
  );

  const move = useCallback((delta: -1 | 1) => {
    setActiveIndex((current) => {
      const nextIndex = current + delta;
      if (nextIndex < 0 || nextIndex >= cards.length) {
        return current;
      }

      return nextIndex;
    });
  }, [cards.length]);

  const consumeWheel = useCallback((delta: number, event?: { preventDefault?: () => void }) => {
    const now = Date.now();
    const threshold = isMobile ? 42 : 60;

    wheelIntentRef.current += delta;

    if (wheelResetTimerRef.current) {
      clearTimeout(wheelResetTimerRef.current);
    }

    wheelResetTimerRef.current = setTimeout(() => {
      wheelIntentRef.current = 0;
    }, 120);

    if (Math.abs(wheelIntentRef.current) < threshold) {
      return;
    }

    if (now - wheelLockRef.current < 420) {
      event?.preventDefault?.();
      return;
    }

    if (wheelIntentRef.current > 0 && activeIndex < cards.length - 1) {
      event?.preventDefault?.();
      wheelLockRef.current = now;
      wheelIntentRef.current = 0;
      move(1);
      return;
    }

    if (wheelIntentRef.current < 0 && activeIndex > 0) {
      event?.preventDefault?.();
      wheelLockRef.current = now;
      wheelIntentRef.current = 0;
      move(-1);
    }
  }, [activeIndex, cards.length, isMobile, move]);

  useEffect(() => {
    function handleWindowWheel(event: WheelEvent) {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const heroDominant =
        rect.top < viewportHeight * 0.38 && rect.bottom > viewportHeight * 0.48;

      if (!heroDominant) {
        return;
      }

      consumeWheel(event.deltaY, event);
    }

    window.addEventListener("wheel", handleWindowWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWindowWheel);
      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current);
      }
    };
  }, [consumeWheel]);

  return (
    <motion.div
      className="relative flex min-h-full w-full overflow-hidden rounded-[2.6rem] p-2.5 shadow-[0_24px_80px_rgba(15,17,21,0.18)] sm:p-4 lg:p-5"
      animate={
        reducedMotion
          ? false
          : {
              backgroundColor: activeCard.stageBackground,
            }
      }
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={sectionStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background: `radial-gradient(circle at 18% 18%, ${activeCard.stageGlow}44 0%, transparent 32%), radial-gradient(circle at 84% 82%, ${activeCard.cardAccent}24 0%, transparent 28%)`,
          transition: reducedMotion ? undefined : "background 360ms ease-out",
        }}
      />

      <div
        ref={frameRef}
        className="relative min-h-[calc(100vh-1.25rem)] w-full overflow-hidden rounded-[2.15rem] border border-white/10 bg-neutral-950/8 px-3 py-4 sm:min-h-[calc(100vh-2rem)] sm:px-5 sm:py-5 lg:min-h-[calc(100vh-2.5rem)] lg:px-7 lg:py-6"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            move(1);
          }

          if (event.key === "ArrowLeft") {
            move(-1);
          }
        }}
        role="region"
        aria-label="Landing hero carousel"
        aria-roledescription="carousel"
        tabIndex={0}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(15,17,21,0.12))]" />

        <AnimatePresence initial={false} mode="popLayout">
          {cards.map((card, index) => {
            const offset = index - activeIndex;
            const style = getCardStyle(offset, isMobile);

            if (Math.abs(offset) > 2) {
              return null;
            }

            return (
              <motion.div
                key={card.id}
                className="absolute top-1/2"
                initial={false}
                animate={{
                  x: style.x,
                  y: style.y,
                  scale: style.scale,
                  opacity: style.opacity,
                  rotate: style.rotate,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 280,
                        damping: 30,
                        mass: 0.74,
                      }
                }
                style={{
                  zIndex: style.zIndex,
                  left: isMobile ? "50%" : "38%",
                  marginLeft: isMobile ? "-8.5rem" : "-16rem",
                  marginTop: isMobile ? "-12.75rem" : "-21rem",
                  willChange: "transform, opacity",
                }}
              >
                <HeroCarouselCard
                  card={card}
                  index={index}
                  total={cards.length}
                  isActive={offset === 0}
                  isNearActive={Math.abs(offset) <= 1}
                  reducedMotion={reducedMotion}
                  onSelect={() => setActiveIndex(index)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface HeroCarouselCardProps {
  card: HeroCarouselCardItem;
  index: number;
  total: number;
  isActive: boolean;
  isNearActive: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}

function HeroCarouselCard({
  card,
  index,
  total,
  isActive,
  isNearActive,
  reducedMotion,
  onSelect,
}: HeroCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const TitleTag = isActive ? "h1" : "p";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isActive) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => undefined);
      }
      return;
    }

    video.pause();
  }, [isActive]);

  return (
    <motion.article
      className="relative h-[25.5rem] w-[17rem] cursor-pointer overflow-hidden rounded-[2.1rem] border sm:h-[33rem] sm:w-[24rem] lg:h-[40rem] lg:w-[31rem]"
      layout={false}
      onClick={onSelect}
      whileHover={
        isActive && !reducedMotion
          ? {
              scale: 1.015,
              rotateY: 1.4,
              rotateX: -1,
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      style={{
        borderColor: card.cardBorder,
        boxShadow: `0 18px 60px ${card.cardShadow}`,
        background: `linear-gradient(155deg, ${card.cardAccent} 0%, ${card.cardSurface} 72%)`,
      }}
      role="group"
      aria-roledescription="slide"
      aria-label={`Card ${index + 1} of ${total}: ${card.title}`}
      tabIndex={isActive ? 0 : -1}
    >
      {isNearActive ? (
        <video
          ref={videoRef}
          src={card.video}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(15,17,21,0.06) 0%, rgba(15,17,21,0.14) 32%, ${card.cardSurface}dd 72%, ${card.cardSurface} 100%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 22% 18%, ${card.stageGlow}35 0%, transparent 28%), radial-gradient(circle at 84% 16%, rgba(255,255,255,0.16) 0%, transparent 24%)`,
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5 lg:p-7">
        <div className="flex items-start justify-between gap-3">
          <span
            className="max-w-[10rem] rounded-full px-3 py-1.5 font-data text-[0.63rem] font-semibold uppercase tracking-[0.12em] sm:max-w-none sm:text-[0.68rem] lg:text-[0.72rem]"
            style={{
              backgroundColor: card.badgeBackground,
              color: card.badgeColor,
            }}
          >
            {card.eyebrow}
          </span>
          <span
            className="rounded-full px-2.5 py-1 font-data text-[0.63rem] font-bold uppercase tracking-[0.14em] sm:text-[0.68rem] lg:text-[0.72rem]"
            style={{
              backgroundColor: card.badgeBackground,
              color: card.badgeColor,
            }}
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="max-w-[23rem]">
          <TitleTag
            className="font-display text-[clamp(2.7rem,8.5vw,4.45rem)] font-[900] leading-[0.88] tracking-[-0.07em] sm:text-[clamp(3rem,6vw,4.6rem)] lg:text-[clamp(3.9rem,5vw,5.2rem)]"
            style={{ color: card.textColor }}
          >
            {card.title}
          </TitleTag>
          <p
            className="mt-3 max-w-[20rem] text-[clamp(0.98rem,2.8vw,1.12rem)] font-semibold leading-[1.3] tracking-[-0.015em] sm:mt-4 sm:text-[clamp(1rem,1.8vw,1.18rem)] lg:max-w-[22rem] lg:text-[clamp(1.05rem,1.45vw,1.28rem)]"
            style={{ color: card.mutedTextColor }}
          >
            {card.subtitle}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
