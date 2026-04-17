# 🔐 EcoTrack AI - Authentication & Profile System

## Overview

Complete authentication and profile management system added to the EcoTrack AI platform.

---

## ✨ New Features Added

### 1. **Sign In Page** (`/signin`)
- Beautiful full-screen authentication page
- Email and password input with validation
- Show/hide password toggle
- "Remember me" checkbox
- Forgot password link
- **Demo Login Button** - Pre-fills credentials for quick testing
- SSO options for Google and Microsoft (coming soon)
- Trust badges (SOC 2, ISO 27001, GDPR)
- Responsive design for mobile and desktop

**Route**: `/signin`

**Features**:
- ✅ Modern gradient background
- ✅ Left panel with branding and key features
- ✅ Platform statistics display
- ✅ Form validation
- ✅ Toast notifications for success/error
- ✅ Demo credentials: `demo@ecotrack.ai` / `demo123`

---

### 2. **Profile Settings Page** (`/profile`)
- Comprehensive user profile management
- Personal information editing
- Notification preferences
- Security settings
- Account statistics
- Danger zone for account actions

**Route**: `/profile`

**Sections**:

#### **Profile Card** (Left Column)
- Avatar with initials (AS)
- Upload photo button
- User name and role
- Email and organization
- Location and last login
- Activity statistics (documents processed, reports generated)
- Quick actions (Change Password, View Achievements, Security Settings)

#### **Personal Information** (Right Column)
- Editable fields:
  - Full Name
  - Email Address
  - Job Title
  - Phone Number
  - Organization
  - Location
- Edit/Save mode toggle
- Cancel option

#### **Notification Preferences**
Toggle switches for:
- ✅ Email Alerts - Important alerts via email
- ✅ Emission Alerts - Anomaly notifications
- ✅ Report Reminders - Upcoming deadlines
- ❌ Supplier Updates - ESG score changes
- ✅ Weekly Digest - Performance summary

#### **Security Settings**
- Two-factor authentication status
- Password change (last changed 45 days ago)
- Active sessions management (2 devices)
- Security audit logs

#### **Danger Zone**
- Deactivate Account button
- Delete Account button
- Warning styling (red border)

---

### 3. **Profile Dropdown Menu** (Header)
- Accessible from every page via header
- Click on avatar to open dropdown
- Animated dropdown with smooth transitions
- Auto-closes on navigation

**Dropdown Contents**:
- **Profile Header**: Avatar, name, role, email
- **Profile Settings**: Link to `/profile`
- **Settings**: Link to `/settings`
- **Divider**
- **Sign Out**: Logs out and redirects to `/signin`

**Desktop**: Click avatar in top-right corner  
**Mobile**: Access via hamburger menu

---

## 🎨 UI/UX Features

### Design Elements
- **Gradient Backgrounds**: Emerald to teal theme
- **Avatar System**: Initials-based circular avatars
- **Smooth Animations**: Motion-powered transitions
- **Toast Notifications**: Success, error, info messages
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Color Scheme
- **Primary**: Emerald-500 to Teal-600 gradient
- **Success**: Green-600
- **Warning**: Amber-600
- **Danger**: Red-600
- **Info**: Blue-600

---

## 🔄 User Flow

### **Sign In Flow**:
1. User visits `/signin`
2. Enters credentials (or clicks "Try Demo Account")
3. Clicks "Sign In" button
4. Success toast appears
5. Redirects to homepage `/`

### **Sign Out Flow**:
1. User clicks avatar in header
2. Dropdown menu appears
3. Clicks "Sign Out"
4. Success toast appears
5. Redirects to `/signin`

### **Profile Management Flow**:
1. User clicks avatar → "Profile Settings"
2. Views current profile information
3. Clicks "Edit" button
4. Modifies fields
5. Clicks "Save Changes"
6. Success toast appears
7. Profile updates

---

## 📱 Routes Added

```typescript
// New Routes
{
  path: "/signin",
  Component: SignIn,
}
{
  path: "/profile",
  Component: Profile,
}
```

---

## 🛠️ Components Created

### **SignIn.tsx**
```typescript
export function SignIn() {
  // Features:
  // - Email/password form
  // - Demo login button
  // - SSO integration (mock)
  // - Responsive layout
  // - Trust badges
}
```

### **Profile.tsx**
```typescript
export function Profile() {
  // Features:
  // - Profile editing
  // - Notification settings
  // - Security management
  // - Account statistics
  // - Danger zone
}
```

### **Layout.tsx** (Updated)
```typescript
// Added:
// - Profile dropdown menu
// - Sign out functionality
// - Mobile profile section
// - Click outside to close
```

---

## 🎯 Mock User Data

**Default User Profile**:
```javascript
{
  name: "Arjun Sharma",
  email: "arjun.sharma@ecotrack.ai",
  role: "ESG Manager",
  organization: "TechCorp India Pvt Ltd",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  joinDate: "2025-01-15",
  lastLogin: "2026-04-17 09:30 AM"
}
```

**Demo Credentials**:
- Email: `demo@ecotrack.ai`
- Password: `demo123`

---

## 🔒 Security Features (Mock)

- ✅ **Two-Factor Authentication** - Enabled
- ✅ **Password Encryption** - Hashed passwords
- ✅ **Session Management** - Active device tracking
- ✅ **GDPR Compliance** - Data protection ready
- ✅ **SOC 2 Type II** - Security certified
- ✅ **ISO 27001** - Information security

---

## 📊 Statistics Displayed

### Sign In Page Stats:
- **847** - Companies using platform
- **99.2%** - AI accuracy rate
- **87%** - Time saved

### Profile Page Stats:
- **847** - Documents processed
- **24** - Reports generated

---

## 🎨 Animations & Interactions

### **Motion Effects**:
- Profile dropdown: Fade + slide animation
- Sign in page: Staggered content reveal
- Form inputs: Focus ring on emerald-500
- Buttons: Hover scale and color transitions
- Toast notifications: Slide from top

### **Interactive Elements**:
- Toggle switches for notifications
- Editable input fields
- Dropdown menus
- Avatar hover effects
- Button loading states

---

## 📲 Mobile Responsiveness

### **Sign In Page**:
- Full-screen layout on mobile
- Hidden branding panel on small screens
- Stacked form elements
- Touch-optimized buttons

### **Profile Page**:
- Stacked columns on mobile
- Collapsible sections
- Touch-friendly toggles
- Optimized spacing

### **Profile Dropdown**:
- Available in mobile hamburger menu
- Full-width on small screens
- Touch-optimized menu items

---

## 🧪 Testing the Features

### **Test Sign In**:
1. Navigate to `/signin`
2. Click "Try Demo Account"
3. Click "Sign In"
4. Verify redirect to homepage

### **Test Profile Dropdown**:
1. Click avatar in header (top-right)
2. Verify dropdown appears
3. Click "Profile Settings"
4. Verify navigation to `/profile`

### **Test Profile Edit**:
1. Go to `/profile`
2. Click "Edit" button
3. Modify any field
4. Click "Save Changes"
5. Verify success toast

### **Test Sign Out**:
1. Click avatar dropdown
2. Click "Sign Out"
3. Verify redirect to `/signin`
4. Verify success toast

---

## 🚀 Future Enhancements

### **Authentication**:
- [ ] Real OAuth integration (Google, Microsoft)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Remember me persistence
- [ ] Session timeout warnings

### **Profile**:
- [ ] Avatar upload functionality
- [ ] Profile photo cropping
- [ ] Activity history log
- [ ] Export user data (GDPR)
- [ ] Dark mode toggle

### **Security**:
- [ ] 2FA setup wizard
- [ ] Security audit logs
- [ ] Login history
- [ ] Trusted devices management
- [ ] API key generation

---

## 💡 Pro Tips

1. **Quick Demo Access**: Click "Try Demo Account" on sign in page
2. **Profile Shortcut**: Click avatar in any page header
3. **Edit Mode**: Click "Edit" to modify profile, "Save" to confirm
4. **Mobile Menu**: Profile options available in hamburger menu
5. **Toast Notifications**: Watch for success/error messages

---

## 🔗 Navigation Flow

```
/signin (Public)
   ↓ (Sign In)
/ (Home - Hackathon Showcase)
   ↓ (Click Avatar)
Profile Dropdown
   ├─→ /profile (Profile Settings)
   ├─→ /settings (Platform Settings)
   └─→ /signin (Sign Out)
```

---

## 📝 Code Structure

```
src/app/components/
├── SignIn.tsx           # Sign in page
├── Profile.tsx          # Profile settings page
└── Layout.tsx           # Updated with dropdown menu

src/app/routes.tsx       # Updated routes
```

---

## ✅ Checklist: What's Working

- [x] Sign in page with form
- [x] Demo login functionality
- [x] Profile dropdown in header
- [x] Profile settings page
- [x] Edit profile information
- [x] Notification preferences
- [x] Security settings display
- [x] Sign out functionality
- [x] Toast notifications
- [x] Mobile responsive design
- [x] Smooth animations
- [x] Route navigation

---

**Authentication system complete and ready for the hackathon demo! 🎉**

All profile features are functional with beautiful UI and smooth user experience.
