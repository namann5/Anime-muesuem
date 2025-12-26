# 🚀 Fix "No Episodes" Issue on Vercel

## ❌ The Problem

Your app works locally but shows "no episodes" on Vercel because:
- ✅ Frontend is deployed on Vercel
- ❌ Backend is NOT deployed (still on localhost)
- Frontend can't reach localhost from the internet!

## ✅ The Solution

Deploy BOTH frontend and backend, then connect them.

---

## 📋 Step-by-Step Fix

### Step 1: Deploy Backend to Render (5 minutes)

1. **Go to** [render.com](https://render.com)
2. **Sign up** with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Select your repo:** `namann5/Anime-muesuem`
5. **Configure:**
   ```
   Name: animeverse-backend
   Root Directory: animeverse-mvp/server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```
6. Click **"Create Web Service"**
7. **Wait 5-10 minutes** for deployment
8. **IMPORTANT: Copy your backend URL!**
   - Example: `https://animeverse-backend-abc123.onrender.com`

---

### Step 2: Update Vercel Environment Variable (2 minutes)

1. **Go to** [vercel.com](https://vercel.com/dashboard)
2. **Open your project** (Anime-muesuem)
3. Click **"Settings"** → **"Environment Variables"**
4. **Add new variable:**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com/api
   ```
   ⚠️ **Replace** `your-backend-url` with your actual Render URL
   ⚠️ **Don't forget** the `/api` at the end!

5. Click **"Save"**

---

### Step 3: Redeploy Frontend (1 minute)

1. In Vercel, go to **"Deployments"**
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. **Wait 2-3 minutes**

---

### Step 4: Test! 🎉

1. **Open your Vercel URL**
2. **Go to "Watch Anime"**
3. **Search for an anime** (e.g., "Naruto")
4. **Click "Play"** on any anime
5. **Episodes should now load!** ✅

---

## 🔧 Current Status

✅ **Code Updated:** Backend URL now uses environment variable
✅ **Works Locally:** Still uses localhost in development
⏳ **Needs Deployment:** Follow steps above to deploy

---

## ⚠️ Important Notes

### Render Free Tier Limitations:
- **Spins down** after 15 minutes of inactivity
- **First request** after sleep takes 30-60 seconds to wake up
- **750 hours/month** free (enough for hobby projects)

### To Keep Backend Always On:
1. Use [UptimeRobot](https://uptimerobot.com) to ping every 14 minutes (free)
2. Or upgrade to Render paid plan ($7/month)

---

## 🐛 Troubleshooting

### "Still no episodes after deployment"

**Check:**
1. Backend is running on Render (green status)
2. Environment variable is correct in Vercel
3. Environment variable ends with `/api`
4. Frontend was redeployed after adding env variable

### "Backend URL not working"

**Try:**
1. Visit your backend URL directly: `https://your-backend.onrender.com/health`
2. Should see: `{"status":"ok","provider":"AnimePahe"}`
3. If not, check Render logs

### "CORS errors in console"

**Fix:**
Update `server/index.js` to allow your Vercel domain:
```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-app.vercel.app'  // Add your Vercel URL
    ]
}));
```

---

## 📝 Quick Reference

**Your URLs:**
- Frontend (Vercel): `https://your-app.vercel.app`
- Backend (Render): `https://your-backend.onrender.com`
- Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## ✅ Checklist

Before testing:
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Environment variable added to Vercel
- [ ] Environment variable ends with `/api`
- [ ] Frontend redeployed
- [ ] Waited 2-3 minutes for deployment

---

**Once you complete these steps, your app will work on Vercel!** 🎉
