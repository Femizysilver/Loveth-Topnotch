import Hero from "@/components/home/Hero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Home, LandPlot, Key, ShieldCheck, Globe, TrendingUp, Users, MessageSquare, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { LOVETH_CONTACT } from "@/constants";
import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/properties/PropertyCard";

interface Testimonial {
  name: string;
  location: string;
  tag: string;
  quote: string;
  rating: number;
  avatar: string;
  property: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adebayo Oyetunji",
    location: "London, UK",
    tag: "Diaspora Client",
    quote: "Buying a luxury duplex in Nigeria while living in London was initially stressful. Loveth provided end-to-end transparency, high-definition video walkthroughs, verified titles, and seamless documentation. Her team made me feel completely present in Lagos!",
    rating: 5,
    avatar: "AO",
    property: "Lekki Phase 1 Terrace Buyer"
  },
  {
    name: "Dr. Chinedu & Amanda E.",
    location: "Dallas, Texas, USA",
    tag: "Diaspora Investor",
    quote: "Loveth TopNotch properties helped us secure multiple premium residential plots in Epe & Ajah. The structured installment payment plan was a complete game-changer. Everything was vetted, registered, and physically demarcated perfectly.",
    rating: 5,
    avatar: "CE",
    property: "Epe Prime Land Buyer"
  },
  {
    name: "Yetunde Alabi",
    location: "Toronto, Canada",
    tag: "Diaspora Client",
    quote: "I highly recommend Loveth's agency. She doesn't just sell property; she sells genuine peace of mind. Her constant live video inspections and detailed analysis of materials and neighborhood value made all the difference. She is incredibly trustworthy!",
    rating: 5,
    avatar: "YA",
    property: "Sangotedo Residential Plot Owner"
  },
  {
    name: "Chief Alhaji Bashir M.",
    location: "Abuja, Nigeria",
    tag: "Local Corporate Investor",
    quote: "As a local institutional developer, I appreciate high-efficiency consulting. Loveth's understanding of land titles, gazettes, and real estate ROI is outstanding. We closed transactions with complete regulatory compliance. Absolute 5-star standard.",
    rating: 5,
    avatar: "BM",
    property: "Maitama Commercial Land Client"
  },
  {
    name: "Chief Mrs. Amara Kalu",
    location: "Lekki, Lagos, Nigeria",
    tag: "Lagos Resident Buyer",
    quote: "I bought a 5-bedroom luxury duplex through Loveth and she was brilliant. She helped negotiate terms and handled physical handover ceremonies like a first-class professional. She's the best realtor I have worked with in Nigeria.",
    rating: 5,
    avatar: "AK",
    property: "Luxury 5BR Duplex Owner"
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};

export default function HomePage() {
  const { properties: dbProperties } = useProperties(3);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyInterest: "General Inquiry",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Testimonials Carousel State
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextTestimonial = () => {
    setDirection(1);
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const featuredProperties = useMemo(() => {
    const fallbackMocks = [
      { id: "1", title: "Luxury 5 Bedroom Duplex", location: "Lekki Phase 1, Lagos", price: 150000000, category: "House", status: "For Sale", size: "800sqm", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600" },
      { id: "2", title: "Prime 600sqm Residential Plot", location: "Sangotedo, Ajah, Lagos", price: 45000000, category: "Land", status: "For Sale", size: "600sqm", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600" },
      { id: "3", title: "Ultra-Modern 4 Bedroom Terrace", location: "Maitama, Abuja", price: 280000000, category: "House", status: "For Sale", size: "500sqm", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600" },
    ];
    
    const results = [...dbProperties];
    if (results.length < 3) {
      const needed = 3 - results.length;
      const filteredMocks = fallbackMocks.filter(
        mock => !dbProperties.some(real => real.title.toLowerCase() === mock.title.toLowerCase())
      );
      results.push(...filteredMocks.slice(0, needed));
    }
    return results.slice(0, 3);
  }, [dbProperties]);

  const categories = [
    { name: "Luxury Houses", icon: <Home size={32} />, path: "/properties?category=House", count: "124 available" },
    { name: "Prime Land", icon: <LandPlot size={32} />, path: "/properties?category=Land", count: "86 available" },
    { name: "Investment", icon: <TrendingUp size={32} />, path: "/properties?category=Other", count: "50-75% ROI" },
    { name: "For Rent", icon: <Key size={32} />, path: "/properties?status=For Rent", count: "45 available" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "Not specified",
      message: formData.message,
      status: "New",
      createdAt: serverTimestamp()
    };

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, "inquiries"), payload);

      // 2. Dispatch email trigger API
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || "Not specified",
            message: formData.message,
            subject: `New Lead: ${formData.propertyInterest} from ${formData.name}`,
            propertyTitle: formData.propertyInterest,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to post email trigger but recorded in Firestore:", emailErr);
      }

      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, "create" as any, "inquiries");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-24 pb-24">
      <Hero />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all group"
            >
              <Link to={cat.path} className="space-y-4 block">
                <div className="text-[#C9A84C] transition-transform group-hover:scale-110 duration-300">
                  {cat.icon}
                </div>
                <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.count}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Realtor Info */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
             {/* Using Loveth's photo from assets - since we can't generate images, 
                 we'll use a placeholder but describe it well in alt or use an Unsplash one for demo */}
            <img 
              src="https://i.ibb.co/PZBRcgHM/IMG-20260607-WA0024.jpg" 
              alt="Loveth TopNotch"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-6 rounded-2xl">
              <p className="font-serif text-2xl font-bold">Loveth TopNotch</p>
              <p className="text-[#C9A84C] font-medium text-sm">Founder & Lead Realtor</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Your Trusted Guide to <span className="text-[#C9A84C]">Nigerian Excellence</span>.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Navigating the Nigerian real estate market can be complex, especially for our diaspora family. I founded {LOVETH_CONTACT.company} to bridge that gap with integrity, transparency, and premium service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="bg-[#C9A84C]/10 p-3 rounded-xl text-[#C9A84C] h-fit">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Vetted Listings</h4>
                  <p className="text-sm text-gray-500">Every property is strictly verified to ensure genuine ownership.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-[#C9A84C]/10 p-3 rounded-xl text-[#C9A84C] h-fit">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Diaspora Specialized</h4>
                  <p className="text-sm text-gray-500">End-to-end support for Nigerians abroad, from viewing to key handover.</p>
                </div>
              </div>
            </div>

            <Button asChild className="bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto">
              <Link to="/about">Read My Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Latest Listings</h2>
            <p className="text-gray-500">Discover hand-picked premium properties.</p>
          </div>
          <Link to="/properties" className="text-[#C9A84C] font-bold border-b-2 border-[#C9A84C] pb-1 hover:text-[#C9A84C]/80 transition-colors">
            View All Properties
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProperties.map((p) => (
            <PropertyCard key={p.id} property={p as any} />
          ))}
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section 
        className="bg-[#0A0A0A] text-white py-24 overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle gold decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-widest font-extrabold text-[#C9A84C] block"
            >
              Client Success Stories
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold font-serif"
            >
              Trusted by <span className="italic font-serif text-[#C9A84C]">Global & Local</span> Clients
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-sans"
            >
              Discover the high-trust experience that hundreds of diaspora and home-country buyers enjoy with Loveth TopNotch Properties.
            </motion.p>
          </div>

          <div className="relative px-2 md:px-12">
            <div className="min-h-[360px] md:min-h-[260px] flex items-center justify-center relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={testimonialIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full text-left p-6 md:p-12 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md flex flex-col justify-between space-y-6 shadow-2xl relative"
                >
                  {/* Card Top: Stars & Quote Icon */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[#C9A84C]">
                      {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, idx) => (
                        <Star key={idx} size={16} fill="currentColor" className="text-[#C9A84C]" />
                      ))}
                    </div>
                    <span className="bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] uppercase tracking-wider font-extrabold py-1 px-3 rounded-full border border-[#C9A84C]/25 font-sans">
                      {TESTIMONIALS[testimonialIndex].tag}
                    </span>
                  </div>

                  {/* Card Quote */}
                  <div className="relative">
                    <Quote className="absolute -top-6 -left-4 text-white/5 w-16 h-16 pointer-events-none" />
                    <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-serif italic relative z-10 pl-2">
                      "{TESTIMONIALS[testimonialIndex].quote}"
                    </p>
                  </div>

                  {/* Card Footer: User details */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center text-white font-bold text-sm tracking-wider font-sans shrink-0">
                      {TESTIMONIALS[testimonialIndex].avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-base font-sans">{TESTIMONIALS[testimonialIndex].name}</h4>
                      <p className="text-[11px] md:text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1 md:gap-1.5 mt-0.5 font-sans">
                        <span className="text-[#C9A84C] font-semibold">{TESTIMONIALS[testimonialIndex].location}</span>
                        <span className="text-white/20">•</span>
                        <span>{TESTIMONIALS[testimonialIndex].property}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 md:mt-0">
              {/* Desktop arrow left */}
              <button
                type="button"
                onClick={prevTestimonial}
                className="md:absolute md:top-1/2 md:-left-8 md:-translate-y-1/2 p-3 rounded-full border border-white/10 hover:border-[#C9A84C] bg-white/5 hover:bg-[#C9A84C] hover:text-black text-white transition-all cursor-pointer z-20 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-2 mx-auto">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDirection(idx > testimonialIndex ? 1 : -1);
                      setTestimonialIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === testimonialIndex ? "w-8 bg-[#C9A84C]" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Desktop arrow right */}
              <button
                type="button"
                onClick={nextTestimonial}
                className="md:absolute md:top-1/2 md:-right-8 md:-translate-y-1/2 p-3 rounded-full border border-white/10 hover:border-[#C9A84C] bg-white/5 hover:bg-[#C9A84C] hover:text-black text-white transition-all cursor-pointer z-20 group"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Contact Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="home-contact-form">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-t-8 border-[#C9A84C]">
          {submitted ? (
            <div className="text-center py-16 space-y-6">
              <div className="bg-green-50 text-green-600 w-20 h-20 rounded-full mx-auto flex items-center justify-center border border-green-200">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-3xl font-serif font-bold">Message Delivered Successfully!</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Thank you for reaching out. Your request has been sent to Loveth. She will contact you directly at your convenience.
              </p>
              <Button onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", phone: "", propertyInterest: "General Inquiry", message: "" });
              }} className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 h-12">
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold font-serif">Let's Find Your Property</h2>
                <p className="text-gray-500">Fill out the form below and Loveth will contact you personally.</p>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-14" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-14" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Phone Number (Optional)</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-14" 
                    placeholder="+234..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Property Interest</label>
                  <select 
                    value={formData.propertyInterest}
                    onChange={(e) => setFormData(p => ({ ...p, propertyInterest: e.target.value }))}
                    className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-14 appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Luxury Mansion</option>
                    <option>Secure Land</option>
                    <option>Investment Property</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Message</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-32" 
                    placeholder="Tell us what you're looking for..."
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button disabled={submitting} type="submit" className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold py-8 text-lg rounded-2xl shadow-lg shadow-[#C9A84C]/20 transition-all active:scale-95">
                    {submitting ? <Loader2 className="animate-spin text-white" /> : "Send Message to Loveth"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
