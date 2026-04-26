#!/bin/bash

# GeoSpatial Road Registry - Local Runner (No Docker)
# This script starts the AI Service (Python), Backend (Java H2), and Frontend (Vite)

# Colors for logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting GeoSpatial Road Registry Manual Setup...${NC}"

# 1. AI Service (Python)
echo -e "${GREEN}[1/3] Starting AI Service (Python)...${NC}"
cd ai-service
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python3 main.py &
AI_PID=$!
cd ..

# 2. Backend (Java/Spring Boot with H2)
echo -e "${GREEN}[2/3] Starting Backend (Java Spring Boot - H2 Mode)...${NC}"
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 3. Frontend (React/Vite)
echo -e "${GREEN}[3/3] Starting Frontend (React/Vite)...${NC}"
# Frontend is likely already running if started in a previous turn, 
# but we'll provide the command for completeness.
npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${GREEN}All services are starting up!${NC}"
echo -e "AI Service (Port 8000): ${BLUE}Running (PID: $AI_PID)${NC}"
echo -e "Backend (Port 8080):    ${BLUE}Running (PID: $BACKEND_PID, logs in backend/backend.log)${NC}"
echo -e "Frontend (Port 5173):   ${BLUE}Running (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "To stop everything, run: ${RED}kill $AI_PID $BACKEND_PID $FRONTEND_PID${NC}"

# Keep script alive to monitor (optional) or just exit
wait
