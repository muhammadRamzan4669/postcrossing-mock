# 📮 PostCrossing Mock System

A complete mock implementation of the PostCrossing system where people exchange postcards around the world. This project includes a backend API, web interface, and Firefox extension.

## 🎯 Project Overview

PostCrossing Mock simulates the real PostCrossing experience with:

- **Backend Server** (Node.js + Express + MongoDB Atlas)
- **Web Interface** (Clean HTML/CSS/JS frontend)
- **Firefox Extension** (Browser integration)
- **Database Integration** (MongoDB Atlas with test data)

## 🚀 Quick Start Guide

### Option 1: One-Command Start (Recommended)

```bash
# Clone and start everything
git clone https://github.com/muhammadRamzan4669/postcrossing-mock.git
cd postcrossing-mock
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Setup database and seed data
npm run seed

# Start the development server
npm run dev
```

### Option 3: Demo Mode

```bash
# Perfect for presentations/demos
npm run demo
```

## 🛠️ Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 7.0.0 or higher (comes with Node.js)
- **MongoDB Atlas** account (free tier works fine)
- **Git** for cloning the repository

## 📋 Initial Setup

### 1. Database Configuration

The project uses MongoDB Atlas. You have two options:

#### Option A: Use Provided Atlas Setup (Recommended)

```bash
node setup-atlas.js
```

Follow the prompts to enter your Atlas credentials.

#### Option B: Manual .env Configuration

Create `server/.env` file:

```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/postcrossing_mock
PORT=4000
CORS_ORIGIN=*
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Test Data

```bash
npm run seed
```

### 4. Start the Server

```bash
npm run dev
```

## 🌐 Accessing the Application

Once started, you can access:

- **Web Interface**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/meta/health
- **API Documentation**: http://localhost:4000/api (lists all endpoints)

## 👥 Test Users

The system comes pre-loaded with test users:

| Username | Country | Description                         |
| -------- | ------- | ----------------------------------- |
| `alice`  | US      | New user, no postcards yet          |
| `bruno`  | CN      | Active user with travel history     |
| `cami`   | CL      | Moderate activity level             |
| `dave`   | DE      | Power user, many received postcards |

## 📱 Web Interface Usage

### Basic Workflow:

1. **Enter User ID**: Use one of the test users (e.g., `alice`)
2. **Test Connection**: Verify the backend is working
3. **Request Address**: Get someone to send a postcard to
4. **Register Received**: Enter postcard codes when you receive them

### Available Actions:

- **Test Connection** - Verify API connectivity
- **Request Address** - Get a new recipient address
- **View Traveling** - See your postcards in transit
- **View Statistics** - Check your profile stats
- **Register Received** - Log received postcards

## 🦊 Firefox Extension

### Installation:

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `extension/manifest.json`

### Usage:

- Click the extension icon in Firefox toolbar
- Configure server URL (default: http://localhost:4000)
- Set your user ID
- Use the popup interface for quick actions

## 🔧 API Endpoints

### Health & Meta

- `GET /api/meta/health` - Server health check
- `GET /api` - List all available endpoints

### PostCard Operations

- `POST /api/postcards/request` - Request new address
  ```json
  { "userId": "alice" }
  ```
- `GET /api/postcards/traveling` - Get traveling postcards
- `POST /api/postcards/register-received` - Register received postcard
  ```json
  { "postcardId": "PC-123456", "userId": "alice" }
  ```

### User Operations

- `GET /api/postcards/stats` - Get user statistics
  ```json
  { "userId": "alice" }
  ```

## 📁 Project Structure

```
postcrossing-mock/
├── 📁 server/                    # Backend application
│   ├── 📁 models/               # Database models
│   │   ├── Address.js           # User addresses
│   │   ├── Counter.js           # Auto-increment counters
│   │   ├── ReceivePool.js       # Credit tracking
│   │   └── User.js              # User accounts
│   ├── 📁 routes/               # API routes
│   │   └── postcards.js         # Postcard endpoints
│   ├── 📁 services/             # Business logic
│   │   └── postcrossingService.js
│   ├── 📁 public/               # Web interface
│   │   └── index.html           # Main web app
│   ├── index.js                 # Server entry point
│   ├── seed.js                  # Database seeding
│   └── package.json             # Server dependencies
├── 📁 extension/                 # Firefox extension
│   ├── manifest.json            # Extension config
│   ├── background.js            # Background script
│   ├── popup.html               # Extension popup
│   ├── popup.js                 # Popup functionality
│   ├── 📁 icons/                # Extension icons
│   ├── README.md                # Extension docs
│   └── FIXES.md                 # Known issues
├── 📁 web/                      # Alternative web interface
│   └── index.html               # Standalone web app
├── start.sh                     # One-click startup script
├── setup-atlas.js               # Atlas configuration helper
├── package.json                 # Root project config
└── README.md                    # This file
```

## 🎮 How PostCrossing Works

### The Exchange Cycle:

1. **Request** → User requests an address to send a postcard to
2. **Send** → User physically mails a postcard with a unique code
3. **Travel** → Postcard travels through postal system
4. **Receive** → Recipient gets the postcard
5. **Register** → Recipient enters the code online
6. **Credit** → Original sender gets credit for new requests

### System Rules:

- Users can only have 5 postcards traveling at once
- Must register received postcards to earn new request credits
- Postcards have unique tracking codes
- Statistics track sent, received, and traveling postcards

## 🗄️ Database Schema

### Collections:

- **users** - User profiles and statistics
- **addresses** - Mailing addresses for users
- **postcards** - Individual postcard records
- **receivepool** - Credits for requesting addresses
- **counters** - Auto-increment sequences

### Key Fields:

```javascript
// User Document
{
  userId: "alice",
  country: "US",
  stats: {
    sent: 10,
    received: 8,
    traveling: 2
  }
}

// Postcard Document
{
  postcardId: "PC-123456",
  senderId: "alice",
  recipientId: "bruno",
  status: "traveling",
  sentDate: Date,
  receivedDate: Date
}
```

## 🚀 Development Scripts

```bash
# Root level commands
npm run dev          # Start development server
npm run start        # Start production server
npm run seed         # Populate database with test data
npm run demo         # Demo mode with info display
npm run health       # Show health check URL

# Legacy support (direct server commands)
npm run dev:legacy   # Direct server dev start
npm run seed:legacy  # Direct server seeding
```

## 🎯 Demo & Presentation Guide

### For Live Demos:

1. **Show the problem**: Explain what PostCrossing is
2. **Start the system**: Use `npm run demo` for clean output
3. **Demo the web interface**:
   - Test connection with `alice`
   - Request an address
   - Show the returned postcard details
   - Register the same postcard as received
   - Show updated statistics
4. **Show the Firefox extension**:
   - Load extension in Firefox
   - Configure with server URL
   - Demonstrate popup functionality
5. **API demonstration**:
   - Show health endpoint
   - Demonstrate API calls via curl/Postman

### Key Talking Points:

- Full-stack application (frontend, backend, database)
- RESTful API design
- MongoDB integration with Atlas
- Browser extension development
- Real-world business logic simulation

## 🔍 Troubleshooting

### Common Issues:

**Server won't start**

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules
npm install
```

**Database connection fails**

```bash
# Use the Atlas setup helper
node setup-atlas.js

# Or check your .env file in server/
cat server/.env
```

**Extension not loading**

- Ensure you're loading `extension/manifest.json`
- Check Firefox console for errors
- Verify server is running on localhost:4000

**Port already in use**

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or change port in server/.env
echo "PORT=3000" >> server/.env
```

## 🛡️ Environment Variables

Server configuration via `server/.env`:

```env
NODE_ENV=development              # Environment mode
MONGODB_URI=mongodb+srv://...     # Atlas connection string
PORT=4000                         # Server port
CORS_ORIGIN=*                     # CORS policy
```

## 🧪 Testing

### Manual Testing:

```bash
# Health check
curl http://localhost:4000/api/meta/health

# Request address
curl -X POST http://localhost:4000/api/postcards/request \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice"}'

# Check traveling postcards
curl "http://localhost:4000/api/postcards/traveling?userId=alice"
```

### Browser Testing:

- Open http://localhost:4000
- Use different test users
- Test all web interface features
- Verify extension integration

## 🎓 Educational Value

This project demonstrates:

- **Backend Development**: Express.js, MongoDB, RESTful APIs
- **Frontend Development**: Vanilla JavaScript, DOM manipulation
- **Browser Extensions**: Firefox extension architecture
- **Database Design**: MongoDB schema, relationships
- **Full-Stack Integration**: Frontend-backend communication
- **Real-World Business Logic**: PostCrossing exchange system
- **DevOps Basics**: Environment configuration, startup scripts

## 📜 License

This project is for educational purposes. Created as a demonstration of full-stack web development concepts.

## 🤝 Contributing

This is an educational project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:

- Check the troubleshooting section above
- Review the extension/FIXES.md for known issues
- Create an issue on GitHub

---

## 🎉 Ready to Start?

```bash
git clone https://github.com/muhammadRamzan4669/postcrossing-mock.git
cd postcrossing-mock
./start.sh
```

Then open http://localhost:4000 and start exchanging virtual postcards! 📮✨
