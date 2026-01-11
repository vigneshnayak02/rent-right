import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { ADMIN_EMAIL } from '@/integrations/firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Bike, 
  BikeStatus, 
  BookingIntent 
} from '@/types/bike';
import { 
  getBikes, 
  createBike, 
  updateBike, 
  deleteBike, 
  updateBikeStatus,
  subscribeToBikes 
} from '@/integrations/firebase/bikes';
import { 
  getBookingIntents, 
  subscribeToBookingIntents 
} from '@/integrations/firebase/bookingIntents';
import { uploadBikeImage, deleteBikeImage } from '@/integrations/firebase/storage';
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  X,
  Activity,
  Package,
  TrendingUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Admin uses local username/password authentication

const Admin = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bookingIntents, setBookingIntents] = useState<BookingIntent[]>([]);
  const [isBikeDialogOpen, setIsBikeDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [bikeForm, setBikeForm] = useState({
    name: '',
    cc: '',
    engine_type: '',
    price_per_hour: '',
    status: 'available' as BikeStatus,
    fuel_type: '',
    mileage: '',
    seats: '',
    bike_number: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Subscribe to bikes
      const unsubscribeBikes = subscribeToBikes((bikesData) => {
        setBikes(bikesData);
      });

      // Subscribe to booking intents
      const unsubscribeIntents = subscribeToBookingIntents((intents) => {
        setBookingIntents(intents);
      });

      return () => {
        unsubscribeBikes();
        unsubscribeIntents();
      };
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      // Ensure admin user exists can be handled elsewhere; here we sign in
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      setUser(cred.user);
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin dashboard',
      });
    } catch (error: any) {
      const msg = error?.message || 'Failed to login';
      setLoginError('Invalid credentials or Firebase error');
      toast({
        title: 'Login failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const resetBikeForm = () => {
    setBikeForm({
      name: '',
      cc: '',
      engine_type: '',
      price_per_hour: '',
      status: 'available',
      fuel_type: '',
      mileage: '',
      seats: '',
      bike_number: '',
      description: '',
      image_url: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingBike(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save bikes",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required fields
    if (!bikeForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Bike name is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.cc || isNaN(parseInt(bikeForm.cc))) {
      toast({
        title: "Validation Error",
        description: "Valid CC is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.price_per_hour || isNaN(parseInt(bikeForm.price_per_hour))) {
      toast({
        title: "Validation Error",
        description: "Valid price per hour is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.fuel_type.trim()) {
      toast({
        title: "Validation Error",
        description: "Fuel type is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.mileage.trim()) {
      toast({
        title: "Validation Error",
        description: "Mileage is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.seats || isNaN(parseInt(bikeForm.seats))) {
      toast({
        title: "Validation Error",
        description: "Valid number of seats is required",
        variant: "destructive",
      });
      return;
    }

    if (!bikeForm.engine_type.trim()) {
      toast({
        title: "Validation Error",
        description: "Engine type is required",
        variant: "destructive",
      });
      return;
    }

    // Validate image
    if (!imageFile && !bikeForm.image_url.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide either an image file or image URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let imageUrl = bikeForm.image_url.trim();

      if (editingBike) {
        // Update existing bike
        // Upload new image if provided
        if (imageFile) {
          // Delete old image if it exists
          if (editingBike.image_url) {
            try {
              await deleteBikeImage(editingBike.image_url);
            } catch (err) {
              console.error("Error deleting old image:", err);
            }
          }
          imageUrl = await uploadBikeImage(imageFile, editingBike.id);
        }

        const bikeData = {
          name: bikeForm.name.trim(),
          cc: parseInt(bikeForm.cc),
          engine_type: bikeForm.engine_type.trim(),
          price_per_hour: parseInt(bikeForm.price_per_hour),
          status: bikeForm.status,
          fuel_type: bikeForm.fuel_type.trim(),
          mileage: bikeForm.mileage.trim(),
          seats: parseInt(bikeForm.seats),
          bike_number: bikeForm.bike_number.trim() || undefined,
          description: bikeForm.description.trim() || undefined,
          image_url: imageUrl
        };

        await updateBike(editingBike.id, bikeData);
        toast({
          title: "Bike updated",
          description: `${bikeForm.name} has been updated successfully`,
        });
      } else {
        // Create new bike - first create the bike, then upload image with correct ID
        let tempImageUrl = imageUrl;

        // If image file is provided, we'll upload after creating the bike
        // For now, use the URL if provided, or a placeholder
        if (!imageFile && !imageUrl) {
          tempImageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
        }

        const bikeData = {
          name: bikeForm.name.trim(),
          cc: parseInt(bikeForm.cc),
          engine_type: bikeForm.engine_type.trim(),
          price_per_hour: parseInt(bikeForm.price_per_hour),
          status: bikeForm.status,
          fuel_type: bikeForm.fuel_type.trim(),
          mileage: bikeForm.mileage.trim(),
          seats: parseInt(bikeForm.seats),
          bike_number: bikeForm.bike_number.trim() || undefined,
          description: bikeForm.description.trim() || undefined,
          image_url: tempImageUrl
        };

        // Create bike first to get the ID
        const newBikeId = await createBike(bikeData);

        // Now upload image with the correct bike ID if file was provided
        if (imageFile && newBikeId) {
          try {
            const uploadedImageUrl = await uploadBikeImage(imageFile, newBikeId);
            // Update the bike with the correct image URL
            await updateBike(newBikeId, { image_url: uploadedImageUrl });
          } catch (imageError: any) {
            console.error("Error uploading image:", imageError);
            toast({
              title: "Warning",
              description: "Bike created but image upload failed. You can update it later.",
              variant: "destructive",
            });
          }
        }

        toast({
          title: "Bike added",
          description: `${bikeForm.name} has been added successfully`,
        });
      }

      setIsBikeDialogOpen(false);
      resetBikeForm();
    } catch (error: any) {
      console.error("Error saving bike:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to save bike';
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = 'Permission denied. Please check Firebase database rules. Make sure authenticated users can write to /bikes';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Error: ${error.code}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditBike = (bike: Bike) => {
    setEditingBike(bike);
    setBikeForm({
      name: bike.name,
      cc: bike.cc.toString(),
      engine_type: bike.engine_type,
      price_per_hour: bike.price_per_hour.toString(),
      status: bike.status,
      fuel_type: bike.fuel_type,
      mileage: bike.mileage,
      seats: bike.seats.toString(),
      bike_number: bike.bike_number || '',
      description: bike.description || '',
      image_url: bike.image_url
    });
    setImagePreview(bike.image_url);
    setIsBikeDialogOpen(true);
  };

  const handleDuplicateBike = (bike: Bike) => {
    setEditingBike(null);
    setBikeForm({
      name: `${bike.name} (Copy)`,
      cc: bike.cc.toString(),
      engine_type: bike.engine_type,
      price_per_hour: bike.price_per_hour.toString(),
      status: 'available' as BikeStatus,
      fuel_type: bike.fuel_type,
      mileage: bike.mileage,
      seats: bike.seats.toString(),
      bike_number: bike.bike_number || '',
      description: bike.description || '',
      image_url: bike.image_url
    });
    setImagePreview(bike.image_url);
    setIsBikeDialogOpen(true);
  };

  const handleDeleteBike = async (bike: Bike) => {
    if (!confirm(`Are you sure you want to delete ${bike.name}?`)) {
      return;
    }

    try {
      // Delete image from storage
      if (bike.image_url) {
        await deleteBikeImage(bike.image_url);
      }
      await deleteBike(bike.id);
      toast({
        title: "Bike deleted",
        description: `${bike.name} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete bike',
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (bikeId: string, newStatus: BikeStatus) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update bike status",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateBikeStatus(bikeId, newStatus);
      toast({
        title: "Status updated",
        description: "Bike status has been updated",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      const errorMessage = error.code === 'PERMISSION_DENIED' 
        ? 'Permission denied. Check Firebase database rules.'
        : error.message || 'Failed to update status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Owner Login</CardTitle>
            <CardDescription>Sign in to access the admin dashboard (Owner only)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={ADMIN_EMAIL}
                  readOnly
                  placeholder={ADMIN_EMAIL}
                  title={ADMIN_EMAIL}
                />
                <input type="hidden" name="email" value={ADMIN_EMAIL} />
                <p className="text-xs text-muted-foreground">Owner access only (admin email is used)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    available: 'bg-green-500/20 text-green-600 border-green-500/30',
    rented: 'bg-red-500/20 text-red-600 border-red-500/30',
    maintenance: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your bike rental business</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${bikes.length > 0 || bookingIntents.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} title={bikes.length > 0 || bookingIntents.length > 0 ? 'Connected to Firebase' : 'Connecting to Firebase...'} />
              <span className="text-xs text-muted-foreground">
                {bikes.length} bikes, {bookingIntents.length} intents
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bikes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Bikes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bikes.filter(b => b.status === 'available').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Booking Intents</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingIntents.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory Manager</TabsTrigger>
            <TabsTrigger value="tracker">Live Tracker</TabsTrigger>
            <TabsTrigger value="status">Status Toggle</TabsTrigger>
          </TabsList>

          {/* Inventory Manager */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bike Inventory</CardTitle>
                    <CardDescription>Manage your bike collection</CardDescription>
                  </div>
                  <Dialog open={isBikeDialogOpen} onOpenChange={setIsBikeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetBikeForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bike
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingBike ? 'Edit Bike' : 'Add New Bike'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBikeSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Bike Name *</Label>
                            <Input
                              id="name"
                              value={bikeForm.name}
                              onChange={(e) => setBikeForm({ ...bikeForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cc">Engine CC *</Label>
                            <Input
                              id="cc"
                              type="number"
                              value={bikeForm.cc}
                              onChange={(e) => setBikeForm({ ...bikeForm, cc: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="engine_type">Engine Type *</Label>
                            <Input
                              id="engine_type"
                              value={bikeForm.engine_type}
                              onChange={(e) => setBikeForm({ ...bikeForm, engine_type: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price_per_hour">Price per Hour (₹) *</Label>
                            <Input
                              id="price_per_hour"
                              type="number"
                              value={bikeForm.price_per_hour}
                              onChange={(e) => setBikeForm({ ...bikeForm, price_per_hour: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fuel_type">Fuel Type *</Label>
                            <Input
                              id="fuel_type"
                              value={bikeForm.fuel_type}
                              onChange={(e) => setBikeForm({ ...bikeForm, fuel_type: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mileage">Mileage *</Label>
                            <Input
                              id="mileage"
                              value={bikeForm.mileage}
                              onChange={(e) => setBikeForm({ ...bikeForm, mileage: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="seats">Seats *</Label>
                            <Input
                              id="seats"
                              type="number"
                              value={bikeForm.seats}
                              onChange={(e) => setBikeForm({ ...bikeForm, seats: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={bikeForm.status}
                              onValueChange={(value) => setBikeForm({ ...bikeForm, status: value as BikeStatus })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="rented">Rented</SelectItem>
                                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bike_number">Bike Number</Label>
                          <Input
                            id="bike_number"
                            value={bikeForm.bike_number}
                            onChange={(e) => setBikeForm({ ...bikeForm, bike_number: e.target.value })}
                            placeholder="e.g., PS-001, RE-2024-001"
                          />
                          <p className="text-xs text-muted-foreground">
                            Internal bike number (not shown on product cards)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={bikeForm.description}
                            onChange={(e) => setBikeForm({ ...bikeForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Bike Image</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="flex-1"
                            />
                            {imagePreview && (
                              <div className="relative w-24 h-24">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6"
                                  onClick={() => {
                                    setImageFile(null);
                                    setImagePreview(editingBike?.image_url || '');
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {!imageFile && !imagePreview && (
                            <div className="space-y-2">
                              <Label htmlFor="image_url">Or Image URL</Label>
                              <Input
                                id="image_url"
                                type="url"
                                value={bikeForm.image_url}
                                onChange={(e) => setBikeForm({ ...bikeForm, image_url: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsBikeDialogOpen(false);
                              resetBikeForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingBike ? 'Update' : 'Create'} Bike
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>CC</TableHead>
                        <TableHead>Price/hr</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bikes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No bikes found. Add your first bike to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bikes.map((bike) => (
                          <TableRow key={bike.id}>
                            <TableCell>
                              <img
                                src={bike.image_url}
                                alt={bike.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{bike.name}</TableCell>
                            <TableCell>{bike.cc} CC</TableCell>
                            <TableCell>₹{bike.price_per_hour}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[bike.status]}>
                                {bike.status === 'available' ? 'Available' : 
                                 bike.status === 'rented' ? 'Rented' : 'Under Maintenance'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditBike(bike)}
                                  title="Edit bike"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicateBike(bike)}
                                  title="Duplicate bike"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteBike(bike)}
                                  title="Delete bike"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tracker */}
          <TabsContent value="tracker" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Intents Tracker</CardTitle>
                <CardDescription>
                  Track every time a customer clicks the WhatsApp booking button
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Bike</TableHead>
                        <TableHead>Pickup Location</TableHead>
                        <TableHead>Pickup Date</TableHead>
                        <TableHead>Drop Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingIntents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No booking intents yet. They will appear here when customers click the booking button.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookingIntents.map((intent) => (
                          <TableRow key={intent.id}>
                            <TableCell>
                              {new Date(intent.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium">{intent.bike_name}</TableCell>
                            <TableCell>{intent.pickup_location}</TableCell>
                            <TableCell>{intent.pickup_date}</TableCell>
                            <TableCell>{intent.drop_date}</TableCell>
                            <TableCell>{intent.total_hours} hours</TableCell>
                            <TableCell className="font-semibold">₹{intent.total_price}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Toggle */}
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bike Status Management</CardTitle>
                <CardDescription>
                  Quickly update bike availability status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bikes.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No bikes found. Add bikes in the Inventory Manager.
                    </div>
                  ) : (
                    bikes.map((bike) => (
                      <Card key={bike.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <img
                              src={bike.image_url}
                              alt={bike.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{bike.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {bike.cc} CC • ₹{bike.price_per_hour}/hr
                              </p>
                              <Select
                                value={bike.status}
                                onValueChange={(value) => handleStatusChange(bike.id, value as BikeStatus)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="rented">Rented</SelectItem>
                                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
