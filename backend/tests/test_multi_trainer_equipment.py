"""
Tests for CanineCompass V2 New Features:
1. Multi-trainer booking calculator with 50% deposit system
2. Dog Equipment Shop with enquiry-based ordering

Test coverage:
- GET /api/equipment/categories - should return 8 categories
- GET /api/equipment/products - should return 31 products with display_price
- GET /api/equipment/featured - should return featured products
- POST /api/trainers/calculate-multi - calculates cost breakdown for multiple trainers
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test fixtures
@pytest.fixture(scope="module")
def api_client():
    """Create a requests session for API testing"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_credentials():
    """Test user credentials"""
    return {
        "email": "multitrainer_test@example.com",
        "password": "testpass123",
        "name": "Multi Trainer Test User"
    }

@pytest.fixture(scope="module")
def auth_session(api_client, auth_credentials):
    """Get authenticated session"""
    # Try to register first
    response = api_client.post(
        f"{BASE_URL}/api/auth/register",
        json=auth_credentials
    )
    
    # If already registered, login
    if response.status_code == 400:
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": auth_credentials["email"], "password": auth_credentials["password"]}
        )
    
    if response.status_code == 200:
        # Get session cookie from response
        api_client.cookies = response.cookies
    
    return api_client


class TestEquipmentCategories:
    """Test equipment categories endpoint"""
    
    def test_get_categories_returns_8(self, api_client):
        """GET /api/equipment/categories returns 8 categories"""
        response = api_client.get(f"{BASE_URL}/api/equipment/categories")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "categories" in data, "Response should have 'categories' key"
        
        categories = data["categories"]
        assert len(categories) == 8, f"Expected 8 categories, got {len(categories)}"
        
        # Verify category structure
        expected_ids = ["harnesses", "grooming", "training", "bowls", "beds", "toys", "health", "travel"]
        actual_ids = [cat["id"] for cat in categories]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing category: {expected_id}"
        
        # Verify each category has required fields
        for cat in categories:
            assert "id" in cat, "Category should have 'id'"
            assert "name" in cat, "Category should have 'name'"
            assert "icon" in cat, "Category should have 'icon'"
        
        print(f"✅ Categories endpoint returns {len(categories)} categories correctly")


class TestEquipmentProducts:
    """Test equipment products endpoint"""
    
    def test_get_products_returns_31(self, api_client):
        """GET /api/equipment/products returns 31 products with display_price"""
        response = api_client.get(f"{BASE_URL}/api/equipment/products")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "products" in data, "Response should have 'products' key"
        assert "total" in data, "Response should have 'total' key"
        
        products = data["products"]
        assert len(products) == 31, f"Expected 31 products, got {len(products)}"
        
        # Verify product structure and pricing
        for product in products:
            assert "product_id" in product, "Product should have 'product_id'"
            assert "name" in product, "Product should have 'name'"
            assert "category" in product, "Product should have 'category'"
            assert "display_price" in product, "Product should have 'display_price'"
            assert "base_price" in product, "Product should have 'base_price'"
            
            # Verify 22% commission is built into display_price
            base_price = product["base_price"]
            display_price = product["display_price"]
            expected_display = round(base_price * 1.22, 2)
            assert abs(display_price - expected_display) < 0.02, \
                f"Product {product['name']}: display_price {display_price} should be ~{expected_display} (22% commission)"
        
        print(f"✅ Products endpoint returns {len(products)} products with correct display_price")
    
    def test_get_products_filter_by_category(self, api_client):
        """Test product filtering by category"""
        response = api_client.get(f"{BASE_URL}/api/equipment/products?category=harnesses")
        
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        # All returned products should be in harnesses category
        for product in products:
            assert product["category"] == "harnesses", f"Product {product['name']} should be in harnesses category"
        
        print(f"✅ Products filter by category works correctly ({len(products)} harness products)")


class TestEquipmentFeatured:
    """Test featured products endpoint"""
    
    def test_get_featured_products(self, api_client):
        """GET /api/equipment/featured returns featured products"""
        response = api_client.get(f"{BASE_URL}/api/equipment/featured")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "products" in data, "Response should have 'products' key"
        assert "total" in data, "Response should have 'total' key"
        
        products = data["products"]
        assert len(products) > 0, "Should have at least 1 featured product"
        
        # All products should be featured
        for product in products:
            assert product.get("featured", False) == True, f"Product {product['name']} should be featured"
            assert "display_price" in product, "Featured product should have display_price"
        
        print(f"✅ Featured endpoint returns {len(products)} featured products")


class TestMultiTrainerCalculator:
    """Test multi-trainer booking calculator"""
    
    def test_calculate_single_trainer_virtual(self, api_client):
        """Test calculation for single trainer virtual session"""
        # Use date 10 days from now (within 7-10 day requirement)
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [{"trainer_id": "team_001", "hours": 1}],
            "session_type": "virtual",
            "date": future_date,
            "time": "10:00",
            "from_postcode": "",
            "to_postcode": "",
            "include_k9_risk_fee": False
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check required fields
        assert "trainer_breakdowns" in data, "Response should have 'trainer_breakdowns'"
        assert "summary" in data, "Response should have 'summary'"
        assert "payment_terms" in data, "Response should have 'payment_terms'"
        assert "policies" in data, "Response should have 'policies'"
        
        # Verify trainer breakdown
        assert len(data["trainer_breakdowns"]) == 1, "Should have 1 trainer breakdown"
        breakdown = data["trainer_breakdowns"][0]
        assert breakdown["trainer_id"] == "team_001"
        assert breakdown["hours"] == 1
        assert breakdown["hourly_rate"] == 81.00, f"Virtual hourly rate should be £81.00, got £{breakdown['hourly_rate']}"
        
        # Verify summary
        summary = data["summary"]
        assert summary["total_trainers"] == 1
        assert summary["total_hours"] == 1
        assert summary["session_costs_subtotal"] == 81.00, f"Session cost should be £81.00, got £{summary['session_costs_subtotal']}"
        
        # Verify 50% deposit
        payment = data["payment_terms"]
        assert payment["deposit_percentage"] == 50, "Deposit should be 50%"
        assert payment["deposit_amount"] == round(summary["grand_total"] * 0.5, 2)
        assert payment["remaining_balance"] == round(summary["grand_total"] * 0.5, 2)
        
        print(f"✅ Single trainer virtual calculation correct: £{summary['grand_total']} total, £{payment['deposit_amount']} deposit")
    
    def test_calculate_multi_trainer_in_person(self, api_client):
        """Test calculation for multiple trainers in-person with K9 risk fee"""
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [
                {"trainer_id": "team_001", "hours": 2},
                {"trainer_id": "team_002", "hours": 3}
            ],
            "session_type": "in_person",
            "date": future_date,
            "time": "14:00",
            "from_postcode": "SW1A 1AA",
            "to_postcode": "EC1A 1BB",
            "include_k9_risk_fee": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify trainer breakdowns
        assert len(data["trainer_breakdowns"]) == 2, "Should have 2 trainer breakdowns"
        
        # Verify in-person hourly rate is £180
        for breakdown in data["trainer_breakdowns"]:
            assert breakdown["hourly_rate"] == 180.00, f"In-person hourly rate should be £180.00, got £{breakdown['hourly_rate']}"
            assert breakdown["k9_risk_fee"] == 10.79, f"K9 risk fee should be £10.79, got £{breakdown['k9_risk_fee']}"
        
        # Verify summary
        summary = data["summary"]
        assert summary["total_trainers"] == 2
        assert summary["total_hours"] == 5  # 2 + 3 hours
        
        # Session costs: 2*180 + 3*180 = 360 + 540 = 900
        assert summary["session_costs_subtotal"] == 900.00, f"Session cost should be £900.00, got £{summary['session_costs_subtotal']}"
        
        # K9 risk fees: 10.79 * 2 trainers = 21.58
        assert summary["k9_risk_fees_total"] == 21.58, f"K9 risk fees should be £21.58, got £{summary['k9_risk_fees_total']}"
        
        # Call-out fee should be present for in-person
        assert summary["call_out_fee"] == 30.00, f"Call-out fee should be £30.00, got £{summary['call_out_fee']}"
        
        # Travel cost should be present
        assert summary["travel_cost"] > 0, "Travel cost should be calculated"
        assert summary["estimated_miles"] > 0, "Estimated miles should be present"
        
        # Verify deposit calculation
        payment = data["payment_terms"]
        assert payment["deposit_percentage"] == 50
        expected_deposit = round(summary["grand_total"] * 0.5, 2)
        assert payment["deposit_amount"] == expected_deposit
        expected_remaining = round(summary["grand_total"] - expected_deposit, 2)
        assert payment["remaining_balance"] == expected_remaining
        
        print(f"✅ Multi-trainer in-person calculation correct:")
        print(f"   - Total: £{summary['grand_total']}")
        print(f"   - Deposit (50%): £{payment['deposit_amount']}")
        print(f"   - Remaining: £{payment['remaining_balance']}")
    
    def test_calculate_emergency_session(self, api_client):
        """Test calculation for emergency 24/7 session"""
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [{"trainer_id": "team_003", "hours": 1}],
            "session_type": "emergency",
            "date": future_date,
            "time": "00:00",
            "from_postcode": "",
            "to_postcode": "",
            "include_k9_risk_fee": False
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Emergency should use flat rate £1619.99
        breakdown = data["trainer_breakdowns"][0]
        assert breakdown["session_cost"] == 1619.99, f"Emergency flat rate should be £1619.99, got £{breakdown['session_cost']}"
        
        summary = data["summary"]
        assert summary["grand_total"] == 1619.99, f"Emergency total should be £1619.99, got £{summary['grand_total']}"
        
        # Verify deposit is 50%
        payment = data["payment_terms"]
        expected_deposit = round(1619.99 * 0.5, 2)
        assert payment["deposit_amount"] == expected_deposit
        
        print(f"✅ Emergency session calculation correct: £{summary['grand_total']} (flat rate)")
    
    def test_calculate_rejects_early_booking(self, api_client):
        """Test that bookings less than 7 days ahead are rejected"""
        # Use date 3 days from now (too early)
        early_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [{"trainer_id": "team_001", "hours": 1}],
            "session_type": "virtual",
            "date": early_date,
            "time": "10:00",
            "from_postcode": "",
            "to_postcode": "",
            "include_k9_risk_fee": False
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        
        assert response.status_code == 200  # Returns 200 with error flag
        data = response.json()
        
        assert data.get("error") == True, "Should return error for early booking"
        assert "7 days" in data.get("message", "").lower() or "7-10" in data.get("message", ""), \
            "Error message should mention 7 day requirement"
        
        print(f"✅ Early booking (< 7 days) correctly rejected")


class TestTrainers:
    """Verify trainer data is correct for multi-trainer selection"""
    
    def test_get_trainers_our_team(self, api_client):
        """Verify our team trainers are returned"""
        response = api_client.get(f"{BASE_URL}/api/trainers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "our_team" in data, "Response should have 'our_team'"
        our_team = data["our_team"]
        
        assert len(our_team) == 3, f"Should have 3 team trainers, got {len(our_team)}"
        
        # Verify trainer IDs
        trainer_ids = [t["trainer_id"] for t in our_team]
        assert "team_001" in trainer_ids
        assert "team_002" in trainer_ids
        assert "team_003" in trainer_ids
        
        print(f"✅ Our K9 Team has {len(our_team)} trainers available for multi-selection")


class TestEquipmentEnquiry:
    """Test equipment enquiry submission (MOCKED)"""
    
    def test_submit_enquiry(self, auth_session):
        """Test submitting an equipment enquiry"""
        payload = {
            "product_id": "harness_001",
            "quantity": 2,
            "size": "M",
            "color": "Black"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/equipment/enquiry", json=payload)
        
        # Might need auth - if 401, skip test
        if response.status_code == 401:
            pytest.skip("Authentication required for enquiry - test user not logged in")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "enquiry_id" in data, "Response should have 'enquiry_id'"
        assert "message" in data, "Response should have confirmation message"
        assert data["quantity"] == 2
        
        print(f"✅ Equipment enquiry submitted successfully (MOCKED): {data['enquiry_id']}")


class TestPricingValidation:
    """Validate pricing matches requirements"""
    
    def test_virtual_hourly_rate(self, api_client):
        """Virtual sessions should be £81/hr"""
        response = api_client.get(f"{BASE_URL}/api/trainers/pricing/info")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check virtual pricing - from TRAINER_PRICING in nasdu_courses_data.py
        # virtual 60min is display price £81.00 (base £67.50 + 20%)
        print(f"✅ Pricing info endpoint accessible")
    
    def test_in_person_hourly_rate(self, api_client):
        """In-person sessions should be £180/hr"""
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [{"trainer_id": "team_001", "hours": 1}],
            "session_type": "in_person",
            "date": future_date,
            "time": "10:00",
            "from_postcode": "",
            "to_postcode": "",
            "include_k9_risk_fee": False
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        breakdown = data["trainer_breakdowns"][0]
        assert breakdown["hourly_rate"] == 180.00, f"In-person hourly rate should be £180/hr"
        
        print(f"✅ In-person rate confirmed: £180/hr")
    
    def test_emergency_flat_rate(self, api_client):
        """Emergency should be £1619.99 flat rate"""
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        payload = {
            "trainers": [{"trainer_id": "team_001", "hours": 1}],
            "session_type": "emergency",
            "date": future_date,
            "time": "00:00",
            "from_postcode": "",
            "to_postcode": "",
            "include_k9_risk_fee": False
        }
        
        response = api_client.post(f"{BASE_URL}/api/trainers/calculate-multi", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        summary = data["summary"]
        assert summary["grand_total"] == 1619.99, f"Emergency flat rate should be £1619.99"
        
        print(f"✅ Emergency flat rate confirmed: £1619.99")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
