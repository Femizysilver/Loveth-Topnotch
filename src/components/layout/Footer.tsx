import { useState } from "react";
import { Link } from "react-router-dom";
import { LOVETH_CONTACT } from "@/constants";
import { Instagram, Facebook, Linkedin, Twitter, Mail, Phone, MapPin, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "newsletters"), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error("Newsletter loyalty subscription error:", err);
      setError("Please input a valid email address and try again.");
      try {
        handleFirestoreError(err, "create" as any, "newsletters");
      } catch (nestedErr) {
        // Safe bypass to prevent runtime crash
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Signup Form Block */}
        <div className="border-b border-white/5 pb-12 mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-md space-y-2">
            <span className="text-[#C9A84C] text-[10px] font-extrabold uppercase tracking-widest block">Exclusive Access</span>
            <h4 className="font-serif text-xl md:text-2xl font-bold tracking-tight">Join Our Private Investment Loop</h4>
            <p className="text-gray-400 text-sm">
              Get notified immediately on premium luxury developments, high-ROI buyback properties, and genuine land opportunities in Nigeria.
            </p>
          </div>
          <div className="w-full max-w-md">
            {submitted ? (
              <div 
                id="newsletter-success-toast"
                className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] p-5 rounded-2xl flex items-start gap-3.5 transition-all"
              >
                <CheckCircle2 className="shrink-0 text-[#C9A84C] mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-bold">Subscription Confirmed</p>
                  <p className="text-gray-400 text-xs mt-0.5">Thank you for joining our newsletter list. We will reach out to you with news and alerts.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5" id="footer-newsletter-form">
                <div className="flex gap-2">
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter email for off-market alerts"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-2xl focus:ring-1 focus:ring-[#C9A84C] h-12 text-sm pl-4"
                  />
                  <Button
                    id="newsletter-subscribe-btn"
                    type="submit"
                    disabled={submitting}
                    className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white px-6 rounded-2xl flex items-center justify-center gap-1.5 h-12 font-bold cursor-pointer shrink-0 transition-all text-xs uppercase tracking-wider"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        Subscribe
                        <ChevronRight size={14} className="text-white" />
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-400 text-[11px] font-semibold pl-1">{error}</p>
                )}
                <p className="text-[10px] text-gray-500 pl-1 font-medium">
                  We value your privacy. No spam. Unsubscribe with one click anywhere, anytime.
                </p>
              </form>
            )}
          </div>
        </div>

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
