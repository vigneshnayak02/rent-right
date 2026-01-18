# FIX BIKE VISIBILITY - Show Rented Bikes on Main Website

## Problem Identified

Looking at the code:

### BikeCard.tsx (Line 14-24)
Shows bikes with different statuses:
- `available`: Green badge, "Available"
- `rented`: Red badge, "Rented" 
- `maintenance`: Yellow badge, "Under Maintenance"

### Index.tsx (Line 25)
```typescript
const featuredBikes = bikes.filter(b => b.status === 'available').slice(0, 3);
```

**THE ISSUE**: Main website only shows bikes with `status === 'available'`

## What Should Happen

When you change bike status to "rented" in admin panel:
1. ✅ Bike status updates in Firebase
2. ✅ Bike should still be visible on main website
3. ✅ Bike should show "Rented" status badge
4. ✅ Bike should show "Unavailable" for booking

## SOLUTION: Update Index.tsx

### Change Line 25 in Index.tsx:

**FROM (Current):**
```typescript
const featuredBikes = bikes.filter(b => b.status === 'available').slice(0, 3);
```

**TO (Fixed):**
```typescript
// Show all bikes, but prioritize available ones for featured section
const featuredBikes = bikes
  .filter(b => b.status === 'available' || b.status === 'rented')
  .sort((a, b) => {
    // Put available bikes first, then rented bikes
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (a.status !== 'available' && b.status === 'available') return 1;
    return 0;
  })
  .slice(0, 3);
```

### Alternative Solution: Show All Bikes

```typescript
// Show all bikes regardless of status
const featuredBikes = bikes.slice(0, 3);
```

## Expected Results:

### Before Fix:
- Only "available" bikes show on main website
- "Rented" bikes disappear from main website
- Users can't see rented bikes

### After Fix:
- Both "available" and "rented" bikes show on main website
- "Rented" bikes show red "Rented" badge
- "Available" bikes show green "Available" badge
- Users can see all bike statuses

## Implementation Steps:

### Step 1: Update Index.tsx
1. Open `src/pages/Index.tsx`
2. Find line 25: `const featuredBikes = bikes.filter(b => b.status === 'available').slice(0, 3);`
3. Replace with the new filtering logic
4. Save the file

### Step 2: Test the Fix
1. Go to admin panel
2. Change a bike status to "rented"
3. Go to main website
4. Check if the bike appears with "Rented" badge

### Step 3: Verify Booking Button
1. Check that rented bikes show "Unavailable" button
2. Verify available bikes show "Book Now" button
3. Test the booking flow

## Additional Improvements:

### Option 1: Separate Sections
```typescript
// Available bikes section
const availableBikes = bikes.filter(b => b.status === 'available').slice(0, 3);

// Rented bikes section  
const rentedBikes = bikes.filter(b => b.status === 'rented').slice(0, 3);
```

### Option 2: Status Filter
Add a status filter to the main bikes page:
```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented'>('all');

const filteredBikes = bikes.filter(bike => {
  if (statusFilter === 'all') return true;
  return bike.status === statusFilter;
});
```

## Final Result:

With the fix:
- ✅ Rented bikes are visible on main website
- ✅ Rented bikes show red "Rented" badge
- ✅ Rented bikes show "Unavailable" booking button
- ✅ Available bikes still show "Available" badge
- ✅ Admin status changes reflect immediately on main site

This will make rented bikes visible on the main website!
