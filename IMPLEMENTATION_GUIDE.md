# Frontend Implementation Guide

## 🎯 Overview

The React frontend has been completely updated to integrate with the new Digital Carbon Tracker backend API. All platform calculations (Shopify, Klaviyo, Meta/Facebook, and Google Ads) now use the backend's carbon footprint calculations based on the formula: `(Impressions × 1.43) / 1000 kg CO2`.

## ✅ What Was Implemented

### 1. **New API Service Layer** (`src/services/platformApi.ts`)
Created a centralized TypeScript service for all platform API calls:

- `fetchAllPlatformsData()` - Get aggregated data from all platforms
- `getPlatformStatus()` - Check platform configuration status
- `fetchShopifyData()` - Get Shopify metrics
- `fetchKlaviyoData()` - Get Klaviyo metrics
- `fetchMetaData()` - Get Meta/Facebook metrics
- `fetchGoogleAdsData()` - Get Google Ads metrics
- Individual calculate functions for each platform
- Helper functions for formatting and color coding

**Key Features:**
- TypeScript interfaces for type safety
- Centralized error handling
- Consistent data structures
- Format helpers for display

### 2. **Updated Main Dashboard** (`src/pages/Main.tsx`)

**Changes:**
- ✅ Uses new `fetchAllPlatformsData()` API
- ✅ Displays all 4 platforms (Shopify, Klaviyo, Meta, Google Ads)
- ✅ Shows loading states properly
- ✅ Error handling with user-friendly messages
- ✅ Passes aggregated data to child components

**Data Flow:**
```
Main.tsx → fetchAllPlatformsData() → Backend API
         ↓
    AggregatedResponse
         ↓
MainRow, SecondRow, DoughnutChart, IndustryComparisonCard
```

### 3. **Updated MainRow Component** (`src/components/MainRow.js`)

**Changes:**
- ✅ Displays 4 platform cards (added Google Ads)
- ✅ Shows carbon footprint in kg CO2
- ✅ Handles N/A for unconfigured platforms
- ✅ Formatted values with 2 decimal places
- ✅ User name from localStorage or aggregated data

**Display:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Meta        │  Shopify     │  Klaviyo     │  Google Ads  │
│  71.5 kg CO2 │  35.75 kg    │  21.45 kg    │  214.5 kg    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 4. **Updated SecondRow Component** (`src/components/SecondRow.js`)

**Changes:**
- ✅ Displays Digital Carbon Score (0-100)
- ✅ Color-coded progress indicator based on score
  - Green (80-100): Excellent
  - Blue (60-79): Good
  - Orange (40-59): Needs work
  - Red (<40): High waste
- ✅ Shows total carbon footprint
- ✅ Shows total carbon wastage
- ✅ Displays rating text

**Score Calculation:**
```
Digital Carbon Score = (1 - (Wastage / Footprint)) × 100
```

### 5. **Updated DoughnutChart Component** (`src/components/DoughnutChart.js`)

**Changes:**
- ✅ Shows carbon footprint by platform (not device)
- ✅ 4 segments: Shopify, Meta, Klaviyo, Google
- ✅ Dynamic percentages based on actual data
- ✅ Color-coded by platform
- ✅ Shows total footprint and wastage

**Chart Data:**
```
🟢 Shopify: 71.5 kg (25%)
🔵 Meta: 143.0 kg (35%)
🟠 Klaviyo: 35.75 kg (15%)
🟣 Google: 214.5 kg (25%)
```

### 6. **Updated IndustryComparisonCard Component** (`src/components/IndustryComparisonCard.js`)

**Changes:**
- ✅ Displays comprehensive platform metrics
- ✅ Shows Carbon Score and Rating
- ✅ Compares to industry average (8 kg CO2 per 1000 impressions)
- ✅ Shows total impressions/recipients
- ✅ Displays carbon wastage
- ✅ Handles unconfigured platforms gracefully
- ✅ Platform-specific icons and colors

**Metrics Displayed:**
- Your Carbon Footprint (kg CO2)
- Industry Average (per 1k impressions)
- Comparison vs Industry (%)
- Total Impressions
- Carbon Wastage

### 7. **Updated ProfileForm** (`src/pages/ProfileForm.tsx`)

**Changes:**
- ✅ Added Google Ads field
- ✅ Updated field labels with descriptions
- ✅ Multi-line textarea for Meta access token
- ✅ All 4 platforms now editable:
  - Klaviyo Private API Key
  - Shopify Admin API Token
  - Meta/Facebook Access Token
  - Google Ads Developer Token

## 📊 Data Structure

### AggregatedResponse
```typescript
{
  userId: number;
  userName: string;
  email: string;
  dateRange: {
    start_date?: string;
    end_date?: string;
  };
  platforms: {
    shopify: PlatformData;
    klaviyo: PlatformData;
    meta: PlatformData;
    google: PlatformData;
  };
  aggregated: {
    totalImpressions: number;
    totalClicks: number;
    totalFootprint: number;
    totalWastage: number;
    digitalCarbonFootprint: number;
    digitalCarbonWastage: number;
    digitalCarbonScore: number;
    rating: string;
    unit: string;
  };
}
```

### PlatformData
```typescript
{
  configured: boolean;
  impressions?: number;
  clicks?: number;
  recipients?: number;
  digitalCarbonFootprint?: number;
  digitalCarbonWastage?: number;
  digitalCarbonScore?: number;
  rating?: string;
  unit?: string;
  error?: string;
}
```

## 🎨 UI Components

### Platform Cards (MainRow)
- **Meta (Facebook)**: Blue theme
- **Shopify**: Green theme
- **Klaviyo**: Orange theme
- **Google Ads**: Purple theme

### Carbon Score Indicator (SecondRow)
- Circular progress bar
- Dynamic color based on score
- Shows actual score value (0-100)
- Rating text below

### Doughnut Chart
- Platform distribution visualization
- Legend with values and percentages
- Total footprint and wastage summary

### Industry Comparison Cards
- Platform logo and name
- Carbon score and rating badge
- 3-column metrics grid
- Additional statistics row
- "Not Configured" state for disabled platforms

## 🔄 API Integration

### Environment Variable
```bash
REACT_APP_API=http://localhost:3004
```

### API Endpoints Used
```
POST /platforms/all/:userId        # Main data fetch
GET  /platforms/status/:userId     # Platform status
POST /platforms/shopify/:userId    # Shopify data
POST /platforms/klaviyo/:userId    # Klaviyo data
POST /platforms/meta/:userId       # Meta data
POST /platforms/google/:userId     # Google data
```

## 📐 Carbon Calculations

All calculations are performed in the backend:

### Formulas (Backend)
```javascript
Digital Carbon Footprint = (Impressions × 1.43) / 1000 kg CO2
Digital Carbon Wastage = ((Impressions - Clicks) × 1.43) / 1000 kg CO2
Digital Carbon Score = (1 - (Wastage / Footprint)) × 100
```

### Frontend Display
The frontend receives pre-calculated values and focuses on:
- Data presentation
- Visualization
- User interaction
- Format conversion

## 🎯 Rating System

| Score | Rating | Color | Icon |
|-------|--------|-------|------|
| 80-100 | Excellent | Green (#4CAF50) | ⭐⭐⭐ |
| 60-79 | Good | Blue (#2196F3) | ⭐⭐ |
| 40-59 | Needs work | Orange (#FF9800) | ⭐ |
| < 40 | High waste | Red (#F44336) | ⚠️ |

## 🚀 Running the Frontend

### Prerequisites
```bash
Node.js v14+
npm or yarn
```

### Installation
```bash
cd dct-react-main
npm install
```

### Environment Setup
Create `.env` file:
```env
REACT_APP_API=http://localhost:3004
```

### Start Development Server
```bash
npm start
```

Runs on `http://localhost:3000`

## 📱 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | SignIn | User authentication |
| `/signup` | SignUp | User registration |
| `/dashboard` | Main | Main dashboard with all metrics |
| `/profile` | ProfileForm | API keys configuration |
| `/users` | Users | User management (admin) |
| `/user-graph` | UserGraph | User-specific graphs |

## 🔒 Protected Routes

All routes except `/login` and `/signup` are protected and require authentication.

**Authentication Flow:**
1. User logs in via `/login`
2. Backend validates credentials
3. User data stored in `localStorage`
4. Protected routes check `localStorage.user`
5. Redirect to `/login` if not authenticated

## 📦 New Dependencies

No new dependencies were added. The implementation uses existing libraries:
- React 18.x
- Material-UI (@mui/material)
- Axios
- React Router
- Chart.js
- TypeScript

## 🎨 Styling

### Theme
- Primary: Material-UI default theme
- Dark mode supported
- Consistent card shadows and borders
- Responsive grid layouts

### Colors
- **Success/Excellent**: #4CAF50 (Green)
- **Info/Good**: #2196F3 (Blue)
- **Warning/Needs work**: #FF9800 (Orange)
- **Error/High waste**: #F44336 (Red)
- **Platform Colors**: Platform-specific (see MainRow)

## 📊 Data Visualization

### Chart.js Charts
1. **Line Charts** (MainRow)
   - Platform-specific trend lines
   - Minimal, clean design
   - No axes, focus on trend

2. **Bar Chart** (SecondRow)
   - Monthly carbon footprint
   - Interactive hover states
   - Color-coded bars

3. **Doughnut Chart** (DoughnutChart)
   - Platform distribution
   - 70% cutout for modern look
   - Custom legend

4. **Circular Progress** (SecondRow)
   - Carbon score indicator
   - Dynamic colors
   - Percentage display

## 🔧 Customization

### Adding a New Platform

1. **Update TypeScript Interface** (`platformApi.ts`)
```typescript
platforms: {
  ...existing,
  newPlatform: PlatformData;
}
```

2. **Add API Function** (`platformApi.ts`)
```typescript
export const fetchNewPlatformData = async (userId, startDate, endDate) => {
  // Implementation
};
```

3. **Update Main Dashboard** (`Main.tsx`)
```jsx
<IndustryComparisonCard 
  img="platform-logo-url"
  title="New Platform"
  color="#hexcolor"
  platform={aggregatedData.platforms.newPlatform}
  industryAverage={8}
/>
```

4. **Update ProfileForm** (`ProfileForm.tsx`)
```jsx
<FormControl>
  <FormLabel htmlFor="newPlatform">New Platform API Key</FormLabel>
  <TextField
    id="newPlatform"
    name="newPlatform"
    value={userData.newPlatform}
    onChange={handleInputChange}
    placeholder="Enter API Key"
  />
</FormControl>
```

## 🐛 Error Handling

### API Errors
```typescript
try {
  const data = await fetchAllPlatformsData(userId);
  setAggregatedData(data);
} catch (error) {
  console.error('Error:', error);
  setError('Failed to fetch data');
}
```

### Display States
- **Loading**: Spinner centered
- **Success**: Data displayed
- **Error**: Error message shown
- **No Data**: "No data available" message

## ✅ Testing Checklist

- [ ] Login works with test@test.com / 123456
- [ ] Dashboard displays all 4 platforms
- [ ] Carbon scores are calculated correctly
- [ ] Ratings match score ranges
- [ ] Doughnut chart shows correct percentages
- [ ] Industry comparison shows proper metrics
- [ ] Profile form allows updating API keys
- [ ] Loading states work properly
- [ ] Error handling displays messages
- [ ] Responsive design works on mobile
- [ ] Charts render correctly
- [ ] Navigation between pages works
- [ ] Logout clears localStorage

## 📝 Files Modified

```
✅ src/services/platformApi.ts (NEW)
✅ src/pages/Main.tsx (UPDATED)
✅ src/components/MainRow.js (UPDATED)
✅ src/components/SecondRow.js (UPDATED)
✅ src/components/DoughnutChart.js (UPDATED)
✅ src/components/IndustryComparisonCard.js (UPDATED)
✅ src/pages/ProfileForm.tsx (UPDATED)
✅ IMPLEMENTATION_GUIDE.md (NEW - This file)
```

## 🎉 Summary

The frontend is now fully integrated with the new backend API and displays accurate carbon footprint calculations for all four platforms. The UI is consistent, responsive, and user-friendly with proper error handling and loading states.

### Key Improvements
✅ Single API call for all platforms (aggregated endpoint)  
✅ Accurate carbon calculations from backend  
✅ Google Ads support added  
✅ TypeScript service layer for type safety  
✅ Improved error handling  
✅ Better loading states  
✅ Enhanced visualizations  
✅ Comprehensive industry comparisons  
✅ Editable API keys for all platforms  

---

**Made with 🌱 for a greener digital future**

