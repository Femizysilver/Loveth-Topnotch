import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "@/components/properties/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid2X2, List as ListIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/hooks/useProperties";

export default function BrowsePage() {
  const { properties: dbProperties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryFilter = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const locationParam = searchParams.get("location") || "";
  const priceRangeParam = searchParams.get("priceRange") || "all";

  const filteredProperties = useMemo(() => {
    return dbProperties.filter(p => {
      const title = p.title || "";
      const location = p.location || "";
      const price = p.price || 0;
      const category = p.category || "";
      const status = p.status || "";

      // 1. Keyword search (checks title or location)
      const matchesSearch = searchQuery 
        ? title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          location.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // 2. Specific Location parameter filter
      const matchesLocation = locationParam 
        ? location.toLowerCase().includes(locationParam.toLowerCase())
        : true;

      // 3. Category
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      // 4. Status
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      // 5. Price range
      let matchesPrice = true;
      if (priceRangeParam !== "all") {
        if (priceRangeParam === "under-50m") {
          matchesPrice = price < 50000000;
        } else if (priceRangeParam === "50m-150m") {
          matchesPrice = price >= 50000000 && price <= 150000000;
        } else if (priceRangeParam === "150m-500m") {
          matchesPrice = price >= 150000000 && price <= 500000000;
        } else if (priceRangeParam === "500m-plus") {
          matchesPrice = price > 500000000;
        }
      }

      return matchesSearch && matchesLocation && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [dbProperties, searchQuery, locationParam, categoryFilter, statusFilter, priceRangeParam]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">
        
        {/* Header */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold font-serif tracking-tight text-black">
                Browse <span className="text-[#C9A84C]">Properties</span>
              </h1>
              <p className="text-gray-500">Discover your next wise investment from our curated collection.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-black text-white hover:bg-black/90" : ""}
                id="btn-view-grid"
              >
                <Grid2X2 size={20} />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-black text-white hover:bg-black/90" : ""}
                id="btn-view-list"
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
                id="property-search-input"
                placeholder="Search by title or quick keywords..." 
                className="pl-12 py-6 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#C9A84C]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-row w-full lg:w-auto gap-4">
              <Select value={categoryFilter} onValueChange={(v) => updateFilter("category", v)}>
                <SelectTrigger id="category-filter-select" className="w-full sm:w-40 py-6 rounded-2xl border-gray-100 bg-gray-50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="House">Houses</SelectItem>
                  <SelectItem value="Land">Lands</SelectItem>
                  <SelectItem value="Other">Other Assets</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRangeParam} onValueChange={(v) => updateFilter("priceRange", v)}>
                <SelectTrigger id="price-range-filter-select" className="w-full sm:w-44 py-6 rounded-2xl border-gray-100 bg-gray-50">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50m">Under ₦50M</SelectItem>
                  <SelectItem value="50m-150m">₦50M - ₦150M</SelectItem>
                  <SelectItem value="150m-500m">₦150M - ₦500M</SelectItem>
                  <SelectItem value="500m-plus">Above ₦500M</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => updateFilter("status", v)}>
                <SelectTrigger id="status-filter-select" className="w-full sm:w-40 py-6 rounded-2xl border-gray-100 bg-gray-50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="For Rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(categoryFilter !== "all" || statusFilter !== "all" || priceRangeParam !== "all" || locationParam !== "" || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 py-2 px-4 rounded-full flex items-center gap-2 border-none">
                  Category: {categoryFilter}
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("category", "all")} />
                </Badge>
              )}
              {priceRangeParam !== "all" && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 py-2 px-4 rounded-full flex items-center gap-2 border-none">
                  Price: {
                    priceRangeParam === "under-50m" ? "Under ₦50M" :
                    priceRangeParam === "50m-150m" ? "₦50M - ₦150M" :
                    priceRangeParam === "150m-500m" ? "₦150M - ₦500M" : "Above ₦500M"
                  }
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("priceRange", "all")} />
                </Badge>
              )}
              {locationParam && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 py-2 px-4 rounded-full flex items-center gap-2 border-none">
                  Location: {locationParam}
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("location", "all")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 py-2 px-4 rounded-full flex items-center gap-2 border-none">
                  Status: {statusFilter}
                  <X size={14} className="cursor-pointer" onClick={() => updateFilter("status", "all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 py-2 px-4 rounded-full flex items-center gap-2 border-none">
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
              id="clear-all-filters-btn"
              variant="link" 
              className="mt-4 text-[#C9A84C] font-semibold"
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
