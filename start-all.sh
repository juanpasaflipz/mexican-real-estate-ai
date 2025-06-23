#!/bin/bash

# Natural Language Database Query System - Startup Script

echo "🚀 Starting Natural Language Database Query System..."
echo

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ All prerequisites met!"
echo

# Function to start a service in a new terminal
start_service() {
    local service_name=$1
    local service_dir=$2
    local start_command=$3
    
    echo "🔧 Starting $service_name..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd '$PWD/$service_dir' && $start_command\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd '$PWD/$service_dir' && $start_command; exec bash"
        elif command_exists xterm; then
            xterm -e "cd '$PWD/$service_dir' && $start_command; bash" &
        else
            echo "⚠️  Could not find a terminal emulator. Please start $service_name manually:"
            echo "   cd $service_dir && $start_command"
        fi
    else
        echo "⚠️  Unsupported OS. Please start $service_name manually:"
        echo "   cd $service_dir && $start_command"
    fi
}

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo
echo "🎯 Starting services..."
echo

# Start backend
start_service "Backend API" "backend" "npm run dev"
sleep 2

# Start frontend
start_service "Frontend UI" "frontend" "npm run dev"
sleep 2

echo
echo "✨ All services starting up!"
echo
echo "📍 Access points:"
echo "   • Frontend UI: http://localhost:5173"
echo "   • Backend API: http://localhost:3001"
echo "   • Health Check: http://localhost:3001/health"
echo
echo "💡 Quick start:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Try asking: 'Show me all tables in my database'"
echo "   3. Or click on one of the suggested queries"
echo
echo "📝 To stop all services, close the terminal windows or press Ctrl+C"
echo
echo "Happy querying! 🎉"