# Settings System Documentation

## Overview

The Burayu MESOB settings system allows administrators to configure website-wide settings including site information, contact details, social media links, language preferences, and SEO settings.

## Architecture

### Backend (Database-Driven)

**Model**: `backend/models/Setting.js`
- Stores settings in MySQL database
- Each setting has: key, value, type, category, description, isPublic flag
- Supports string, JSON, boolean, and number data types

**Controller**: `backend/controllers/settingController.js`
- `getAllSettings()` - Get all settings (admin only)
- `getPublicSettings()` - Get public settings (no auth)
- `updateSettings()` - Update multiple settings at once
- `getSetting()` - Get single setting by key
- `deleteSetting()` - Delete a setting
- `resetSettings()` - Reset to defaults

**Routes**: `backend/routes/settingRoutes.js`
```
GET    /api/settings/public         - Public settings
GET    /api/settings                - All settings (admin)
GET    /api/settings/:key           - Single setting (admin)
PUT    /api/settings                - Update settings (admin)
DELETE /api/settings/:key           - Delete setting (admin)
POST   /api/settings/reset          - Reset to defaults (admin)
```

### Frontend

**Service**: `src/services/settingService.js`
- API wrapper for settings endpoints
- Handles authentication tokens
- Error handling

**Admin Page**: `src/app/admin/dashboard/settings/page.js`
- Tab-based UI for different setting categories
- Real-time save to database
- Loading states and error handling

## Setting Categories

### 1. General Settings
- **Site Name** (multilingual: en, am, om)
- **Site Tagline** (multilingual)
- **Site Description** (multilingual)
- **E-Service** configuration (enabled, URL)

### 2. Contact Information
- Email address
- Phone number
- Office address
- Working hours

### 3. Social Media Links
- Facebook URL
- Twitter URL
- YouTube URL
- Telegram URL
- LinkedIn URL

### 4. Language Settings
- Default language
- Require full translations toggle
- Auto-translate options

### 5. Content Settings
- Items per page
- Enable search
- Enable filters

### 6. SEO Settings
- Meta keywords
- Author
- OG image URL

## Database Structure

```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type ENUM('string', 'json', 'boolean', 'number'),
  category VARCHAR(255) DEFAULT 'general',
  description VARCHAR(255),
  isPublic BOOLEAN DEFAULT false,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## How It Works

### 1. Admin Updates Settings

```javascript
// Admin clicks "Save Settings"
1. Settings page collects all form data
2. Sends PUT request to /api/settings
3. Backend flattens nested object (e.g., siteName.en → key: "siteName.en")
4. Each setting is upserted (update or insert)
5. Success response returned
```

### 2. Frontend Uses Settings

```javascript
// Public pages fetch settings
import settingService from '@/src/services/settingService';

// Get public settings (no auth needed)
const settings = await settingService.getPublic();

// Use in components
<h1>{settings.siteName.en}</h1>
<a href={`mailto:${settings.contactInfo.email}`}>Contact Us</a>
```

### 3. Data Flow

```
Admin Form → settingService.update() → Backend API → MySQL Database
                                                              ↓
Public Pages ← settingService.getPublic() ← Backend API ← Database
```

## Key Features

✅ **Database-Driven** - All settings persist in MySQL
✅ **Real-Time Updates** - Changes apply immediately
✅ **Multilingual Support** - Site info in 3 languages
✅ **Public/Private** - Some settings accessible without auth
✅ **Nested Structure** - Keys like "siteName.en" auto-flatten
✅ **Type Safety** - JSON, boolean, number types preserved
✅ **Admin Only** - Protected by authentication middleware

## Usage Examples

### Get All Settings (Admin)
```javascript
const settings = await settingService.getAll();
console.log(settings.siteName.en); // "Burayu MESOB"
```

### Get Public Settings (Frontend)
```javascript
const settings = await settingService.getPublic();
// Only returns settings with isPublic = true
```

### Update Settings
```javascript
await settingService.update({
  contactInfo: {
    email: "new@burayu.gov.et",
    phone: "+251 11 999 9999"
  },
  eService: {
    enabled: true,
    url: "https://eservice.burayu.gov.et"
  }
});
```

### Reset to Defaults
```javascript
await settingService.reset();
// Deletes all non-critical settings
```

## isPublic Flag

Settings marked as `isPublic: true` are accessible via `/api/settings/public` without authentication:

- Site name, tagline, description
- Contact information
- Social media links  
- Default language
- E-Service configuration
- SEO settings

Admin-only settings:
- Full translation requirements
- Content display settings
- Maintenance mode

## Integration Points

### 1. Footer Component
```javascript
const settings = await settingService.getPublic();
<footer>
  <p>{settings.contactInfo.email}</p>
  <p>{settings.contactInfo.phone}</p>
  <a href={settings.socialMedia.facebook}>Facebook</a>
</footer>
```

### 2. SEO Metadata
```javascript
const settings = await settingService.getPublic();
<meta name="keywords" content={settings.seo.keywords} />
<meta property="og:image" content={settings.seo.ogImage} />
```

### 3. Language Selector
```javascript
const settings = await settingService.getPublic();
const defaultLang = settings.languageSettings.defaultLanguage; // "om"
```

## Security

- **Authentication Required** - All write operations require valid JWT token
- **Admin Role Required** - Only admins can modify settings
- **Rate Limited** - Protected by express-rate-limit
- **Input Validation** - Type checking and sanitization
- **CORS Protected** - Only allowed origins can access

## Development vs Production

### Development (Current)
- Uses MySQL database
- Settings persist across sessions
- API at http://localhost:5000/api/settings

### Production
Same setup! The system is production-ready:
- Database-driven settings
- Protected admin endpoints
- Public settings for frontend
- No code changes needed for deployment

## Troubleshooting

### Settings Not Loading
1. Check backend is running: `node backend/server.js`
2. Check MySQL connection in `backend/.env`
3. Verify JWT token is valid
4. Check browser console for errors

### Settings Not Saving
1. Verify admin authentication
2. Check network tab for API errors
3. Check backend logs for database errors
4. Ensure MySQL table exists

### Public Settings Not Working
1. Ensure settings have `isPublic: true` flag
2. Check `/api/settings/public` endpoint
3. No authentication needed for public settings

## Migration from localStorage

Old code (localStorage):
```javascript
localStorage.setItem("mesob_admin_settings", JSON.stringify(settings));
```

New code (database):
```javascript
await settingService.update(settings);
```

The new system automatically handles:
- Data persistence
- Multi-user support
- Server-side validation
- Public/private access control

## Summary

The settings system provides a complete, production-ready solution for managing website configuration:

1. **Admin** updates settings via dashboard
2. **Backend** stores in MySQL database
3. **Frontend** fetches and displays settings
4. **Public pages** access settings without auth
5. **Real-time updates** - changes apply immediately
