#!/bin/bash

# PostCrossing Mock - Simple Startup Script
# This script starts the entire PostCrossing Mock system

echo "🚀 Starting PostCrossing Mock System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies if not already installed
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies are ready"

# Check if MongoDB is configured (will use Atlas by default)
echo "🗄️  Database connection configured"

# Seed the database with test users
echo "🌱 Setting up test data..."
npm run seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Could not seed database, but continuing..."
fi

echo "✅ Test data ready"
echo ""
echo "🎯 Starting the server..."
echo "   - Web Interface: http://localhost:4000"
echo "   - API Health: http://localhost:4000/api/meta/health"
echo ""
echo "📋 Test Users Available:"
echo "   - alice (US)"
echo "   - bruno (CN)"
echo "   - cami (CL)"
echo "   - dave (DE)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "────────────────────────────────────────"

# Start the development server
npm run dev
