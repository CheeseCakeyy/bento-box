"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const cameraRollImages = [
  { src: "/camera-roll/01.jpeg", alt: "Street mirror selfie overlooking a busy city intersection" },
  { src: "/camera-roll/02.jpeg", alt: "A sleeping cat beside handwritten study notes" },
  { src: "/camera-roll/03.jpeg", alt: "A laptop beside a rain-covered window during a journey" },
  { src: "/camera-roll/04.jpeg", alt: "A dog resting in front of a mountain landscape" },
  { src: "/camera-roll/05.jpeg", alt: "A quiet restaurant interior beneath a bright cloudy sky" },
  { src: "/camera-roll/06.jpeg", alt: "A portrait taken along a mountain fort walkway" },
  { src: "/camera-roll/07.jpeg", alt: "Rows of colorful paint jars in an art supply shop" },
];

const imageCount = cameraRollImages.length;
const gap = 16;
const flickDeceleration = 2200;
const flickMaxSteps = 8;

function wrapIndex(index: number) {
  return ((index % imageCount) + imageCount) % imageCount;
}

export default function CameraRoll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    lastX: number;
    lastTime: number;
    total: number;
    velocity: number;
  } | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  const visualFrameRef = useRef<number | null>(null);
  const pendingVisualRef = useRef({ offset: 0, velocity: 0 });
  const [slideWidth, setSlideWidth] = useState(1);
  const [displayIndex, setDisplayIndex] = useState(imageCount * 2);
  const [dragOffset, setDragOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [snapDuration, setSnapDuration] = useState(420);
  const [reduceMotion, setReduceMotion] = useState(false);
  const currentPhoto = wrapIndex(displayIndex);
  const stride = slideWidth + gap;
  const repeatedImages = useMemo(
    () => Array.from({ length: 5 }, () => cameraRollImages).flat(),
    [],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setSlideWidth(Math.max(1, Math.round(entry.contentRect.width)));
      setDragOffset(0);
    });
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (wheelLockRef.current !== null) window.clearTimeout(wheelLockRef.current);
      if (visualFrameRef.current !== null) window.cancelAnimationFrame(visualFrameRef.current);
    };
  }, []);

  const scheduleDragVisual = (offset: number, nextVelocity: number) => {
    pendingVisualRef.current = { offset, velocity: nextVelocity };
    if (visualFrameRef.current !== null) return;
    visualFrameRef.current = window.requestAnimationFrame(() => {
      const pending = pendingVisualRef.current;
      setDragOffset(pending.offset);
      setVelocity(pending.velocity);
      visualFrameRef.current = null;
    });
  };

  const navigate = (steps: number) => {
    if (!steps || dragging) return;
    setSnapDuration(Math.min(620, 340 + Math.abs(steps) * 54));
    setTransitioning(!reduceMotion);
    setDisplayIndex((index) => index + steps);
    setDragOffset(0);
  };

  const navigateTo = (photoIndex: number) => {
    let delta = photoIndex - currentPhoto;
    if (delta > imageCount / 2) delta -= imageCount;
    if (delta < -imageCount / 2) delta += imageCount;
    navigate(delta);
  };

  const finishDrag = (cancelled = false) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (visualFrameRef.current !== null) {
      window.cancelAnimationFrame(visualFrameRef.current);
      visualFrameRef.current = null;
    }

    const velocityPxPerSecond = Math.max(-4200, Math.min(4200, drag.velocity * 1000));
    const coastDistance =
      (velocityPxPerSecond * Math.abs(velocityPxPerSecond)) / (2 * flickDeceleration);
    const projectedDistance = -drag.total - coastDistance;
    let steps = cancelled ? 0 : Math.round(projectedDistance / Math.max(stride, 1));
    if (!cancelled && steps === 0 && (Math.abs(drag.total) > 34 || Math.abs(drag.velocity) > 0.32)) {
      steps = drag.total < 0 || drag.velocity < 0 ? 1 : -1;
    }
    steps = Math.max(-flickMaxSteps, Math.min(flickMaxSteps, steps));

    const duration = cancelled
      ? 360
      : Math.min(760, 330 + Math.abs(steps) * 48 + Math.abs(velocityPxPerSecond) / 18);

    dragRef.current = null;
    setDragging(false);
    setSnapDuration(duration);
    setTransitioning(!reduceMotion);
    setDragOffset(0);
    setVelocity(reduceMotion ? 0 : drag.velocity);
    if (steps) setDisplayIndex((index) => index + steps);
  };

  const distortion = reduceMotion ? 0 : Math.min(Math.abs(velocity) * 0.72, 1);
  const trackTransform = -displayIndex * stride + dragOffset;

  return (
    <>
      <div className="camera-roll__header">
        <span>Camera roll</span>
        <div className="camera-roll__indicators" aria-label="Choose a camera roll photo">
          {cameraRollImages.map((image, index) => (
            <button
              key={image.src}
              className={index === currentPhoto ? "is-active" : ""}
              type="button"
              aria-label={`Go to photo ${index + 1}`}
              aria-current={index === currentPhoto ? "true" : undefined}
              onClick={() => navigateTo(index)}
            />
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`camera-roll__viewport ${dragging ? "is-dragging" : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Camera roll, photo ${currentPhoto + 1} of ${imageCount}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(-1);
          }
        }}
        onWheel={(event) => {
          const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
          if (!horizontalIntent || wheelLockRef.current !== null) return;
          event.preventDefault();
          const delta = event.shiftKey ? event.deltaY : event.deltaX;
          navigate(delta > 0 ? 1 : -1);
          wheelLockRef.current = window.setTimeout(() => {
            wheelLockRef.current = null;
          }, 420);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            lastX: event.clientX,
            lastTime: event.timeStamp,
            total: 0,
            velocity: 0,
          };
          setDragging(true);
          setTransitioning(false);
          setVelocity(0);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const now = event.timeStamp;
          const elapsed = Math.max(now - drag.lastTime, 1);
          const movement = event.clientX - drag.lastX;
          drag.total = event.clientX - drag.startX;
          drag.velocity = drag.velocity * 0.58 + (movement / elapsed) * 0.42;
          drag.lastX = event.clientX;
          drag.lastTime = now;
          scheduleDragVisual(drag.total, drag.velocity);
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId !== event.pointerId) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          finishDrag();
        }}
        onPointerCancel={() => finishDrag(true)}
      >
        <div className="camera-roll__instructions">Drag, flick, or use arrow keys</div>
        <div
          className={`camera-roll__track ${transitioning ? "is-transitioning" : ""}`}
          style={
            {
              transform: `translate3d(${trackTransform}px, 0, 0)`,
              "--camera-slide-width": `${slideWidth}px`,
              "--camera-squash": String(1 - distortion * 0.11),
              "--camera-stretch": String(1 + distortion * 0.035),
              "--camera-blur": `${distortion * 2.4}px`,
              "--camera-snap-duration": `${snapDuration}ms`,
            } as React.CSSProperties
          }
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            let normalizedIndex = displayIndex;
            while (normalizedIndex < imageCount * 2) normalizedIndex += imageCount;
            while (normalizedIndex >= imageCount * 3) normalizedIndex -= imageCount;
            setTransitioning(false);
            setVelocity(0);
            if (normalizedIndex !== displayIndex) setDisplayIndex(normalizedIndex);
          }}
        >
          {repeatedImages.map((image, index) => (
            <figure key={`${image.src}-${index}`} className="camera-roll__slide">
              <img
                src={image.src}
                alt={index >= imageCount * 2 && index < imageCount * 3 ? image.alt : ""}
                draggable="false"
                loading={index === imageCount * 2 ? "eager" : "lazy"}
              />
            </figure>
          ))}
        </div>
        <span className="camera-roll__counter" aria-live="polite">
          {String(currentPhoto + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
