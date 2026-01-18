import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  subscribeToBookingIntents,
  deleteBookingIntent,
  deleteAllBookingIntents,
  updateBookingIntent
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
  const [displayEmail, setDisplayEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bookingIntents, setBookingIntents] = useState<BookingIntent[]>([]);
  const [isBikeDialogOpen, setIsBikeDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Bulk selection states
  const [selectedBikes, setSelectedBikes] = useState<string[]>([]);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [selectAllBikes, setSelectAllBikes] = useState(false);
  const [selectAllIntents, setSelectAllIntents] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [bikeForm, setBikeForm] = useState({
    name: '',
    cc: '',
    engine_type: '',
    price_per_hour: '',
    price_per_day: '',
    price_per_week: '',
    price_per_month: '',
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

  // Display email in the visible input (not the real admin email)
  const DISPLAY_EMAIL = 'contact@psrentals.com';
  // initialize visible display email
  useEffect(() => setDisplayEmail(DISPLAY_EMAIL), []);

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
      await setPersistence(auth, browserLocalPersistence);
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
      price_per_day: '',
      price_per_week: '',
      price_per_month: '',
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
    
    console.log("Submitting bike form:", bikeForm);
    console.log("Image file:", imageFile);
    console.log("Image preview:", imagePreview);
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save bikes",
        variant: "destructive",
      });
      return;
    }
    
    // Validate only essential required fields (make pricing optional)
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

    // Validate all price fields only if provided (all optional now)
    if (bikeForm.price_per_hour && isNaN(parseInt(bikeForm.price_per_hour))) {
      toast({
        title: "Validation Error",
        description: "Price per hour must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (bikeForm.price_per_day && isNaN(parseInt(bikeForm.price_per_day))) {
      toast({
        title: "Validation Error",
        description: "Price per day must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (bikeForm.price_per_week && isNaN(parseInt(bikeForm.price_per_week))) {
      toast({
        title: "Validation Error",
        description: "Price per week must be a valid number",
        variant: "destructive",
      });
      return;
    }

    if (bikeForm.price_per_month && isNaN(parseInt(bikeForm.price_per_month))) {
      toast({
        title: "Validation Error",
        description: "Price per month must be a valid number",
        variant: "destructive",
      });
      return;
    }

    // At least one price field should be provided
    if (!bikeForm.price_per_hour && !bikeForm.price_per_day && !bikeForm.price_per_week && !bikeForm.price_per_month) {
      toast({
        title: "Validation Error", 
        description: "Please provide at least one price option (hourly, daily, weekly, or monthly)",
        variant: "destructive",
      });
      return;
    }

    // Image is optional - if no image provided, use placeholder
    if (!imageFile && !bikeForm.image_url.trim()) {
      console.log("No image provided, will use placeholder");
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
          price_per_hour: bikeForm.price_per_hour ? parseInt(bikeForm.price_per_hour) : undefined,
          price_per_day: bikeForm.price_per_day ? parseInt(bikeForm.price_per_day) : undefined,
          price_per_week: bikeForm.price_per_week ? parseInt(bikeForm.price_per_week) : undefined,
          price_per_month: bikeForm.price_per_month ? parseInt(bikeForm.price_per_month) : undefined,
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
          price_per_hour: bikeForm.price_per_hour ? parseInt(bikeForm.price_per_hour) : undefined,
          price_per_day: bikeForm.price_per_day ? parseInt(bikeForm.price_per_day) : undefined,
          price_per_week: bikeForm.price_per_week ? parseInt(bikeForm.price_per_week) : undefined,
          price_per_month: bikeForm.price_per_month ? parseInt(bikeForm.price_per_month) : undefined,
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
      price_per_day: bike.price_per_day?.toString() || '',
      price_per_week: bike.price_per_week?.toString() || '',
      price_per_month: bike.price_per_month?.toString() || '',
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
      price_per_day: bike.price_per_day?.toString() || '',
      price_per_week: bike.price_per_week?.toString() || '',
      price_per_month: bike.price_per_month?.toString() || '',
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

  const handleDeleteBookingIntent = async (intentId: string, bikeName: string) => {
    if (!confirm(`Are you sure you want to delete the booking intent for ${bikeName}?`)) {
      return;
    }

    try {
      await deleteBookingIntent(intentId);
      toast({
        title: "Booking intent deleted",
        description: `Booking intent for ${bikeName} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete booking intent',
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllBookingIntents = async () => {
    if (!confirm(`Are you sure you want to delete all ${bookingIntents.length} booking intents? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAllBookingIntents();
      toast({
        title: "All booking intents deleted",
        description: `${bookingIntents.length} booking intents have been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete booking intents',
        variant: "destructive",
      });
    }
  };

  // Bulk selection handlers
  const handleBikeSelection = (bikeId: string, checked: boolean) => {
    if (checked) {
      setSelectedBikes(prev => [...prev, bikeId]);
    } else {
      setSelectedBikes(prev => prev.filter(id => id !== bikeId));
    }
    // Reset select all state when individual selection changes
    setSelectAllBikes(false);
  };

  const handleIntentSelection = (intentId: string, checked: boolean) => {
    if (checked) {
      setSelectedIntents(prev => [...prev, intentId]);
    } else {
      setSelectedIntents(prev => prev.filter(id => id !== intentId));
    }
    // Reset select all state when individual selection changes
    setSelectAllIntents(false);
  };

  const handleSelectAllBikes = (checked: boolean, bikeList: Bike[]) => {
    setSelectAllBikes(checked);
    if (checked) {
      setSelectedBikes(bikeList.map(bike => bike.id));
    } else {
      setSelectedBikes([]);
    }
  };

  const handleSelectAllIntents = (checked: boolean) => {
    setSelectAllIntents(checked);
    if (checked) {
      setSelectedIntents(bookingIntents.map(intent => intent.id));
    } else {
      setSelectedIntents([]);
    }
  };

  const handleBulkDeleteBikes = async () => {
    if (selectedBikes.length === 0) {
      toast({
        title: "No bikes selected",
        description: "Please select at least one bike to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBikes.length} selected bikes? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const bikeId of selectedBikes) {
        const bike = bikes.find(b => b.id === bikeId);
        if (bike && bike.image_url) {
          await deleteBikeImage(bike.image_url);
        }
        await deleteBike(bikeId);
      }
      setSelectedBikes([]);
      setSelectAllBikes(false);
      toast({
        title: "Bikes deleted",
        description: `${selectedBikes.length} bikes have been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete bikes',
        variant: "destructive",
      });
    }
  };

  const handleBulkDeleteIntents = async () => {
    if (selectedIntents.length === 0) {
      toast({
        title: "No intents selected",
        description: "Please select at least one booking intent to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIntents.length} selected booking intents? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const intentId of selectedIntents) {
        await deleteBookingIntent(intentId);
      }
      setSelectedIntents([]);
      setSelectAllIntents(false);
      toast({
        title: "Booking intents deleted",
        description: `${selectedIntents.length} booking intents have been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to delete booking intents',
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

  const handleBookingStatusChange = async (intentId: string, newStatus: 'not_booked' | 'booked') => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update booking status",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateBookingIntent(intentId, { booking_status: newStatus });
      toast({
        title: "Booking status updated",
        description: `Booking marked as ${newStatus === 'booked' ? 'confirmed' : 'not confirmed'}`,
      });
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update booking status',
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
                  value={displayEmail}
                  onChange={(e) => setDisplayEmail(e.target.value)}
                  placeholder={DISPLAY_EMAIL}
                  title={DISPLAY_EMAIL}
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
            <TabsTrigger value="live">Live Bikes</TabsTrigger>
            <TabsTrigger value="tracker">Live Tracker</TabsTrigger>
            <TabsTrigger value="booking">Bookings</TabsTrigger>
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
                  <div className="flex items-center gap-2">
                    {selectedBikes.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDeleteBikes}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedBikes.length})
                      </Button>
                    )}
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
                            <Label htmlFor="price_per_hour">Price per Hour (₹)</Label>
                            <Input
                              id="price_per_hour"
                              type="number"
                              value={bikeForm.price_per_hour}
                              onChange={(e) => setBikeForm({ ...bikeForm, price_per_hour: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price_per_day">Price per Day (₹)</Label>
                            <Input
                              id="price_per_day"
                              type="number"
                              value={bikeForm.price_per_day}
                              onChange={(e) => setBikeForm({ ...bikeForm, price_per_day: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price_per_week">Price per Week (₹)</Label>
                            <Input
                              id="price_per_week"
                              type="number"
                              value={bikeForm.price_per_week}
                              onChange={(e) => setBikeForm({ ...bikeForm, price_per_week: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price_per_month">Price per Month (₹)</Label>
                            <Input
                              id="price_per_month"
                              type="number"
                              value={bikeForm.price_per_month}
                              onChange={(e) => setBikeForm({ ...bikeForm, price_per_month: e.target.value })}
                              placeholder="Optional"
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAllBikes}
                            onCheckedChange={(checked) => handleSelectAllBikes(checked as boolean, bikes)}
                          />
                          <span className="ml-2 text-xs text-muted-foreground">Select All</span>
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>CC</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Other Prices</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bikes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No bikes found. Add your first bike to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bikes.map((bike) => (
                          <TableRow key={bike.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedBikes.includes(bike.id)}
                                onCheckedChange={(checked) => handleBikeSelection(bike.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <img
                                src={bike.image_url}
                                alt={bike.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{bike.name}</TableCell>
                            <TableCell>{bike.cc} CC</TableCell>
                            <TableCell>
                              {bike.price_per_hour ? `₹${bike.price_per_hour}` : 
                               bike.price_per_day ? `₹${bike.price_per_day}/day` :
                               bike.price_per_week ? `₹${bike.price_per_week}/week` :
                               bike.price_per_month ? `₹${bike.price_per_month}/month` : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {bike.price_per_day && <div>Day: ₹{bike.price_per_day}</div>}
                                {bike.price_per_week && <div>Week: ₹{bike.price_per_week}</div>}
                                {bike.price_per_month && <div>Month: ₹{bike.price_per_month}</div>}
                                {!bike.price_per_day && !bike.price_per_week && !bike.price_per_month && (
                                  <div className="text-muted-foreground">-</div>
                                )}
                              </div>
                            </TableCell>
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
                                {bike.status === 'available' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBike(bike)}
                                    title="Delete live bike"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {bike.status !== 'available' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBike(bike)}
                                    title="Delete bike"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
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

          {/* Live Bikes Management */}
          <TabsContent value="live" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Bikes Management</CardTitle>
                    <CardDescription>
                      Manage bikes that are currently available for booking
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {bikes.filter(b => b.status === 'available').length} live bikes
                    </span>
                    {selectedBikes.filter(id => bikes.find(b => b.id === id && b.status === 'available')).length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDeleteBikes}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedBikes.filter(id => bikes.find(b => b.id === id && b.status === 'available')).length})
                      </Button>
                    )}
                    {bikes.filter(b => b.status === 'available').length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete all ${bikes.filter(b => b.status === 'available').length} live bikes? This action cannot be undone.`)) {
                            bikes.filter(b => b.status === 'available').forEach(bike => {
                              handleDeleteBike(bike);
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Live
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAllBikes && bikes.filter(b => b.status === 'available').length > 0}
                            onCheckedChange={(checked) => handleSelectAllBikes(checked as boolean, bikes.filter(b => b.status === 'available'))}
                          />
                          <span className="ml-2 text-xs text-muted-foreground">Select All</span>
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>CC</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bikes.filter(b => b.status === 'available').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No live bikes found. Set some bikes to "Available" status to see them here.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bikes.filter(b => b.status === 'available').map((bike) => (
                          <TableRow key={bike.id} className="bg-green-50/50">
                            <TableCell>
                              <Checkbox
                                checked={selectedBikes.includes(bike.id)}
                                onCheckedChange={(checked) => handleBikeSelection(bike.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <img
                                src={bike.image_url}
                                alt={bike.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{bike.name}</TableCell>
                            <TableCell>{bike.cc} CC</TableCell>
                            <TableCell>
                              {bike.price_per_hour ? `₹${bike.price_per_hour}` : 
                               bike.price_per_day ? `₹${bike.price_per_day}/day` :
                               bike.price_per_week ? `₹${bike.price_per_week}/week` :
                               bike.price_per_month ? `₹${bike.price_per_month}/month` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-500 text-white">
                                <Activity className="h-3 w-3 mr-1" />
                                Live
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
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteBike(bike)}
                                  title="Delete live bike"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Booking Intents Tracker</CardTitle>
                    <CardDescription>
                      Track every time a customer clicks the WhatsApp booking button
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {bookingIntents.filter(intent => intent.booking_status !== 'booked').length} pending intents
                    </span>
                    {selectedIntents.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDeleteIntents}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedIntents.length})
                      </Button>
                    )}
                    {bookingIntents.filter(intent => intent.booking_status !== 'booked').length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAllBookingIntents}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAllIntents}
                            onCheckedChange={(checked) => handleSelectAllIntents(checked as boolean)}
                          />
                          <span className="ml-2 text-xs text-muted-foreground">Select All</span>
                        </TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Bike</TableHead>
                        <TableHead>Pickup Location</TableHead>
                        <TableHead>Pickup Date</TableHead>
                        <TableHead>Drop Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingIntents.filter(intent => intent.booking_status !== 'booked').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No pending booking intents. All booking intents have been marked as booked or there are no intents yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookingIntents
                          .filter(intent => intent.booking_status !== 'booked')
                          .map((intent) => {
                            const bike = bikes.find(b => b.id === intent.bike_id);
                            return (
                          <TableRow key={intent.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIntents.includes(intent.id)}
                                onCheckedChange={(checked) => handleIntentSelection(intent.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(intent.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <img
                                  src={bike?.image_url || '/placeholder-bike.jpg'}
                                  alt={intent.bike_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <div className="font-medium">{intent.bike_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {bike?.cc} CC • {bike?.engine_type}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{intent.pickup_location}</TableCell>
                            <TableCell>{intent.pickup_date}</TableCell>
                            <TableCell>{intent.drop_date}</TableCell>
                            <TableCell>{intent.total_hours} hours</TableCell>
                            <TableCell className="font-semibold">₹{intent.total_price}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={intent.booking_status || 'not_booked'}
                                  onValueChange={(value) => handleBookingStatusChange(intent.id, value as 'not_booked' | 'booked')}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_booked">Not Booked</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteBookingIntent(intent.id, intent.bike_name)}
                                  title="Delete booking intent"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="booking" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Confirmed Bookings</CardTitle>
                    <CardDescription>
                      All confirmed bookings with full bike details and pricing
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {bookingIntents.filter(intent => intent.booking_status === 'booked').length} confirmed bookings
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Bike</TableHead>
                        <TableHead>Bike Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pickup Location</TableHead>
                        <TableHead>Pickup Date</TableHead>
                        <TableHead>Drop Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingIntents.filter(intent => intent.booking_status === 'booked').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No confirmed bookings yet. Mark booking intents as "Booked" in the Live Tracker to see them here.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookingIntents
                          .filter(intent => intent.booking_status === 'booked')
                          .map((intent) => {
                            const bike = bikes.find(b => b.id === intent.bike_id);
                            return (
                              <TableRow key={intent.id}>
                                <TableCell>
                                  {new Date(intent.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={bike?.image_url || '/placeholder-bike.jpg'}
                                      alt={intent.bike_name}
                                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium">{intent.bike_name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {bike?.cc} CC • {bike?.engine_type}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Bike #: {bike?.bike_number || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="font-medium">
                                      {intent.customer_phone || 'Phone not provided'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      WhatsApp booking
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {intent.pickup_location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{intent.pickup_location}</TableCell>
                                <TableCell>{intent.pickup_date}</TableCell>
                                <TableCell>{intent.drop_date}</TableCell>
                                <TableCell>{intent.total_hours} hours</TableCell>
                                <TableCell className="font-semibold">₹{intent.total_price}</TableCell>
                                <TableCell>
                                  <Select
                                    value={intent.booking_status || 'booked'}
                                    onValueChange={(value) => handleBookingStatusChange(intent.id, value as 'not_booked' | 'booked')}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_booked">Not Booked</SelectItem>
                                      <SelectItem value="booked">Booked</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
