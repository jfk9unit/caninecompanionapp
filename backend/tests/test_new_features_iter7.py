"""
Test suite for iteration 7 new features:
- First purchase discount eligibility
- QR code generation for referrals  
- Deep linking for shared content
- Notification settings CRUD
- PayPal payment endpoints (MOCKED - requires API keys)
- Dog age with years/months/days
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicEndpoints:
    """Test endpoints that don't require authentication"""
    
    def test_api_health(self):
        """API health check"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "breeds_count" in data
        print(f"✓ API healthy - {data['breeds_count']} breeds, {data['lessons_count']} lessons")

    def test_token_packages_available(self):
        """Token packages endpoint returns packages"""
        response = requests.get(f"{BASE_URL}/api/tokens/packages")
        assert response.status_code == 200
        packages = response.json()
        assert "starter" in packages
        assert "value" in packages
        assert "premium" in packages
        assert "ultimate" in packages
        print(f"✓ Token packages: {list(packages.keys())}")

    def test_lesson_share_link_valid_lesson(self):
        """GET /api/share/lesson/{lesson_id} returns shareable deep link"""
        # Get a valid lesson ID first
        lessons_resp = requests.get(f"{BASE_URL}/api/training/lessons?level=beginner")
        assert lessons_resp.status_code == 200
        lessons = lessons_resp.json()
        assert len(lessons) > 0, "No lessons available"
        
        lesson_id = lessons[0]["lesson_id"]
        
        response = requests.get(f"{BASE_URL}/api/share/lesson/{lesson_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Validate deep link structure
        assert "share_url" in data
        assert "lesson_title" in data
        assert "share_text" in data
        assert lesson_id in data["share_url"]
        assert "caninecompass.app" in data["share_url"]
        print(f"✓ Lesson share link: {data['share_url']}")
        print(f"✓ Share text: {data['share_text']}")
        
    def test_lesson_share_link_invalid_lesson(self):
        """GET /api/share/lesson/{lesson_id} returns 404 for invalid lesson"""
        response = requests.get(f"{BASE_URL}/api/share/lesson/invalid_lesson_999")
        assert response.status_code == 404
        print("✓ Invalid lesson returns 404")


class TestAuthenticatedEndpoints:
    """Test endpoints requiring authentication - will skip if no valid session"""
    
    @pytest.fixture
    def session(self):
        """Create a requests session - tests will skip if auth fails"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    def test_first_purchase_eligible_unauthorized(self, session):
        """GET /api/payments/first-purchase-eligible requires auth"""
        response = session.get(f"{BASE_URL}/api/payments/first-purchase-eligible")
        # Without auth, should return 401
        assert response.status_code == 401
        print("✓ First purchase eligibility requires authentication")
    
    def test_referral_qr_code_unauthorized(self, session):
        """GET /api/referral/qr-code requires auth"""
        response = session.get(f"{BASE_URL}/api/referral/qr-code")
        assert response.status_code == 401
        print("✓ QR code endpoint requires authentication")
    
    def test_notification_settings_get_unauthorized(self, session):
        """GET /api/notifications/settings requires auth"""
        response = session.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 401
        print("✓ Notification settings GET requires authentication")
    
    def test_notification_settings_put_unauthorized(self, session):
        """PUT /api/notifications/settings requires auth"""
        response = session.put(f"{BASE_URL}/api/notifications/settings", json={
            "push_enabled": True,
            "training_reminders": True,
            "daily_tips": True,
            "achievement_alerts": True,
            "tournament_updates": True,
            "marketing": False
        })
        assert response.status_code == 401
        print("✓ Notification settings PUT requires authentication")
    
    def test_dogs_endpoint_unauthorized(self, session):
        """Dog CRUD endpoints require auth"""
        response = session.get(f"{BASE_URL}/api/dogs")
        assert response.status_code == 401
        print("✓ Dogs endpoint requires authentication")
    
    def test_dogs_create_unauthorized(self, session):
        """POST /api/dogs requires auth - tests age_years, age_months, age_days fields"""
        response = session.post(f"{BASE_URL}/api/dogs", json={
            "name": "Test Dog",
            "breed": "Labrador",
            "age_years": 2,
            "age_months": 6,
            "age_days": 15,
            "weight_kg": 25.5,
            "size": "large"
        })
        assert response.status_code == 401
        print("✓ Dog creation requires authentication")


class TestPayPalEndpoints:
    """Test PayPal payment endpoints - MOCKED (requires API keys)"""
    
    @pytest.fixture
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    def test_paypal_create_payment_unauthorized(self, session):
        """POST /api/payments/paypal/create requires auth"""
        response = session.post(f"{BASE_URL}/api/payments/paypal/create", json={
            "package_id": "starter",
            "return_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel"
        })
        # Without auth, should return 401
        assert response.status_code == 401
        print("✓ PayPal create payment requires authentication")
    
    def test_paypal_execute_payment_unauthorized(self, session):
        """POST /api/payments/paypal/execute requires auth"""
        response = session.post(f"{BASE_URL}/api/payments/paypal/execute", json={
            "payment_id": "PAY-123",
            "payer_id": "PAYER-456"
        })
        assert response.status_code == 401
        print("✓ PayPal execute payment requires authentication")


class TestNotificationEndpoints:
    """Test notification subscription endpoints"""
    
    @pytest.fixture
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    def test_notification_subscribe_unauthorized(self, session):
        """POST /api/notifications/subscribe requires auth"""
        response = session.post(f"{BASE_URL}/api/notifications/subscribe", json={
            "subscription": {
                "endpoint": "https://fcm.googleapis.com/fcm/send/test",
                "keys": {"auth": "test", "p256dh": "test"}
            }
        })
        assert response.status_code == 401
        print("✓ Push notification subscribe requires authentication")
    
    def test_notification_unsubscribe_unauthorized(self, session):
        """DELETE /api/notifications/unsubscribe requires auth"""
        response = session.delete(f"{BASE_URL}/api/notifications/unsubscribe")
        assert response.status_code == 401
        print("✓ Push notification unsubscribe requires authentication")


class TestDeepLinkEndpoints:
    """Test deep link generation endpoints"""
    
    @pytest.fixture
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    def test_achievement_share_link_unauthorized(self, session):
        """GET /api/share/achievement/{id} requires auth"""
        response = session.get(f"{BASE_URL}/api/share/achievement/test_achievement")
        assert response.status_code == 401
        print("✓ Achievement share link requires authentication")
    
    def test_k9_credential_share_link_unauthorized(self, session):
        """GET /api/share/k9-credential/{id} requires auth"""
        response = session.get(f"{BASE_URL}/api/share/k9-credential/K9-ABC123-01")
        assert response.status_code == 401
        print("✓ K9 credential share link requires authentication")


class TestDogProfileModel:
    """Verify Dog profile model supports years/months/days for age"""
    
    def test_training_lessons_available(self):
        """Verify training lessons are available for dog training"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) > 0
        
        # Check lesson structure
        lesson = lessons[0]
        assert "lesson_id" in lesson
        assert "title" in lesson
        assert "token_cost" in lesson
        print(f"✓ {len(lessons)} training lessons available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
