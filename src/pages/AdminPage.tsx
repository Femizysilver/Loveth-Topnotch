import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, Plus, Search, Filter, 
  MoreVertical, Edit, Trash2, LayoutDashboard, 
  Mail, Settings, LogOut, CheckCircle2, 
  ArrowUpRight, Users, MessageSquare, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LOVETH_CONTACT } from "@/constants";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from "firebase/auth";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { handleFirestoreError } from "@/lib/errorHandlers";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProperties, Property } from "@/hooks/useProperties";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const { properties, loading: propertiesLoading } = useProperties();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      // For demo purposes, we still use the default admin email if not provided
      const targetEmail = email.includes("@") ? email : "femizydasilver@gmail.com";
      await signInWithEmailAndPassword(auth, targetEmail, password);
    } catch (err) {
      alert("Login failed. Please check credentials.");
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "properties", id));
    } catch (err) {
      handleFirestoreError(err, "delete", `properties/${id}`);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      status: "For Sale",
      description: formData.get("description") as string,
      size: formData.get("size") as string,
      imageUrls: [formData.get("imageUrl") as string || "https://picsum.photos/800/600"],
      amenities: (formData.get("amenities") as string).split(",").map(a => a.trim()),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: user?.uid,
    };

    try {
      await addDoc(collection(db, "properties"), data);
      alert("Property created!");
    } catch (err) {
      handleFirestoreError(err, "create", "properties");
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
                  placeholder="admin@lovethreal estate.com" 
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
            { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: true, tab: "properties" },
            { name: "Inquiries", icon: <Mail size={20} />, tab: "inquiries" },
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white font-bold h-12 rounded-xl">
                <Plus size={20} className="mr-2" /> New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Create New Property Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProperty} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input name="title" required placeholder="Luxurious Estate..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input name="location" required placeholder="Lagos, NG" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (NGN)</Label>
                    <Input name="price" type="number" required placeholder="150000000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select name="category" className="w-full h-10 px-3 rounded-md border bg-white border-gray-200">
                      <option>House</option>
                      <option>Land</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Size / Dimensions</Label>
                    <Input name="size" placeholder="600sqm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Main Image URL</Label>
                    <Input name="imageUrl" placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amenities (comma separated)</Label>
                  <Input name="amenities" placeholder="Pool, Gym, Security" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" required className="min-h-[100px]" />
                </div>
                <Button type="submit" className="w-full bg-[#C9A84C] text-white py-6">Publish Listing</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="properties" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-2xl h-auto flex flex-wrap lg:w-fit">
            <TabsTrigger value="properties" className="rounded-xl px-8 py-3 data-[state=active]:bg-black data-[state=active]:text-white">Active Listings</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-xl px-8 py-3">Property Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="px-10 py-6">Property Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price (NGN)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right px-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((p) => (
                      <TableRow key={p.id} className="hover:bg-gray-50 transition-colors border-b last:border-none">
                        <TableCell className="px-10 py-6 font-bold">{p.title}</TableCell>
                        <TableCell>{p.location}</TableCell>
                        <TableCell>₦{p.price.toLocaleString()}</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-700">{p.status}</Badge></TableCell>
                        <TableCell className="text-right px-10">
                           <Button onClick={() => handleDeleteProperty(p.id)} size="icon" variant="ghost" className="hover:text-red-500"><Trash2 size={18}/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {properties.length === 0 && !propertiesLoading && (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">No properties yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="px-10 py-6">Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right px-10">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inq) => (
                      <TableRow key={inq.id} className="hover:bg-gray-50 transition-colors border-b last:border-none">
                        <TableCell className="px-10 py-6 font-bold">{inq.name}</TableCell>
                        <TableCell>
                          <p className="text-xs">{inq.email}</p>
                          <p className="text-xs text-gray-500">{inq.phone}</p>
                        </TableCell>
                        <TableCell className="text-xs">{inq.propertyTitle || "Direct"}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">{inq.message}</TableCell>
                        <TableCell className="text-right px-10 text-xs">
                          {inq.createdAt?.toDate?.().toLocaleDateString() || "Just now"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {inquiries.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">No inquiries yet.</TableCell></TableRow>
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
