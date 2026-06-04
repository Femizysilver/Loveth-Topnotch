export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  console.error(`Firestore Error [${operationType}] at ${path || 'unknown'}:`, error);
  
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: {
      userId: 'anonymous', // In real app, get from auth
      email: '',
      emailVerified: false,
      isAnonymous: true,
      providerInfo: []
    }
  };

  throw new Error(JSON.stringify(errorInfo));
}
