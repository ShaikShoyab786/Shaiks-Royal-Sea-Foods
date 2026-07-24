import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const QUALITY_CARDS = [
  {
    image: '/images/quality-export.png',
    title: 'Export Quality',
    desc: 'Sourced from the finest catch and carefully selected to meet premium quality standards.',
    detail:
      'Every product in our lineup undergoes rigorous inspection to meet international export standards. We partner with certified processors who maintain HACCP and ISO 22000 compliance, ensuring each batch meets the highest benchmark of quality. Our selection criteria prioritise freshness, size consistency and zero contamination — so what reaches your table is the very finest the sea has to offer.',
  },
  {
    image: '/images/quality-hygiene.png',
    title: 'Hygienically Cleaned',
    desc: 'Professionally cleaned in a hygienic environment using safe food handling practices.',
    detail:
      'Our processing facility operates under strict food-safety protocols enforced by certified food handlers wearing PPE at all times. Every piece of seafood is meticulously cleaned, deveined and rinsed under potable water to eliminate bacteria and contaminants. We maintain a zero-tolerance policy for cross-contamination, so your family receives seafood that is not just clean — but clinically clean.',
  },
  {
    image: '/images/quality-frozen.png',
    title: 'Flash Frozen –18°C',
    desc: 'Instantly frozen at –18°C to lock freshness, taste and nutritional value.',
    detail:
      'Using industrial blast-freeze technology, our seafood is frozen within hours of processing — locking in peak freshness, natural flavour and vital nutrients like Omega-3 fatty acids. Unlike slow freezing which damages cell structure, our flash-freeze process preserves texture and taste at the molecular level. The result is seafood that is virtually indistinguishable from fresh-caught when properly prepared.',
  },
  {
    image: '/images/quality-temp.png',
    title: 'Temperature Controlled',
    desc: 'Maintained under strict cold-chain conditions from our facility to your doorstep.',
    detail:
      'Our cold-chain logistics ensure your order never deviates from the optimal –18°C to –20°C range from the moment it leaves our facility to the moment it arrives at your door. Deliveries are packed in high-density insulated thermocol boxes with ice packs rated to maintain temperature for up to 8 hours. Our field executives are trained to handle each parcel with the same care as a pharmaceutical cold-chain delivery.',
  },
];

const PARTICLES = [
  { top: '8%',  left: '6%',  w: 320, h: 320, dur: 11, delay: 0 },
  { top: '55%', left: '78%', w: 280, h: 280, dur: 14, delay: 2 },
  { top: '72%', left: '12%', w: 200, h: 200, dur: 9,  delay: 1 },
  { top: '20%', left: '88%', w: 180, h: 180, dur: 13, delay: 3 },
  { top: '45%', left: '45%', w: 140, h: 140, dur: 8,  delay: 1.5 },
];

export function RoyalStandardSection() {
  const [modalIdx, setModalIdx]       = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIn, setLightboxIn]   = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [activeCard, setActiveCard]   = useState<number | null>(null);

  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs   = useRef<(HTMLImageElement | null)[]>([]);

  // ── Entrance animation (once, staggered) ──────────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    wrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisibleCards(prev => new Set([...prev, i])), i * 150);
            obs.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── Scroll-active card highlight ──────────────────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    wrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCard(i); },
        { threshold: 0.65 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── Mouse parallax on image ───────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const img = imageRefs.current[i];
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 10; // ±5 px
    const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    img.style.transition = 'none';
    img.style.transform  = `translate(${dx}px, ${dy}px) scale(1.07)`;
  }, []);

  const handleMouseLeave = useCallback((i: number) => {
    const img = imageRefs.current[i];
    if (!img) return;
    img.style.transition = 'transform 0.5s ease';
    img.style.transform  = 'translate(0, 0) scale(1.04)';
  }, []);

  // ── Modal ──────────────────────────────────────────────────────────────
  const openModal = (i: number) => {
    setModalIdx(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  };
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalIdx(null), 300);
  };

  // ── Lightbox ───────────────────────────────────────────────────────────
  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    requestAnimationFrame(() => requestAnimationFrame(() => setLightboxIn(true)));
  };
  const closeLightbox = () => {
    setLightboxIn(false);
    setTimeout(() => setLightboxSrc(null), 300);
  };

  return (
    <section id="quality" className="relative py-24 border-y border-border/50 overflow-hidden bg-background">

      {/* ── Floating golden particles (background) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/[0.04] blur-[70px]"
            style={{
              top: p.top, left: p.left,
              width: p.w, height: p.h,
              animation: `float-particle ${p.dur}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
        {/* tiny sparkle dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-[3px] h-[3px] rounded-full bg-primary/25"
            style={{
              left: `${10 + i * 15}%`,
              top:  `${25 + (i % 3) * 25}%`,
              animation: `float-particle ${5 + i}s ease-in-out infinite ${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">The Royal Standard</h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Every order is handled with uncompromising quality, hygiene and care.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUALITY_CARDS.map((card, i) => (
            /* Entrance wrapper — handles fade-in + slide-up */
            <div
              key={i}
              ref={el => { wrapperRefs.current[i] = el; }}
              className="transition-[opacity,transform] duration-700"
              style={{
                opacity:   visibleCards.has(i) ? 1 : 0,
                transform: visibleCards.has(i) ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
                transitionDelay: `${i * 150}ms`,
              }}
            >
              {/* Interactive card */}
              <div
                className={[
                  'quality-card-shine group relative rounded-2xl overflow-hidden cursor-pointer',
                  'bg-card/70 backdrop-blur-sm',
                  'border transition-all duration-300',
                  'hover:-translate-y-2',
                  activeCard === i
                    ? 'border-primary shadow-[0_0_28px_rgba(212,175,55,0.35)]'
                    : 'border-primary/25 shadow-xl hover:border-primary/70 hover:shadow-[0_14px_44px_rgba(212,175,55,0.22)]',
                ].join(' ')}
                onClick={() => openModal(i)}
                onMouseMove={e => handleMouseMove(e, i)}
                onMouseLeave={() => handleMouseLeave(i)}
              >
                {/* Image container */}
                <div className="relative overflow-hidden aspect-square">
                  <img
                    ref={el => { imageRefs.current[i] = el; }}
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover select-none"
                    style={{ transform: 'translate(0,0) scale(1.04)', transition: 'transform 0.5s ease' }}
                    onClick={e => { e.stopPropagation(); openLightbox(card.image); }}
                  />

                  {/* Dark gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* View hint */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100
                    translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                    <span className="text-[10px] font-semibold text-primary bg-background/70 backdrop-blur-sm
                      px-2.5 py-1 rounded-full border border-primary/30">
                      🔍 Full View
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-primary mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-primary/60 font-semibold uppercase tracking-wide">
                    <span>Learn more</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            transition: 'opacity 0.3s ease',
            opacity: modalVisible ? 1 : 0,
          }}
          onClick={closeModal}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-background/78 backdrop-blur-md" />

          {/* Modal panel — fade + scale */}
          <div
            className="relative z-10 w-full max-w-2xl bg-card border border-primary/30 rounded-2xl
              shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            style={{
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity:   modalVisible ? 1 : 0,
              transform: modalVisible ? 'scale(1)' : 'scale(0.92)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* HD image */}
            <div className="aspect-video overflow-hidden relative">
              <img
                src={QUALITY_CARDS[modalIdx].image}
                alt={QUALITY_CARDS[modalIdx].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-8">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5 leading-tight">
                {QUALITY_CARDS[modalIdx].title}
              </h2>

              {/* Golden divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/70 to-transparent" />
                <div className="h-1 w-1 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full border border-primary" />
                <div className="h-1 w-1 rounded-full bg-primary" />
                <div className="h-px flex-1 bg-gradient-to-l from-primary/70 to-transparent" />
              </div>

              <p className="text-muted-foreground leading-relaxed text-base">
                {QUALITY_CARDS[modalIdx].detail}
              </p>
            </div>

            {/* Close button */}
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

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-zoom-out"
          style={{
            background: 'rgba(0,0,0,0.93)',
            transition: 'opacity 0.3s ease',
            opacity: lightboxIn ? 1 : 0,
          }}
          onClick={closeLightbox}
        >
          <img
            src={lightboxSrc}
            alt="Quality — full view"
            draggable={false}
            className="max-w-[92vw] max-h-[92vh] object-contain rounded-xl shadow-2xl select-none"
            style={{
              transition: 'transform 0.35s ease, opacity 0.3s ease',
              transform: lightboxIn ? 'scale(1)' : 'scale(0.88)',
              opacity:   lightboxIn ? 1 : 0,
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 h-11 w-11 flex items-center justify-center rounded-full
              border border-white/20 bg-white/10 hover:bg-white/20
              text-white transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  );
}
