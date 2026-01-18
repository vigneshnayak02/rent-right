# ADMIN BOOKING TRACKER FIX - Add Booking Status Dropdown

## Current Structure:

### Live Tracker Tab:
- Shows booking intents from customers
- Has delete button for each intent
- No booking status management

## Required Changes:

### 1. Add Booking Status Field to Booking Intent
- Add `booking_status` field to booking intents
- Options: "not_booked" (default) and "booked"

### 2. Add Dropdown to Each Tracker Row
- Add Select dropdown in Actions column
- Options: "not_booked" and "booked"
- When changed to "booked", move item to Booking section

### 3. Create New "Booking" Tab
- Show all booked intents
- Display full bike details and prices
- Separate from tracker

## Implementation Plan:

### Step 1: Update Booking Intent Type
Add `booking_status` field to BookingIntent type

### Step 2: Update Live Tracker Table
Add dropdown in Actions column:
```typescript
<Select
  value={intent.booking_status || 'not_booked'}
  onValueChange={(value) => handleBookingStatusChange(intent.id, value)}
>
  <SelectTrigger className="w-32">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="not_booked">Not Booked</SelectItem>
    <SelectItem value="booked">Booked</SelectItem>
  </SelectContent>
</Select>
```

### Step 3: Add Booking Status Handler
```typescript
const handleBookingStatusChange = async (intentId: string, status: string) => {
  // Update booking intent status in Firebase
  // If status is "booked", move to booking section
};
```

### Step 4: Create New Booking Tab
```typescript
<TabsTrigger value="booking">Bookings</TabsTrigger>

<TabsContent value="booking" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Confirmed Bookings</CardTitle>
      <CardDescription>
        All confirmed bookings with full bike details
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Show booked intents with full bike details */}
    </CardContent>
  </Card>
</TabsContent>
```

### Step 5: Filter Booked Intents
```typescript
const bookedIntents = bookingIntents.filter(intent => intent.booking_status === 'booked');
const trackerIntents = bookingIntents.filter(intent => intent.booking_status !== 'booked');
```

## Expected Results:

### Live Tracker Tab:
- Shows only "not_booked" intents
- Has dropdown to change status
- When changed to "booked", item disappears from tracker

### Booking Tab:
- Shows only "booked" intents
- Displays full bike details
- Shows all pricing information
- Professional booking management

### User Flow:
1. Customer clicks booking button → Intent appears in tracker
2. Admin changes status to "booked" → Intent moves to booking section
3. Booking section shows confirmed bookings with full details

## Files to Modify:

1. `src/types/bike.ts` - Add booking_status to BookingIntent
2. `src/pages/Admin.tsx` - Add dropdown and new booking tab
3. `src/integrations/firebase/bookingIntents.ts` - Add update function

This will create a complete booking management system!
