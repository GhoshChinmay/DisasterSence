# DisasterSense Flask Backend Setup Instructions

## Quick Start

### Option 1: Using the Start Script (Recommended for Windows)

1. **Double-click `start.bat`** - This will automatically:
   - Check for Python installation
   - Create virtual environment
   - Install dependencies
   - Start the Flask server

### Option 2: Manual Setup

1. **Install Python 3.8+** if not already installed
2. **Open Command Prompt/PowerShell** in the project directory
3. **Run the following commands:**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the application
python run.py
```

## Access the Application

- **Main Website**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Admin Dashboard**: http://localhost:5000/dashboard.html

## Features Available

### ✅ Working Features

1. **Incident Reporting** (`/api/incident-report`)
   - Submit disaster reports with location, type, description
   - Email notifications
   - File upload support (images/videos)

2. **Emergency Kit Planner** (`/api/emergency-kit`)
   - Generate personalized emergency kits
   - Based on family size, disaster type, budget
   - Real-time kit generation

3. **Newsletter Subscription** (`/api/newsletter`)
   - Email subscription management
   - Duplicate prevention

4. **Weather Alerts** (`/api/weather-alerts`)
   - Mock weather alert system
   - Real-time alert display

5. **Safe Spot Finder** (`/api/safe-spots`)
   - Find evacuation spots based on location
   - Disaster-type specific recommendations

6. **Admin Dashboard**
   - View incident reports
   - Update incident status
   - Statistics overview

### 🔧 Configuration

#### Database
- **Default**: SQLite (no setup required)
- **Production**: PostgreSQL (update DATABASE_URL in .env)

#### Email (Optional)
- Update `.env` file with your email credentials
- Gmail: Use App Password for authentication

#### File Uploads
- **Location**: `uploads/` directory
- **Max Size**: 25MB per file
- **Formats**: PNG, JPG, JPEG, GIF, MP4, MOV, AVI

## API Endpoints

### Main Routes
- `GET /` - Home page
- `GET /kit.html` - Emergency kit planner
- `GET /maps.html` - Evacuation maps
- `GET /alerts.html` - Weather alerts
- `GET /dashboard.html` - Admin dashboard

### API Endpoints
- `POST /api/incident-report` - Submit incident
- `GET /api/incidents` - Get incidents (admin)
- `PUT /api/incidents/<id>` - Update incident status
- `POST /api/emergency-kit` - Generate kit
- `POST /api/newsletter` - Subscribe newsletter
- `GET /api/weather-alerts` - Get weather alerts
- `GET /api/safe-spots` - Find safe spots
- `GET /health` - Health check

## File Structure

```
disastersense/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── utils.py               # Utility functions
├── config.py              # Configuration
├── run.py                 # Application runner
├── requirements.txt       # Dependencies
├── start.bat             # Windows start script
├── start.sh              # Mac/Linux start script
├── templates/            # HTML templates
│   ├── index.html
│   ├── kit.html
│   ├── maps.html
│   ├── alerts.html
│   └── dashboard.html
├── uploads/              # File uploads
└── disastersense.log     # Application logs
```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Install Python 3.8+ from python.org
   - Add Python to PATH during installation

2. **Port 5000 already in use**
   - Change port in `run.py`: `app.run(port=5001)`
   - Or kill process using port 5000

3. **Database errors**
   - Delete `disastersense.db` and restart
   - Check database permissions

4. **Email not working**
   - Check email credentials in `.env`
   - Use App Password for Gmail
   - Check firewall/antivirus settings

### Logs
- Check `disastersense.log` for detailed error information
- Console output shows real-time logs

## Production Deployment

### Environment Variables
```env
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-app-password
FLASK_ENV=production
```

### Database Migration
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Web Server
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Support

- **Documentation**: README.md
- **Logs**: disastersense.log
- **Health Check**: http://localhost:5000/health

## Next Steps

1. **Test all features** by visiting each page
2. **Submit test incident reports** to verify functionality
3. **Generate emergency kits** with different parameters
4. **Check admin dashboard** for incident management
5. **Configure email** for notifications
6. **Deploy to production** when ready

The Flask backend is now fully functional and ready for use! 🚀
