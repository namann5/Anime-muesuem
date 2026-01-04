# 🔧 Development Workflow Guide

## 🎯 Goal: Test Locally Before Deploying

You now have **two branches**:
- `main` → Production (deployed to Vercel)
- `development` → Testing (your workspace)

---

## 📋 Daily Workflow

### **1. Make Changes (Always on Development Branch)**

```bash
# Make sure you're on development branch
git branch  # Should show * development

# If not, switch to it
git checkout development

# Now make your changes, test locally
# Your local servers: http://localhost:5173
```

### **2. Save Your Work**

```bash
# After testing locally and everything works
git add .
git commit -m "describe your changes"
git push origin development
```

**✅ This pushes to `development` branch only - does NOT affect your live site!**

---

### **3. When Ready to Deploy**

Only when you're 100% sure everything works:

```bash
# Switch to main branch
git checkout main

# Merge your tested changes from development
git merge development

# Push to deploy
git push origin main
```

**✅ NOW it deploys to Vercel and updates your live site!**

---

## 🚀 Quick Commands

### **Daily Development:**
```bash
# Start working
git checkout development

# Make changes, test locally
# (npm run dev should be running)

# Save changes (does NOT deploy)
git add .
git commit -m "your message"
git push origin development
```

### **Deploy to Production:**
```bash
# Only when ready!
git checkout main
git merge development
git push origin main
# ↑ This deploys to live site
```

### **Check Current Branch:**
```bash
git branch
# * development  ← You're here (safe to experiment)
#   main         ← Production branch
```

---

## ✅ Current Status

- ✅ You're now on `development` branch
- ✅ All future changes stay here
- ✅ `main` branch is protected (your deployment)
- ✅ Test everything locally before merging to main

---

## 🎬 Example Workflow

**Scenario: You want to add a new feature**

```bash
# 1. Make sure you're on development
git checkout development

# 2. Make your changes in VS Code
# 3. Test locally (localhost:5173)
# 4. If it works, save it

git add .
git commit -m "Added new feature"
git push origin development

# 5. Test more, make more changes, repeat steps 2-4

# 6. When EVERYTHING is perfect and tested
git checkout main
git merge development
git push origin main
# ↑ NOW it goes live!
```

---

## ⚠️ Important Rules

1. **NEVER work directly on `main` branch**
   - Always use `development` for changes

2. **Test thoroughly before merging to main**
   - Your live site depends on `main` branch

3. **Push to `development` as often as you want**
   - It's your playground, won't affect live site

4. **Only merge to `main` when ready to deploy**
   - This is your "release" moment

---

## 🔍 Branch Status

```bash
# See which branch you're on
git branch

# See all branches
git branch -a

# Switch branches
git checkout development  # For testing
git checkout main        # For deploying
```

---

## 💡 Pro Tips

1. **Always check your branch before committing**
   ```bash
   git branch  # Shows current branch
   ```

2. **If you accidentally work on main**
   ```bash
   # Don't panic! Move changes to development
   git stash
   git checkout development
   git stash pop
   ```

3. **Keep development in sync with main**
   ```bash
   git checkout development
   git merge main
   ```

---

## 🎯 Summary

**Your Workflow:**
1. Work on `development` branch (you're here now!)
2. Test locally (localhost:5173)
3. Push to `development` (safe, won't deploy)
4. When ready, merge to `main` and push (deploys!)

**Current Branch:** `development` ✅

**You're all set!** Make changes freely - they won't affect your deployed site until you merge to `main`. 🚀
