# Deployment Guide for Vercel

## Current Setup

This is a full-stack application with:
- **Frontend**: React app built with Vite (in `client/` directory)
- **Backend**: Express.js API server (in `server/` directory)

## Vercel Deployment Issues

Vercel is optimized for serverless functions, but this app uses a traditional Express server. You have two options:

### Option 1: Deploy Frontend Only to Vercel (Recommended for now)

1. **Build the frontend**: The build command will create `client/dist/`
2. **Deploy backend separately**: Use Railway, Render, or Heroku for the Express server
3. **Update API URLs**: Change the API base URL in the frontend to point to your backend

### Option 2: Convert to Vercel Serverless Functions (Advanced)

This requires refactoring the Express routes into Vercel serverless functions in an `api/` directory.

## Quick Fix for Build

The current `vercel.json` should work for frontend-only deployment. Make sure:

1. **Environment Variables**: Add these in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

2. **Build Command**: `npm run vercel-build` (installs client deps and builds)

3. **Output Directory**: `client/dist`

## Alternative: Deploy Backend Separately

For a full-stack deployment, consider:

- **Frontend**: Vercel (current setup)
- **Backend**: 
  - Railway (railway.app) - Easy MongoDB integration
  - Render (render.com) - Free tier available
  - Heroku - Traditional option

Then update the API URL in your frontend code to point to the backend URL.

