# Vendor Registration App Deployment Guide

This guide explains how to deploy the Vendor Registration app to GitHub and Vercel.

## Prerequisites

- GitHub account
- Vercel account (can sign up with GitHub)
- Node.js and npm installed locally

## Step 1: Push to GitHub

1. Ensure your repository is up to date:

```bash
git add .
git commit -m "Prepare vendor registration app for deployment"
git push origin main
```

## Step 2: Connect to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository "Vendor_application_submission"
4. Configure project settings:
   - **Framework Preset**: Select Vite
   - **Root Directory**: Leave empty (uses project root)
   - **Build Command**: Use default (`npm run build`)
   - **Output Directory**: Leave default

## Step 3: Configure Environment Variables

Add these environment variables in Vercel project settings:

- `NODE_ENV`: `production`
- `EMAIL_HOST`: `smtp.office365.com` (or your SMTP server)
- `EMAIL_PORT`: `587` (or your SMTP port)
- `EMAIL_SECURE`: `false` (set to `true` if using SSL)
- `EMAIL_USER`: `procurement@rashmigroup.com` (your sender email)
- `EMAIL_PASS`: `********` (your email password - keep secure!)
- `ADMIN_EMAIL`: `procurement@rashmigroup.com` (recipient for form submissions)

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build and deployment to complete
3. Vercel will provide a URL (e.g., https://vendor-application-submission.vercel.app)

## Testing the Deployment

1. Visit your deployed URL
2. Fill out the vendor registration form
3. Submit with test files
4. Verify that the success message appears
5. Check that notification emails are sent

## Troubleshooting

### Email Issues

If emails aren't being sent:

1. Check Vercel logs for errors
2. Verify that `EMAIL_USER` and `EMAIL_PASS` are correct
3. Ensure your email provider allows SMTP access
4. Try using an app password if your email has 2FA enabled

### File Upload Issues

If file uploads fail:

1. Check that files are under 10MB
2. Verify file types are PDF or Word documents
3. Check network requests in browser developer tools for errors

## Contact

For deployment assistance, contact the development team. 