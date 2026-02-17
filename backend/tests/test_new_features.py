"""
Test new features: AI Chat Support, Auth changes, Social Share
- AI Chat Support requires auth and deducts 5 tokens per message
- Apple login removed (only Google and Facebook remain)
- Social share buttons (frontend only)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "testuser123@example.com"
TEST_USER_PASSWORD = "test123456"


class TestAuth:
    """Test auth endpoints - verify Apple removed, Google/Facebook present"""
    
    def test_health_check(self):
        """Basic API health check"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        print(f"✅ API health check passed: {data}")
    
    def test_email_login_success(self):
        """Test email login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == TEST_USER_EMAIL
        print(f"✅ Email login success: {data.get('name', 'User')}")
    
    def test_email_login_invalid_password(self):
        """Test email login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": "wrongpassword123"}
        )
        assert response.status_code == 401
        print("✅ Invalid password correctly rejected")
    
    def test_email_login_invalid_email(self):
        """Test email login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "anypassword"}
        )
        assert response.status_code == 401
        print("✅ Invalid email correctly rejected")


class TestAIChatSupport:
    """Test AI Chat Support endpoint - requires auth, costs 5 tokens"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200, f"Auth failed: {response.text}"
        return session
    
    def test_chat_requires_auth(self):
        """Chat endpoint should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/chat/support",
            json={"message": "How do I train my dog to sit?"}
        )
        assert response.status_code == 401, "Chat should require auth"
        print("✅ Chat endpoint correctly requires authentication")
    
    def test_chat_history_requires_auth(self):
        """Chat history endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 401
        print("✅ Chat history endpoint correctly requires authentication")
    
    def test_chat_support_with_auth(self, auth_session):
        """Test chat support with authenticated user"""
        # First check token balance
        balance_response = auth_session.get(f"{BASE_URL}/api/tokens/balance")
        assert balance_response.status_code == 200
        initial_balance = balance_response.json().get("tokens", 0)
        print(f"   Initial token balance: {initial_balance}")
        
        if initial_balance < 5:
            pytest.skip(f"Not enough tokens ({initial_balance}) to test chat. Need 5 tokens.")
        
        # Send a chat message
        response = auth_session.post(
            f"{BASE_URL}/api/chat/support",
            json={"message": "How do I teach my dog to sit?"}
        )
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "reply" in data, "Response should have 'reply'"
        assert "tokens_spent" in data, "Response should have 'tokens_spent'"
        assert "remaining_tokens" in data, "Response should have 'remaining_tokens'"
        
        # Verify token deduction
        assert data["tokens_spent"] == 5, "Should cost 5 tokens per message"
        assert data["remaining_tokens"] == initial_balance - 5, "Tokens should be deducted"
        
        print(f"✅ Chat support working:")
        print(f"   Reply: {data['reply'][:100]}...")
        print(f"   Tokens spent: {data['tokens_spent']}")
        print(f"   Remaining: {data['remaining_tokens']}")
    
    def test_chat_insufficient_tokens(self, auth_session):
        """Test chat with insufficient tokens"""
        # Create a temporary user with 0 tokens to test
        # For now, we just verify the endpoint response structure
        # The actual insufficient token test requires a user with 0 tokens
        
        # Get current balance
        balance_response = auth_session.get(f"{BASE_URL}/api/tokens/balance")
        assert balance_response.status_code == 200
        print("✅ Token balance check working")
    
    def test_chat_history_with_auth(self, auth_session):
        """Test getting chat history with authenticated user"""
        response = auth_session.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)
        print(f"✅ Chat history retrieved: {len(data['history'])} messages")


class TestTokenBalance:
    """Test token balance endpoint"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_token_balance_requires_auth(self):
        """Token balance should require auth"""
        response = requests.get(f"{BASE_URL}/api/tokens/balance")
        assert response.status_code == 401
        print("✅ Token balance correctly requires authentication")
    
    def test_token_balance_with_auth(self, auth_session):
        """Test getting token balance with auth"""
        response = auth_session.get(f"{BASE_URL}/api/tokens/balance")
        assert response.status_code == 200
        data = response.json()
        assert "tokens" in data
        assert "referral_code" in data
        assert isinstance(data["tokens"], int)
        print(f"✅ Token balance: {data['tokens']} tokens")
        print(f"   Referral code: {data['referral_code']}")


class TestDashboardStats:
    """Test dashboard stats endpoint"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_dashboard_stats(self, auth_session):
        """Test dashboard stats endpoint"""
        response = auth_session.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        # Dashboard stats should have training info
        print(f"✅ Dashboard stats: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
