import { Property } from "@/hooks/useProperties";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Luxury 5 Bedroom Duplex",
    description: "Experience the pinnacle of luxury living in this magnificent 5-bedroom fully detached duplex with a clean boys' quarters located in premium Lekki Phase 1, Lagos. Crafted to high international standards, this magnificent masterpiece features ultra-premium materials, custom lighting arrays, and spacious living chambers designed for absolute comfort.",
    price: 150000000,
    location: "Lekki Phase 1, Lagos",
    category: "House",
    subcategory: "Duplexes",
    status: "For Sale",
    size: "800sqm",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Swimming Pool", "En-suite Bedrooms", "CCTV System", "Fully Fitted Kitchen", "Smart Automation"],
    installmentEnabled: true,
    installmentPlans: [
      { months: 3, price: 155000000 },
      { months: 6, price: 160000000 }
    ],
    discountEnabled: true,
    discountValue: 5000000,
    discountReason: "Independence Day Promo"
  },
  {
    id: "2",
    title: "Prime 600sqm Residential Plot",
    description: "This is a premium, 100% dry and gated residential parcel measuring 600sqm in the rapidly building axis of Sangotedo, Ajah, Lagos. It possesses secure architectural boundaries and is fully documented under top titles (C of O), representing an unmatched investment for developer builds or custom high-end family mansions.",
    price: 45000000,
    location: "Sangotedo, Ajah, Lagos",
    category: "Land",
    subcategory: "Land for Building",
    status: "For Sale",
    size: "600sqm",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Paved Access Road", "Electricity Infrastructure", "Gated Security", "Proper Drainage System"],
    installmentEnabled: true,
    installmentPlans: [
      { months: 3, price: 46000000 },
      { months: 6, price: 48000000 }
    ],
    discountEnabled: false
  },
  {
    id: "3",
    title: "Ultra-Modern 4 Bedroom Terrace",
    description: "A prestigious 4-bedroom terraced home with executive class design features situated in the diplomatic and highly secure Maitama neighborhood in Abuja. Outfitted with master-built glass balconies, integrated home gyms, double-high ceilings, and state of the art climate management.",
    price: 280000000,
    location: "Maitama, Abuja",
    category: "House",
    subcategory: "Terraced Houses",
    status: "For Sale",
    size: "500sqm",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Rooftop Terrace", "Integrated Sound", "Executive Lounge", "24/7 Security Patrols"],
    installmentEnabled: false,
    discountEnabled: true,
    discountValue: 10000000,
    discountReason: "End-of-Year Clearance Promo"
  },
  {
    id: "4",
    title: "3 Bedroom Apartment with BQ",
    description: "Elegant 3-bedroom luxury apartment plus fully fitted Boys' Quarters located inside key commercial core of Victoria Island, Lagos. Perfect residence for corporate directors, expatriates, or investment-minded landlords seeking reliable top-tier rental cashflows on short-let services.",
    price: 120000000,
    location: "Victoria Island, Lagos",
    category: "House",
    subcategory: "Apartments / Flats",
    status: "For Rent",
    size: "350sqm",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Fitted Kitchen", "Passenger Elevators", "Generous Parking", "Water Treatment Infrastructure"],
    installmentEnabled: false,
    discountEnabled: false
  },
  {
    id: "5",
    title: "Commercial Development Land",
    description: "Outstanding commercial plot measuring 1,200sqm boasting dual-access frontage onto busy Ikorodu Road, Lagos. Perfectly situated for office complexes, logistic operational parks, supermarkets, or high-density retail nodes in an area with explosive high daily commute traction.",
    price: 25000000,
    location: "Ikorodu, Lagos",
    category: "Land",
    subcategory: "Commercial Land",
    status: "For Sale",
    size: "1200sqm",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Dual Frontage", "Guaranteed Dry Solid Ground", "Close Transit Proximity"],
    installmentEnabled: true,
    installmentPlans: [
      { months: 3, price: 26000000 },
      { months: 6, price: 27500000 }
    ],
    discountEnabled: false
  },
  {
    id: "6",
    title: "Palatial 7 Bedroom Mansion",
    description: "Extravagant 7-bedroom water-facing architectural mansion on the ultra-exclusive Banana Island, Lagos. Designed without compromise, featuring double-height marble lobbies, customized wellness spas, private home theatres, indoor elevator systems, and private yacht slipway.",
    price: 1500000000,
    location: "Banana Island, Lagos",
    category: "House",
    subcategory: "Mansion / Mansionette",
    status: "For Sale",
    size: "1500sqm",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600",
    imageUrls: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800&h=600"
    ],
    amenities: ["Waterfront Access", "Private Elevator", "Home Cinema", "Direct Yacht Berth", "Indoor/Outdoor Dual Pools"],
    installmentEnabled: true,
    installmentPlans: [
      { months: 6, price: 1550000000 },
      { months: 12, price: 1600000000 }
    ],
    discountEnabled: true,
    discountValue: 50000000,
    discountReason: "Premium Buyer Immediate Settlement Offer"
  }
];
