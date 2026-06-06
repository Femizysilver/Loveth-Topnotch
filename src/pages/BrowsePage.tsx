import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "@/components/properties/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid2X2, List as ListIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPES } from "@/constants";
import { useProperties } from "@/hooks/useProperties";

// Mock Data for initial view
const MOCK_PROPERTIES = [
  { id: "1", title: "Luxury 5 Bedroom Duplex", location: "Lekki Phase 1, Lagos", price: 150000000, category: "House", subcategory: "Duplexes", status: "For Sale", size: "800sqm", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600" },
  { id: "2", title: "Prime 600sqm Residential Plot", location: "Sangotedo, Ajah, Lagos", price: 45000000, category: "Land", subcategory: "Land for Building", status: "For Sale", size: "600sqm", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600" },
  { id: "3", title: "Ultra-Modern 4 Bedroom Terrace", location: "Maitama, Abuja", price: 280000000, category: "House", subcategory: "Terraced Houses", status: "For Sale", size: "500sqm", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600" },
  { id: "4", title: "3 Bedroom Apartment with BQ", location: "Victoria Island, Lagos", price: 120000000, category: "House", subcategory: "Apartments / Flats", status: "For Rent", size: "350sqm", imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800&h=600" },
  { id: "5", title: "Commercial Development Land", location: "Ikorodu, Lagos", price: 25000000, category: "Land", subcategory: "Commercial Land", status: "For Sale", size: "1200sqm", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600" },
  { id: "6", title: "Palatial 7 Bedroom Mansion", location: "Banana Island, Lagos", price: 1500000000, category: "House", subcategory: "Mansion / Mansionette", status: "For Sale", size: "1500sqm", imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600" },
];

export default function BrowsePage() {
  const { properties: dbProperties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryFilter = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";

  const allProperties = useMemo(() => {
    // Show newly properties created first, followed by illustrative mock properties,
    // filtered against duplication by title
    const uniqueMocks = MOCK_PROPERTIES.filter(
      (mock) => !dbProperties.some((real) => real.title.toLowerCase() === mock.title.toLowerCase())
    );
    return [...dbProperties, ...uniqueMocks];
  }, [dbProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      const title = p.title || "";
      const location = p.location || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allProperties, searchQuery, categoryFilter, statusFilter]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold font-serif tracking-tight">Browse <span className="text-[#C9A84C]">Properties</span></h1>
              <p className="text-gray-500">Discover your next wise investment from our curated collection.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-black" : ""}
              >
                <Grid2X2 size={20} />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-black" : ""}
              >
                <ListIcon size={20} />
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative w-full lg:flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Search by title or location..." 
                className="pl-12 py-6 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#C9A84C]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex w-full lg:w-auto gap-4">
              <Select value={categoryFilter} onValueChange={(v) => updateFilter("category", v)}>
                <SelectTrigger className="w-full lg:w-48 py-6 rounded-2xl border-gray-100 bg-gray-50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="House">Houses</SelectItem>
                  <SelectItem value="Land">Lands</SelectItem>
                  <SelectItem value="Other">Other Assets</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => updateFilter("status", v)}>
                <SelectTrigger className="w-full lg:w-48 py-6 rounded-2xl border-gray-100 bg-gray-50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="For Rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="py-6 rounded-2xl border-gray-100 bg-gray-50 lg:px-6">
                <SlidersHorizontal size={20} className="mr-2" />
                More
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] py-2 px-4 rounded-full flex items-center gap-2">
                  Category: {categoryFilter}
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("category", "all")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] py-2 px-4 rounded-full flex items-center gap-2">
                  Status: {statusFilter}
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("status", "all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] py-2 px-4 rounded-full flex items-center gap-2">
                  Search: {searchQuery}
                  <X size={14} className="cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredProperties.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-8"
          }>
            {filteredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-2xl font-serif font-bold text-gray-400">No properties found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
            <Button 
              variant="link" 
              className="mt-4 text-[#C9A84C]"
              onClick={() => {
                setSearchParams({});
                setSearchQuery("");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
