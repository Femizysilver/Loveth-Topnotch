import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/errorHandlers';
import { MOCK_PROPERTIES } from '@/data/mockProperties';

export interface InstallmentPlan {
  months: number;
  price: number;
}

export interface Property {
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
  description?: string;
  amenities?: string[];
  featured?: boolean;
  videoUrl?: string;
  videoUrls?: string[];
  ownerId?: string;
  createdAt?: any;
  updatedAt?: any;
  
  // Installer and discount options
  installmentEnabled?: boolean;
  installmentPlans?: InstallmentPlan[];
  discountEnabled?: boolean;
  discountValue?: number;
  discountReason?: string;
}

export function hideMockProperty(id: string) {
  const hidden = JSON.parse(localStorage.getItem("hidden_mock_ids") || "[]");
  if (!hidden.includes(id)) {
    hidden.push(id);
    localStorage.setItem("hidden_mock_ids", JSON.stringify(hidden));
  }
  window.dispatchEvent(new Event("properties-changed"));
}

export function useProperties(limitCount?: number) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hiddenIds, setHiddenIds] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem("hidden_mock_ids") || "[]")
  );

  useEffect(() => {
    const handleUpdate = () => {
      setHiddenIds(JSON.parse(localStorage.getItem("hidden_mock_ids") || "[]"));
    };
    window.addEventListener("properties-changed", handleUpdate);
    return () => window.removeEventListener("properties-changed", handleUpdate);
  }, []);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const dbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
        
        // Filter out hidden mock properties and those that have a name match in database
        const activeMocks = MOCK_PROPERTIES.filter(mock => {
          if (hiddenIds.includes(mock.id)) return false;
          const nameMatch = dbData.some(real => real.title.toLowerCase() === mock.title.toLowerCase());
          return !nameMatch;
        });

        // Combine
        let combined = [...dbData, ...activeMocks];
        if (limitCount) {
          combined = combined.slice(0, limitCount);
        }

        setProperties(combined);
        setLoading(false);
      }, 
      (err) => {
        // Fallback to only mocks if DB query fails or permission denied
        console.warn("Using offline mocks list because of Firestore fetch error or permissions:", err);
        const activeMocks = MOCK_PROPERTIES.filter(mock => !hiddenIds.includes(mock.id));
        let combined = [...activeMocks];
        if (limitCount) {
          combined = combined.slice(0, limitCount);
        }
        setProperties(combined);
        setError(err.message);
        setLoading(false);
        handleFirestoreError(err, 'list', 'properties');
      }
    );
    
    return () => unsubscribe();
  }, [limitCount, hiddenIds]);

  return { properties, loading, error };
}
