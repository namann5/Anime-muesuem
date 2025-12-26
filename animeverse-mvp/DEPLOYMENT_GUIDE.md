# 🚀 Deployment Guide - Host AnimeVerse Publicly

## 📋 Prerequisites

- GitHub account (you already have your code there!)
- Vercel account (free)
- Render account (free)

---

## 🎯 Deployment Strategy

We'll deploy in two parts:
1. **Backend** → Render (Node.js server)
2. **Frontend** → Vercel (React app)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

First, let's add a start script to your backend package.json:

1. Open `server/package.json`
2. Make sure it has this structure:

```json
{
  "name": "animeverse-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@consumet/extensions": "^3.3.8",
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  }
}
```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `namann5/Anime-muesuem`
4. Configure:
   - **Name:** `animeverse-backend`
   - **Root Directory:** `animeverse-mvp/server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://animeverse-backend.onrender.com`)

### Step 3: Update CORS Settings

After deployment, you'll need to update the backend to allow your frontend domain.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update API URL

Before deploying, update your frontend to use the production backend URL:

1. Create a file: `animeverse-mvp/.env.production`
2. Add this line (replace with your Render URL):

```
VITE_API_URL=https://animeverse-backend.onrender.com
```

3. Update your API calls to use this environment variable

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. **Go to [vercel.com](https://vercel.com)** and sign up/login with GitHub
2. Click **"Add New Project"**
3. Import your repository: `namann5/Anime-muesuem`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `animeverse-mvp`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**
6. Wait 2-3 minutes
7. **Your app is live!** 🎉

**Option B: Using Vercel CLI (Advanced)**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd d:\Info\ANime\animeverse-mvp

# Deploy
vercel

# Follow the prompts
# When asked for settings, use:
# - Build Command: npm run build
# - Output Directory: dist
# - Development Command: npm run dev
```

---

## Part 3: Configure Environment Variables

### On Render (Backend):

1. Go to your service dashboard
2. Click **"Environment"**
3. Add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)

### On Vercel (Frontend):

1. Go to your project settings
2. Click **"Environment Variables"**
3. Add:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`

---

## 🔧 Update Frontend API Calls

Update your API calls to use the environment variable:

**In `src/api/streamingApi.js` or wherever you make API calls:**

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Use API_URL instead of hardcoded localhost
export async function searchAnime(query) {
    const response = await fetch(`${API_URL}/api/search?q=${query}`);
    return response.json();
}
```

---

## 🎉 Final Steps

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Vercel will auto-deploy** when you push to GitHub

3. **Test your live app!**

---

## 🌐 Alternative: All-in-One Platforms

### **Option 2: Railway (Easiest)**

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Deploy both frontend and backend together
4. Free tier: $5 credit/month

### **Option 3: Netlify + Render**

Similar to Vercel + Render, but uses Netlify for frontend.

---

## ⚠️ Important Notes

### **Free Tier Limitations:**

**Render Free Tier:**
- ✅ Free forever
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds
- ✅ 750 hours/month free

**Vercel Free Tier:**
- ✅ Free forever
- ✅ Always on
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS

### **Cold Start Issue:**

On Render's free tier, your backend will "sleep" after 15 minutes of no activity. The first request will wake it up (takes 30-60 seconds).

**Solutions:**
1. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes
2. Upgrade to Render's paid plan ($7/month)
3. Use Railway instead (better free tier)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy frontend to Vercel
cd d:\Info\ANime\animeverse-mvp
npx vercel

# 3. Backend deploys automatically on Render after setup
```

---

## 📊 Expected Costs

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Free | $0/month |
| Render | Free | $0/month |
| **Total** | | **$0/month** |

**Paid options if you want better performance:**
- Render Starter: $7/month (no cold starts)
- Railway: $5 credit/month (usually enough)

---

## 🎬 Your Live URLs

After deployment, you'll have:

- **Frontend:** `https://anime-muesuem.vercel.app`
- **Backend:** `https://animeverse-backend.onrender.com`
- **Custom Domain:** Optional (free on Vercel)

---

## 🆘 Troubleshooting

### Backend not responding:
- Check Render logs
- Verify environment variables
- Wait 30-60 seconds (cold start)

### Frontend can't connect to backend:
- Update CORS settings in backend
- Check VITE_API_URL environment variable
- Verify backend URL is correct

### Build fails:
- Check build logs
- Verify all dependencies in package.json
- Test build locally: `npm run build`

---

## ✅ Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] Backend package.json has start script
- [ ] Frontend uses environment variables for API URL
- [ ] CORS configured for production domain
- [ ] Tested build locally

---

**Ready to deploy? Let me know which option you want to try!** 🚀
