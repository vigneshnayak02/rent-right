# FIX MOBILE MENU & FOOTER EMAIL

## Issues Identified:

### 1. Mobile Menu: Shows "4 Locations" instead of "1 Location"
**File**: `src/components/Navbar.tsx`
**Line 99**: `<span>4 Locations in Hyderabad</span>`

### 2. Footer Email: Shows "info@psrentals.com" instead of "psrental08@gmail.com"
**File**: `src/components/Footer.tsx`
**Line 67**: `info@psrentals.com`

## SOLUTIONS:

### Fix 1: Update Mobile Menu Text

**In Navbar.tsx, change line 99:**

**FROM:**
```typescript
<span>4 Locations in Hyderabad</span>
```

**TO:**
```typescript
<span>1 Location in Hyderabad</span>
```

### Fix 2: Update Footer Email

**In Footer.tsx, change line 67:**

**FROM:**
```typescript
<a href="mailto:info@psrentals.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
  <Mail className="h-4 w-4 text-primary" />
  info@psrentals.com
</a>
```

**TO:**
```typescript
<a href="mailto:psrental08@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
  <Mail className="h-4 w-4 text-primary" />
  psrental08@gmail.com
</a>
```

## IMPLEMENTATION STEPS:

### Step 1: Fix Mobile Menu
1. **Open**: `src/components/Navbar.tsx`
2. **Find**: Line 99
3. **Replace**: "4 Locations" with "1 Location"
4. **Save**: The file

### Step 2: Fix Footer Email
1. **Open**: `src/components/Footer.tsx`
2. **Find**: Line 67
3. **Replace**: `info@psrentals.com` with `psrental08@gmail.com`
4. **Save**: The file

### Step 3: Test Changes
1. **Open website** on mobile device or browser dev tools
2. **Check mobile menu**: Should show "1 Location"
3. **Check footer**: Should show "psrental08@gmail.com"
4. **Test email link**: Should open email client with correct address

## EXPECTED RESULTS:

### Before Fix:
- Mobile menu: "4 Locations in Hyderabad"
- Footer email: "info@psrentals.com"

### After Fix:
- Mobile menu: "1 Location in Hyderabad"
- Footer email: "psrental08@gmail.com"

## CODE CHANGES:

### Navbar.tsx (Line 99):
```typescript
// OLD
<span>4 Locations in Hyderabad</span>

// NEW
<span>1 Location in Hyderabad</span>
```

### Footer.tsx (Line 67):
```typescript
// OLD
<a href="mailto:info@psrentals.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
  <Mail className="h-4 w-4 text-primary" />
  info@psrentals.com
</a>

// NEW
<a href="mailto:psrental08@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
  <Mail className="h-4 w-4 text-primary" />
  psrental08@gmail.com
</a>
```

## FINAL RESULT:

With these fixes:
- ✅ Mobile menu shows correct location count
- ✅ Footer shows correct email address
- ✅ Email link works properly
- ✅ Consistent branding across all devices

This will fix both mobile menu and footer email issues!
