import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/errorHandlers';

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
}

export function useProperties(limitCount?: number) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
        setProperties(data);
        setLoading(false);
      }, 
      (err) => {
        setError(err.message);
        setLoading(false);
        handleFirestoreError(err, 'list', 'properties');
      }
    );
    
    return () => unsubscribe();
  }, [limitCount]);

  return { properties, loading, error };
}
