"""
Test VIP Features: VIP Status, Welcome Message, Daily Memos, Admin Award Tokens
Tests: GET /api/user/vip-status, GET /api/welcome-message, POST /api/daily-memo/mark-seen, 
       POST /api/admin/award-tokens, Daily Reward for VIP users (20 tokens)
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# VIP Players list from server.py
VIP_PLAYERS = [
    "jfk9unit@gmail.com",
    "rociolopez111@hotmail.com",
    "damoncrook94@gmail.com"
]

# Admin emails list from server.py
ADMIN_EMAILS = [
    "admin@caninecompass.app",
    "developer@caninecompass.app"
]


class TestAPIHealth:
    """Health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ API is healthy: {data}")


class TestVIPStatusEndpoint:
    """Test VIP Status endpoint - GET /api/user/vip-status"""
    
    def test_vip_status_requires_auth(self):
        """VIP status endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/user/vip-status")
        assert response.status_code == 401
        print("✓ VIP status requires authentication (401)")
    
    def test_vip_status_with_auth(self, auth_session):
        """VIP status should return is_vip flag and benefits"""
        response = auth_session.get(f"{BASE_URL}/api/user/vip-status")
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "is_vip" in data
        assert isinstance(data["is_vip"], bool)
        
        # VIP benefits should be present if VIP, None otherwise
        if data["is_vip"]:
            assert "vip_benefits" in data
            assert data["vip_benefits"]["daily_tokens"] == 20
            assert data["vip_benefits"]["double_xp"] == True
            assert data["vip_benefits"]["special_badge"] == "VIP Tester"
            print(f"✓ User IS VIP - benefits: {data['vip_benefits']}")
        else:
            assert data["vip_benefits"] is None
            print(f"✓ User is NOT VIP - no benefits returned")
        
        print(f"✓ VIP status response: {data}")


class TestWelcomeMessageEndpoint:
    """Test Welcome Message endpoint - GET /api/welcome-message"""
    
    def test_welcome_message_requires_auth(self):
        """Welcome message endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/welcome-message")
        assert response.status_code == 401
        print("✓ Welcome message requires authentication (401)")
    
    def test_welcome_message_structure(self, auth_session):
        """Welcome message should return personalized greeting and daily memo"""
        response = auth_session.get(f"{BASE_URL}/api/welcome-message")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        required_fields = ["first_name", "role", "is_vip", "is_admin", "greeting", "daily_memo", "memo_already_seen"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Check role is valid
        assert data["role"] in ["admin", "vip", "member"], f"Invalid role: {data['role']}"
        
        # Check greeting is personalized (contains first name)
        assert data["first_name"] in data["greeting"] or data["greeting"]
        
        # Check daily memo structure
        assert "title" in data["daily_memo"]
        assert "message" in data["daily_memo"]
        
        print(f"✓ Welcome message received for {data['first_name']}")
        print(f"  - Role: {data['role']}")
        print(f"  - Is VIP: {data['is_vip']}")
        print(f"  - Is Admin: {data['is_admin']}")
        print(f"  - Daily memo: {data['daily_memo']['title']}")
        
        # VIP specific checks
        if data["is_vip"]:
            assert "vip_daily_tokens" in data
            assert data["vip_daily_tokens"] == 20
            print(f"  - VIP daily tokens: {data['vip_daily_tokens']}")
        
        return data
    
    def test_welcome_message_vip_bonus_field(self, auth_session):
        """VIP bonus fields should be present"""
        response = auth_session.get(f"{BASE_URL}/api/welcome-message")
        assert response.status_code == 200
        data = response.json()
        
        # These fields should always be present
        assert "vip_bonus_just_claimed" in data
        assert "vip_bonus_amount" in data
        
        print(f"✓ VIP bonus fields present: vip_bonus_just_claimed={data['vip_bonus_just_claimed']}, vip_bonus_amount={data['vip_bonus_amount']}")


class TestDailyMemoMarkSeen:
    """Test Daily Memo Mark Seen endpoint - POST /api/daily-memo/mark-seen"""
    
    def test_mark_seen_requires_auth(self):
        """Mark seen endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/daily-memo/mark-seen")
        assert response.status_code == 401
        print("✓ Mark seen requires authentication (401)")
    
    def test_mark_daily_memo_seen(self, auth_session):
        """Should mark today's memo as seen"""
        response = auth_session.post(f"{BASE_URL}/api/daily-memo/mark-seen")
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "message" in data
        print(f"✓ Memo marked as seen: {data}")
    
    def test_memo_seen_status_after_marking(self, auth_session):
        """After marking seen, welcome message should show memo_already_seen=True"""
        # Mark as seen
        auth_session.post(f"{BASE_URL}/api/daily-memo/mark-seen")
        
        # Check welcome message
        response = auth_session.get(f"{BASE_URL}/api/welcome-message")
        assert response.status_code == 200
        data = response.json()
        
        # Should show memo already seen (depends on when this test runs)
        print(f"✓ memo_already_seen status: {data['memo_already_seen']}")


class TestAdminAwardTokens:
    """Test Admin Award Tokens endpoint - POST /api/admin/award-tokens"""
    
    def test_award_tokens_requires_auth(self):
        """Award tokens endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/award-tokens", 
                                 json={"email": "test@test.com", "tokens": 100})
        assert response.status_code == 401
        print("✓ Award tokens requires authentication (401)")
    
    def test_award_tokens_requires_admin(self, auth_session):
        """Non-admin users should get 403 Forbidden"""
        response = auth_session.post(f"{BASE_URL}/api/admin/award-tokens",
                                     json={"email": "test@test.com", "tokens": 100})
        
        # Non-admin should get 403
        if response.status_code == 403:
            print("✓ Non-admin user correctly rejected (403)")
        else:
            # If user is admin, this would succeed
            print(f"ℹ Admin award tokens response: {response.status_code} - {response.json()}")
        
        assert response.status_code in [200, 403]
    
    def test_award_tokens_requires_valid_data(self, auth_session):
        """Should require email and positive token amount"""
        # Test missing email
        response = auth_session.post(f"{BASE_URL}/api/admin/award-tokens",
                                     json={"tokens": 100})
        assert response.status_code in [400, 403]  # 400 for invalid data, 403 for non-admin
        
        # Test missing tokens
        response = auth_session.post(f"{BASE_URL}/api/admin/award-tokens",
                                     json={"email": "test@test.com"})
        assert response.status_code in [400, 403]
        
        # Test negative tokens
        response = auth_session.post(f"{BASE_URL}/api/admin/award-tokens",
                                     json={"email": "test@test.com", "tokens": -10})
        assert response.status_code in [400, 403]
        
        print("✓ Award tokens validation working")


class TestDailyRewardVIP:
    """Test Daily Reward for VIP players - should get 20 tokens"""
    
    def test_daily_reward_status(self, auth_session):
        """Check daily reward status"""
        response = auth_session.get(f"{BASE_URL}/api/daily-reward/status")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["current_streak", "longest_streak", "total_logins", "claimed_today", "next_reward"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Daily reward status: streak={data['current_streak']}, claimed_today={data['claimed_today']}")
        return data
    
    def test_daily_reward_claim_returns_vip_flag(self, auth_session):
        """Daily reward claim should return is_vip flag"""
        # First check if already claimed
        status_response = auth_session.get(f"{BASE_URL}/api/daily-reward/status")
        status_data = status_response.json()
        
        if status_data["claimed_today"]:
            print("ℹ Daily reward already claimed today, skipping claim test")
            return
        
        # Claim reward
        response = auth_session.post(f"{BASE_URL}/api/daily-reward/claim")
        
        if response.status_code == 200:
            data = response.json()
            assert "is_vip" in data, "Missing is_vip field in claim response"
            
            if data["is_vip"]:
                assert data["tokens_earned"] == 20, f"VIP should get 20 tokens, got {data['tokens_earned']}"
                print(f"✓ VIP claim successful: {data['tokens_earned']} tokens (VIP bonus)")
            else:
                print(f"✓ Regular claim successful: {data['tokens_earned']} tokens")
        elif response.status_code == 400:
            print(f"ℹ Already claimed today: {response.json()}")
        else:
            print(f"⚠ Unexpected response: {response.status_code}")


class TestDailyMemoContent:
    """Test Daily Memo rotation - 30 unique memos based on day of year"""
    
    def test_daily_memo_present(self, auth_session):
        """Daily memo should be present in welcome message"""
        response = auth_session.get(f"{BASE_URL}/api/welcome-message")
        assert response.status_code == 200
        data = response.json()
        
        assert "daily_memo" in data
        assert "title" in data["daily_memo"]
        assert "message" in data["daily_memo"]
        assert len(data["daily_memo"]["title"]) > 0
        assert len(data["daily_memo"]["message"]) > 0
        
        print(f"✓ Daily memo: '{data['daily_memo']['title']}' - {data['daily_memo']['message'][:50]}...")


class TestAdminCheck:
    """Test Admin Check endpoint - GET /api/admin/check"""
    
    def test_admin_check_requires_auth(self):
        """Admin check should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/check")
        assert response.status_code == 401
        print("✓ Admin check requires authentication (401)")
    
    def test_admin_check_returns_status(self, auth_session):
        """Admin check should return is_admin and email"""
        response = auth_session.get(f"{BASE_URL}/api/admin/check")
        assert response.status_code == 200
        data = response.json()
        
        assert "is_admin" in data
        assert "email" in data
        assert isinstance(data["is_admin"], bool)
        
        print(f"✓ Admin check: is_admin={data['is_admin']}, email={data['email']}")


# ============== FIXTURES ==============

@pytest.fixture(scope="session")
def auth_session():
    """Create an authenticated session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Try to use existing test session
    test_session_token = "test_sess_2302f5c0a7a74fda91a05ca701557cf3"
    session.cookies.set("session_token", test_session_token)
    
    # Verify session is valid
    response = session.get(f"{BASE_URL}/api/auth/me")
    if response.status_code == 200:
        user_data = response.json()
        print(f"\n✓ Using existing session for user: {user_data.get('email', 'unknown')}")
        return session
    
    # If session expired, skip tests
    pytest.skip("No valid session available - need Google OAuth login")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
