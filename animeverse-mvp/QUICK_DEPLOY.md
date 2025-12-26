# 🚀 Quick Deployment Steps

## Fastest Way: Vercel + Render (Both FREE)

### 1️⃣ Deploy Backend (5 minutes)

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your repo: `namann5/Anime-muesuem`
4. Settings:
   - **Root Directory:** `animeverse-mvp/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. **Copy your backend URL** (e.g., `https://animeverse-backend-xyz.onrender.com`)

### 2️⃣ Deploy Frontend (3 minutes)

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **"Add New Project"**
3. Import: `namann5/Anime-muesuem`
4. Settings:
   - **Root Directory:** `animeverse-mvp`
   - **Framework:** Vite
5. **Before deploying**, add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: Your Render backend URL from step 1
6. Click **"Deploy"**
7. **Done!** Your app is live! 🎉

### 3️⃣ Update CORS (Important!)

After deployment, update your backend CORS to allow your Vercel domain:

In `server/index.js`, update the CORS section:

```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-app-name.vercel.app'  // Add your Vercel URL
    ]
}));
```

Then push to GitHub - Render will auto-redeploy.

---

## ⚡ Even Faster: Railway (All-in-One)

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Select `namann5/Anime-muesuem`
4. Railway auto-detects and deploys both frontend & backend
5. **Done in 2 minutes!** 🚀

**Note:** Railway gives $5 free credit/month (usually enough for hobby projects)

---

## 📝 Current Status

- ✅ Code on GitHub
- ✅ Backend ready for deployment
- ✅ Frontend ready for deployment
- ⏳ Waiting for you to deploy!

---

## 🎯 What You'll Get

**Free Tier:**
- ✅ Public URL (HTTPS)
- ✅ Automatic deployments on git push
- ✅ Free SSL certificate
- ✅ 99% uptime
- ⚠️ Backend sleeps after 15 min (Render free tier)

**Your Live URLs:**
- Frontend: `https://anime-muesuem.vercel.app`
- Backend: `https://animeverse-backend.onrender.com`

---

## ⏱️ Time Estimate

- Render setup: 5 minutes
- Vercel setup: 3 minutes
- Testing: 2 minutes
- **Total: ~10 minutes to go live!**

---

**Ready? Pick an option and let's deploy!** 🚀
