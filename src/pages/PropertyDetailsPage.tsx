import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LOVETH_CONTACT } from "@/constants";
import { 
  MapPin, Maximize, Calendar, 
  Heart, Download, Mail, Phone, 
  MessageCircle, ArrowLeft, CheckCircle2, Loader2, Share2
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  status: string;
  size: string;
  imageUrls: string[];
  amenities: string[];
  videoUrl?: string;
  videoUrls?: string[];
}

const MOCK_PROPERTIES_DETAILS: Record<string, Property> = {
  "1": {
    id: "1",
    title: "Luxury 5 Bedroom Duplex",
    description: "Experience the pinnacle of luxury living in this magnificent 5-bedroom fully detached duplex with a clean boys' quarters located premium Lekki Phase 1, Lagos. Crafted to high international standards, this magnificent masterpiece features ultra-premium materials, custom lighting arrays, and spacious living chambers designed for absolute comfort.",
    price: 150000000,
    location: "Lekki Phase 1, Lagos",
    category: "House",
    status: "For Sale",
    size: "800sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Swimming Pool", "En-suite Bedrooms", "CCTV System", "Fully Fitted Kitchen", "Smart Automation"]
  },
  "2": {
    id: "2",
    title: "Prime 600sqm Residential Plot",
    description: "This is a premium, 100% dry and gated residential parcel measuring 600sqm in the rapidly building axis of Sangotedo, Ajah, Lagos. It possesses secure architectural boundaries and is fully documented under top titles (C of O), representing an unmatched investment for developer builds or custom high-end family mansions.",
    price: 45000000,
    location: "Sangotedo, Ajah, Lagos",
    category: "Land",
    status: "For Sale",
    size: "600sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Paved Access Road", "Electricity Infrastructure", "Gated Security", "Proper Drainage System"]
  },
  "3": {
    id: "3",
    title: "Ultra-Modern 4 Bedroom Terrace",
    description: "A prestigious 4-bedroom terraced home with executive class design features situated in the diplomatic and highly secure Maitama neighborhood in Abuja. Outfitted with master-built glass balconies, integrated home gyms, double-high ceilings, and state of the art climate management.",
    price: 280000000,
    location: "Maitama, Abuja",
    category: "House",
    status: "For Sale",
    size: "500sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Rooftop Terrace", "Integrated Sound", "Executive Lounge", "24/7 Security Patrols"]
  },
  "4": {
    id: "4",
    title: "3 Bedroom Apartment with BQ",
    description: "Elegant 3-bedroom luxury apartment plus fully fitted Boys' Quarters located inside key commercial core of Victoria Island, Lagos. Perfect residence for corporate directors, expatriates, or investment-minded landlords seeking reliable top-tier rental cashflows on short-let services.",
    price: 120000000,
    location: "Victoria Island, Lagos",
    category: "House",
    status: "For Rent",
    size: "350sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Fitted Kitchen", "Passenger Elevators", "Generous Parking", "Water Treatment Infrastructure"]
  },
  "5": {
    id: "5",
    title: "Commercial Development Land",
    description: "Outstanding commercial plot measuring 1,200sqm boasting dual-access frontage onto busy Ikorodu Road, Lagos. Perfectly situated for office complexes, logistic operational parks, supermarkets, or high-density retail nodes in an area with explosive high daily commute traction.",
    price: 25000000,
    location: "Ikorodu, Lagos",
    category: "Land",
    status: "For Sale",
    size: "1200sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Dual Frontage", "Guaranteed Dry Solid Ground", "Close Transit Proximity"]
  },
  "6": {
    id: "6",
    title: "Palatial 7 Bedroom Mansion",
    description: "Extravagant 7-bedroom water-facing architectural mansion on the ultra-exclusive Banana Island, Lagos. Designed without compromise, featuring double-height marble lobbies, customized wellness spas, private home theatres, indoor elevator systems, and private yacht slipway.",
    price: 1500000000,
    location: "Banana Island, Lagos",
    category: "House",
    status: "For Sale",
    size: "1500sqm",
    imageUrls: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Waterfront Access", "Private Elevator", "Home Cinema", "Direct Yacht Berth", "Indoor/Outdoor Dual Pools"]
  }
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() } as Property);
        } else if (MOCK_PROPERTIES_DETAILS[id]) {
          // Fall back to Mock Detail
          setProperty(MOCK_PROPERTIES_DETAILS[id]);
        }
      } catch (err) {
        if (MOCK_PROPERTIES_DETAILS[id]) {
          setProperty(MOCK_PROPERTIES_DETAILS[id]);
        } else {
          handleFirestoreError(err, "get", `properties/${id}`);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!property) return;
    setInquiryLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
      propertyId: property.id,
      propertyTitle: property.title,
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
            phone: data.phone,
            message: data.message,
            propertyTitle: data.propertyTitle,
            subject: `New Property Inquiry: ${data.propertyTitle} from ${data.name}`,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to trigger email api but saved to Firestore:", emailErr);
      }

      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, "create", "inquiries");
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A84C]" size={48} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif font-bold">Property Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/properties">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/properties" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={16} />
          Back to Listings
        </Link>
      </div>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px] md:h-[500px]">
          <div className="md:col-span-3 rounded-3xl overflow-hidden h-full">
            <img src={property.imageUrls[0]} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            {property.imageUrls.slice(1, 3).map((url, i) => (
              <div key={i} className="flex-grow rounded-3xl overflow-hidden bg-gray-100 relative">
                <img src={url} alt={`Detail ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {i === 1 && property.imageUrls.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold cursor-pointer">
                    +{property.imageUrls.length - 3} Photos
                  </div>
                )}
              </div>
            ))}
            {property.imageUrls.length <= 1 && (
               <div className="flex-grow rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
                 No more photos
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6 border-b pb-8">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-[#C9A84C] text-white hover:bg-[#C9A84C]">{property.status}</Badge>
              <Badge variant="outline" className="border-gray-200">{property.category}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif">{property.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={18} className="text-[#C9A84C]" />
              <span>{property.location}</span>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-[#C9A84C]"><Maximize size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Size</p>
                  <p className="font-bold">{property.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-[#C9A84C]"><Calendar size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Details</p>
                  <p className="font-bold">Verified Listing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h2 className="text-2xl font-bold text-black font-serif">Description</h2>
            <p>{property.description}</p>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-black font-serif">Amenities & Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {property.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={18} className="text-[#C9A84C]" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Video Tours Showcase Section */}
          {((property.videoUrls && property.videoUrls.length > 0) || property.videoUrl) && (
            <div className="space-y-6 pt-12 border-t font-serif">
              <h2 className="text-2xl font-bold text-black font-serif">Property Video Showcase</h2>
              <p className="text-sm font-sans text-gray-500">
                Experience a detailed virtual tour of this premium asset, curated personally to demonstrate its exclusive value.
              </p>
              <div className="space-y-8">
                {/* Main Video */}
                {property.videoUrl && (
                  <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-2xl relative border border-gray-100 max-w-4xl">
                    <video 
                      src={property.videoUrl} 
                      controls 
                      playsInline
                      className="w-full h-full object-contain"
                      poster={property.imageUrls[0]}
                    />
                  </div>
                )}

                {/* Additional Videos */}
                {property.videoUrls && property.videoUrls.filter(v => v !== property.videoUrl).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {property.videoUrls.filter(v => v !== property.videoUrl).map((vUrl, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest text-[#C9A84C] font-bold font-sans">Virtual Walkthrough #{idx + 2}</h4>
                        <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md border">
                          <video 
                            src={vUrl} 
                            controls 
                            playsInline
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Inquiry */}
        <aside className="space-y-8">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sticky top-28 space-y-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Investment Value</p>
              <h3 className="text-4xl font-bold font-serif">₦{property.price.toLocaleString()}</h3>
              <p className="text-[#C9A84C] font-semibold">≈ ${Math.round(property.price / 1600).toLocaleString()} <span className="text-[10px] text-gray-400">USD</span></p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-900 border-b pb-2">Interested in this property?</p>
              {submitted ? (
                <div className="p-6 bg-[#C9A84C]/10 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-[#C9A84C]" size={32} />
                  <p className="font-bold">Inquiry Sent!</p>
                  <p className="text-xs text-gray-500">Loveth will contact you shortly.</p>
                  <Button variant="link" onClick={() => setSubmitted(false)} className="text-[#C9A84C] text-xs">Send another</Button>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-3">
                  <Input required name="name" placeholder="Your Name" className="bg-gray-50 border-none py-6 px-4 rounded-xl" />
                  <Input required name="email" type="email" placeholder="Your Email" className="bg-gray-50 border-none py-6 px-4 rounded-xl" />
                  <Input required name="phone" placeholder="Phone Number" className="bg-gray-50 border-none py-6 px-4 rounded-xl" />
                  <textarea 
                    required
                    name="message"
                    className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-[#C9A84C]" 
                    placeholder="I'm interested in this property..."
                    defaultValue={`I am interested in ${property.title}. Please provide more details.`}
                  />
                  <Button disabled={inquiryLoading} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-7 rounded-xl shadow-lg">
                    {inquiryLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Inquiry"}
                  </Button>
                </form>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-6 rounded-xl group/wa">
                  <MessageCircle size={18} className="mr-2 group-hover/wa:fill-white" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="border-gray-200 py-6 rounded-xl">
                  <Phone size={18} className="mr-2" />
                  Call Now
                </Button>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4 text-xs text-gray-400 justify-center">
              <div className="flex items-center gap-1 cursor-pointer hover:text-black"><Share2 size={14} /> Share</div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black focus:text-red-500"><Heart size={14} /> Favorite</div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black"><Download size={14} /> Brochure</div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
