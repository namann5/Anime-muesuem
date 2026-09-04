# 🎬 AnimeVerse MVP

A modern, sleek anime streaming web application built with React and powered by AnimePahe integration.

![AnimeVerse](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔍 **Advanced Search** - Search thousands of anime titles with real-time results
- 📺 **Streaming Player** - Embedded AnimePahe player for seamless watching
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- 🎭 **Anime Details** - View synopsis, ratings, genres, and episode lists
- ⚡ **Fast & Smooth** - Optimized performance with React
- 🌐 **Backend Proxy** - Express server to handle API requests and bypass CORS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/namann5/Anime-muesuem.git
   cd animeverse-mvp
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

You need to run **TWO** servers:

#### 1. Start the Backend Server (Port 3001)
```bash
cd server
node index.js
```

You should see:
```
🚀 Backend server running on http://localhost:3001
✅ Consumet provider (AnimePahe) initialized successfully
```

#### 2. Start the Frontend Dev Server (Port 5173)
Open a **new terminal** and run:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 🎉 Access the App

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
animeverse-mvp/
├── src/
│   ├── api/
│   │   ├── anilistApi.js       # AniList GraphQL API integration
│   │   └── streamingApi.js     # AnimePahe streaming API
│   ├── components/
│   │   ├── AnimeCard.jsx        # Anime card component
│   │   ├── AnimePlayer.jsx      # Video player component
│   │   └── CharacterCard.jsx    # Character display component
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── WatchAnime.jsx       # Anime browsing page
│   │   ├── AnimeDetail.jsx      # Anime details & episodes
│   │   └── Museum.jsx           # Character museum
│   ├── App.jsx                  # Main app component
│   └── index.css                # Global styles
├── server/
│   ├── index.js                 # Express backend server
│   └── package.json             # Backend dependencies
├── public/                      # Static assets
├── package.json                 # Frontend dependencies
└── vite.config.js              # Vite configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with gradients and animations
- **React Router** - Client-side routing

### Backend
- **Express.js** - Web server
- **Consumet API** - Anime data and streaming sources
- **CORS** - Cross-origin resource sharing
- **Axios** - HTTP client

### APIs
- **AniList GraphQL API** - Anime metadata, ratings, and information
- **AnimePahe (via Consumet)** - Streaming sources and episodes

## 🎮 Usage

### Watch Anime
1. Click **"Watch Anime"** on the homepage
2. Browse trending anime or use the search bar
3. Click **"Play"** on any anime
4. Select an episode from the list
5. Enjoy streaming!

### Features in Detail

#### 🔍 Search
- Real-time search with debouncing
- Search by anime title
- Displays results with cover images and ratings

#### 📺 Player
- Embedded AnimePahe player
- Episode navigation (Previous/Next)
- Multiple quality options
- Fullscreen support

#### 📊 Anime Details
- Synopsis and description
- Episode count and status
- Genres and tags
- Average rating
- Cover and banner images

## ⚙️ Configuration

### Backend Port
The backend runs on port `3001` by default. To change it, edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

### Frontend Port
The frontend runs on port `5173` by default (Vite default). To change it, edit `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5173
  }
})
```

## 🐛 Troubleshooting

### Backend not starting?
- Make sure you're in the `server` directory
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`

### Frontend not loading?
- Ensure the backend is running first
- Check if port 5173 is available
- Clear browser cache and reload

### Episodes not loading?
- Verify the backend server is running on port 3001
- Check browser console for errors
- Ensure internet connection is stable

### Player not working?
- The player uses AnimePahe's embedded player
- Some browsers may block iframes - check browser settings
- Try disabling ad blockers temporarily

## 🚧 Known Issues

- Large file sizes in Git history (working on optimization)
- Some anime may not have streaming sources available
- Player requires stable internet connection

## Cleanup Notes

- Archived several local test and investigation files under `server/` to reduce repository noise. Remove them manually if you need to purge them from version control.

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Watchlist and favorites
- [ ] Continue watching feature
- [ ] Multiple streaming providers
- [ ] Download episodes
- [ ] Dark/Light theme toggle
- [ ] Advanced filters (genre, year, rating)
- [ ] Recommendations engine

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## ⚠️ Disclaimer

This application is for educational purposes only. All anime content is sourced from third-party providers. Please support official releases.

## 👨‍💻 Developer

Created with ❤️ by [namann5](https://github.com/namann5)

## 🙏 Acknowledgments

- [AniList](https://anilist.co/) - For the amazing GraphQL API
- [Consumet](https://github.com/consumet/consumet.ts) - For the streaming API
- [AnimePahe](https://animepahe.com/) - For streaming sources
- React & Vite communities

---

**Enjoy watching anime! 🎉**

For issues or questions, please open an issue on GitHub.
