import { LOVETH_CONTACT } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, Target, Heart, Award, Users, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1920&h=1080"
            className="w-full h-full object-cover opacity-60"
            alt="Business Professional"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/80 flex flex-col items-center justify-center p-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif font-bold text-center tracking-tighter"
            >
              The Visionary Behind <span className="text-[#C9A84C]">TopNotch</span>
            </motion.h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl text-center leading-relaxed">
              Redefining premium real estate in Nigeria through transparency, integrity, and elite service.
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative group">
          <div className="absolute -inset-4 gold-bg rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-2xl"></div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl">
            <img 
              src="https://i.ibb.co/PZBRcgHM/IMG-20260607-WA0024.jpg"
              alt="Loveth TopNotch"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-[#C9A84C] font-bold uppercase tracking-widest text-sm">Meet Loveth TopNotch</h2>
            <h3 className="text-4xl md:text-5xl font-bold font-serif leading-tight">Crafting Legacies, One Property at a Time.</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              With over a decade of high-stakes real estate experience in Nigeria, Loveth TopNotch has become synonymous with elite service and secure investment. Her journey began with a single mission: to provide a safe, transparent platform for Nigerians, especially those in the diaspora, to invest in their homeland without fear.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, {LOVETH_CONTACT.company} serves a global clientele, offering curated luxury homes, prime land, and high-ROI buyback schemes that empower investors to build intergenerational wealth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div>
              <p className="text-4xl font-bold font-serif text-[#C9A84C]">10+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Years of Excellence</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif text-[#C9A84C]">₪2.5B+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Portfolio Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-bold font-serif">Our Core Foundation</h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">We don't just sell properties; we build trust and secure your future in Nigeria.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Unwavering Integrity", icon: <ShieldCheck />, desc: "Transparent documentation and strict verification for every single listing." },
              { title: "Client Focused", icon: <Heart />, desc: "We listen to your specific needs whether you're in Lagos, London, or New York." },
              { title: "Result Driven", icon: <Target />, desc: "Focusing on high-appreciation areas and investment vehicles with proven ROI." }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow space-y-6 text-center border border-gray-100">
                <div className="bg-[#C9A84C]/10 text-[#C9A84C] p-4 rounded-2xl w-fit mx-auto">
                  {value.icon}
                </div>
                <h4 className="font-bold text-xl">{value.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-[#0A0A0A] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C] blur-[150px] opacity-20 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C] blur-[150px] opacity-10 -ml-32 -mb-32"></div>
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold font-serif leading-tight tracking-tight">Ready to start your <span className="text-[#C9A84C]">Real Estate</span> journey?</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Join hundreds of successful investors who have secured their future with Loveth TopNotch Global Properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white px-12 py-8 rounded-2xl text-lg font-bold">
                <Link to="/contact">Book a Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-12 py-8 rounded-2xl text-lg font-bold">
                <Link to="/properties">Browse Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
