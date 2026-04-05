# 🛠️ Fixora – Local Problem Tracker

Fixora is a lightweight and efficient **problem tracking system** designed to help developers and students manage coding problems, bugs, and tasks locally without relying on external tools.

---

## 🚀 Features

- Add, update, and delete problems/tasks  
- Track status: Pending, In Progress, Completed  
- Organized structure for better workflow  
- Local storage (no internet dependency)  
- Fast and simple user experience  

---

## 🧠 Tech Stack

- Frontend: (React / HTML / CSS – update this)
- Backend: (Node.js / Express – update this)
- Database: MongoDB  
- Environment Variables for secure configuration  

---

## 📂 Project Structure
```
Fixora/
│── client/         # Frontend
│── server/         # Backend
│── .env.example    # Environment variables template
│── .gitignore
│── README.md

```
---

## Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/chetna3110/fixora.git
cd fixora
```
### 2️⃣ Install dependencies
For client
```
cd client
npm install
```
For server
```
cd ../server
npm install
```
### 3️⃣ Setup environment variables

Create .env files in both client and server folders.

Example:
MONGO_URI=your_mongodb_uri
OPENROUTER_API_KEY=your_api_key
### 4️⃣ Run the project
Start backend
```
cd server
node index.js
```
Start frontend
```
cd client
npm run dev
```

## 🎯 Use Cases

- Track DSA problems and solutions
- Manage project bugs and fixes
- Organize learning tasks
- Improve productivity and workflow


### 🔐 Security Note

Sensitive data like API keys and database URIs are stored using environment variables and are not exposed in the repository.
