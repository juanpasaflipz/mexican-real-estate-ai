# Deployment Guide

This guide explains how to deploy the Mexican Real Estate Platform to production using Render (backend) and Vercel (frontend).

## Prerequisites

1. GitHub repository: https://github.com/juanpasaflipz/mexican-real-estate-ai
2. Accounts on:
   - [Render.com](https://render.com)
   - [Vercel.com](https://vercel.com)

## Backend Deployment (Render)

### 1. Push Changes to GitHub

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `juanpasaflipz/mexican-real-estate-ai`
5. Configure:
   - **Name**: mexican-real-estate-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Set Environment Variables

In Render dashboard, add these environment variables:

```
DATABASE_URL=postgresql://postgres:T8cBFXxnxe2rvd8aBuWN@db.pfpyfxspinghdhrjalsg.supabase.co:5432/postgres
SUPABASE_DATABASE_URL=postgresql://postgres:T8cBFXxnxe2rvd8aBuWN@db.pfpyfxspinghdhrjalsg.supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=https://your-app-name.vercel.app
JWT_SECRET=(Render will auto-generate this)
```

### 4. Deploy

Click "Create Web Service". Render will build and deploy your backend.

Your backend URL will be: `https://mexican-real-estate-api.onrender.com`

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables

Add this environment variable in Vercel:

```
VITE_API_URL=https://mexican-real-estate-api.onrender.com/api
```

### 4. Deploy

Click "Deploy". Vercel will build and deploy your frontend.

Your frontend URL will be: `https://mexican-real-estate-ai.vercel.app`

## Post-Deployment Steps

### 1. Update Backend Environment

Go back to Render and update the `CLIENT_URL` environment variable with your Vercel URL:

```
CLIENT_URL=https://mexican-real-estate-ai.vercel.app
```

### 2. Verify CORS Settings

Ensure your backend allows requests from your frontend domain.

### 3. Test the Deployment

1. Visit your frontend URL
2. Test the natural language query system
3. Check the blog functionality
4. Verify API connections

## Monitoring

### Backend (Render)
- View logs in Render dashboard
- Monitor performance metrics
- Set up health checks

### Frontend (Vercel)
- Check Analytics tab for performance
- Monitor build logs
- Review function logs if using Vercel Functions

## Updating Production

### Backend Updates
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Render will automatically redeploy.

### Frontend Updates
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will automatically redeploy.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CLIENT_URL is set correctly in backend
   - Check CORS middleware configuration

2. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check Supabase connection limits

3. **API Calls Failing**
   - Verify VITE_API_URL in frontend
   - Check backend logs in Render

### Debug Commands

Backend logs:
```bash
# View in Render dashboard under "Logs"
```

Frontend logs:
```bash
# View in Vercel dashboard under "Functions" or browser console
```

## Costs

### Free Tier Limits
- **Render**: 750 hours/month, spins down after 15 min inactivity
- **Vercel**: Unlimited deployments, 100GB bandwidth/month

### Recommendations
- For production with no spin-down: Upgrade Render to paid tier ($7/month)
- For custom domain: Both platforms support free custom domains