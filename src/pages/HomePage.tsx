import Hero from "@/components/home/Hero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Home, LandPlot, Key, ShieldCheck, Globe, TrendingUp, Users, MessageSquare } from "lucide-react";
import { LOVETH_CONTACT } from "@/constants";

export default function HomePage() {
  const categories = [
    { name: "Luxury Houses", icon: <Home size={32} />, path: "/properties?category=House", count: "124 available" },
    { name: "Prime Land", icon: <LandPlot size={32} />, path: "/properties?category=Land", count: "86 available" },
    { name: "Investment", icon: <TrendingUp size={32} />, path: "/properties?category=Other", count: "50-75% ROI" },
    { name: "For Rent", icon: <Key size={32} />, path: "/properties?status=For Rent", count: "45 available" },
  ];

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
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000" 
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
          {[1, 2, 3].map((id) => (
            <div key={id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
                <img 
                  src={`https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600&sig=${id}`}
                  alt="Property"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[#C9A84C] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Featured
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold group-hover:text-[#C9A84C] transition-colors">Luxury 5 Bedroom Duplex</h3>
              <p className="text-gray-500 text-sm mt-1">Lekki Phase 1, Lagos</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-bold">₦150,000,000</p>
                <Link to={`/properties/${id}`} className="text-sm font-medium underline">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0A0A0A] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif italic text-[#C9A84C]">Trusted by Global Nigerians</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">See what our clients from across the world have to say about their experience with Loveth TopNotch Properties.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-10 border border-white/10 rounded-3xl bg-white/5 space-y-6 text-left italic">
                <MessageSquare className="text-[#C9A84C]" size={32} />
                <p className="text-gray-300 leading-relaxed">
                  "Buying a home in Nigeria from the UK was terrifying until I met Loveth. Her transparency and constant updates via video calls made me feel like I was right there in Lagos."
                </p>
                <div>
                  <p className="font-bold text-white tracking-widest uppercase text-xs">Adebayo O.</p>
                  <p className="text-[#C9A84C] text-xs mt-1">London, UK</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Contact Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-t-8 border-[#C9A84C]">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Let's Find Your Property</h2>
            <p className="text-gray-500">Fill out the form below and Loveth will contact you personally.</p>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Full Name</label>
              <input className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C]" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Email Address</label>
              <input className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C]" placeholder="john@example.com" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Property Interest</label>
              <select className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C]">
                <option>General Inquiry</option>
                <option>Luxury Mansion</option>
                <option>Secure Land</option>
                <option>Investment Property</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Message</label>
              <textarea className="w-full bg-gray-50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-[#C9A84C] h-32" placeholder="Tell us what you're looking for..."></textarea>
            </div>
            <div className="md:col-span-2 pt-4">
              <Button className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold py-8 text-lg rounded-2xl shadow-lg shadow-[#C9A84C]/20 transition-all active:scale-95">
                Send Message to Loveth
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
