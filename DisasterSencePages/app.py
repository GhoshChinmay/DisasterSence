"""
DisasterSense Flask Backend
A comprehensive disaster management platform with AI-powered predictions and community reporting.
"""

import os
import logging
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file, abort
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('disastersense.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///disastersense.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25MB max file size

# Email configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# Database Models
class IncidentReport(db.Model):
    """Model for incident reports submitted by users"""
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), nullable=False)
    incident_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    datetime_occurred = db.Column(db.DateTime, nullable=True)
    description = db.Column(db.Text, nullable=False)
    media_files = db.Column(db.JSON, nullable=True)  # Store file paths as JSON
    consent = db.Column(db.Boolean, nullable=False, default=False)
    status = db.Column(db.String(20), default='pending')  # pending, verified, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'email': self.email,
            'incident_type': self.incident_type,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'datetime_occurred': self.datetime_occurred.isoformat() if self.datetime_occurred else None,
            'description': self.description,
            'media_files': self.media_files,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class NewsletterSubscription(db.Model):
    """Model for newsletter subscriptions"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'subscribed_at': self.subscribed_at.isoformat(),
            'is_active': self.is_active
        }

class EmergencyKit(db.Model):
    """Model for emergency kit configurations"""
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    family_size = db.Column(db.Integer, nullable=False)
    adults = db.Column(db.Integer, nullable=False)
    children = db.Column(db.Integer, nullable=False)
    seniors = db.Column(db.Integer, nullable=False)
    has_medical_conditions = db.Column(db.Boolean, default=False)
    has_disabilities = db.Column(db.Boolean, default=False)
    has_pets = db.Column(db.Boolean, default=False)
    kit_duration = db.Column(db.Integer, nullable=False)  # days
    budget_range = db.Column(db.String(20), nullable=False)
    disaster_type = db.Column(db.String(50), nullable=False)
    kit_items = db.Column(db.JSON, nullable=True)  # Store kit configuration as JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'kit_id': self.kit_id,
            'family_size': self.family_size,
            'adults': self.adults,
            'children': self.children,
            'seniors': self.seniors,
            'has_medical_conditions': self.has_medical_conditions,
            'has_disabilities': self.has_disabilities,
            'has_pets': self.has_pets,
            'kit_duration': self.kit_duration,
            'budget_range': self.budget_range,
            'disaster_type': self.disaster_type,
            'kit_items': self.kit_items,
            'created_at': self.created_at.isoformat()
        }

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    logger.warning(f"404 error: {request.url}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {error}")
    db.session.rollback()
    return render_template('500.html'), 500

@app.errorhandler(413)
def too_large(error):
    logger.warning(f"File too large: {request.url}")
    return jsonify({'error': 'File too large. Maximum size is 25MB.'}), 413

@app.errorhandler(HTTPException)
def handle_exception(e):
    logger.error(f"HTTP error {e.code}: {e.description}")
    return jsonify({'error': e.description}), e.code

# Utility Functions
def send_email(to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
    """Send email notification"""
    try:
        if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
            logger.warning("Email credentials not configured")
            return False
            
        msg = MIMEMultipart()
        msg['From'] = app.config['MAIL_USERNAME']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.starttls()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_files(files) -> List[str]:
    """Save uploaded files and return list of file paths"""
    saved_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            saved_files.append(filename)
            logger.info(f"File saved: {filename}")
    return saved_files

# Main Routes
@app.route('/')
def index():
    """Home page"""
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering index page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/prepare.html')
def prepare():
    """Prepare page - renders the prepare.html template"""
    try:
        return render_template('prepare.html')
    except Exception as e:
        logger.error(f"Error rendering prepare page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/kit.html')
def kit():
    """Emergency kit planner page"""
    try:
        return render_template('kit.html')
    except Exception as e:
        logger.error(f"Error rendering kit page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/maps.html')
def maps():
    """Evacuation maps page"""
    try:
        return render_template('maps.html')
    except Exception as e:
        logger.error(f"Error rendering maps page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/SOS.html')
def sos():
    """SOS emergency page"""
    try:
        return render_template('SOS.html')
    except Exception as e:
        logger.error(f"Error rendering SOS page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/dashboard.html')
def dashboard():
    """Dashboard page"""
    try:
        return render_template('dashboard.html')
    except Exception as e:
        logger.error(f"Error rendering dashboard page: {str(e)}")
        return render_template('500.html'), 500

@app.route('/users.html')
def users():
    """Users management page"""
    try:
        return render_template('users.html')
    except Exception as e:
        logger.error(f"Error rendering users page: {str(e)}")
        return render_template('500.html'), 500

# API Routes
@app.route('/api/incident-report', methods=['POST'])
def submit_incident_report():
    """Submit incident report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'incident_type', 'location', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if '@' not in data['email']:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Create incident report
        incident = IncidentReport(
            email=data['email'],
            incident_type=data['incident_type'],
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            datetime_occurred=datetime.fromisoformat(data['datetime']) if data.get('datetime') else None,
            description=data['description'],
            consent=data.get('consent', False)
        )
        
        db.session.add(incident)
        db.session.commit()
        
        # Send confirmation email
        email_body = f"""
        Thank you for reporting the incident. Your report has been received and assigned ID: {incident.report_id}
        
        Incident Details:
        - Type: {incident.incident_type}
        - Location: {incident.location}
        - Description: {incident.description}
        - Status: {incident.status}
        
        We will review your report and contact you if additional information is needed.
        
        Stay safe,
        DisasterSense Team
        """
        
        send_email(incident.email, "Incident Report Confirmation", email_body)
        
        logger.info(f"Incident report submitted: {incident.report_id}")
        return jsonify({
            'success': True,
            'report_id': incident.report_id,
            'message': 'Incident report submitted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error submitting incident report: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit incident report'}), 500

@app.route('/api/newsletter', methods=['POST'])
def subscribe_newsletter():
    """Subscribe to newsletter"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email or '@' not in email:
            return jsonify({'error': 'Valid email is required'}), 400
        
        # Check if already subscribed
        existing = NewsletterSubscription.query.filter_by(email=email).first()
        if existing:
            if existing.is_active:
                return jsonify({'error': 'Email already subscribed'}), 400
            else:
                existing.is_active = True
                existing.subscribed_at = datetime.utcnow()
        else:
            subscription = NewsletterSubscription(email=email)
            db.session.add(subscription)
        
        db.session.commit()
        
        logger.info(f"Newsletter subscription: {email}")
        return jsonify({'success': True, 'message': 'Successfully subscribed to newsletter'})
        
    except Exception as e:
        logger.error(f"Error subscribing to newsletter: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to subscribe to newsletter'}), 500

@app.route('/api/emergency-kit', methods=['POST'])
def generate_emergency_kit():
    """Generate emergency kit configuration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['family_size', 'adults', 'children', 'seniors', 'kit_duration', 'budget_range', 'disaster_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate kit items based on parameters
        kit_items = generate_kit_items(
            disaster_type=data['disaster_type'],
            family_size=data['family_size'],
            adults=data['adults'],
            children=data['children'],
            seniors=data['seniors'],
            has_medical=data.get('has_medical_conditions', False),
            has_disabilities=data.get('has_disabilities', False),
            has_pets=data.get('has_pets', False),
            duration=data['kit_duration'],
            budget=data['budget_range']
        )
        
        # Save kit configuration
        kit = EmergencyKit(
            family_size=data['family_size'],
            adults=data['adults'],
            children=data['children'],
            seniors=data['seniors'],
            has_medical_conditions=data.get('has_medical_conditions', False),
            has_disabilities=data.get('has_disabilities', False),
            has_pets=data.get('has_pets', False),
            kit_duration=data['kit_duration'],
            budget_range=data['budget_range'],
            disaster_type=data['disaster_type'],
            kit_items=kit_items
        )
        
        db.session.add(kit)
        db.session.commit()
        
        logger.info(f"Emergency kit generated: {kit.kit_id}")
        return jsonify({
            'success': True,
            'kit_id': kit.kit_id,
            'kit_items': kit_items,
            'message': 'Emergency kit generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error generating emergency kit: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to generate emergency kit'}), 500

def generate_kit_items(disaster_type: str, family_size: int, adults: int, children: int, 
                      seniors: int, has_medical: bool, has_disabilities: bool, 
                      has_pets: bool, duration: int, budget: str) -> Dict[str, Any]:
    """Generate emergency kit items based on parameters"""
    
    # Base items for all disasters
    base_items = {
        'water': {'quantity': f"{family_size * duration * 4} liters", 'priority': 'high'},
        'food': {'quantity': f"{family_size * duration * 3} meals", 'priority': 'high'},
        'first_aid_kit': {'quantity': '1', 'priority': 'high'},
        'flashlight': {'quantity': f"{family_size}", 'priority': 'high'},
        'batteries': {'quantity': '20+', 'priority': 'high'},
        'radio': {'quantity': '1', 'priority': 'medium'},
        'whistle': {'quantity': f"{family_size}", 'priority': 'medium'},
        'blankets': {'quantity': f"{family_size}", 'priority': 'medium'},
        'important_documents': {'quantity': '1 set', 'priority': 'high'},
        'cash': {'quantity': '₹5000+', 'priority': 'high'}
    }
    
    # Disaster-specific items
    disaster_items = {
        'Flood': {
            'water_purification_tablets': {'quantity': '50+', 'priority': 'high'},
            'waterproof_bags': {'quantity': f"{family_size}", 'priority': 'high'},
            'life_jackets': {'quantity': f"{family_size}", 'priority': 'high'},
            'sandbags': {'quantity': '20+', 'priority': 'medium'}
        },
        'Earthquake': {
            'hard_hats': {'quantity': f"{family_size}", 'priority': 'high'},
            'work_gloves': {'quantity': f"{family_size * 2}", 'priority': 'medium'},
            'crowbar': {'quantity': '1', 'priority': 'medium'},
            'dust_masks': {'quantity': f"{family_size * 5}", 'priority': 'high'}
        },
        'Cyclone': {
            'tarps': {'quantity': '2+', 'priority': 'high'},
            'rope': {'quantity': '50+ meters', 'priority': 'medium'},
            'duct_tape': {'quantity': '5+ rolls', 'priority': 'medium'},
            'emergency_shelter': {'quantity': '1', 'priority': 'high'}
        },
        'Landslide': {
            'emergency_shovel': {'quantity': '1', 'priority': 'high'},
            'walkie_talkies': {'quantity': '2+', 'priority': 'medium'},
            'emergency_blanket': {'quantity': f"{family_size}", 'priority': 'high'}
        }
    }
    
    # Special needs items
    special_items = {}
    if has_medical:
        special_items.update({
            'prescription_medications': {'quantity': '7+ days supply', 'priority': 'high'},
            'medical_equipment': {'quantity': 'As needed', 'priority': 'high'},
            'medical_records': {'quantity': '1 copy', 'priority': 'high'}
        })
    
    if has_disabilities:
        special_items.update({
            'assistive_devices': {'quantity': 'As needed', 'priority': 'high'},
            'communication_aids': {'quantity': 'As needed', 'priority': 'high'}
        })
    
    if has_pets:
        special_items.update({
            'pet_food': {'quantity': f"{duration * 2} days", 'priority': 'medium'},
            'pet_carrier': {'quantity': '1+', 'priority': 'medium'},
            'pet_medications': {'quantity': 'As needed', 'priority': 'medium'}
        })
    
    # Combine all items
    all_items = {**base_items, **disaster_items.get(disaster_type, {}), **special_items}
    
    # Calculate estimated cost based on budget
    cost_multipliers = {'basic': 1.0, 'standard': 1.5, 'premium': 2.0}
    multiplier = cost_multipliers.get(budget, 1.0)
    base_cost = family_size * duration * 500  # Base cost per person per day
    estimated_cost = int(base_cost * multiplier)
    
    return {
        'items': all_items,
        'estimated_cost': estimated_cost,
        'total_items': len(all_items),
        'high_priority_items': len([item for item in all_items.values() if item['priority'] == 'high']),
        'disaster_type': disaster_type,
        'family_size': family_size,
        'duration_days': duration
    }

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    """Get incident reports (admin endpoint)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = IncidentReport.query
        if status:
            query = query.filter_by(status=status)
        
        incidents = query.order_by(IncidentReport.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents.items],
            'total': incidents.total,
            'pages': incidents.pages,
            'current_page': page
        })
        
    except Exception as e:
        logger.error(f"Error fetching incidents: {str(e)}")
        return jsonify({'error': 'Failed to fetch incidents'}), 500

@app.route('/api/incidents/<report_id>', methods=['PUT'])
def update_incident_status(report_id):
    """Update incident status (admin endpoint)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'verified', 'resolved']:
            return jsonify({'error': 'Invalid status'}), 400
        
        incident = IncidentReport.query.filter_by(report_id=report_id).first()
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        incident.status = new_status
        incident.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Incident {report_id} status updated to {new_status}")
        return jsonify({'success': True, 'message': 'Status updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating incident status: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update status'}), 500

@app.route('/api/weather-alerts', methods=['GET'])
def get_weather_alerts():
    """Get weather alerts for the area"""
    try:
        # This would integrate with a weather API like OpenWeatherMap
        # For now, return mock data
        alerts = [
            {
                'id': 1,
                'type': 'flood_warning',
                'severity': 'moderate',
                'message': 'Heavy rainfall expected in next 24 hours. Ensure your emergency kit is ready!',
                'location': 'Mumbai, Maharashtra',
                'valid_until': (datetime.utcnow() + timedelta(hours=24)).isoformat()
            }
        ]
        
        return jsonify({'alerts': alerts})
        
    except Exception as e:
        logger.error(f"Error fetching weather alerts: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather alerts'}), 500

@app.route('/api/safe-spots', methods=['GET'])
def get_safe_spots():
    """Get safe spots for evacuation"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        disaster_type = request.args.get('disaster_type', 'earthquake')
        radius = request.args.get('radius', 5, type=int)  # km
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # This would integrate with OpenStreetMap Overpass API
        # For now, return mock data
        safe_spots = [
            {
                'id': 1,
                'name': 'Local Park',
                'type': 'open_space',
                'latitude': lat + 0.01,
                'longitude': lng + 0.01,
                'distance_km': 1.2,
                'capacity': 100,
                'facilities': ['shelter', 'water', 'toilets']
            },
            {
                'id': 2,
                'name': 'Community Center',
                'type': 'shelter',
                'latitude': lat - 0.01,
                'longitude': lng + 0.02,
                'distance_km': 2.1,
                'capacity': 200,
                'facilities': ['shelter', 'medical', 'food']
            }
        ]
        
        return jsonify({'safe_spots': safe_spots})
        
    except Exception as e:
        logger.error(f"Error fetching safe spots: {str(e)}")
        return jsonify({'error': 'Failed to fetch safe spots'}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected'
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

# Initialize database - happens in run.py now

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
