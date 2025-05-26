# 🚀 Vercel Deployment Checklist

## Pre-Deployment ✅

- [ ] All code committed and pushed to GitHub
- [ ] `vercel.json` configured for full-stack deployment
- [ ] Build scripts tested locally (`npm run build:frontend` && `npm run build:backend`)
- [ ] Environment variables documented
- [ ] Email credentials ready (including app password if using 2FA)

## Vercel Configuration ⚙️

- [ ] Project settings updated:
  - [ ] Framework: "Other" or "Vite"
  - [ ] Build Command: `npm run vercel-build`
  - [ ] Output Directory: `frontend/dist`
  - [ ] Root Directory: (empty)

- [ ] Environment Variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `EMAIL_HOST=smtp.office365.com`
  - [ ] `EMAIL_PORT=587`
  - [ ] `EMAIL_SECURE=false`
  - [ ] `EMAIL_USER=procurement@rashmigroup.com`
  - [ ] `EMAIL_PASS=********` (secure password)
  - [ ] `ADMIN_EMAIL=procurement@rashmigroup.com`

## Deployment Process 🚀

- [ ] Trigger deployment in Vercel dashboard
- [ ] Monitor build logs for errors
- [ ] Verify both frontend and backend builds complete
- [ ] Check deployment URL is accessible

## Post-Deployment Testing 🧪

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Vendor registration form displays
- [ ] Theme toggle (light/dark) works
- [ ] Responsive design on mobile/desktop
- [ ] All images and assets load
- [ ] Navigation links work

### Backend Tests
- [ ] Form submission works
- [ ] File upload functionality
- [ ] Email notifications sent
- [ ] API endpoints respond (check Network tab)
- [ ] Error handling displays properly

### Integration Tests
- [ ] Complete form submission flow
- [ ] Success message displays after submission
- [ ] Email received at admin address
- [ ] Form validation works correctly
- [ ] File attachments included in emails

## Troubleshooting 🔧

If issues occur, check:
- [ ] Vercel function logs
- [ ] Browser console errors
- [ ] Network requests in DevTools
- [ ] Environment variables are set correctly
- [ ] Email service configuration

## Success Criteria ✨

- [ ] Static HTML site successfully replaced
- [ ] Full-stack React/Node.js app deployed
- [ ] Same domain preserved
- [ ] All functionality working
- [ ] Email notifications operational
- [ ] Performance acceptable (< 3s load time)

## Final Steps 🎯

- [ ] Update any documentation with new URLs
- [ ] Inform stakeholders of successful deployment
- [ ] Set up monitoring/analytics if needed
- [ ] Plan regular maintenance schedule

---

**🎉 Deployment Complete!** Your vendor registration portal is now live with full React frontend and Node.js backend functionality.
