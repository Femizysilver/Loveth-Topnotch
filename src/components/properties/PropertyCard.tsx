import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, LandPlot, Maximize, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  category: string;
  subcategory?: string;
  status: string;
  size: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export default function PropertyCard({ property }: { property: Property }) {
  const displayImageUrl = property.imageUrl || (property.imageUrls && property.imageUrls[0]) || "https://picsum.photos/800/600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={displayImageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/80 backdrop-blur text-white border-none py-1.5 px-4 rounded-full font-bold tracking-wider uppercase text-[10px]">
              {property.status}
            </Badge>
            <Badge className="bg-[#C9A84C] text-white border-none py-1.5 px-4 rounded-full font-bold tracking-wider uppercase text-[10px]">
              {property.category}
            </Badge>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold group-hover:text-[#C9A84C] transition-colors line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} className="text-[#C9A84C]" />
              {property.location}
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-y border-gray-50">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Investment</span>
              <span className="text-2xl font-bold font-serif whitespace-nowrap">₦{property.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-1.5">
                <Maximize size={16} />
                <span className="text-xs font-medium">{property.size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between group/btn">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A84C]">View Details</span>
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all group-hover:bg-[#C9A84C] group-hover:border-[#C9A84C] group-hover:text-white">
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
