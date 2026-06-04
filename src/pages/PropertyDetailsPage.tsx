import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LOVETH_CONTACT } from "@/constants";
import { 
  MapPin, Maximize, Calendar, Share3, 
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
}

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
        }
      } catch (err) {
        handleFirestoreError(err, "get", `properties/${id}`);
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
