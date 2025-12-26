# 🎬 AnimeVerse - Quick Setup Guide

Welcome! Follow these simple steps to run AnimeVerse on your PC.

## 📋 Prerequisites

Before you start, make sure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### Step 1: Clone the Repository
```bash
git clone https://github.com/namann5/Anime-muesuem.git
cd Anime-muesuem/animeverse-mvp
```

### Step 2: Install Dependencies
```bash
npm install
cd server
npm install
cd ..
```

### Step 3: Start the Backend Server
Open a terminal and run:
```bash
cd server
node index.js
```

You should see:
```
🚀 Backend server running on http://localhost:3001
✅ Consumet provider (AnimePahe) initialized successfully
```

### Step 4: Start the Frontend (in a NEW terminal)
Open another terminal in the project root and run:
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 5: Open in Browser
Open your browser and go to:
```
http://localhost:5173
```

## 🎉 That's it!

You should now see the AnimeVerse app running. You can:
- Search for anime
- Browse popular shows
- Stream episodes

## ⚠️ Important Notes

- **Keep both terminals running** - You need both the frontend and backend servers
- **Internet required** - The app fetches anime data from online sources
- **Port conflicts** - If ports 3001 or 5173 are already in use, you'll need to change them

## 🛠️ Troubleshooting

### "Port already in use" error
- Close any apps using ports 3001 or 5173
- Or modify the port numbers in the config files

### "Module not found" error
- Make sure you ran `npm install` in both the root directory AND the server directory
- Try deleting `node_modules` folder and running `npm install` again

### Backend not connecting
- Make sure the backend server is running (Step 3)
- Check that it's running on port 3001

## 📞 Need Help?

Check the main [README.md](README.md) for detailed documentation or open an issue on GitHub.

---

**Enjoy watching anime! 🍿**
