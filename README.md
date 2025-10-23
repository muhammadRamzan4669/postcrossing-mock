# 📮 PostCrossing Mock - Simple Project

A simple web application that simulates the PostCrossing system where people exchange postcards around the world.

## 🎯 What This Project Does

This is a **mock PostCrossing system** with:

- **Backend API** (Node.js + Express + MongoDB)
- **Simple Web Interface** (HTML + CSS + JavaScript)
- **Basic PostCard Exchange Logic**

## 🚀 Quick Start (For Viva Demo)

1. **Start the Server:**

   ```bash
   npm run dev
   ```

2. **Open Web Interface:**
   - Go to: http://localhost:4000
   - The webpage will load automatically

3. **Use the System:**
   - Enter User ID: `alice` (or bruno, cami, dave)
   - Click "Test Connection" to verify it works
   - Click "Request Address" to get someone to send a postcard to
   - Use the postcard code to "Register as Received"

## 🏗️ Project Structure

```
postcrossing-mock/
├── server/                  # Backend API
│   ├── models/             # Database models (User, Postcard, etc.)
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── public/             # Web interface (HTML/CSS/JS)
│   └── index.js            # Main server file
└── package.json            # Project configuration
```

## 🛠️ Key Features

### Backend API Endpoints:

- `GET /api/meta/health` - Check if server is running
- `POST /api/postcards/request` - Request an address to send postcard to
- `GET /api/postcards/traveling` - See your postcards in transit
- `GET /api/postcards/stats` - Get your statistics
- `POST /api/postcards/register-received` - Register when you receive a postcard

### Web Interface:

- Simple configuration (API URL + User ID)
- Easy buttons for all main actions
- Real-time output display
- Clean, mobile-friendly design

## 👥 Test Users

The system comes with 4 pre-created users:

- **alice** (US) - New user with no postcards yet
- **bruno** (CN) - Active user with some history
- **cami** (CL) - Moderate user
- **dave** (DE) - Power user with lots of received postcards

## 🔄 How PostCrossing Works

1. **Request Address**: User asks for someone to send a postcard to
2. **Send Postcard**: User sends physical postcard with unique code
3. **Register Received**: Recipient enters the code when postcard arrives
4. **Get Credit**: Original sender gets 1 credit to request new addresses
5. **Repeat**: System creates a cycle of postcard exchanges

## 💾 Database

Uses MongoDB with these main collections:

- **Users** - User accounts and statistics
- **Addresses** - Mailing addresses for users
- **Postcards** - Individual postcard records
- **ReceivePool** - Credits for requesting new addresses

## 🎓 For Viva Presentation

**Key Points to Explain:**

1. This simulates real PostCrossing where people exchange postcards globally
2. Backend API handles the business logic and database
3. Frontend provides simple interface to interact with the system
4. MongoDB stores all the data
5. System enforces rules like travel limits and reciprocity

**Demo Flow:**

1. Show the clean web interface
2. Test connection to prove backend works
3. Request an address as 'alice'
4. Show the returned postcard code and recipient info
5. Register that same postcard as received
6. Show how statistics update

## 🔧 Technical Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Validation**: Zod schema validation
- **Environment**: Local development setup

---

_This project demonstrates full-stack web development with a real-world PostCrossing simulation that's easy to understand and demonstrate._
