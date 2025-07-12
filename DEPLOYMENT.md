# Deployment Guide for Render

This guide will help you deploy your Link Hub application to Render as a web service.

## Prerequisites

1. A Render account (free tier available)
2. Your Supabase project URL and anon key
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Environment Variables

Before deploying, you'll need to set up the following environment variables in your Render dashboard:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_ENV`: Set to `production`

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing your Link Hub code

### 2. Configure the Service

Use these settings:

- **Name**: `link-hub` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Set Environment Variables

In the Render dashboard, go to your service's "Environment" tab and add:

```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
NODE_ENV=production
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The first deployment may take 5-10 minutes

## Configuration Files

The project includes:
- `render.yaml`: Render configuration file
- `server.js`: Express server to serve the built React app
- `package.json`: Contains the build and start scripts

## Troubleshooting

### Build Issues
- Check that all dependencies are in `package.json`
- Ensure the build command completes successfully locally

### Runtime Issues
- Verify environment variables are set correctly
- Check the logs in the Render dashboard
- Ensure your Supabase project is accessible

### Performance
- The free tier has limitations on build time and runtime
- Consider upgrading for production use

## Local Testing

Before deploying, test your production build locally:

```bash
npm run build
npm start
```

Visit `http://localhost:8080` to verify everything works correctly. 