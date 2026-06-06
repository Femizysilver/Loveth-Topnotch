import { LOVETH_CONTACT } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      phone: "Not provided", // Could add phone field later
      status: "New",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "inquiries"), data);
      
      // Send direct email notice to her email
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to trigger email api but saved layout to Firestore:", emailErr);
      }

      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, "create", "inquiries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold font-serif tracking-tighter">Get in <span className="text-[#C9A84C]">Touch</span></h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Have questions about a property or investment? Loveth is ready to help you navigate the Nigerian real estate market.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-serif">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="bg-[#C9A84C]/10 text-[#C9A84C] p-4 rounded-2xl group-hover:bg-[#C9A84C] group-hover:text-white transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Call or WhatsApp</p>
                    <p className="text-xl font-bold mt-1">{LOVETH_CONTACT.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="bg-[#C9A84C]/10 text-[#C9A84C] p-4 rounded-2xl group-hover:bg-[#C9A84C] group-hover:text-white transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</p>
                    <p className="text-xl font-bold mt-1 break-all">{LOVETH_CONTACT.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="bg-[#C9A84C]/10 text-[#C9A84C] p-4 rounded-2xl group-hover:bg-[#C9A84C] group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Office Coverage</p>
                    <p className="text-xl font-bold mt-1">Lagos, Abuja, Ibadan & Diaspora Services</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-serif">Follow Us</h2>
              <div className="flex gap-4">
                {[
                  { icon: <Instagram />, link: LOVETH_CONTACT.socials.instagram },
                  { icon: <Facebook />, link: LOVETH_CONTACT.socials.facebook },
                  { icon: <Linkedin />, link: LOVETH_CONTACT.socials.linkedin },
                  { icon: <Twitter />, link: LOVETH_CONTACT.socials.twitter }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link} 
                    className="p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-[#C9A84C] hover:text-white transition-all transform hover:-translate-y-1"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-8 rounded-2xl text-lg font-bold shadow-xl">
              <a href={`https://wa.me/${LOVETH_CONTACT.whatsapp}`} target="_blank" rel="noopener">
                <MessageCircle size={24} className="mr-3" />
                Chat on WhatsApp
              </a>
            </Button>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.08)] border border-gray-100 p-12 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold font-serif">Send a Message</h3>
                      <p className="text-gray-500">I respond to all inquiries within 24 hours.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                        <Input required name="name" className="bg-gray-50 border-none py-7 px-6 rounded-2xl" placeholder="Full Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <Input required name="email" type="email" className="bg-gray-50 border-none py-7 px-6 rounded-2xl" placeholder="Email Address" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Subject</label>
                        <Input name="subject" className="bg-gray-50 border-none py-7 px-6 rounded-2xl" placeholder="Property Inquiry, Investment, etc." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Message</label>
                        <textarea required name="message" className="w-full bg-gray-50 border-none px-6 py-6 rounded-2xl text-sm min-h-[200px] focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all" placeholder="Tell us what you're looking for..."></textarea>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold py-8 rounded-2xl text-lg shadow-lg group">
                      {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send size={18} className="ml-3 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 space-y-6"
                  >
                    <div className="w-24 h-24 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle size={48} />
                    </div>
                    <h3 className="text-4xl font-bold font-serif">Message Received!</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Thank you for reaching out. Loveth will get back to you shortly to assist with your real estate needs.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl border-gray-200 mt-8">
                      Send another message
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="h-[500px] bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
        <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-12 z-10 flex justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-xl"><MapPin /></div>
            <div>
              <p className="font-bold">Lekki Phase 1</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Lagos, Nigeria</p>
            </div>
          </div>
        </div>
        {/* Real Google Map would go here */}
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15858.917531776518!2d3.47352373024849!3d6.428456678252277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf45398687b3b%3A0xe54ef99723ec09!2sLekki%20Phase%201%2C%20Lagos!5e0!3m2!1sen!2sng!4v1713894000000!5m2!1sen!2sng"
          className="w-full h-full border-none"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer"
        ></iframe>
      </section>
    </div>
  );
}
