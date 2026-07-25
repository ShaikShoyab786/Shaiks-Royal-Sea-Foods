import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Fish, ShieldCheck, Droplets, Snowflake, Thermometer, Truck, Home } from 'lucide-react';
import { useGetContent, type JourneyStep } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Timeline (static) ─────────────────────────────────────────────────── */

const TIMELINE = [
  { Icon: Fish,        label: 'Sea' },
  { Icon: ShieldCheck, label: 'Quality Inspection' },
  { Icon: Droplets,    label: 'Professional Cleaning' },
  { Icon: Snowflake,   label: 'Flash Frozen −18°C' },
  { Icon: Thermometer, label: 'Temp. Controlled Storage' },
  { Icon: Truck,       label: 'Royal Delivery' },
  { Icon: Home,        label: 'Your Doorstep' },
];

const PARTICLES = [
  { top: '5%',  left: '4%',  w: 280, h: 280, dur: 13, delay: 0 },
  { top: '60%', left: '80%', w: 320, h: 320, dur: 16, delay: 2.5 },
  { top: '40%', left: '50%', w: 160, h: 160, dur: 10, delay: 1 },
  { top: '75%', left: '18%', w: 200, h: 200, dur: 11, delay: 1.8 },
  { top: '10%', left: '90%', w: 180, h: 180, dur: 14, delay: 3 },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function JourneySection() {
  const { data: steps, isLoading } = useGetContent<JourneyStep[]>('journey_steps');

  const [modalIdx, setModalIdx]         = useState<number | null>(null);
  const [modalIn, setModalIn]           = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [activeCard, setActiveCard]     = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sectionIn, setSectionIn]       = useState(false);
  const [timelineIn, setTimelineIn]     = useState(false);

  const sectionRef   = useRef<HTMLElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs      = useRef<(HTMLImageElement | null)[]>([]);
  const timelineRef  = useRef<HTMLDivElement>(null);

  /* Section entrance */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSectionIn(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Card entrance + stagger */
  useEffect(() => {
    if (!steps) return;
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setTimeout(() => {
              setVisibleCards(prev => {
                const next = new Set([...prev, i]);
                if (next.size === steps.length) {
                  setTimeout(() => setShowCompletion(true), 400);
                }
                return next;
              });
            }, i * 150);
            obs.disconnect();
          }
        },
        { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [steps]);

  /* Active card (scroll progress highlight) */
  useEffect(() => {
    if (!steps) return;
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveCard(i); },
        { threshold: 0.65 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [steps]);

  /* Timeline reveal */
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimelineIn(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Mouse parallax */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const img = imgRefs.current[i];
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    img.style.transition = 'none';
    img.style.transform  = `translate(${dx}px,${dy}px) scale(1.05)`;
  }, []);

  const handleMouseLeave = useCallback((i: number) => {
    const img = imgRefs.current[i];
    if (!img) return;
    img.style.transition = 'transform 0.5s ease';
    img.style.transform  = 'translate(0,0) scale(1.02)';
  }, []);

  /* Modal */
  const openModal = (i: number) => {
    setModalIdx(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setModalIn(true)));
  };
  const closeModal = () => {
    setModalIn(false);
    setTimeout(() => setModalIdx(null), 300);
  };

  /* Shared connector element */
  const Connector = ({ idx }: { idx: number }) => (
    <>
      <div className="hidden md:flex items-center justify-center w-10 lg:w-14 flex-shrink-0 relative py-6">
        <div
          className={`absolute left-0 right-0 h-0.5 overflow-hidden rounded-full transition-opacity duration-700 ${
            activeCard !== null && activeCard > idx ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className={`absolute inset-0 journey-connector-h ${idx === 1 ? 'journey-connector-h-d' : ''}`} />
        </div>
        <div
          className={`relative z-10 h-2.5 w-2.5 rotate-45 rounded-sm transition-all duration-500 ${
            activeCard !== null && activeCard > idx
              ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]'
              : 'bg-primary/30 border border-primary/40'
          }`}
        />
      </div>
      <div className="flex md:hidden justify-center py-2">
        <div
          className={`relative w-0.5 h-12 overflow-hidden rounded-full transition-opacity duration-700 ${
            activeCard !== null && activeCard > idx ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className={`absolute inset-0 journey-connector-v ${idx === 1 ? 'journey-connector-v-d' : ''}`} />
        </div>
      </div>
    </>
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-24 bg-card/50 border-b border-border/50 overflow-hidden"
    >
      {/* ── Floating particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {PARTICLES.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-primary/[0.035] blur-[72px]"
            style={{ top: p.top, left: p.left, width: p.w, height: p.h,
              animation: `float-particle ${p.dur}s ease-in-out infinite ${p.delay}s` }} />
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={`dot-${i}`} className="absolute w-[2px] h-[2px] rounded-full bg-primary/20"
            style={{ left: `${8 + i * 20}%`, top: `${30 + (i % 2) * 35}%`,
              animation: `float-particle ${6 + i * 1.2}s ease-in-out infinite ${i * 0.9}s` }} />
        ))}
      </div>

      {/* ── Content wrapper — section entrance ── */}
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-[opacity,transform] duration-700"
        style={{ opacity: sectionIn ? 1 : 0, transform: sectionIn ? 'translateY(0)' : 'translateY(28px)' }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5">The Journey to Your Table</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <div className="h-px w-6  bg-primary/60" />
            <div className="h-2.5 w-2.5 rotate-45 bg-primary shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
            <div className="h-px w-6  bg-primary/60" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
            From the Sea &nbsp;·&nbsp; To Your Door
          </p>
        </div>

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="flex flex-col md:flex-row gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex-1 rounded-2xl border border-primary/15 overflow-hidden bg-card/70">
                <Skeleton className="w-full" style={{ height: 280 }} />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Cards row ── */}
        {steps && (
          <>
            <div className="flex flex-col md:flex-row md:items-stretch gap-0">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div
                    ref={el => { cardRefs.current[i] = el; }}
                    className="flex-1 min-w-0 transition-[opacity,transform] duration-700"
                    style={{
                      opacity:   visibleCards.has(i) ? 1 : 0,
                      transform: visibleCards.has(i) ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.96)',
                      transitionDelay: `${i * 150}ms`,
                    }}
                  >
                    <div
                      className={[
                        'quality-card-shine group relative rounded-2xl border overflow-hidden cursor-pointer h-full',
                        'bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2',
                        activeCard === i
                          ? 'border-primary shadow-[0_0_30px_rgba(212,175,55,0.35)]'
                          : 'border-primary/25 shadow-xl hover:border-primary/70 hover:shadow-[0_16px_50px_rgba(212,175,55,0.24)]',
                      ].join(' ')}
                      onClick={() => openModal(i)}
                      onMouseMove={e => handleMouseMove(e, i)}
                      onMouseLeave={() => handleMouseLeave(i)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          ref={el => { imgRefs.current[i] = el; }}
                          src={step.image} alt={step.title} loading="lazy" draggable={false}
                          className="w-full h-auto select-none block"
                          style={{ transform: 'translate(0,0) scale(1.02)', transition: 'transform 0.5s ease' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-xl font-bold text-primary mb-2 leading-snug">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-primary/55 font-semibold uppercase tracking-wide">
                          <span>Learn more</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {i < steps.length - 1 && <Connector idx={i} />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Completion text ── */}
            <div className="mt-10 text-center min-h-[40px]">
              {showCompletion && (
                <div className="journey-completion">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
                  </div>
                  <p className="font-serif text-lg md:text-xl text-primary/80 italic tracking-wide">
                    Fresh from the Sea to Your Door
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Premium Story Timeline ── */}
        <div ref={timelineRef} className="mt-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Our Promise — Every Step of the Way
            </p>
          </div>
          <div className="relative overflow-x-auto pb-2">
            <div className="flex items-start justify-center gap-0 min-w-max mx-auto px-4">
              {TIMELINE.map(({ Icon, label }, i) => (
                <React.Fragment key={i}>
                  <div
                    className="flex flex-col items-center gap-2 w-[88px] flex-shrink-0"
                    style={{
                      animation: timelineIn ? `timeline-item-in 0.6s ease ${i * 100}ms both` : 'none',
                      opacity: timelineIn ? undefined : 0,
                    }}
                  >
                    <div className="h-11 w-11 rounded-full border border-primary/35 bg-card flex items-center justify-center
                      shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:shadow-[0_0_16px_rgba(212,175,55,0.3)]
                      hover:border-primary/70 hover:scale-110 transition-all duration-300 group cursor-default">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] text-center leading-tight text-muted-foreground font-medium px-1">{label}</p>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div
                      className="flex-shrink-0 mt-[22px] self-start"
                      style={{
                        animation: timelineIn ? `timeline-item-in 0.6s ease ${i * 100 + 50}ms both` : 'none',
                        opacity: timelineIn ? undefined : 0,
                      }}
                    >
                      <div className="relative h-0.5 w-8 overflow-hidden rounded-full">
                        <div className="absolute inset-0 journey-connector-h" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalIdx !== null && steps && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ transition: 'opacity 0.3s ease', opacity: modalIn ? 1 : 0 }}
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <div
            className="relative z-10 w-full max-w-2xl bg-card border border-primary/30 rounded-2xl
              shadow-[0_28px_80px_rgba(0,0,0,0.65)] overflow-hidden"
            style={{ transition: 'opacity 0.3s ease, transform 0.3s ease', opacity: modalIn ? 1 : 0, transform: modalIn ? 'scale(1)' : 'scale(0.92)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full overflow-hidden">
              <img src={steps[modalIdx].image} alt={steps[modalIdx].title} className="w-full h-auto block"
                style={{ maxHeight: '55vh', objectFit: 'contain' }} />
            </div>
            <div className="p-7">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">{steps[modalIdx].title}</h2>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/70 to-transparent" />
                <div className="h-1 w-1 rounded-full bg-primary" />
                <div className="h-2 w-2 rounded-full border border-primary" />
                <div className="h-1 w-1 rounded-full bg-primary" />
                <div className="h-px flex-1 bg-gradient-to-l from-primary/70 to-transparent" />
              </div>
              <p className="text-muted-foreground leading-relaxed">{steps[modalIdx].detail}</p>
            </div>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full
                bg-background/70 backdrop-blur border border-border/60
                text-muted-foreground hover:text-foreground hover:bg-background/90
                transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
