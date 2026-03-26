# Digital Carbon Tracker - Frontend

React-based dashboard for tracking digital carbon footprint across multiple marketing platforms.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd dct-react-main
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
REACT_APP_API=http://localhost:3004
```

### 3. Start Development Server
```bash
npm start
```

Opens at `http://localhost:3000`

### 4. Login
```
Email: test@test.com
Password: 123456
```

## 📊 Features

### ✅ Multi-Platform Carbon Tracking
- **Shopify** - Website visitor tracking
- **Klaviyo** - Email campaign metrics
- **Meta/Facebook** - Ad impressions & clicks
- **Google Ads** - Campaign performance

### ✅ Real-Time Calculations
- Digital Carbon Footprint
- Digital Carbon Wastage
- Carbon Score (0-100)
- Rating (Excellent, Good, Needs work, High waste)

### ✅ Visual Analytics
- Platform comparison cards
- Doughnut chart distribution
- Carbon score indicator
- Industry benchmarking
- Monthly trend charts

### ✅ User Management
- Profile editing
- API key management
- Multi-user support
- Admin features

## 🎯 Carbon Metrics

### Formula
```
Digital Carbon Footprint = (Impressions × 1.43) / 1000 kg CO2
Digital Carbon Wastage = ((Impressions - Clicks) × 1.43) / 1000 kg CO2
Digital Carbon Score = (1 - (Wastage / Footprint)) × 100
```

### Rating System
| Score | Rating | Color |
|-------|--------|-------|
| 80-100 | Excellent ⭐⭐⭐ | Green |
| 60-79 | Good ⭐⭐ | Blue |
| 40-59 | Needs work ⭐ | Orange |
| < 40 | High waste ⚠️ | Red |

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication |
| Sign Up | `/signup` | User registration |
| Dashboard | `/dashboard` | Main carbon metrics |
| Profile | `/profile` | API key configuration |
| Users | `/users` | User management |
| User Graph | `/user-graph` | Individual analytics |

## 🎨 Components

### Core Components
- **MainRow** - Platform carbon footprint cards
- **SecondRow** - Carbon score & wastage chart
- **DoughnutChart** - Platform distribution
- **IndustryComparisonCard** - Benchmarking cards
- **Sidebar** - Navigation menu
- **SignIn/SignUp** - Authentication forms

### New Service Layer
- **platformApi.ts** - TypeScript API service
  - Centralized API calls
  - Type-safe interfaces
  - Error handling
  - Data formatting

## 🔧 Tech Stack

- **React** 18.x
- **TypeScript** - Type safety
- **Material-UI** - UI components
- **Axios** - HTTP client
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **React Spinners** - Loading states

## 📦 Project Structure

```
dct-react-main/
├── src/
│   ├── services/
│   │   └── platformApi.ts          # API service layer
│   ├── pages/
│   │   ├── Main.tsx                # Main dashboard
│   │   ├── ProfileForm.tsx         # API key config
│   │   ├── Users.tsx               # User management
│   │   └── UserGraph.tsx           # Analytics
│   ├── components/
│   │   ├── MainRow.js              # Platform cards
│   │   ├── SecondRow.js            # Score & chart
│   │   ├── DoughnutChart.js        # Distribution
│   │   ├── IndustryComparisonCard.js
│   │   ├── Sidebar.js              # Navigation
│   │   ├── SignIn.tsx              # Login
│   │   └── SignUp.tsx              # Registration
│   ├── App.js                      # Router config
│   └── index.js                    # Entry point
├── public/
├── .env                            # Environment config
├── package.json
├── IMPLEMENTATION_GUIDE.md         # Detailed docs
└── FRONTEND_README.md              # This file
```

## 🔑 API Configuration

Update API keys in Profile page:

### Klaviyo
- **Type**: Private API Key
- **Get from**: https://www.klaviyo.com/account#api-keys-tab
- **Format**: `pk_...`

### Shopify
- **Type**: Admin API Access Token
- **Get from**: Shopify Admin → Apps → Develop apps
- **Format**: `shpat_...`

### Meta/Facebook
- **Type**: Long-lived Access Token
- **Get from**: https://developers.facebook.com/tools/explorer/
- **Permissions**: `ads_read`, `read_insights`
- **Format**: `EAA...`

### Google Ads
- **Type**: Developer Token
- **Get from**: https://ads.google.com/aw/apicenter
- **Requires**: OAuth2 + Customer ID

## 🌐 API Endpoints

All endpoints hit the backend at `REACT_APP_API`:

```
POST /platforms/all/:userId        # Get all platform data
GET  /platforms/status/:userId     # Check configuration
POST /user/login                   # Authentication
PUT  /user/:userId                 # Update profile
```

## 🎨 Customization

### Theme Colors
Edit in components or create theme file:
```javascript
const theme = {
  shopify: '#66BB6A',   // Green
  meta: '#29B6F6',      // Blue
  klaviyo: '#FF9800',   // Orange
  google: '#7E57C2'     // Purple
};
```

### Add New Platform
1. Update `platformApi.ts` interfaces
2. Add fetch function in service
3. Update `Main.tsx` to display
4. Add to `IndustryComparisonCard`
5. Add field in `ProfileForm.tsx`

## 🐛 Troubleshooting

### Backend Connection Error
```
Error: Network Error
```
**Solution**: Ensure backend is running on port 3004

### CORS Error
```
Error: CORS policy blocked
```
**Solution**: Backend CORS is already configured

### Login Failed
```
Error: E-mail or password is incorrect!
```
**Solution**: Use `test@test.com` / `123456`

### No Data Displayed
**Check:**
1. Backend server running
2. API keys configured in profile
3. User logged in
4. Browser console for errors

## 📊 Sample Data

When API keys are not configured or invalid, the backend returns simulated data:

```json
{
  "shopify": {
    "impressions": 50000,
    "clicks": 35000,
    "digitalCarbonFootprint": 71.5,
    "digitalCarbonScore": 70.0,
    "rating": "Good"
  }
}
```

## 🔒 Security Notes

### Production Checklist
- [ ] Use HTTPS
- [ ] Implement JWT authentication
- [ ] Store tokens securely (not localStorage)
- [ ] Add CSRF protection
- [ ] Validate all inputs
- [ ] Sanitize API responses
- [ ] Add rate limiting
- [ ] Enable security headers
- [ ] Use environment variables

### Current Implementation
⚠️ **Development Mode** - Uses localStorage for simplicity. Not recommended for production.

## 📈 Performance

### Optimization Tips
- Components use React hooks efficiently
- Minimal re-renders with proper state management
- Charts configured for performance
- Lazy loading for routes (can be added)
- Code splitting (can be enhanced)

### Bundle Size
```bash
npm run build
```
Creates optimized production build in `/build`

## 🧪 Testing

### Manual Testing
```bash
npm start
# Test each page manually
```

### Unit Tests (To Add)
```bash
npm test
```

### E2E Tests (To Add)
Use Cypress or Playwright for E2E testing.

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Detailed technical documentation
- **FRONTEND_README.md** - This file (Quick start guide)
- Backend docs in `../dct-back-main/API_DOCUMENTATION.md`

## 🆘 Support

### Common Issues

**Issue**: TypeScript errors
**Solution**: Run `npm install --save-dev @types/react @types/node`

**Issue**: Charts not rendering
**Solution**: Ensure Chart.js registered: `Chart.register(...)`

**Issue**: Material-UI styles conflict
**Solution**: Check MUI version compatibility

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag & drop `/build` folder
- **Vercel**: Connect GitHub repo
- **AWS S3**: Upload `/build` to bucket
- **Heroku**: Add `static.json` config

### Environment Variables
```env
# Production
REACT_APP_API=https://your-api-domain.com

# Development
REACT_APP_API=http://localhost:3004
```

## 📄 License

ISC

## 🌟 Features Added

✅ TypeScript API service layer  
✅ Aggregated multi-platform data  
✅ Google Ads support  
✅ Real-time carbon calculations  
✅ Industry benchmarking  
✅ Improved error handling  
✅ Loading states  
✅ Responsive design  
✅ Profile API key management  

## 🔄 Updates from Previous Version

### Before
- ❌ Single platform API calls
- ❌ Limited error handling
- ❌ No TypeScript
- ❌ Hardcoded calculations
- ❌ Only 3 platforms

### After
- ✅ Aggregated API call
- ✅ Comprehensive error handling
- ✅ TypeScript service layer
- ✅ Backend calculations
- ✅ 4 platforms supported

---

**Made with 🌱 for a greener digital future**

For detailed implementation docs, see `IMPLEMENTATION_GUIDE.md`

