"""
Database models for DisasterSense Flask application
"""

from datetime import datetime
from app import db
import uuid

class IncidentReport(db.Model):
    """Model for incident reports submitted by users"""
    __tablename__ = 'incident_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), nullable=False, index=True)
    incident_type = db.Column(db.String(50), nullable=False, index=True)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    datetime_occurred = db.Column(db.DateTime, nullable=True)
    description = db.Column(db.Text, nullable=False)
    media_files = db.Column(db.JSON, nullable=True)  # Store file paths as JSON
    consent = db.Column(db.Boolean, nullable=False, default=False)
    status = db.Column(db.String(20), default='pending', index=True)  # pending, verified, resolved
    priority = db.Column(db.String(10), default='medium')  # low, medium, high, critical
    assigned_to = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
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
            'media_files': self.media_files or [],
            'consent': self.consent,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<IncidentReport {self.report_id}: {self.incident_type}>'

class NewsletterSubscription(db.Model):
    """Model for newsletter subscriptions"""
    __tablename__ = 'newsletter_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=True)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    unsubscribe_token = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    last_email_sent = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'subscribed_at': self.subscribed_at.isoformat(),
            'is_active': self.is_active,
            'last_email_sent': self.last_email_sent.isoformat() if self.last_email_sent else None
        }
    
    def __repr__(self):
        return f'<NewsletterSubscription {self.email}>'

class EmergencyKit(db.Model):
    """Model for emergency kit configurations"""
    __tablename__ = 'emergency_kits'
    
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_email = db.Column(db.String(120), nullable=True, index=True)
    family_size = db.Column(db.Integer, nullable=False)
    adults = db.Column(db.Integer, nullable=False)
    children = db.Column(db.Integer, nullable=False)
    seniors = db.Column(db.Integer, nullable=False)
    has_medical_conditions = db.Column(db.Boolean, default=False)
    has_disabilities = db.Column(db.Boolean, default=False)
    has_pets = db.Column(db.Boolean, default=False)
    kit_duration = db.Column(db.Integer, nullable=False)  # days
    budget_range = db.Column(db.String(20), nullable=False)
    disaster_type = db.Column(db.String(50), nullable=False, index=True)
    kit_items = db.Column(db.JSON, nullable=True)  # Store kit configuration as JSON
    is_public = db.Column(db.Boolean, default=False)  # Allow sharing of kit configurations
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'kit_id': self.kit_id,
            'user_email': self.user_email,
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
            'kit_items': self.kit_items or {},
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<EmergencyKit {self.kit_id}: {self.disaster_type}>'

class WeatherAlert(db.Model):
    """Model for weather alerts and warnings"""
    __tablename__ = 'weather_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    alert_type = db.Column(db.String(50), nullable=False, index=True)  # flood, cyclone, heatwave, etc.
    severity = db.Column(db.String(20), nullable=False, index=True)  # low, moderate, high, extreme
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200), nullable=False, index=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    radius_km = db.Column(db.Float, nullable=True)  # Alert radius in kilometers
    valid_from = db.Column(db.DateTime, nullable=False, index=True)
    valid_until = db.Column(db.DateTime, nullable=False, index=True)
    source = db.Column(db.String(100), nullable=False)  # IMD, NDMA, etc.
    external_id = db.Column(db.String(100), nullable=True)  # External alert ID
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'alert_id': self.alert_id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'radius_km': self.radius_km,
            'valid_from': self.valid_from.isoformat(),
            'valid_until': self.valid_until.isoformat(),
            'source': self.source,
            'external_id': self.external_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<WeatherAlert {self.alert_id}: {self.alert_type}>'

class SafeSpot(db.Model):
    """Model for safe evacuation spots"""
    __tablename__ = 'safe_spots'
    
    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    spot_type = db.Column(db.String(50), nullable=False, index=True)  # shelter, open_space, hospital, etc.
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)
    address = db.Column(db.String(300), nullable=True)
    capacity = db.Column(db.Integer, nullable=True)
    facilities = db.Column(db.JSON, nullable=True)  # List of available facilities
    contact_number = db.Column(db.String(20), nullable=True)
    is_accessible = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    disaster_types = db.Column(db.JSON, nullable=True)  # Which disasters this spot is suitable for
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'spot_id': self.spot_id,
            'name': self.name,
            'spot_type': self.spot_type,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'capacity': self.capacity,
            'facilities': self.facilities or [],
            'contact_number': self.contact_number,
            'is_accessible': self.is_accessible,
            'is_verified': self.is_verified,
            'disaster_types': self.disaster_types or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<SafeSpot {self.spot_id}: {self.name}>'

class UserFeedback(db.Model):
    """Model for user feedback and suggestions"""
    __tablename__ = 'user_feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    feedback_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_email = db.Column(db.String(120), nullable=True)
    feedback_type = db.Column(db.String(50), nullable=False, index=True)  # bug_report, feature_request, general
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    page_url = db.Column(db.String(500), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='new', index=True)  # new, in_review, resolved, closed
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    assigned_to = db.Column(db.String(100), nullable=True)
    response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'feedback_id': self.feedback_id,
            'user_email': self.user_email,
            'feedback_type': self.feedback_type,
            'subject': self.subject,
            'message': self.message,
            'page_url': self.page_url,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'response': self.response,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<UserFeedback {self.feedback_id}: {self.feedback_type}>'
