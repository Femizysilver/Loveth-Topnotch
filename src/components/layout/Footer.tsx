import { Link } from "react-router-dom";
import { LOVETH_CONTACT } from "@/constants";
import { Instagram, Facebook, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold tracking-tighter">
              LOVETH <span className="text-[#C9A84C]">TOPNOTCH</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium real estate solutions in Nigeria and beyond. We help diaspora and local investors secure genuine properties and build wealth.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={LOVETH_CONTACT.socials.instagram} className="hover:text-[#C9A84C] transition-colors"><Instagram size={20} /></a>
              <a href={LOVETH_CONTACT.socials.facebook} className="hover:text-[#C9A84C] transition-colors"><Facebook size={20} /></a>
              <a href={LOVETH_CONTACT.socials.linkedin} className="hover:text-[#C9A84C] transition-colors"><Linkedin size={20} /></a>
              <a href={LOVETH_CONTACT.socials.twitter} className="hover:text-[#C9A84C] transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-[#C9A84C] mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white">Browse Properties</Link></li>
              <li><Link to="/about" className="hover:text-white">About Loveth</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-[#C9A84C] mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {LOVETH_CONTACT.services.slice(0, 4).map((service, i) => (
                <li key={i}>{service.split(' & ')[0]}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-[#C9A84C] mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#C9A84C] shrink-0" />
                <span>{LOVETH_CONTACT.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#C9A84C] shrink-0" />
                <span className="break-all">{LOVETH_CONTACT.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#C9A84C] shrink-0" />
                <span>Serving Lagos, Abuja, Ibadan & Beyond</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {LOVETH_CONTACT.company}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
