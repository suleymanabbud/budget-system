"""
Main FastAPI application entry point
نقطة دخول التطبيق الرئيسية
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect
from typing import List
import json

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="نظام إدارة الموازنات - Budget Management System",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
# Allow origins from environment or default to localhost
import os
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Allow multiple origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.get("/")
async def root():
    """Root endpoint - نقطة النهاية الرئيسية"""
    return {
        "message": "Budget Management System API",
        "message_ar": "نظام إدارة الموازنات",
        "version": settings.APP_VERSION,
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "budget-system"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await manager.broadcast({
                "type": "update",
                "data": data
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Export manager for use in other modules
app.state.ws_manager = manager

