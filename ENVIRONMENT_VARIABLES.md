# 🔐 Environment Variables Configuration

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel project settings:

### Core Application Settings
```
NODE_ENV=production
```

### Email Configuration (SMTP)
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=procurement@rashmigroup.com
EMAIL_PASS=your_email_password_here
ADMIN_EMAIL=procurement@rashmigroup.com
```

## 📧 Email Setup Instructions

### For Office 365/Outlook.com:

1. **If using 2FA (recommended)**:
   - Go to [Microsoft Account Security](https://account.microsoft.com/security)
   - Generate an "App Password" for email applications
   - Use the app password as `EMAIL_PASS`

2. **If not using 2FA**:
   - Use your regular email password as `EMAIL_PASS`
   - Consider enabling 2FA for better security

### For Gmail:

If you prefer Gmail, update these values:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your_app_password
```

**Gmail Setup**:
1. Enable 2-Factor Authentication
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password as `EMAIL_PASS`

## 🔧 How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:
   - **Name**: Variable name (e.g., `EMAIL_HOST`)
   - **Value**: Variable value (e.g., `smtp.office365.com`)
   - **Environment**: Select "Production" (and "Preview" if needed)
5. Click "Save"

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add ADMIN_EMAIL
vercel env add NODE_ENV
```

## 🔒 Security Best Practices

### DO:
- ✅ Use app passwords instead of main passwords
- ✅ Enable 2FA on email accounts
- ✅ Regularly rotate passwords
- ✅ Use different passwords for different services
- ✅ Keep environment variables in Vercel only

### DON'T:
- ❌ Commit passwords to Git repository
- ❌ Share passwords in plain text
- ❌ Use the same password for multiple services
- ❌ Store sensitive data in frontend code

## 🧪 Testing Email Configuration

### Local Testing:
Create a `.env` file in your backend directory for local development:
```bash
# backend/.env
NODE_ENV=development
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=procurement@rashmigroup.com
EMAIL_PASS=your_password_here
ADMIN_EMAIL=procurement@rashmigroup.com
```

**Note**: Add `.env` to your `.gitignore` file to prevent committing secrets.

### Production Testing:
After deployment, test the email functionality by:
1. Submitting a test form on your deployed site
2. Checking if emails are received
3. Reviewing Vercel function logs for any errors

## 🚨 Troubleshooting Email Issues

### Common Problems:

**Authentication Failed**:
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Use app password if 2FA is enabled
- Check if "Less secure app access" needs to be enabled (not recommended)

**Connection Timeout**:
- Verify `EMAIL_HOST` and `EMAIL_PORT` are correct
- Check if your hosting provider blocks SMTP ports

**Emails Not Received**:
- Check spam/junk folders
- Verify `ADMIN_EMAIL` is correct
- Test with a different recipient email

### Debug Steps:
1. Check Vercel function logs in dashboard
2. Verify all environment variables are set
3. Test email credentials with a simple email client
4. Review backend email service code for errors

## 📋 Environment Variables Checklist

Before deploying, ensure you have:
- [ ] `NODE_ENV` set to `production`
- [ ] `EMAIL_HOST` configured for your email provider
- [ ] `EMAIL_PORT` set correctly (usually 587 or 465)
- [ ] `EMAIL_SECURE` set appropriately
- [ ] `EMAIL_USER` with valid email address
- [ ] `EMAIL_PASS` with correct password/app password
- [ ] `ADMIN_EMAIL` for receiving form submissions
- [ ] All variables added to Vercel project settings
- [ ] Email functionality tested

---

**🔐 Security Reminder**: Never commit sensitive environment variables to your repository. Always use Vercel's secure environment variable storage.
