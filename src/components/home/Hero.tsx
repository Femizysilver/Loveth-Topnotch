import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black text-white py-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1920&h=1080"
          alt="Luxury Mansion"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center h-full">
        <div className="max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#C9A84C] text-sm font-semibold tracking-wider uppercase bg-[#C9A84C]/10 px-4 py-2 rounded-full border border-[#C9A84C]/20 inline-block mb-3">
              Trusted Diaspora Real Estate Partner
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tighter">
              Secure Your <span className="text-[#C9A84C]">Dream Home</span> in Nigeria.
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Premium, verified real estate investments with flexible installment choices and verified titles. Tailored for patriots at home and in the diaspora.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Button asChild size="lg" className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white px-8 py-7 text-lg font-medium rounded-2xl transition-all cursor-pointer">
              <Link to="/properties">Browse All Listings</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-7 text-lg font-medium rounded-2xl transition-all cursor-pointer">
              <Link to="/contact">Consult Free Consultation</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 pt-10 border-t border-white/20"
          >
            <div>
              <p className="text-3xl font-serif font-bold text-[#C9A84C]">500+</p>
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Properties Secured</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-[#C9A84C]">10+</p>
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-[#C9A84C]">98%</p>
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Satisfaction Rate</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
