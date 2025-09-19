# DisasterSense Flask Backend

A comprehensive Flask backend for the DisasterSense disaster management platform with AI-powered predictions and community reporting.

## Features

- **Incident Reporting**: Submit and manage disaster incident reports
- **Emergency Kit Planner**: Generate personalized emergency kits based on family needs
- **Weather Alerts**: Integration with weather services for real-time alerts
- **Safe Spot Finder**: Locate evacuation spots based on disaster type
- **Newsletter Management**: Email subscription and notification system
- **File Upload**: Support for media attachments in incident reports
- **RESTful API**: Complete API endpoints for frontend integration
- **Database Models**: SQLAlchemy models for data persistence
- **Error Handling**: Comprehensive error handling and logging
- **Email Notifications**: Automated email notifications for reports

## Project Structure

```
disastersense/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── utils.py               # Utility functions and services
├── config.py              # Configuration settings
├── run.py                 # Application runner
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── README.md             # This file
├── uploads/              # File upload directory
└── disastersense.log     # Application logs
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- SQLite (included with Python) or PostgreSQL

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disastersense
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python run.py
   # This will create the database tables automatically
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///disastersense.db
# For PostgreSQL: postgresql://username:password@localhost/disastersense

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# API Keys (Optional)
OPENWEATHER_API_KEY=your-openweather-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Database Configuration

The application supports both SQLite (default) and PostgreSQL:

- **SQLite**: No additional setup required
- **PostgreSQL**: Install PostgreSQL and update `DATABASE_URL` in `.env`

## Running the Application

### Development Mode

```bash
python run.py
```

The application will be available at `http://localhost:5000`

### Production Mode

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Main Routes

- `GET /` - Home page
- `GET /prepare.html` - Prepare page (redirects to kit)
- `GET /kit.html` - Emergency kit planner
- `GET /maps.html` - Evacuation maps
- `GET /alerts.html` - Weather alerts
- `GET /dashboard.html` - Admin dashboard
- `GET /SOS.html` - Emergency SOS page
- `GET /users.html` - User management

### API Endpoints

#### Incident Reports

- `POST /api/incident-report` - Submit incident report
- `GET /api/incidents` - Get incident reports (admin)
- `PUT /api/incidents/<report_id>` - Update incident status

#### Emergency Kits

- `POST /api/emergency-kit` - Generate emergency kit

#### Newsletter

- `POST /api/newsletter` - Subscribe to newsletter

#### Weather & Alerts

- `GET /api/weather-alerts` - Get weather alerts
- `GET /api/safe-spots` - Find safe evacuation spots

#### Health Check

- `GET /health` - Application health status

## Database Models

### IncidentReport
- Stores user-submitted incident reports
- Fields: email, incident_type, location, description, media_files, status, etc.

### NewsletterSubscription
- Manages newsletter subscriptions
- Fields: email, subscribed_at, is_active, etc.

### EmergencyKit
- Stores emergency kit configurations
- Fields: family_size, disaster_type, kit_items, budget_range, etc.

### WeatherAlert
- Stores weather alerts and warnings
- Fields: alert_type, severity, location, valid_until, etc.

### SafeSpot
- Stores safe evacuation locations
- Fields: name, spot_type, coordinates, capacity, facilities, etc.

### UserFeedback
- Stores user feedback and suggestions
- Fields: feedback_type, subject, message, status, etc.

## Error Handling

The application includes comprehensive error handling:

- **404 Errors**: Custom 404 page for missing routes
- **500 Errors**: Custom 500 page for server errors
- **413 Errors**: File size limit exceeded
- **HTTP Exceptions**: Standardized error responses
- **Database Errors**: Rollback and error logging
- **API Errors**: JSON error responses with status codes

## Logging

Application logs are written to:
- Console output (development)
- `disastersense.log` file (production)

Log levels: INFO, WARNING, ERROR

## File Upload

- **Supported formats**: PNG, JPG, JPEG, GIF, MP4, MOV, AVI
- **Maximum size**: 25MB per file
- **Storage location**: `uploads/` directory
- **Security**: Filename sanitization and validation

## Email Notifications

- **SMTP Configuration**: Gmail, Outlook, or custom SMTP
- **Templates**: Plain text and HTML email support
- **Notifications**: Incident confirmations, newsletter subscriptions

## Security Features

- **CSRF Protection**: Flask-WTF integration
- **File Validation**: Secure filename handling
- **Input Validation**: Email format, coordinate validation
- **SQL Injection Prevention**: SQLAlchemy ORM
- **XSS Protection**: Template auto-escaping

## Development

### Adding New Features

1. **Database Models**: Add to `models.py`
2. **API Endpoints**: Add to `app.py`
3. **Utility Functions**: Add to `utils.py`
4. **Configuration**: Update `config.py`

### Database Migrations

```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade
```

### Testing

```bash
# Run tests (when implemented)
python -m pytest tests/
```

## Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Heroku

1. Create `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. Deploy:
   ```bash
   git push heroku main
   ```

### AWS/GCP/Azure

- Use managed database services (RDS, Cloud SQL, etc.)
- Configure environment variables
- Use application load balancers
- Enable HTTPS/SSL

## Monitoring

### Health Checks

- **Endpoint**: `/health`
- **Checks**: Database connectivity, application status
- **Response**: JSON with status and timestamp

### Logging

- **File**: `disastersense.log`
- **Format**: Timestamp, level, message
- **Rotation**: Configure with logrotate

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@disastersense.org
- Issues: GitHub Issues
- Documentation: This README

## Changelog

### Version 1.0.0
- Initial release
- Incident reporting system
- Emergency kit planner
- Weather alerts integration
- Safe spot finder
- Newsletter management
- File upload support
- RESTful API
- Database models
- Error handling
- Email notifications
