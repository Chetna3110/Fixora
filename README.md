# 📍 Fixora — Civic Issue Tracking Platform

> **Your City. Your Voice. Your Fix.**  
> A full-stack civic tech platform where citizens report local problems, workers resolve them, and communities collaborate through guilds.

---

## 🌐 Live Demo

> _Coming soon — deploy on Vercel + Render_

---



## 🚀 Features

###  For Citizens (Users)
-  Report civic issues with title, description, category, photo & location
-  View all issues on a live interactive map
-  Upvote issues to prioritize them
-  Comment on issues
-  Search issues by title, description, or location
-  View guilds (read-only)
-  Send messages to admin via Contact page

###  For Workers
-  View issues assigned to them
-  Update issue progress with notes
-  Create & join guilds
-  Chat with guild members
-  Assign issues to guilds

###  For Admins
-  Full issue management (resolve, update status)
-  Assign workers to issues
-  Promote users to worker/admin roles
-  View & manage citizen messages
-  Analytics dashboard
-  Guild leaderboard

### 🌟 Platform Features
-  Guild system — volunteer groups with chat, badges & leaderboard
-  Live map with colored pins (red/orange/green by status)
-  AI chatbot assistant (powered by OpenRouter)
-  Dark/light theme toggle (gold luxury design)
-  Responsive design

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| React-Leaflet | Interactive maps |
| Leaflet.js | Map rendering |
| CSS Variables | Theme system (dark/light) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cloudinary | Image storage |

### External APIs
| Service | Purpose |
|---------|---------|
| OpenRouter AI | Chatbot (Llama 4 free model) |
| MongoDB Atlas | Cloud database |
| Cloudinary | Image CDN |
| OpenStreetMap | Map tiles |

---

## 📁 Project Structure

```
fixora/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Login.jsx       # TechConnect-style login
│   │   │   ├── Register.jsx    # Role selection register
│   │   │   ├── Dashboard.jsx   # Issue grid + search + leaderboard
│   │   │   ├── Admin.jsx       # Admin panel with tabs
│   │   │   ├── WorkerDashboard.jsx  # Worker assigned issues
│   │   │   ├── Guilds.jsx      # Guild management
│   │   │   ├── Contact.jsx     # Citizen contact form
│   │   │   ├── MapView.jsx     # Live issue map
│   │   │   └── ReportIssue.jsx # Issue reporting form
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Sidebar + navbar layout
│   │   │   ├── IssueModal.jsx  # Issue detail modal
│   │   │   ├── ChatBot.jsx     # AI chatbot widget
│   │   │   └── ShareButton.jsx # Social share
│   │   ├── context/
│   │   │   └── ThemeContext.jsx # Dark/light theme
│   │   ├── assets/
│   │   │   └── fixora-logo.png
│   │   ├── Logo.jsx
│   │   ├── CityBackground.jsx  # Animated orb background
│   │   ├── App.jsx             # Routes
│   │   └── index.css           # Gold luxury theme system
│   └── .env
│
└── server/                     # Node.js Backend
    ├── models/
    │   ├── User.js             # User schema (user/worker/admin)
    │   ├── Issue.js            # Issue schema with comments
    │   ├── Guild.js            # Guild schema with chat & badges
    │   └── Contact.js         # Contact message schema
    ├── routes/
    │   ├── auth.js             # Register, login, user management
    │   ├── issues.js           # CRUD + upvote + comments + status
    │   ├── guilds.js           # Guild management + chat
    │   └── contact.js         # Contact messages
    ├── index.js                # Express app entry point
    └── .env
```

---

##  Role-Based Access Control

| Feature | User | Worker | Admin |
|---------|------|--------|-------|
| View issues | ✅ | ✅ | ✅ |
| Report issue | ✅ | ✅ | ✅ |
| Upvote & comment | ✅ | ✅ | ✅ |
| View guilds | ✅ | ✅ | ✅ |
| Join guild | ❌ | ✅ | ✅ |
| Create guild | ❌ | ✅ | ✅ |
| Guild chat | ❌ | ✅ | ✅ |
| Update issue progress | ❌ | ✅ (assigned only) | ✅ |
| Resolve issues | ❌ | ❌ | ✅ |
| Assign workers | ❌ | ❌ | ✅ |
| Manage user roles | ❌ | ❌ | ✅ |
| View messages | ❌ | ❌ | ✅ |

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- OpenRouter API key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/fixora.git
cd fixora
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fixora
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

Start backend:
```bash
node index.js
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_OPENROUTER_KEY=your_openrouter_api_key
```

Start frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🗺️ API Endpoints

### Auth Routes `/api/auth`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login & get JWT | Public |
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |

### Issue Routes `/api/issues`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all issues | Public |
| POST | `/` | Create issue | Auth |
| PUT | `/:id/upvote` | Upvote issue | Auth |
| PUT | `/:id/status` | Update status | Admin/Worker |
| PUT | `/:id/assign-worker` | Assign worker | Admin |
| POST | `/:id/comments` | Add comment | Auth |

### Guild Routes `/api/guilds`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all guilds | Public |
| GET | `/:id` | Get guild details | Public |
| POST | `/` | Create guild | Worker/Admin |
| POST | `/:id/apply` | Apply to join | Worker/Admin |
| PUT | `/:id/requests/:userId` | Approve/reject | Leader |
| POST | `/:id/chat` | Send chat message | Members |

### Contact Routes `/api/contact`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Send message | Auth |
| GET | `/` | Get all messages | Admin |
| PUT | `/:id/read` | Mark as read | Admin |
| DELETE | `/:id` | Delete message | Admin |

---

## Design System

- **Primary Font:** Cormorant Garamond (headings)
- **Body Font:** DM Sans
- **Gold Accent:** `#c9a96e`
- **Dark Background:** `#0d0d0f`
- **Light Background:** `#f5f0e8` (warm parchment)
- **Animated Orbs:** Purple, gold, blue floating backgrounds
- **Theme:** Persistent dark/light toggle via localStorage

---

##  Key Implementation Highlights

### JWT Authentication Flow
```
User Login → bcrypt verify → JWT sign (id, name, role) → 
localStorage → Authorization header → Backend middleware → 
Role-based response
```

### Issue Status Workflow
```
Citizen reports → Pending → Admin assigns worker → 
Worker updates (In Progress) → Admin resolves → Resolved
```

### Guild Badge System
Auto-awards badges based on:
-  Community Starter — 5+ members
-  Growing Strong — 20+ members  
-  Problem Solvers — 10+ resolved
-  City Heroes — 50+ resolved
-  Legendary Guild — 100+ resolved

---

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---



##  Acknowledgements

- [React-Leaflet](https://react-leaflet.js.org/) — Interactive maps
- [OpenRouter](https://openrouter.ai/) — Free AI models
- [Cloudinary](https://cloudinary.com/) — Image management
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database
- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles
