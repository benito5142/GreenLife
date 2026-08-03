import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Pause, Play, Quote, UserCheck } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl?: string;
  department: string;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'rev-1',
    name: 'Harrison Miller',
    role: 'Cardiology Patient',
    location: 'New York, NY',
    rating: 5,
    department: 'Cardiology & Heart Care',
    date: 'July 2026',
    text: 'The cardiology team at Green Life Hospital treated my heart condition with immense care and precision. Being able to book appointments online and download my lab results directly from my patient dashboard saved me so much stress!',
  },
  {
    id: 'rev-2',
    name: 'Claire Higgins',
    role: 'Orthopedic Patient',
    location: 'Boston, MA',
    rating: 5,
    department: 'Orthopedics & Sports Medicine',
    date: 'June 2026',
    text: 'After my knee replacement surgery with Dr. David Thorne, I was walking and back on my feet weeks ahead of schedule. The physical therapy staff and cloud report access made my entire recovery journey seamless.',
  },
  {
    id: 'rev-3',
    name: 'Benjamin K. Alvarez',
    role: 'Emergency Care Patient',
    location: 'Philadelphia, PA',
    rating: 5,
    department: '24/7 Level-1 Emergency Trauma',
    date: 'August 2026',
    text: 'Brought my daughter to Green Life’s 24/7 Emergency Unit at 2 AM with a high fever. The triage nurses admitted us in under 3 minutes. Extremely compassionate doctors and life-saving care when every minute mattered.',
  },
  {
    id: 'rev-4',
    name: 'Sienna O\'Connor',
    role: 'Neurology Patient',
    location: 'Chicago, IL',
    rating: 5,
    department: 'Neurology & Brain Sciences',
    date: 'May 2026',
    text: 'Dr. Marcus Vance diagnosed my chronic neurological migraines after months of uncertainty elsewhere. Their specialized neurology clinic and state-of-the-art MRI suite are truly world-class.',
  },
  {
    id: 'rev-5',
    name: 'Priya Sharma',
    role: 'Maternity Patient',
    location: 'San Jose, CA',
    rating: 5,
    department: 'Obstetrics & Pediatrics',
    date: 'June 2026',
    text: 'Delivered my firstborn son at Green Life Hospital. The nursing staff, pediatric NICU team, and modern private birth suites felt like 5-star hotel care backed by top-tier medical expertise.',
  },
  {
    id: 'rev-6',
    name: 'Arthur Pendelton',
    role: 'OPD Executive Patient',
    location: 'Austin, TX',
    rating: 5,
    department: 'General OPD & Executive Health',
    date: 'July 2026',
    text: 'Booking my annual comprehensive health screening online took less than a minute. ZERO wait time in the clinic lounge, and all my blood panel results synced to my patient portal the same afternoon!',
  }
];

export const TestimonialSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-sliding timer effect
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
      }, 4500); // Slides every 4.5 seconds
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Swipe gesture handling for mobile touch screens
  const minSwipeDistance = 50;
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.touches[0].clientX);

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentReview = TESTIMONIALS[currentIndex];

  return (
    <section className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white py-14 sm:py-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-10 relative overflow-hidden border border-emerald-500/20 shadow-2xl">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge & Live Slider Status */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Patient Reviews ({currentIndex + 1} of {TESTIMONIALS.length})</span>
        </div>

        {/* Hover / View Status indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
            title={isPaused ? "Click to resume auto-sliding" : "Click to pause auto-sliding"}
          >
            {isPaused ? (
              <>
                <Pause className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Paused (Viewing)</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Auto-sliding</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Review Card Stage */}
      <div 
        className="max-w-4xl mx-auto text-center space-y-6 relative cursor-default group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          setTouchStart(e.targetTouches[0].clientX);
        }}
        onTouchMove={onTouchMove}
        onTouchEnd={() => {
          setIsPaused(false);
          onTouchEndHandler();
        }}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        tabIndex={0}
        aria-label="Patient Testimonial Carousel"
      >
        <Quote className="w-10 h-10 mx-auto text-emerald-500/40 shrink-0" />

        {/* Star Rating */}
        <div className="flex justify-center gap-1 text-amber-400">
          {[...Array(currentReview.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400" />
          ))}
        </div>

        {/* Testimonial Quote Text with Slide Animation */}
        <div className="min-h-[120px] sm:min-h-[100px] flex items-center justify-center px-2">
          <blockquote key={currentReview.id} className="text-base sm:text-xl lg:text-2xl font-bold italic leading-relaxed text-slate-100 transition-all duration-500 animate-fadeIn">
            "{currentReview.text}"
          </blockquote>
        </div>

        {/* Patient Details */}
        <div className="space-y-1 pt-2">
          <p className="text-base font-extrabold text-emerald-400 tracking-wide">
            {currentReview.name}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300 flex-wrap font-medium">
            <span className="bg-emerald-900/80 px-2.5 py-0.5 rounded-md border border-emerald-700/50 text-emerald-200">
              {currentReview.department}
            </span>
            <span className="text-slate-500">•</span>
            <span>{currentReview.role}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{currentReview.location}</span>
          </div>
        </div>

        {/* Floating Hint Overlay on Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-amber-300/90 font-medium">
          💡 Slider paused while viewing. Move cursor away to resume auto-slide.
        </div>
      </div>

      {/* Carousel Controls & Pagination Dots */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pt-6 border-t border-emerald-800/40 mt-8">
        
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 transition-all active:scale-90"
          aria-label="Previous Review"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentIndex === index
                  ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 transition-all active:scale-90"
          aria-label="Next Review"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </section>
  );
};
