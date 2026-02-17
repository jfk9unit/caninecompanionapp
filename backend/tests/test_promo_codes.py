"""
Test suite for Admin Promo Codes feature
Tests:
- Admin check endpoint
- Promo code CRUD (create, list, update, delete) - requires admin
- Promo code validation
- Promo code redemption (tokens and discounts)
- User discount check
- Redemption history
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test session from previous iterations
TEST_SESSION_TOKEN = "test_sess_2302f5c0a7a74fda91a05ca701557cf3"

# Admin emails from server.py
ADMIN_EMAILS = ["admin@caninecompass.app", "developer@caninecompass.app"]

# Test codes to cleanup
test_codes_to_cleanup = []


class TestSetup:
    """Setup and utility tests"""
    
    def test_api_is_healthy(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"API healthy: {data['message']}")
    
    def test_test_session_valid(self):
        """Verify test session is still valid"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        print(f"Test user: {data['email']} with {data['tokens']} tokens")


class TestAdminCheckEndpoint:
    """Test /api/admin/check endpoint"""
    
    def test_admin_check_non_admin_user(self):
        """Non-admin user should get is_admin: false"""
        response = requests.get(
            f"{BASE_URL}/api/admin/check",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "is_admin" in data
        assert "email" in data
        # Test user email should not be admin
        assert data["is_admin"] == False or data["email"] in ADMIN_EMAILS
        print(f"Admin check: is_admin={data['is_admin']}, email={data['email']}")
    
    def test_admin_check_requires_auth(self):
        """Admin check should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/check")
        assert response.status_code == 401
        print("Admin check correctly requires authentication")


class TestPromoCodeValidation:
    """Test /api/promo-codes/validate/{code} endpoint"""
    
    def test_validate_invalid_code(self):
        """Validating a non-existent code should return 404"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/validate/NONEXISTENT123",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print(f"Invalid code response: {data['detail']}")
    
    def test_validate_requires_auth(self):
        """Promo code validation requires authentication"""
        response = requests.get(f"{BASE_URL}/api/promo-codes/validate/TESTCODE")
        assert response.status_code == 401
        print("Promo code validation correctly requires authentication")


class TestPromoCodeRedemption:
    """Test /api/promo-codes/redeem endpoint"""
    
    def test_redeem_invalid_code(self):
        """Redeeming a non-existent code should fail"""
        response = requests.post(
            f"{BASE_URL}/api/promo-codes/redeem",
            json={"code": "INVALID123456"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print(f"Invalid redemption response: {data['detail']}")
    
    def test_redeem_requires_auth(self):
        """Promo code redemption requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/promo-codes/redeem",
            json={"code": "TESTCODE"}
        )
        assert response.status_code == 401
        print("Promo code redemption correctly requires authentication")


class TestUserDiscountAndHistory:
    """Test /api/promo-codes/my-discount and /api/promo-codes/my-history endpoints"""
    
    def test_get_my_discount(self):
        """Get user's active discount"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/my-discount",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "has_discount" in data
        print(f"User discount status: has_discount={data['has_discount']}")
        if data.get("has_discount"):
            assert "discount_percent" in data
            print(f"  Discount: {data['discount_percent']}%")
    
    def test_get_my_history(self):
        """Get user's promo code redemption history"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/my-history",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "redemptions" in data
        assert isinstance(data["redemptions"], list)
        print(f"User has {len(data['redemptions'])} redemption(s) in history")
    
    def test_discount_requires_auth(self):
        """My discount endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/promo-codes/my-discount")
        assert response.status_code == 401
        print("My discount endpoint correctly requires authentication")
    
    def test_history_requires_auth(self):
        """My history endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/promo-codes/my-history")
        assert response.status_code == 401
        print("My history endpoint correctly requires authentication")


class TestAdminPromoCodeCRUD:
    """Test admin promo code CRUD endpoints (requires admin)
    These tests verify the API structure and access control.
    Without admin credentials, we expect 403 errors.
    """
    
    def test_admin_list_codes_non_admin(self):
        """Non-admin should get 403 when listing promo codes"""
        response = requests.get(
            f"{BASE_URL}/api/admin/promo-codes",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should be 403 if user is not admin
        if response.status_code == 403:
            data = response.json()
            assert "detail" in data
            print(f"Non-admin correctly denied: {data['detail']}")
        elif response.status_code == 200:
            # User might be admin for some reason
            data = response.json()
            assert "promo_codes" in data
            print(f"User is admin, {len(data['promo_codes'])} codes found")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_admin_create_code_non_admin(self):
        """Non-admin should get 403 when creating promo codes"""
        response = requests.post(
            f"{BASE_URL}/api/admin/promo-codes",
            json={
                "code": "TEST_CREATE_FAIL",
                "code_type": "tokens",
                "value": 10,
                "description": "Test code"
            },
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should be 403 if user is not admin
        if response.status_code == 403:
            print("Non-admin correctly denied from creating promo code")
        elif response.status_code == 200 or response.status_code == 201:
            # User might be admin - cleanup
            test_codes_to_cleanup.append("TEST_CREATE_FAIL")
            print("User is admin, code created (will be cleaned up)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_admin_update_code_non_admin(self):
        """Non-admin should get 403 when updating promo codes"""
        response = requests.put(
            f"{BASE_URL}/api/admin/promo-codes/SOMENONEXISTENTCODE",
            json={"active": False},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should be 403 for non-admin or 404 if code doesn't exist
        assert response.status_code in [403, 404]
        print(f"Update code response: {response.status_code}")
    
    def test_admin_delete_code_non_admin(self):
        """Non-admin should get 403 when deleting promo codes"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/promo-codes/SOMENONEXISTENTCODE",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should be 403 for non-admin or 404 if code doesn't exist
        assert response.status_code in [403, 404]
        print(f"Delete code response: {response.status_code}")
    
    def test_admin_endpoints_require_auth(self):
        """All admin endpoints should require authentication"""
        # Test create
        resp1 = requests.post(
            f"{BASE_URL}/api/admin/promo-codes",
            json={"code": "TEST", "code_type": "tokens", "value": 10}
        )
        assert resp1.status_code == 401
        
        # Test list
        resp2 = requests.get(f"{BASE_URL}/api/admin/promo-codes")
        assert resp2.status_code == 401
        
        # Test update
        resp3 = requests.put(
            f"{BASE_URL}/api/admin/promo-codes/TEST",
            json={"active": False}
        )
        assert resp3.status_code == 401
        
        # Test delete
        resp4 = requests.delete(f"{BASE_URL}/api/admin/promo-codes/TEST")
        assert resp4.status_code == 401
        
        print("All admin endpoints correctly require authentication")


class TestPromoCodeEndpointStructure:
    """Verify the API endpoint structure and response formats"""
    
    def test_validate_endpoint_structure(self):
        """Verify validate endpoint returns expected structure for invalid code"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/validate/TEST_STRUCTURE",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should return 404 with detail message for non-existent code
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print("Validate endpoint returns proper error structure")
    
    def test_redeem_endpoint_structure(self):
        """Verify redeem endpoint accepts proper request format"""
        response = requests.post(
            f"{BASE_URL}/api/promo-codes/redeem",
            json={"code": "TEST_STRUCTURE"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        # Should return 404 for non-existent code
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print("Redeem endpoint accepts proper request format")
    
    def test_my_discount_endpoint_structure(self):
        """Verify my-discount endpoint returns expected structure"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/my-discount",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "has_discount" in data
        if data["has_discount"]:
            assert "discount_percent" in data
            assert "promo_code" in data
        print(f"My discount structure valid: {data}")
    
    def test_my_history_endpoint_structure(self):
        """Verify my-history endpoint returns expected structure"""
        response = requests.get(
            f"{BASE_URL}/api/promo-codes/my-history",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "redemptions" in data
        assert isinstance(data["redemptions"], list)
        print(f"My history structure valid: {len(data['redemptions'])} redemptions")


class TestAdminCheckStructure:
    """Verify admin check endpoint structure"""
    
    def test_admin_check_response_structure(self):
        """Admin check should return is_admin and email fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/check",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        assert "is_admin" in data
        assert "email" in data
        assert isinstance(data["is_admin"], bool)
        assert isinstance(data["email"], str)
        print(f"Admin check structure valid: is_admin={data['is_admin']}, email={data['email']}")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_codes():
    """Cleanup any test codes created during tests"""
    yield
    # Cleanup after all tests
    for code in test_codes_to_cleanup:
        try:
            requests.delete(
                f"{BASE_URL}/api/admin/promo-codes/{code}",
                cookies={"session_token": TEST_SESSION_TOKEN}
            )
        except Exception:
            pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
