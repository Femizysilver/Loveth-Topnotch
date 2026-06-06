import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LOVETH_CONTACT } from "@/constants";
import { 
  MapPin, Maximize, Calendar, 
  Heart, Download, Mail, Phone, 
  MessageCircle, ArrowLeft, CheckCircle2, Loader2, Share2, Film
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { Property } from "@/hooks/useProperties";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Interactive selected payment plan schedule: "outright" or month plans (e.g. 3, 6, 12)
  const [selectedPlan, setSelectedPlan] = useState<number | "outright">("outright");

  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() } as Property);
        } else {
          // Look up in central MOCK_PROPERTIES
          const mockFound = MOCK_PROPERTIES.find((m) => m.id === id);
          if (mockFound) {
            setProperty(mockFound);
          }
        }
      } catch (err) {
        // Fall back to Mock
        const mockFound = MOCK_PROPERTIES.find((m) => m.id === id);
        if (mockFound) {
          setProperty(mockFound);
        } else {
          handleFirestoreError(err, "get", `properties/${id}`);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  // Compute values dynamically based on promotional discount or installment schedule toggle
  const pricingInfo = useMemo(() => {
    if (!property) return null;
    let basePrice = property.price;
    const originalPrice = property.price;
    let isPromoDiscounted = false;
    let promoReason = "";

    // 1. Check if discount is active and we are in Outright Mode
    if (property.discountEnabled && property.discountValue && selectedPlan === "outright") {
      basePrice = Math.max(0, property.price - property.discountValue);
      isPromoDiscounted = true;
      promoReason = property.discountReason || "Limited Promo Offer";
    }

    // 2. Check if installment schedule is selected and exists
    if (selectedPlan !== "outright" && property.installmentPlans) {
      const plan = property.installmentPlans.find(planItem => planItem.months === selectedPlan);
      if (plan) {
        basePrice = plan.price;
      }
    }

    return {
      price: basePrice,
      originalPrice,
      isPromoDiscounted,
      promoReason,
      discountValue: property.discountValue || 0
    };
  }, [property, selectedPlan]);

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!property) return;
    setInquiryLoading(true);

    const formData = new FormData(e.currentTarget);
    const planDetails = selectedPlan === "outright" 
      ? "Outright cash purchase"
      : `${selectedPlan} Months Installment payment schedule`;

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: `${formData.get("message") as string} (Selected Payment Terms: ${planDetails})`,
      propertyId: property.id,
      propertyTitle: property.title,
      status: "New",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "inquiries"), data);

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

  const allImages = property.imageUrls || (property.imageUrl ? [property.imageUrl] : ["https://picsum.photos/800/600"]);

  return (
    <div className="min-h-screen bg-white pb-24 text-black">
      {/* Back button */}
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
            <img src={allImages[0]} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            {allImages.slice(1, 4).map((url, i) => (
              <div key={i} className="flex-grow rounded-3xl overflow-hidden bg-gray-100 relative">
                <img src={url} alt={`Detail ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {i === 2 && allImages.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold cursor-pointer">
                    +{allImages.length - 4} Photos
                  </div>
                )}
              </div>
            ))}
            {allImages.length <= 1 && (
              <div className="flex-grow rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
                No more photos available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left main info */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6 border-b pb-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#C9A84C] text-white hover:bg-[#C9A84C]">{property.status}</Badge>
              <Badge variant="outline" className="border-gray-200">{property.category}</Badge>
              {property.discountEnabled && (
                <Badge variant="secondary" className="bg-red-50 text-red-600 border border-red-100 font-bold">
                  ★ DISCOUNT OFFER ACTIVED
                </Badge>
              )}
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
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Size Details</p>
                  <p className="font-bold">{property.size || "Standard Grid"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-[#C9A84C]"><Calendar size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Security / Title</p>
                  <p className="font-bold">Loveth Verified Title</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <h2 className="text-2xl font-bold text-black font-serif">Description</h2>
            <p className="whitespace-pre-line">{property.description}</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black font-serif">Amenities & Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {(property.amenities || []).map((amenity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <CheckCircle2 size={18} className="text-[#C9A84C]" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Video Tour Section */}
          {((property.videoUrls && property.videoUrls.length > 0) || property.videoUrl) && (
            <div className="space-y-6 pt-12 border-t font-serif">
              <h2 className="text-2xl font-bold text-black font-serif">Walkthrough Video Showcase</h2>
              <p className="text-sm font-sans text-gray-500">
                Experience a virtual tour of this luxury real estate asset recorded by her dedicated team.
              </p>
              <div className="space-y-8">
                {property.videoUrl && (
                  <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-2xl relative border">
                    <video 
                      src={property.videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      poster={allImages[0]}
                    />
                  </div>
                )}
                {property.videoUrls && property.videoUrls.filter(v => v !== property.videoUrl).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {property.videoUrls.filter(v => v !== property.videoUrl).map((vUrl, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest text-[#C9A84C] font-bold font-sans">Additional Video tour #{idx + 2}</h4>
                        <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md border">
                          <video src={vUrl} controls className="w-full h-full object-contain" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Price & Inquiry Panels */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-[0_25px_55px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sticky top-28 space-y-6">
            
            {/* Live Pricing Values */}
            {pricingInfo && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-0.5">Asset Pricing Terms</p>
                
                {pricingInfo.isPromoDiscounted ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-400 text-sm font-bold">₦{pricingInfo.originalPrice.toLocaleString()}</span>
                      <span className="bg-red-50 text-red-600 font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-red-100">
                        Save ₦{pricingInfo.discountValue.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold font-serif text-black leading-none">
                      ₦{pricingInfo.price.toLocaleString()}
                    </h3>
                    {property.discountReason && (
                      <p className="text-xs text-[#C9A84C] bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-2.5 rounded-xl font-medium">
                        ★ Promo Offer: "{property.discountReason}" applied!
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-4xl font-bold font-serif text-black leading-none">
                      ₦{pricingInfo.price.toLocaleString()}
                    </h3>
                  </div>
                )}

                {selectedPlan !== "outright" ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-2xl text-xs space-y-1 mt-2">
                    <p className="font-bold">✓ Payment Mode: {selectedPlan}-Month Installment plan</p>
                    <p className="font-medium">Spread: <span className="font-bold">₦{Math.round(pricingInfo.price / selectedPlan).toLocaleString()}</span> / month</p>
                  </div>
                ) : (
                  <p className="text-sm text-[#C9A84C] font-semibold">
                    ≈ ${Math.round(pricingInfo.price / 1600).toLocaleString()}{" "}
                    <span className="text-[10px] text-gray-400 uppercase font-bold">USD Outright</span>
                  </p>
                )}
              </div>
            )}

            {/* Installments Option Selector Switches */}
            {property.installmentEnabled && property.installmentPlans && property.installmentPlans.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest pl-1">Payment Schedule Choices:</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("outright")}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex justify-between items-center ${
                      selectedPlan === "outright"
                        ? "bg-black text-white border-black shadow-md scale-[1.01]"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                    }`}
                  >
                    <span>Outright Cash</span>
                    <span className={selectedPlan === "outright" ? "text-[#C9A84C]" : "text-gray-500"}>
                      ₦{(property.discountEnabled && property.discountValue ? property.price - property.discountValue : property.price).toLocaleString()}
                    </span>
                  </button>

                  {property.installmentPlans.map((plan) => (
                    <button
                      key={plan.months}
                      type="button"
                      onClick={() => setSelectedPlan(plan.months)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex justify-between items-center ${
                        selectedPlan === plan.months
                          ? "bg-black text-white border-black shadow-md scale-[1.01]"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                      }`}
                    >
                      <span>{plan.months} Months Spread</span>
                      <span className={selectedPlan === plan.months ? "text-[#C9A84C]" : "text-gray-500"}>
                        ₦{plan.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiry Form */}
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-bold text-gray-900">Initiate Purchase / Consult</p>
              
              {submitted ? (
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-[#C9A84C]" size={36} />
                  <p className="font-bold text-black text-sm">Consultation message sent!</p>
                  <p className="text-xs text-gray-500">Loveth and her team will call or message you immediately.</p>
                  <Button variant="link" onClick={() => setSubmitted(false)} className="text-[#C9A84C] text-xs font-semibold p-0">
                    Send another consultation
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-3">
                  <Input required name="name" placeholder="Full Name" className="bg-gray-50 border-none py-6 px-4 rounded-2xl text-xs font-medium" />
                  <Input required name="email" type="email" placeholder="Email Address" className="bg-gray-50 border-none py-6 px-4 rounded-2xl text-xs font-medium" />
                  <Input required name="phone" placeholder="Phone (e.g. WhatsApp with country code)" className="bg-gray-50 border-none py-6 px-4 rounded-2xl text-xs font-medium" />
                  <textarea 
                    required
                    name="message"
                    className="w-full bg-gray-50 border-none px-4 py-4 rounded-2xl text-xs min-h-[100px] outline-none focus:ring-1 focus:ring-[#C9A84C] font-medium" 
                    placeholder="Enter your specific requirements..."
                    defaultValue={`I am highly interested in purchasing the property "${property.title}" located at "${property.location}". Please let's discuss details and next steps.`}
                  />
                  <Button disabled={inquiryLoading} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold py-6 rounded-2xl shadow">
                    {inquiryLoading ? <Loader2 className="animate-spin text-white" size={18} /> : "Book Appointment / Consultation"}
                  </Button>
                </form>
              )}

              {/* Direct channels */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  asChild
                  variant="outline" 
                  className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-6 rounded-2xl group transition-all"
                >
                  <a href={`https://wa.me/${LOVETH_CONTACT.whatsapp}?text=Hello%20Loveth,%20I%20am%20interested%20in%20"${encodeURIComponent(property.title)}"%20at%20${encodeURIComponent(property.location)}.`} target="_blank" rel="noreferrer">
                    <MessageCircle size={18} className="mr-2" />
                    WhatsApp
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="border-neutral-200 text-black hover:bg-neutral-50 py-6 rounded-2xl transition-all"
                >
                  <a href={`tel:${LOVETH_CONTACT.phone}`}>
                    <Phone size={18} className="mr-2 text-[#C9A84C]" />
                    Direct Call
                  </a>
                </Button>
              </div>
            </div>

            {/* Secondary actions */}
            <div className="pt-2 flex items-center gap-4 text-xs text-gray-400 justify-center border-t border-gray-100">
              <div className="flex items-center gap-1 cursor-pointer hover:text-black"><Share2 size={14} /> Share</div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black hover:text-red-500"><Heart size={14} /> Favorite</div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black"><Download size={14} /> Brochure</div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
