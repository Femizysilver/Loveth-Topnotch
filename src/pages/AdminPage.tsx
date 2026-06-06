import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, Plus, Search, Filter, 
  Edit, Trash2, LayoutDashboard, 
  Mail, LogOut, Loader2,
  Upload, X, Film, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LOVETH_CONTACT } from "@/constants";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc, 
  addDoc,
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProperties, Property, hideMockProperty } from "@/hooks/useProperties";

// Convert file to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Compress image before saving to base64 for Firestore storage when API upload fails
const compressImage = (file: File, maxDimension = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

interface MediaQueueItem {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Unified properties hook
  const { properties, loading: propertiesLoading } = useProperties();
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Editable listing states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    category: "House",
    size: "",
    amenities: "",
    description: "",
    installmentEnabled: false,
    plan_3m_price: "",
    plan_6m_price: "",
    plan_12m_price: "",
    discountEnabled: false,
    discountValue: "",
    discountReason: "",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    location: "",
    price: "",
    category: "House",
    status: "For Sale",
    size: "",
    amenities: "",
    description: "",
    installmentEnabled: false,
    plan_3m_price: "",
    plan_6m_price: "",
    plan_12m_price: "",
    discountEnabled: false,
    discountValue: "",
    discountReason: "",
  });

  // Track session on mount
  useEffect(() => {
    // 1. Try restore from localStorage
    const saved = localStorage.getItem("loveth_local_admin_session");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error("Local session parsing skipped:", err);
      }
    }

    // 2. Listen to standard FirebaseAuthState to keep sync
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isLocal: false
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch inquiries
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snap) => {
        setInquiries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => handleFirestoreError(err, "list", "inquiries")
    );
    return () => unsubscribe();
  }, [user]);

  const handleFilesAdded = (files: FileList) => {
    const newList: MediaQueueItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImg = file.type.startsWith("image/");
      
      if (!isImg && !isVideo) continue;
      
      newList.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image"
      });
    }
    setMediaFiles(prev => [...prev, ...newList]);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMessage("");

    const targetEmail = email.trim();
    const targetPassword = password;
    const normalizedEmail = targetEmail.toLowerCase();

    const isSpecialAdmin = 
      normalizedEmail === "lovethproperties02@gmail.com" ||
      normalizedEmail === "femizydasilver@gmail.com";

    try {
      if (isSpecialAdmin && targetPassword === "loveth2004") {
        const localSessionUser = {
          uid: "local_admin_" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_"),
          email: targetEmail,
          isLocal: true,
        };

        try {
          await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        } catch (authErr: any) {
          console.warn("Background Firebase Auth login failed or disabled. Logging in via instant config fallback.", authErr);
          if (
            authErr.code === "auth/user-not-found" || 
            authErr.code === "auth/invalid-credential" || 
            authErr.code === "auth/wrong-password" || 
            authErr.message?.includes("INVALID_LOGIN_CREDENTIALS") ||
            authErr.message?.includes("user-not-found")
          ) {
            try {
              await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
            } catch (createErr: any) {
              console.warn("Background Admin registration skipped:", createErr);
            }
          }
        }

        localStorage.setItem("loveth_local_admin_session", JSON.stringify(localSessionUser));
        setUser(localSessionUser);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        setUser(userCredential.user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMessage(
          "Notice: Firebase Email/Password Auth is disabled in your cloud project. " +
          "But you have been granted session access! If you wish to use standard security, " +
          "enable the 'Email/Password' provider in the Firebase Console under Authentication."
        );
      } else {
        setErrorMessage(err.message || "System Authentication Fail: Please check your Loveth credentials.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("loveth_local_admin_session");
    await signOut(auth);
    setUser(null);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      if (["1", "2", "3", "4", "5", "6"].includes(id)) {
        hideMockProperty(id);
        alert("Sample property listing deleted from view!");
        return;
      }
      await deleteDoc(doc(db, "properties", id));
      alert("Property deleted successfully.");
    } catch (err) {
      handleFirestoreError(err, "delete", `properties/${id}`);
    }
  };

  const handleEditClick = (p: Property) => {
    setEditingProperty(p);

    const plan3m = p.installmentPlans?.find(x => x.months === 3)?.price.toString() || "";
    const plan6m = p.installmentPlans?.find(x => x.months === 6)?.price.toString() || "";
    const plan12m = p.installmentPlans?.find(x => x.months === 12)?.price.toString() || "";

    setEditFormData({
      title: p.title || "",
      location: p.location || "",
      price: (p.price || 0).toString(),
      category: p.category || "House",
      status: p.status || "For Sale",
      size: p.size || "",
      amenities: (p.amenities || []).join(", "),
      description: p.description || "",
      installmentEnabled: p.installmentEnabled || false,
      plan_3m_price: plan3m,
      plan_6m_price: plan6m,
      plan_12m_price: plan12m,
      discountEnabled: p.discountEnabled || false,
      discountValue: (p.discountValue || "").toString(),
      discountReason: p.discountReason || "",
    });
  };

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mediaFiles.length === 0) {
      alert("Please upload at least one image or video for this property.");
      return;
    }

    setUploadProgress(true);

    try {
      const uploadedImageUrls: string[] = [];
      const uploadedVideoUrls: string[] = [];

      for (const item of mediaFiles) {
        let fileUrl = "";
        
        try {
          const base64 = await fileToBase64(item.file);
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: item.file.name,
              base64Data: base64
            })
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.url) fileUrl = resData.url;
          }
        } catch (uploadErr) {
          console.warn(`[Upload Warning] Express backend upload failed for "${item.file.name}". Falling back to premium client-side storage encoding.`, uploadErr);
        }

        if (!fileUrl) {
          if (item.type === "image") {
            fileUrl = await compressImage(item.file, 800, 0.6);
          } else {
            const sizeInMb = item.file.size / (1024 * 1024);
            if (sizeInMb > 0.85) {
              throw new Error(
                `The video file "${item.file.name}" is too large (${sizeInMb.toFixed(2)}MB).\n\n` +
                `Please upload a smaller video clip under 850KB, or upload images instead.`
              );
            }
            fileUrl = await fileToBase64(item.file);
          }
        }

        if (fileUrl) {
          if (item.type === "image") {
            uploadedImageUrls.push(fileUrl);
          } else {
            uploadedVideoUrls.push(fileUrl);
          }
        }
      }

      const finalImageUrls = uploadedImageUrls.length > 0 
        ? uploadedImageUrls 
        : ["https://picsum.photos/800/600"];

      // Setup installment plans
      const installmentPlansList = [];
      if (formData.installmentEnabled) {
        if (formData.plan_3m_price) installmentPlansList.push({ months: 3, price: Number(formData.plan_3m_price) });
        if (formData.plan_6m_price) installmentPlansList.push({ months: 6, price: Number(formData.plan_6m_price) });
        if (formData.plan_12m_price) installmentPlansList.push({ months: 12, price: Number(formData.plan_12m_price) });
      }

      const data = {
        title: formData.title,
        location: formData.location,
        price: Number(formData.price),
        category: formData.category,
        status: "For Sale",
        description: formData.description,
        size: formData.size || "Not specified",
        imageUrls: finalImageUrls,
        videoUrl: uploadedVideoUrls[0] || "",
        videoUrls: uploadedVideoUrls,
        amenities: formData.amenities.split(",").map(a => a.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user?.uid,

        // Installment options
        installmentEnabled: formData.installmentEnabled,
        installmentPlans: installmentPlansList,

        // Discount options
        discountEnabled: formData.discountEnabled,
        discountValue: formData.discountEnabled ? Number(formData.discountValue) : 0,
        discountReason: formData.discountEnabled ? formData.discountReason : "",
      };

      await addDoc(collection(db, "properties"), data);
      
      mediaFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setMediaFiles([]);
      
      setFormData({
        title: "",
        location: "",
        price: "",
        category: "House",
        size: "",
        amenities: "",
        description: "",
        installmentEnabled: false,
        plan_3m_price: "",
        plan_6m_price: "",
        plan_12m_price: "",
        discountEnabled: false,
        discountValue: "",
        discountReason: "",
      });

      alert("Property published successfully!");
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Error creating property listing:", err);
      alert(err.message || "Failed to publish listing.");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    setUploadProgress(true);

    try {
      const uploadedImageUrls: string[] = [];
      const uploadedVideoUrls: string[] = [];

      for (const item of mediaFiles) {
        let fileUrl = "";
        try {
          const base64 = await fileToBase64(item.file);
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: item.file.name,
              base64Data: base64
            })
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.url) fileUrl = resData.url;
          }
        } catch (uploadErr) {
          console.warn("Upload fallback encoding triggered:", uploadErr);
        }

        if (!fileUrl) {
          if (item.type === "image") {
            fileUrl = await compressImage(item.file, 800, 0.6);
          } else {
            fileUrl = await fileToBase64(item.file);
          }
        }

        if (item.type === "image") {
          uploadedImageUrls.push(fileUrl);
        } else {
          uploadedVideoUrls.push(fileUrl);
        }
      }

      // Merge brand new assets with existing ones
      const finalImageUrls = [
        ...(editingProperty.imageUrls || (editingProperty.imageUrl ? [editingProperty.imageUrl] : [])),
        ...uploadedImageUrls
      ];
      
      const finalVideoUrls = [
        ...(editingProperty.videoUrls || (editingProperty.videoUrl ? [editingProperty.videoUrl] : [])),
        ...uploadedVideoUrls
      ];

      const installmentPlansList = [];
      if (editFormData.installmentEnabled) {
        if (editFormData.plan_3m_price) installmentPlansList.push({ months: 3, price: Number(editFormData.plan_3m_price) });
        if (editFormData.plan_6m_price) installmentPlansList.push({ months: 6, price: Number(editFormData.plan_6m_price) });
        if (editFormData.plan_12m_price) installmentPlansList.push({ months: 12, price: Number(editFormData.plan_12m_price) });
      }

      const updatedPayload: any = {
        title: editFormData.title,
        location: editFormData.location,
        price: Number(editFormData.price),
        category: editFormData.category,
        size: editFormData.size || "Not specified",
        status: editFormData.status,
        description: editFormData.description,
        amenities: editFormData.amenities.split(",").map(a => a.trim()).filter(Boolean),
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : ["https://picsum.photos/800/600"],
        videoUrls: finalVideoUrls,
        videoUrl: finalVideoUrls[0] || "",
        updatedAt: serverTimestamp(),
        
        installmentEnabled: editFormData.installmentEnabled,
        installmentPlans: installmentPlansList,
        discountEnabled: editFormData.discountEnabled,
        discountValue: editFormData.discountEnabled ? Number(editFormData.discountValue) : 0,
        discountReason: editFormData.discountEnabled ? editFormData.discountReason : "",
      };

      if (["1", "2", "3", "4", "5", "6"].includes(editingProperty.id)) {
        // If they edit mock, hide original mock, clone it as a database record
        hideMockProperty(editingProperty.id);
        updatedPayload.createdAt = serverTimestamp();
        updatedPayload.ownerId = user?.uid;
        await addDoc(collection(db, "properties"), updatedPayload);
        alert("Sample listing customized & saved into cloud database successfully!");
      } else {
        await updateDoc(doc(db, "properties", editingProperty.id), updatedPayload);
        alert("Listing updated successfully!");
      }

      mediaFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setMediaFiles([]);
      setEditingProperty(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to edit property.");
    } finally {
      setUploadProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A84C]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl border-none p-4">
          <CardHeader className="space-y-4 text-center">
            <div className="bg-[#C9A84C] w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg">
              <Building2 size={32} />
            </div>
            <CardTitle className="text-3xl font-serif">Admin Portal</CardTitle>
            <CardDescription>Secure access for Loveth TopNotch Management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="lovethproperties02@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border-none h-14" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Access Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border-none h-14" 
                />
              </div>
              
              {errorMessage && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 text-xs border border-red-100 text-center font-medium">
                  {errorMessage}
                </div>
              )}

              <Button disabled={authLoading} type="submit" className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold h-14 rounded-xl">
                {authLoading ? <Loader2 className="animate-spin" /> : "Authorize Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8">
          <h2 className="font-serif text-2xl font-bold tracking-tighter">
            ADMIN <span className="text-[#C9A84C]">TOPNOTCH</span>
          </h2>
        </div>
        <nav className="flex-grow px-4 py-8 space-y-2">
          {[
            { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-medium transition-colors ${item.active ? "bg-[#C9A84C] text-white" : "text-gray-400 hover:text-white"}`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 space-y-12 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-serif">Management Studio</h1>
            <p className="text-gray-500">Welcome, {user.email}. Control Loveth's digital portfolio here.</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) {
              mediaFiles.forEach(item => URL.revokeObjectURL(item.preview));
              setMediaFiles([]);
            }
            setDialogOpen(open);
          }}>
            <DialogTrigger onClick={() => setDialogOpen(true)} className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold h-12 rounded-xl px-4 flex items-center justify-center cursor-pointer">
              <Plus size={20} className="mr-2" /> New Listing
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white rounded-3xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Create New Property Listing</DialogTitle>
                <DialogDescription>
                  Upload high-quality images and video tours. Configure optional installments and promotional discounts effortlessly.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProperty} className="space-y-6 py-4 text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      required 
                      value={formData.title} 
                      onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                      placeholder="Luxurious Penthouse / Prime Dry Land..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      required 
                      value={formData.location} 
                      onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                      placeholder="Lekki Phase 1, Lagos" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (NGN)</Label>
                    <Input 
                      type="number" 
                      required 
                      value={formData.price} 
                      onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                      placeholder="e.g. 120000000" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border bg-white border-gray-200 outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    >
                      <option>House</option>
                      <option>Land</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Size / Dimensions / Title documentation</Label>
                    <Input 
                      value={formData.size} 
                      onChange={(e) => setFormData(p => ({ ...p, size: e.target.value }))}
                      placeholder="600sqm (C of O / Governor's Consent)" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities & Features (comma separated)</Label>
                  <Input 
                    value={formData.amenities} 
                    onChange={(e) => setFormData(p => ({ ...p, amenities: e.target.value }))}
                    placeholder="Swimming Pool, Smart Home Automation, CCTV, Secured Gateway" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    required 
                    value={formData.description} 
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="min-h-[90px]" 
                    placeholder="Provide detailed legal titles, close transit routes, structural options..."
                  />
                </div>

                {/* Optional Installment Plan details */}
                <div className="space-y-4 border rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="create-installment-enabled"
                      checked={formData.installmentEnabled}
                      onChange={(e) => setFormData(p => ({ ...p, installmentEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                    />
                    <Label htmlFor="create-installment-enabled" className="font-semibold cursor-pointer text-sm">
                      Enable Payment Installment Plans
                    </Label>
                  </div>
                  {formData.installmentEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-6 pt-2 animate-fade-in text-xs">
                      <div className="space-y-1">
                        <Label>3 Months Plan Total Price (₦)</Label>
                        <Input 
                          type="number"
                          value={formData.plan_3m_price}
                          onChange={(e) => setFormData(p => ({ ...p, plan_3m_price: e.target.value }))}
                          placeholder="e.g. 125000000"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>6 Months Plan Total Price (₦)</Label>
                        <Input 
                          type="number"
                          value={formData.plan_6m_price}
                          onChange={(e) => setFormData(p => ({ ...p, plan_6m_price: e.target.value }))}
                          placeholder="e.g. 130000000"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>12 Months Plan Total Price (₦)</Label>
                        <Input 
                          type="number"
                          value={formData.plan_12m_price}
                          onChange={(e) => setFormData(p => ({ ...p, plan_12m_price: e.target.value }))}
                          placeholder="e.g. 140000000"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Discounts Section */}
                <div className="space-y-4 border rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="create-discount-enabled"
                      checked={formData.discountEnabled}
                      onChange={(e) => setFormData(p => ({ ...p, discountEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                    />
                    <Label htmlFor="create-discount-enabled" className="font-semibold cursor-pointer text-sm">
                      Offer Promotional Discount Value
                    </Label>
                  </div>
                  {formData.discountEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 pt-2 animate-fade-in text-xs">
                      <div className="space-y-1">
                        <Label>Discount Value Amount (₦ off total price)</Label>
                        <Input 
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData(p => ({ ...p, discountValue: e.target.value }))}
                          placeholder="e.g. 5000000"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Discount Offer / Reason Label</Label>
                        <Input 
                          value={formData.discountReason}
                          onChange={(e) => setFormData(p => ({ ...p, discountReason: e.target.value }))}
                          placeholder="e.g. Eid Mubarak Promo, Christmas Special"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload Zone */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Listing Media Files</Label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files); }}
                    onClick={() => document.getElementById("property-file-upload")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-gray-300 hover:border-[#C9A84C] bg-gray-50"
                    }`}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      className="hidden" 
                      id="property-file-upload" 
                      onChange={(e) => { if (e.target.files) handleFilesAdded(e.target.files); }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                      <div className="bg-[#C9A84C]/10 p-3 rounded-full text-[#C9A84C]">
                        <Upload size={24} />
                      </div>
                      <p className="font-medium text-sm text-gray-700">Drag & drop files here, or <span className="text-[#C9A84C] underline font-bold">browse</span></p>
                      <p className="text-xs text-gray-400">Upload multiple photos & videos to establish a high end catalog.</p>
                    </div>
                  </div>

                  {mediaFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-gray-500">Queued Assets ({mediaFiles.length})</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[220px] overflow-y-auto p-1 border rounded-xl bg-gray-55">
                        {mediaFiles.map((item) => (
                          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-white border shadow-sm group">
                            {item.type === "image" ? (
                              <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full relative bg-black flex items-center justify-center">
                                <video src={item.preview} className="w-full h-full object-cover opacity-80" muted playsInline />
                                <Film size={20} className="absolute text-white" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                URL.revokeObjectURL(item.preview);
                                setMediaFiles(prev => prev.filter(f => f.id !== item.id));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={uploadProgress} 
                  className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white py-6 rounded-xl font-bold mt-4"
                >
                  {uploadProgress ? <Loader2 className="animate-spin text-white" /> : "Publish Listing"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic Edit Dialog */}
        <Dialog open={editingProperty !== null} onOpenChange={(open) => { if (!open) setEditingProperty(null); }}>
          <DialogContent className="max-w-3xl bg-white rounded-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-black">Edit Listing: {editingProperty?.title}</DialogTitle>
              <DialogDescription>
                Customize layout text, details, promotional bargains, and installment arrangements.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProperty} className="space-y-6 py-4 text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    required 
                    value={editFormData.title} 
                    onChange={(e) => setEditFormData(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    required 
                    value={editFormData.location} 
                    onChange={(e) => setEditFormData(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (NGN)</Label>
                  <Input 
                    type="number" 
                    required 
                    value={editFormData.price} 
                    onChange={(e) => setEditFormData(p => ({ ...p, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    value={editFormData.category} 
                    onChange={(e) => setEditFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border bg-white border-gray-200 outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  >
                    <option>House</option>
                    <option>Land</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status Option</Label>
                  <select 
                    value={editFormData.status} 
                    onChange={(e) => setEditFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border bg-white border-gray-200 outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  >
                    <option>For Sale</option>
                    <option>For Rent</option>
                    <option>Sold</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Size Details</Label>
                  <Input 
                    value={editFormData.size} 
                    onChange={(e) => setEditFormData(p => ({ ...p, size: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amenities & Features (separated with commas)</Label>
                <Input 
                  value={editFormData.amenities} 
                  onChange={(e) => setEditFormData(p => ({ ...p, amenities: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea 
                  required 
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData(p => ({ ...p, description: e.target.value }))}
                  className="min-h-[110px]"
                />
              </div>

              {/* Installment Plan Panel */}
              <div className="space-y-4 border rounded-2xl p-4 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="edit-installment-enabled"
                    checked={editFormData.installmentEnabled}
                    onChange={(e) => setEditFormData(p => ({ ...p, installmentEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                  />
                  <Label htmlFor="edit-installment-enabled" className="font-semibold cursor-pointer text-sm">
                    Allow Installmental Switch Payment Rules
                  </Label>
                </div>
                {editFormData.installmentEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-6 pt-2 animate-fade-in text-xs">
                    <div className="space-y-1">
                      <Label>3 Months Plan Extra / Total Price (₦)</Label>
                      <Input 
                        type="number"
                        value={editFormData.plan_3m_price}
                        onChange={(e) => setEditFormData(p => ({ ...p, plan_3m_price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>6 Months Plan Extra / Total Price (₦)</Label>
                      <Input 
                        type="number"
                        value={editFormData.plan_6m_price}
                        onChange={(e) => setEditFormData(p => ({ ...p, plan_6m_price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>12 Months Plan Extra / Total Price (₦)</Label>
                      <Input 
                        type="number"
                        value={editFormData.plan_12m_price}
                        onChange={(e) => setEditFormData(p => ({ ...p, plan_12m_price: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Options Panel */}
              <div className="space-y-4 border rounded-2xl p-4 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="edit-discount-enabled"
                    checked={editFormData.discountEnabled}
                    onChange={(e) => setEditFormData(p => ({ ...p, discountEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                  />
                  <Label htmlFor="edit-discount-enabled" className="font-semibold cursor-pointer text-sm">
                    Offer Special discount rate
                  </Label>
                </div>
                {editFormData.discountEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 pt-2 animate-fade-in text-xs">
                    <div className="space-y-1">
                      <Label>Discount Value (₦ off price)</Label>
                      <Input 
                        type="number"
                        value={editFormData.discountValue}
                        onChange={(e) => setEditFormData(p => ({ ...p, discountValue: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Discount Reason or Name</Label>
                      <Input 
                        value={editFormData.discountReason}
                        onChange={(e) => setEditFormData(p => ({ ...p, discountReason: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Files Upload for updates */}
              <div className="space-y-2">
                <Label className="text-sm">Add Additional Photos/Media (Optional)</Label>
                <div
                  onClick={() => document.getElementById("edit-property-file")?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-[#C9A84C] bg-gray-50"
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    className="hidden" 
                    id="edit-property-file" 
                    onChange={(e) => { if (e.target.files) handleFilesAdded(e.target.files); }}
                  />
                  <p className="text-xs text-gray-500 font-medium">Click to select new upload files or drag them in (this splits onto previous collections)</p>
                </div>
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {mediaFiles.map(x => (
                      <div key={x.id} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50">
                        {x.type === "image" ? (
                          <img src={x.preview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-black relative flex items-center justify-center">
                            <Film size={14} className="text-white" />
                          </div>
                        )}
                        <button 
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full"
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(x.preview);
                            setMediaFiles(prev => prev.filter(f => f.id !== x.id));
                          }}
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/2" 
                  onClick={() => {
                    mediaFiles.forEach(f => URL.revokeObjectURL(f.preview));
                    setMediaFiles([]);
                    setEditingProperty(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadProgress} className="w-1/2 bg-black hover:bg-black/90 text-white">
                  {uploadProgress ? <Loader2 className="animate-spin text-white" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Content Tabs */}
        <Tabs defaultValue="properties" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-2xl h-auto flex flex-wrap lg:w-fit">
            <TabsTrigger value="properties" className="rounded-xl px-8 py-3 data-[state=active]:bg-black data-[state=active]:text-white">
              Active Listings ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-xl px-8 py-3">Property Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="px-10 py-6">Property Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price (NGN)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Rules</TableHead>
                      <TableHead className="text-right px-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-black font-medium">
                    {properties.map((p) => (
                      <TableRow key={p.id} className="hover:bg-gray-50 transition-colors border-b last:border-none">
                        <TableCell className="px-10 py-6 font-bold flex items-center gap-2">
                          {p.title}
                          {["1", "2", "3", "4", "5", "6"].includes(p.id) && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px]">Sample Listing</Badge>
                          )}
                        </TableCell>
                        <TableCell>{p.location}</TableCell>
                        <TableCell>
                          {p.discountEnabled && p.discountValue ? (
                            <div>
                              <span className="line-through text-red-400 text-xs mr-2">₦{p.price.toLocaleString()}</span>
                              <span>₦{(p.price - p.discountValue).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span>₦{p.price.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            p.status === "Sold" ? "bg-red-50 text-red-700 border-red-100 border text-[11px]" :
                            p.status === "For Rent" ? "bg-amber-50 text-amber-700 border-amber-100 border text-[11px]" :
                            "bg-green-50 text-green-700 border-green-100 border text-[11px]"
                          }>
                            {p.status || "For Sale"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs space-y-1">
                          {p.installmentEnabled ? (
                            <p className="text-emerald-600 font-bold">✓ Installments On ({p.installmentPlans?.length || 0} plans)</p>
                          ) : (
                            <p className="text-neutral-400">Outright purchase only</p>
                          )}
                          {p.discountEnabled && (
                            <p className="text-[#C9A84C] font-semibold">★ Promo discount is Active</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex justify-end gap-1">
                            <Button onClick={() => handleEditClick(p)} size="icon" variant="ghost" className="hover:text-amber-500 hover:bg-amber-50 rounded-full">
                              <Edit size={16} />
                            </Button>
                            <Button onClick={() => handleDeleteProperty(p.id)} size="icon" variant="ghost" className="hover:text-red-500 hover:bg-red-50 rounded-full">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {properties.length === 0 && !propertiesLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                          No properties cataloged yet. Tap 'New Listing' above to construct one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="px-10 py-6">Name</TableHead>
                      <TableHead>Contact info</TableHead>
                      <TableHead>Target Property</TableHead>
                      <TableHead>Message Log</TableHead>
                      <TableHead className="text-right px-10">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-black font-medium">
                    {inquiries.map((inq) => (
                      <TableRow key={inq.id} className="hover:bg-gray-50 transition-colors border-b last:border-none">
                        <TableCell className="px-10 py-6 font-bold">{inq.name}</TableCell>
                        <TableCell className="space-y-0.5">
                          <p className="text-xs font-semibold">{inq.email}</p>
                          <p className="text-xs text-gray-500">{inq.phone}</p>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-600">{inq.propertyTitle || "Direct Conversation"}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-neutral-600">{inq.message}</TableCell>
                        <TableCell className="text-right px-10 text-xs font-mono text-gray-500">
                          {inq.createdAt?.toDate?.().toLocaleDateString() || "Just now"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {inquiries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                          No prospective buyers have initiated communication yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
