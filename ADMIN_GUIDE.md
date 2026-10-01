# Burayu MESOB Admin Panel Guide

## ✅ Production-Ready Admin Panel

All security vulnerabilities have been fixed and the admin panel is now ready for production use.

## 🔒 Security Features Implemented

### Authentication & Authorization
- ✅ **Client-side route protection** - All admin pages check authentication before loading
- ✅ **Server-side JWT authentication** - All API mutations require valid JWT tokens
- ✅ **Secure logout** - Properly clears localStorage and session cookies
- ✅ **Protected registration** - Only admins can create new users (enforced by middleware)
- ✅ **Session management** - 7-day JWT tokens with automatic redirect on expiry

### Password Security
- ✅ **Strong password requirements:**
  - Minimum 12 characters
  - Must contain uppercase letter (A-Z)
  - Must contain lowercase letter (a-z)
  - Must contain number (0-9)
  - Must contain special character (!@#$%^&* etc.)
- ✅ **Bcrypt hashing** with 12 salt rounds
- ✅ **Password excluded** from all API responses

### Input Validation & Sanitization
- ✅ **XSS Prevention** - DOMPurify sanitization for all user input
- ✅ **Comprehensive validation** - Email, phone, URL, length, format checks
- ✅ **Multilingual validation** - Ensures required languages before publishing
- ✅ **File upload validation** - Type, size, and naming checks
- ✅ **SQL Injection protection** - Sequelize ORM with parameterized queries

## 🎨 Language System

Languages are now properly labeled:
- **Afan Oromo** (om) - Default language
- **አማርኛ** (am) - Amharic
- **English** (en)

All language selectors throughout the site use these consistent labels.

## 📝 Admin Panel Access

### Login
**URL:** `/admin/login`

**Default Credentials:**
- Email: `admin@burayu.gov.et`
- Password: `password123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

### Forgot Password
If you forget your password, click "Forgot Password" on the login page. For security, password resets must be processed by the system administrator.

## 🎯 Admin Features

### Dashboard (`/admin/dashboard`)
- Overview statistics for all content types
- Quick access to recent items
- Draft vs. published content counts
- Direct links to create new content

### Content Management

#### News Articles (`/admin/dashboard/news`)
**Features:**
- Multilingual titles, summaries, and content
- Category selection
- Featured image upload or URL
- Draft/Publish workflow
- Publish date scheduling
- Tags for categorization

**Validation:**
- Title required in at least one language
- Category required
- Before publishing: All three languages recommended
- Image validation (JPEG, PNG, WEBP, max 5MB)

#### Announcements (`/admin/dashboard/announcements`)
**Features:**
- Urgent/Important priority levels
- Expiration dates
- Full multilingual support
- Draft/Publish workflow

**Validation:**
- Title required in primary language
- Priority level required
- Valid dates required

#### Projects (`/admin/dashboard/projects`)
**Features:**
- Project status tracking (Planning, In Progress, Completed)
- Budget management
- Location specification
- Timeline with start and completion dates
- Progress percentage
- Multiple images support

**Validation:**
- Title and location required
- Valid budget numbers
- Date range validation (completion after start)
- Status updates tracked

#### Services (`/admin/dashboard/services`)
**Features:**
- Service catalog management
- External links to e-services
- Multilingual descriptions
- Icon/image selection

#### Gallery (`/admin/dashboard/gallery`)
**Features:**
- Image upload and management
- Categories and tags
- Multilingual captions
- Bulk upload support

#### Slides (`/admin/dashboard/slide-image`)
**Features:**
- Homepage hero slider images
- Display order management
- Optional overlay text
- Active/inactive toggle

### Website Settings

#### About/Mayor Message (`/admin/dashboard/about`)
- Manage mayor/city administrator bio
- Multilingual content support
- Profile photo upload

#### City Information (`/admin/dashboard/city-information`)
- City statistics and facts
- Demographic information
- Historical data

#### Contact Information (`/admin/dashboard/contact-information`)
- Office addresses
- Phone numbers (with Ethiopian format validation)
- Email addresses (with validation)
- Office hours
- Map location

## 🛠️ Using Forms

### Form Validation
All forms include real-time validation with helpful error messages:

```javascript
// Title validation (multilingual)
- At least one language required for draft
- All three languages required before publishing

// Email validation  
- Must be valid email format (includes @)

// Phone validation
- Ethiopian formats: 09XXXXXXXX, 07XXXXXXXX, +2519XXXXXXXX
- International formats also supported

// URL validation
- Must start with http:// or https://
- Dangerous protocols (javascript:, data:) blocked

// Image validation
- Only JPEG, PNG, WEBP, GIF formats
- Maximum 5MB file size
- Automatic upload or paste URL
```

### Publish Workflow

1. **Create Draft:**
   - Click "Save as Draft" to save without publishing
   - Drafts are only visible to admin users
   - Minimal validation (only primary language required)

2. **Review & Validate:**
   - System checks all required fields
   - Warns if translations are missing
   - Validates image formats and sizes

3. **Publish:**
   - Click "Publish" button
   - Confirmation dialog shows any warnings
   - Content immediately visible on public site

4. **Update Published Content:**
   - Edit published content anytime
   - Changes go live immediately
   - Can unpublish to return to draft

### Image Management

**Upload from computer:**
1. Click "Upload from Computer/Phone" button
2. Select image file (JPEG, PNG, WEBP, GIF)
3. Max 5MB size
4. Image uploads to `/public/uploads/`
5. Preview appears automatically

**Use external URL:**
1. Paste image URL in the text field
2. Must be https:// URL
3. Preview appears if valid

**Remove image:**
1. Click "Remove" button on preview
2. Or clear the URL field

## 🔐 Security Best Practices

### For Administrators

1. **Use Strong Passwords:**
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Don't reuse passwords from other sites
   - Change password regularly

2. **Protect Your Credentials:**
   - Never share your login information
   - Don't write passwords down
   - Use a password manager
   - Log out when finished

3. **Be Careful with Content:**
   - Review all content before publishing
   - Check for typos and errors
   - Verify all translations are accurate
   - Test links before publishing

4. **Regular Maintenance:**
   - Remove expired announcements
   - Archive old news articles
   - Update contact information when changed
   - Keep service information current

### For System Administrators

1. **Change Default Credentials:**
   ```bash
   # Login as admin and immediately change password
   # Or update directly in database:
   cd backend
   node seed.js  # Re-run with new credentials
   ```

2. **Environment Variables:**
   ```bash
   # Generate new JWT_SECRET for production:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update both .env files:
   backend/.env
   .env.local
   ```

3. **Database Backups:**
   ```bash
   # Create regular backups of MySQL database
   mysqldump -u root -p burayu_mesob > backup_$(date +%Y%m%d).sql
   ```

4. **Monitor Logs:**
   - Check backend console for errors
   - Review failed login attempts
   - Monitor API response times

5. **SSL Certificate:**
   ```bash
   # Ensure HTTPS is enabled in production
   # Update NEXT_PUBLIC_API_URL to use https://
   ```

## 🐛 Troubleshooting

### "Not authorized" Error
- **Cause:** JWT token expired or invalid
- **Solution:** Log out and log in again

### "Network Error" or "Failed to fetch"
- **Cause:** Backend server not running
- **Solution:** Check backend is running on port 5000

### Image Upload Fails
- **Cause:** File too large or wrong format
- **Solution:** Resize to under 5MB, use JPEG/PNG/WEBP

### Form Won't Submit
- **Cause:** Validation errors
- **Solution:** Check for red error messages under fields, fill required fields

### Can't Publish Content
- **Cause:** Missing required translations
- **Solution:** Fill in all three language versions (om, am, en)

### Logout Button Doesn't Work
- **Cause:** Old browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R) or clear browser cache

## 📊 Content Guidelines

### News Articles
- **Title:** Clear, informative, under 100 characters
- **Summary:** 2-3 sentences, 150-300 characters
- **Content:** Full article text, properly formatted
- **Category:** Choose appropriate category
- **Tags:** 3-5 relevant keywords
- **Image:** Relevant, high-quality photo

### Announcements
- **When to use:** Time-sensitive information
- **Priority Levels:**
  - Important: City-wide significance
  - Urgent: Immediate action required
- **Expiration:** Set realistic expiry date
- **Content:** Keep concise and actionable

### Projects
- **Status:** Update regularly as project progresses
- **Budget:** Enter accurate figures in Birr
- **Timeline:** Set realistic dates
- **Progress:** Update percentage as work completes
- **Images:** Show project at different stages

## 📞 Support

For technical support or questions:
- **Email:** it@burayu.gov.et
- **Phone:** [IT Department Number]
- **Office Hours:** Monday-Friday, 8:30 AM - 5:00 PM

## 🔄 Updates Log

### Version 1.1 (Current)
- ✅ Added authentication protection to all admin routes
- ✅ Implemented comprehensive input validation
- ✅ Added XSS prevention with DOMPurify
- ✅ Strengthened password requirements
- ✅ Fixed logout functionality
- ✅ Updated language labels
- ✅ Added forgot password page
- ✅ Created publish confirmation dialogs
- ✅ Added loading states throughout admin panel

### Version 1.0 (Initial)
- Basic CRUD operations for all content types
- Draft/Publish workflow
- Multilingual support
- Image upload functionality
- User authentication
