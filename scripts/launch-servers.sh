#!/bin/bash
# Launch script for main website server and co-aug dashboard
# Checks if servers are running and starts/refreshes them as needed

set -uo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server configurations
WEBSITE_PORT=3001
WEBSITE_DIR="no3d-tools-website"
# Use --listen flag for vercel dev (avoids recursive invocation issue)
WEBSITE_CMD="vercel dev --listen ${WEBSITE_PORT} --yes"
WEBSITE_URL="http://localhost:${WEBSITE_PORT}"

DASHBOARD_PORT=5551
DASHBOARD_DIR="co-aug-dashboard"
DASHBOARD_CMD="npm run dev"
DASHBOARD_URL="http://localhost:${DASHBOARD_PORT}"

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Function to check if a server is running
check_server() {
    local port=$1
    local url=$2
    
    # Check if port is in use
    if lsof -ti:${port} > /dev/null 2>&1; then
        # Try to connect to the URL to verify it's actually responding
        if curl -s -f --max-time 2 "${url}" > /dev/null 2>&1; then
            return 0  # Server is running and responding
        fi
    fi
    return 1  # Server is not running
}

# Function to find and kill process on a port
kill_port() {
    local port=$1
    local name=$2
    
    # Find process using the port
    local pid=$(lsof -ti:${port} 2>/dev/null || true)
    
    if [ -n "${pid}" ]; then
        echo -e "${YELLOW}Stopping ${name} (PID: ${pid})...${NC}"
        kill "${pid}" 2>/dev/null || true
        # Wait a moment for the process to stop
        sleep 2
        # Force kill if still running
        if lsof -ti:${port} > /dev/null 2>&1; then
            kill -9 "${pid}" 2>/dev/null || true
            sleep 1
        fi
    fi
}

# Function to start a server
start_server() {
    local name=$1
    local dir=$2
    local cmd=$3
    local port=$4
    local url=$5
    
    local full_dir="${PROJECT_ROOT}/${dir}"
    
    if [ ! -d "${full_dir}" ]; then
        echo -e "${RED}Error: Directory ${full_dir} does not exist${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Starting ${name}...${NC}"
    cd "${full_dir}"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies for ${name}...${NC}"
        npm install
    fi
    
    # Start the server in the background
    nohup bash -c "${cmd}" > /tmp/${name}-server.log 2>&1 &
    local pid=$!
    
    # Wait a moment for the server to start (longer for first start)
    echo -e "${YELLOW}Waiting for ${name} to start...${NC}"
    sleep 5
    
    # Check multiple times with increasing delays
    local max_attempts=6
    local attempt=1
    while [ ${attempt} -le ${max_attempts} ]; do
        if check_server "${port}" "${url}"; then
            echo -e "${GREEN}✓ ${name} is now running at ${url} (PID: ${pid})${NC}"
            return 0
        fi
        if [ ${attempt} -lt ${max_attempts} ]; then
            sleep 2
        fi
        attempt=$((attempt + 1))
    done
    
    # If we get here, server didn't start
    echo -e "${RED}✗ Failed to start ${name} after ${max_attempts} attempts.${NC}"
    echo -e "${YELLOW}Check logs: /tmp/${name}-server.log${NC}"
    echo -e "${YELLOW}Last 10 lines of log:${NC}"
    tail -n 10 /tmp/${name}-server.log 2>/dev/null || true
    return 1
}

# Function to refresh (restart) a server
refresh_server() {
    local name=$1
    local dir=$2
    local cmd=$3
    local port=$4
    local url=$5
    
    echo -e "${YELLOW}Refreshing ${name}...${NC}"
    kill_port "${port}" "${name}"
    sleep 1
    start_server "${name}" "${dir}" "${cmd}" "${port}" "${url}"
}

# Main execution
echo -e "${GREEN}=== Server Launch Script ===${NC}"
echo ""

# Track failures
WEBSITE_OK=0
DASHBOARD_OK=0

# Check website server
if check_server "${WEBSITE_PORT}" "${WEBSITE_URL}"; then
    echo -e "${GREEN}✓ Website server is already running at ${WEBSITE_URL}${NC}"
    if refresh_server "Website" "${WEBSITE_DIR}" "${WEBSITE_CMD}" "${WEBSITE_PORT}" "${WEBSITE_URL}"; then
        WEBSITE_OK=1
    fi
else
    echo -e "${YELLOW}Website server is not running${NC}"
    if start_server "Website" "${WEBSITE_DIR}" "${WEBSITE_CMD}" "${WEBSITE_PORT}" "${WEBSITE_URL}"; then
        WEBSITE_OK=1
    fi
fi

echo ""

# Check dashboard server
if check_server "${DASHBOARD_PORT}" "${DASHBOARD_URL}"; then
    echo -e "${GREEN}✓ Co-aug dashboard is already running at ${DASHBOARD_URL}${NC}"
    if refresh_server "Dashboard" "${DASHBOARD_DIR}" "${DASHBOARD_CMD}" "${DASHBOARD_PORT}" "${DASHBOARD_URL}"; then
        DASHBOARD_OK=1
    fi
else
    echo -e "${YELLOW}Co-aug dashboard is not running${NC}"
    if start_server "Dashboard" "${DASHBOARD_DIR}" "${DASHBOARD_CMD}" "${DASHBOARD_PORT}" "${DASHBOARD_URL}"; then
        DASHBOARD_OK=1
    fi
fi

echo ""
echo -e "${GREEN}=== Launch Complete ===${NC}"
echo ""

# Summary
if [ ${WEBSITE_OK} -eq 1 ] && [ ${DASHBOARD_OK} -eq 1 ]; then
    echo -e "${GREEN}✓ Both servers are running successfully${NC}"
    EXIT_CODE=0
elif [ ${WEBSITE_OK} -eq 1 ] || [ ${DASHBOARD_OK} -eq 1 ]; then
    echo -e "${YELLOW}⚠ One or more servers failed to start${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}✗ Both servers failed to start${NC}"
    EXIT_CODE=1
fi

echo ""
echo "Server logs:"
echo "  Website: /tmp/Website-server.log"
echo "  Dashboard: /tmp/Dashboard-server.log"
echo ""
echo "To view logs in real-time:"
echo "  tail -f /tmp/Website-server.log"
echo "  tail -f /tmp/Dashboard-server.log"
echo ""
echo "To stop servers:"
echo "  lsof -ti:${WEBSITE_PORT} | xargs kill"
echo "  lsof -ti:${DASHBOARD_PORT} | xargs kill"

exit ${EXIT_CODE}

