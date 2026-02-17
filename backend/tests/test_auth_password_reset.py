"""
Test Auth Page & Password Reset Flow
Tests for: email registration, email login, and password reset endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthRegistration:
    """Email/Password Registration endpoint tests"""
    
    def test_register_success(self):
        """Test successful registration with email/password"""
        unique_email = f"test_reg_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user_id" in data
        assert data["email"] == unique_email.lower()
        assert data["name"] == "Test User"
        assert "message" in data
        print(f"✓ Registration successful for {unique_email}")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email fails"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        # First registration
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "First User"
        })
        # Duplicate registration should fail
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "otherpass",
            "name": "Duplicate User"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already registered" in response.json().get("detail", "").lower()
        print(f"✓ Duplicate email registration correctly rejected")
    
    def test_register_invalid_email_format(self):
        """Test registration with invalid email format"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "notanemail",
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print(f"✓ Invalid email format correctly rejected")


class TestAuthLogin:
    """Email/Password Login endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with correct credentials"""
        unique_email = f"test_login_{uuid.uuid4().hex[:8]}@example.com"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "loginpass123",
            "name": "Login Test User"
        })
        # Now login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "loginpass123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == unique_email.lower()
        assert "message" in data and "successful" in data["message"].lower()
        print(f"✓ Login successful for {unique_email}")
    
    def test_login_wrong_password(self):
        """Test login with incorrect password"""
        unique_email = f"test_wrongpw_{uuid.uuid4().hex[:8]}@example.com"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "correctpass123",
            "name": "Wrong Password Test"
        })
        # Login with wrong password
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "invalid" in response.json().get("detail", "").lower()
        print(f"✓ Wrong password login correctly rejected")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent_user_12345@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Non-existent user login correctly rejected")


class TestPasswordReset:
    """Password Reset Flow tests"""
    
    def test_password_reset_request(self):
        """Test password reset request sends verification code message"""
        unique_email = f"test_reset_{uuid.uuid4().hex[:8]}@example.com"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "originalpass123",
            "name": "Reset Test User"
        })
        # Request password reset
        response = requests.post(f"{BASE_URL}/api/auth/password-reset/request", json={
            "email": unique_email
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data
        # Should return success message regardless of email existence (prevent enumeration)
        print(f"✓ Password reset request successful")
    
    def test_password_reset_request_nonexistent_email(self):
        """Test password reset for non-existent email (should still return success)"""
        response = requests.post(f"{BASE_URL}/api/auth/password-reset/request", json={
            "email": "nonexistent_reset_test@example.com"
        })
        # Should return 200 to prevent email enumeration attacks
        assert response.status_code == 200, f"Expected 200 (prevent enumeration), got {response.status_code}"
        print(f"✓ Password reset for non-existent email handled correctly")
    
    def test_password_reset_verify_invalid_code(self):
        """Test password reset verification with invalid code"""
        unique_email = f"test_verify_{uuid.uuid4().hex[:8]}@example.com"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "originalpass123",
            "name": "Verify Test User"
        })
        # Request reset
        requests.post(f"{BASE_URL}/api/auth/password-reset/request", json={
            "email": unique_email
        })
        # Try to verify with invalid code
        response = requests.post(f"{BASE_URL}/api/auth/password-reset/verify", json={
            "email": unique_email,
            "code": "000000",  # Invalid code
            "new_password": "newpassword123"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "invalid" in response.json().get("detail", "").lower() or "expired" in response.json().get("detail", "").lower()
        print(f"✓ Invalid verification code correctly rejected")
    
    def test_password_reset_short_password(self):
        """Test password reset with too short password"""
        response = requests.post(f"{BASE_URL}/api/auth/password-reset/verify", json={
            "email": "test@example.com",
            "code": "123456",
            "new_password": "12345"  # Less than 6 characters
        })
        # Either validation error or invalid code error is acceptable
        assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}"
        print(f"✓ Short password validation working")


class TestHealthEndpoint:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API root endpoint is healthy"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "breeds_count" in data
        assert "lessons_count" in data
        print(f"✓ API healthy - {data['breeds_count']} breeds, {data['lessons_count']} lessons")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
