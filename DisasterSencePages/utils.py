"""
Utility functions for DisasterSense Flask application
"""

import os
import logging
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class EmailService:
    """Email service for sending notifications"""
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize email service with app configuration"""
        self.app = app
        self.mail_server = app.config.get('MAIL_SERVER', 'smtp.gmail.com')
        self.mail_port = app.config.get('MAIL_PORT', 587)
        self.mail_use_tls = app.config.get('MAIL_USE_TLS', True)
        self.mail_username = app.config.get('MAIL_USERNAME')
        self.mail_password = app.config.get('MAIL_PASSWORD')
    
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """Send email notification"""
        try:
            if not self.mail_username or not self.mail_password:
                logger.warning("Email credentials not configured")
                return False
            
            msg = MIMEMultipart()
            msg['From'] = self.mail_username
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.mail_server, self.mail_port)
            server.starttls()
            server.login(self.mail_username, self.mail_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

class WeatherService:
    """Weather service for fetching alerts and forecasts"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    def get_weather_alerts(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        """Get weather alerts for a location"""
        try:
            if not self.api_key:
                logger.warning("Weather API key not configured")
                return self._get_mock_alerts()
            
            # This would integrate with OpenWeatherMap API
            # For now, return mock data
            return self._get_mock_alerts()
        except Exception as e:
            logger.error(f"Error fetching weather alerts: {str(e)}")
            return []
    
    def _get_mock_alerts(self) -> List[Dict[str, Any]]:
        """Return mock weather alerts"""
        return [
            {
                'id': 1,
                'type': 'flood_warning',
                'severity': 'moderate',
                'title': 'Heavy Rainfall Warning',
                'message': 'Heavy rainfall expected in next 24 hours. Ensure your emergency kit is ready!',
                'location': 'Mumbai, Maharashtra',
                'valid_until': (datetime.utcnow() + timedelta(hours=24)).isoformat()
            }
        ]

class SafeSpotService:
    """Service for finding safe evacuation spots"""
    
    def __init__(self):
        self.overpass_url = "https://overpass-api.de/api/interpreter"
    
    def find_safe_spots(self, lat: float, lon: float, disaster_type: str, radius_km: int = 5) -> List[Dict[str, Any]]:
        """Find safe spots for evacuation based on disaster type"""
        try:
            # This would integrate with OpenStreetMap Overpass API
            # For now, return mock data
            return self._get_mock_safe_spots(lat, lon, disaster_type)
        except Exception as e:
            logger.error(f"Error finding safe spots: {str(e)}")
            return []
    
    def _get_mock_safe_spots(self, lat: float, lon: float, disaster_type: str) -> List[Dict[str, Any]]:
        """Return mock safe spots"""
        base_spots = [
            {
                'id': 1,
                'name': 'Local Park',
                'type': 'open_space',
                'latitude': lat + 0.01,
                'longitude': lon + 0.01,
                'distance_km': 1.2,
                'capacity': 100,
                'facilities': ['shelter', 'water', 'toilets']
            },
            {
                'id': 2,
                'name': 'Community Center',
                'type': 'shelter',
                'latitude': lat - 0.01,
                'longitude': lon + 0.02,
                'distance_km': 2.1,
                'capacity': 200,
                'facilities': ['shelter', 'medical', 'food']
            }
        ]
        
        # Filter spots based on disaster type
        if disaster_type == 'earthquake':
            return [spot for spot in base_spots if spot['type'] == 'open_space']
        elif disaster_type == 'flood':
            return [spot for spot in base_spots if spot['type'] in ['shelter', 'open_space']]
        else:
            return base_spots

class FileService:
    """Service for handling file uploads and management"""
    
    def __init__(self, upload_folder: str, allowed_extensions: set):
        self.upload_folder = upload_folder
        self.allowed_extensions = allowed_extensions
        os.makedirs(upload_folder, exist_ok=True)
    
    def allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_uploaded_files(self, files) -> List[str]:
        """Save uploaded files and return list of file paths"""
        saved_files = []
        for file in files:
            if file and self.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to avoid conflicts
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                filepath = os.path.join(self.upload_folder, filename)
                file.save(filepath)
                saved_files.append(filename)
                logger.info(f"File saved: {filename}")
        return saved_files
    
    def delete_file(self, filename: str) -> bool:
        """Delete a file from the upload folder"""
        try:
            filepath = os.path.join(self.upload_folder, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"File deleted: {filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {str(e)}")
            return False

class EmergencyKitGenerator:
    """Service for generating emergency kit configurations"""
    
    def __init__(self):
        self.base_items = {
            'water': {'quantity_per_person_per_day': 4, 'unit': 'liters', 'priority': 'high'},
            'food': {'quantity_per_person_per_day': 3, 'unit': 'meals', 'priority': 'high'},
            'first_aid_kit': {'quantity': 1, 'unit': 'kit', 'priority': 'high'},
            'flashlight': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'high'},
            'batteries': {'quantity': 20, 'unit': 'pieces', 'priority': 'high'},
            'radio': {'quantity': 1, 'unit': 'piece', 'priority': 'medium'},
            'whistle': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'medium'},
            'blankets': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'medium'},
            'important_documents': {'quantity': 1, 'unit': 'set', 'priority': 'high'},
            'cash': {'quantity': 5000, 'unit': 'rupees', 'priority': 'high'}
        }
        
        self.disaster_specific_items = {
            'Flood': {
                'water_purification_tablets': {'quantity': 50, 'unit': 'tablets', 'priority': 'high'},
                'waterproof_bags': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'high'},
                'life_jackets': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'high'},
                'sandbags': {'quantity': 20, 'unit': 'bags', 'priority': 'medium'}
            },
            'Earthquake': {
                'hard_hats': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'high'},
                'work_gloves': {'quantity_per_person': 2, 'unit': 'pairs', 'priority': 'medium'},
                'crowbar': {'quantity': 1, 'unit': 'piece', 'priority': 'medium'},
                'dust_masks': {'quantity_per_person': 5, 'unit': 'pieces', 'priority': 'high'}
            },
            'Cyclone': {
                'tarps': {'quantity': 2, 'unit': 'pieces', 'priority': 'high'},
                'rope': {'quantity': 50, 'unit': 'meters', 'priority': 'medium'},
                'duct_tape': {'quantity': 5, 'unit': 'rolls', 'priority': 'medium'},
                'emergency_shelter': {'quantity': 1, 'unit': 'piece', 'priority': 'high'}
            },
            'Landslide': {
                'emergency_shovel': {'quantity': 1, 'unit': 'piece', 'priority': 'high'},
                'walkie_talkies': {'quantity': 2, 'unit': 'pairs', 'priority': 'medium'},
                'emergency_blanket': {'quantity_per_person': 1, 'unit': 'piece', 'priority': 'high'}
            }
        }
    
    def generate_kit(self, disaster_type: str, family_size: int, adults: int, 
                    children: int, seniors: int, has_medical: bool, 
                    has_disabilities: bool, has_pets: bool, duration: int, 
                    budget: str) -> Dict[str, Any]:
        """Generate emergency kit configuration"""
        
        # Calculate quantities for base items
        kit_items = {}
        for item_name, item_config in self.base_items.items():
            if 'quantity_per_person_per_day' in item_config:
                quantity = item_config['quantity_per_person_per_day'] * family_size * duration
            elif 'quantity_per_person' in item_config:
                quantity = item_config['quantity_per_person'] * family_size
            else:
                quantity = item_config['quantity']
            
            kit_items[item_name] = {
                'quantity': f"{quantity} {item_config['unit']}",
                'priority': item_config['priority']
            }
        
        # Add disaster-specific items
        if disaster_type in self.disaster_specific_items:
            for item_name, item_config in self.disaster_specific_items[disaster_type].items():
                if 'quantity_per_person' in item_config:
                    quantity = item_config['quantity_per_person'] * family_size
                else:
                    quantity = item_config['quantity']
                
                kit_items[item_name] = {
                    'quantity': f"{quantity} {item_config['unit']}",
                    'priority': item_config['priority']
                }
        
        # Add special needs items
        if has_medical:
            kit_items.update({
                'prescription_medications': {'quantity': f"{duration + 3} days supply", 'priority': 'high'},
                'medical_equipment': {'quantity': 'As needed', 'priority': 'high'},
                'medical_records': {'quantity': '1 copy', 'priority': 'high'}
            })
        
        if has_disabilities:
            kit_items.update({
                'assistive_devices': {'quantity': 'As needed', 'priority': 'high'},
                'communication_aids': {'quantity': 'As needed', 'priority': 'high'}
            })
        
        if has_pets:
            kit_items.update({
                'pet_food': {'quantity': f"{duration * 2} days", 'priority': 'medium'},
                'pet_carrier': {'quantity': '1+', 'priority': 'medium'},
                'pet_medications': {'quantity': 'As needed', 'priority': 'medium'}
            })
        
        # Calculate estimated cost
        cost_multipliers = {'basic': 1.0, 'standard': 1.5, 'premium': 2.0}
        multiplier = cost_multipliers.get(budget, 1.0)
        base_cost = family_size * duration * 500  # Base cost per person per day
        estimated_cost = int(base_cost * multiplier)
        
        return {
            'items': kit_items,
            'estimated_cost': estimated_cost,
            'total_items': len(kit_items),
            'high_priority_items': len([item for item in kit_items.values() if item['priority'] == 'high']),
            'disaster_type': disaster_type,
            'family_size': family_size,
            'duration_days': duration,
            'budget_range': budget
        }

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_coordinates(lat: float, lon: float) -> bool:
    """Validate latitude and longitude coordinates"""
    return -90 <= lat <= 90 and -180 <= lon <= 180

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers"""
    from math import radians, cos, sin, asin, sqrt
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r

def format_datetime(dt: datetime) -> str:
    """Format datetime for display"""
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def get_priority_color(priority: str) -> str:
    """Get color code for priority level"""
    colors = {
        'low': '#10b981',      # green
        'medium': '#f59e0b',   # yellow
        'high': '#ef4444',     # red
        'critical': '#7c2d12'  # dark red
    }
    return colors.get(priority, '#6b7280')  # gray as default

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace dangerous characters
    dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for char in dangerous_chars:
        filename = filename.replace(char, '_')
    return filename

def generate_report_id() -> str:
    """Generate unique report ID"""
    import uuid
    return str(uuid.uuid4())

def log_api_call(endpoint: str, method: str, status_code: int, response_time: float):
    """Log API call details"""
    logger.info(f"API Call: {method} {endpoint} - Status: {status_code} - Time: {response_time:.3f}s")

def create_error_response(message: str, status_code: int = 400) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        'error': message,
        'status_code': status_code,
        'timestamp': datetime.utcnow().isoformat()
    }

def create_success_response(message: str, data: Any = None) -> Dict[str, Any]:
    """Create standardized success response"""
    response = {
        'success': True,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    if data is not None:
        response['data'] = data
    return response
