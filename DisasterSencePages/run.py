#!/usr/bin/env python3
"""
DisasterSense Flask Application Runner
Run this file to start the Flask development server.
"""

import os
from app import app, db

if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database tables created/verified")
    
    # Run the Flask application
    print("Starting DisasterSense Flask application...")
    print("Access the application at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
