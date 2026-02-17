"""
Backend tests for K9 Trainer Booking and NASDU Courses features
Tests trainer segregation (Our Team vs Approved 3rd Party) and NASDU course catalog
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://k9-elite-hub.preview.emergentagent.com')

class TestTrainerEndpoints:
    """Tests for K9 Trainer API endpoints"""
    
    def test_get_trainers_returns_both_teams(self):
        """GET /api/trainers returns our_team and approved_contractors arrays"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        
        data = response.json()
        # Verify response structure
        assert "our_team" in data
        assert "approved_contractors" in data
        assert "our_team_count" in data
        assert "approved_count" in data
        
        # Verify our_team has data
        assert isinstance(data["our_team"], list)
        assert len(data["our_team"]) > 0
        print(f"✓ Our Team count: {len(data['our_team'])}")
        
        # Verify approved_contractors has data
        assert isinstance(data["approved_contractors"], list)
        assert len(data["approved_contractors"]) > 0
        print(f"✓ Approved Contractors count: {len(data['approved_contractors'])}")
    
    def test_our_team_trainers_structure(self):
        """Verify our team trainers have correct data structure"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        
        data = response.json()
        for trainer in data["our_team"]:
            assert "trainer_id" in trainer
            assert "name" in trainer
            assert "title" in trainer
            assert "specializations" in trainer
            assert "rating" in trainer
            assert "reviews" in trainer
            assert "location" in trainer
            assert trainer.get("our_team") == True  # Should have our_team flag
            print(f"✓ Our team trainer: {trainer['name']} ({trainer['trainer_id']})")
    
    def test_approved_trainers_structure(self):
        """Verify approved contractors have correct data structure"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        
        data = response.json()
        for trainer in data["approved_contractors"]:
            assert "trainer_id" in trainer
            assert "name" in trainer
            assert "title" in trainer
            assert "specializations" in trainer
            assert "rating" in trainer
            assert "experience_years" in trainer
            print(f"✓ Approved trainer: {trainer['name']} ({trainer['trainer_id']})")
    
    def test_get_our_team_only(self):
        """GET /api/trainers/our-team returns only our team"""
        response = requests.get(f"{BASE_URL}/api/trainers/our-team")
        assert response.status_code == 200
        
        data = response.json()
        assert "trainers" in data
        assert "total" in data
        assert len(data["trainers"]) == data["total"]
        
        # Verify all trainers are from our team
        for trainer in data["trainers"]:
            assert trainer.get("our_team") == True
        print(f"✓ Our team trainers: {data['total']}")
    
    def test_get_approved_trainers_only(self):
        """GET /api/trainers/approved returns approved contractors with coming_soon status"""
        response = requests.get(f"{BASE_URL}/api/trainers/approved")
        assert response.status_code == 200
        
        data = response.json()
        assert "trainers" in data
        assert "total" in data
        assert "status" in data
        assert data["status"] == "coming_soon"
        print(f"✓ Approved trainers: {data['total']} (status: {data['status']})")


class TestPricingEndpoints:
    """Tests for trainer pricing info endpoint"""
    
    def test_get_pricing_info_structure(self):
        """GET /api/trainers/pricing/info returns correct data structure"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        data = response.json()
        # Verify main keys exist
        assert "pricing" in data
        assert "equipment" in data
        assert "behavioural_issues" in data
        print("✓ Pricing info contains: pricing, equipment, behavioural_issues")
    
    def test_virtual_session_pricing(self):
        """Verify virtual session pricing"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        assert "virtual" in pricing
        
        # 30min virtual
        assert "30min" in pricing["virtual"]
        assert pricing["virtual"]["30min"]["price"] == 44.99
        print(f"✓ Virtual 30min: £{pricing['virtual']['30min']['price']}")
        
        # 60min virtual
        assert "60min" in pricing["virtual"]
        assert pricing["virtual"]["60min"]["price"] == 67.50
        print(f"✓ Virtual 60min: £{pricing['virtual']['60min']['price']}")
    
    def test_in_person_session_pricing(self):
        """Verify in-person/home visit pricing"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        assert "in_person" in pricing
        
        # 1 hour minimum
        assert "60min" in pricing["in_person"]
        assert pricing["in_person"]["60min"]["price"] == 150.00
        print(f"✓ In-person 60min: £{pricing['in_person']['60min']['price']}")
        
        # 2 hours
        assert "120min" in pricing["in_person"]
        assert pricing["in_person"]["120min"]["price"] == 480.00
        print(f"✓ In-person 120min: £{pricing['in_person']['120min']['price']}")
        
        # 3 hours intensive
        assert "180min" in pricing["in_person"]
        assert pricing["in_person"]["180min"]["price"] == 630.00
        print(f"✓ In-person 180min: £{pricing['in_person']['180min']['price']}")
    
    def test_emergency_pricing(self):
        """Verify emergency 24/7 pricing"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        assert "emergency_24_7" in pricing
        assert pricing["emergency_24_7"]["price"] == 1349.99
        print(f"✓ Emergency 24/7: £{pricing['emergency_24_7']['price']}")
    
    def test_travel_fees(self):
        """Verify travel fees"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        assert "travel" in pricing
        assert pricing["travel"]["call_out_fee"] == 25.00
        assert pricing["travel"]["per_mile"] == 0.85
        print(f"✓ Call-out fee: £{pricing['travel']['call_out_fee']}")
        print(f"✓ Per mile: £{pricing['travel']['per_mile']}")
    
    def test_k9_risk_fee(self):
        """Verify K9 risk equipment fee"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        assert "k9_risk_equipment_fee" in pricing
        assert pricing["k9_risk_equipment_fee"] == 8.99
        print(f"✓ K9 risk & equipment fee: £{pricing['k9_risk_equipment_fee']}")
    
    def test_equipment_list(self):
        """Verify equipment list is present"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        equipment = response.json()["equipment"]
        assert isinstance(equipment, list)
        assert len(equipment) > 0
        
        for item in equipment:
            assert "name" in item
            assert "description" in item
        print(f"✓ Equipment items: {len(equipment)}")
    
    def test_behavioural_issues_list(self):
        """Verify behavioural issues list is present"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        issues = response.json()["behavioural_issues"]
        assert isinstance(issues, list)
        assert len(issues) > 0
        
        for issue in issues:
            assert "issue" in issue
            assert "description" in issue
        print(f"✓ Behavioural issues: {len(issues)}")


class TestNasduCoursesEndpoints:
    """Tests for NASDU course catalog endpoints"""
    
    def test_get_all_courses(self):
        """GET /api/nasdu/courses returns courses array"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        assert response.status_code == 200
        
        data = response.json()
        assert "courses" in data
        assert "total" in data
        assert isinstance(data["courses"], list)
        assert len(data["courses"]) > 0
        assert len(data["courses"]) == data["total"]
        print(f"✓ Total NASDU courses: {data['total']}")
    
    def test_course_data_structure(self):
        """Verify course cards have correct data structure"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        for course in courses[:3]:  # Check first 3 courses
            assert "course_id" in course
            assert "title" in course
            assert "level" in course
            assert "category" in course
            assert "description" in course
            assert "duration_hours" in course
            assert "duration_days" in course
            assert "price" in course
            assert "commission_price" in course  # Price with commission
            assert "location" in course
            assert "certification_body" in course
            assert "units" in course
            assert "skills_learned" in course
            assert "prerequisites" in course
            assert "career_paths" in course
            assert "hourly_rate_after" in course
            assert "image_url" in course
            print(f"✓ Course: {course['title']} - £{course['commission_price']}")
    
    def test_course_has_prices(self):
        """Verify courses have proper pricing"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        for course in courses:
            assert isinstance(course["price"], (int, float))
            assert course["price"] > 0
            assert isinstance(course["commission_price"], (int, float))
            assert course["commission_price"] > course["price"]  # Commission added
            print(f"✓ {course['title']}: Base £{course['price']} -> £{course['commission_price']}")
    
    def test_filter_by_category(self):
        """Test filtering courses by category"""
        # Get all categories from courses
        all_response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        courses = all_response.json()["courses"]
        categories = set(c["category"] for c in courses)
        
        for cat in list(categories)[:2]:  # Test first 2 categories
            response = requests.get(f"{BASE_URL}/api/nasdu/courses?category={cat}")
            assert response.status_code == 200
            
            filtered = response.json()["courses"]
            for course in filtered:
                assert course["category"] == cat
            print(f"✓ Category '{cat}': {len(filtered)} courses")
    
    def test_get_single_course(self):
        """GET /api/nasdu/courses/{course_id} returns single course"""
        # First get list to get a course_id
        list_response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        course_id = list_response.json()["courses"][0]["course_id"]
        
        response = requests.get(f"{BASE_URL}/api/nasdu/courses/{course_id}")
        assert response.status_code == 200
        
        course = response.json()
        assert course["course_id"] == course_id
        print(f"✓ Single course: {course['title']}")
    
    def test_get_invalid_course_returns_404(self):
        """GET /api/nasdu/courses/invalid_id returns 404"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses/invalid_course_xyz")
        assert response.status_code == 404


class TestCalculateCostEndpoint:
    """Tests for cost calculation endpoint"""
    
    def test_calculate_virtual_session_cost(self):
        """POST /api/trainers/calculate-cost for virtual session"""
        payload = {
            "session_type": "virtual",
            "duration": "30min"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 44.99
        assert data["call_out_fee"] == 0
        assert data["travel_cost"] == 0
        assert data["total"] == 44.99
        print(f"✓ Virtual 30min total: £{data['total']}")
    
    def test_calculate_in_person_cost_with_travel(self):
        """POST /api/trainers/calculate-cost for in-person with travel"""
        payload = {
            "session_type": "in_person",
            "duration": "60min",
            "from_postcode": "SW1A 1AA",
            "to_postcode": "EC1A 1BB"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 150.00
        assert data["call_out_fee"] == 25.00
        assert data["k9_risk_fee"] == 8.99
        assert data["estimated_miles"] > 0
        assert data["travel_cost"] > 0
        assert data["total"] > data["session_cost"]  # Should include fees
        print(f"✓ In-person 60min with travel: £{data['total']}")
    
    def test_calculate_emergency_cost(self):
        """POST /api/trainers/calculate-cost for emergency session"""
        payload = {
            "session_type": "emergency",
            "duration": "emergency"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 1349.99
        assert data["total"] == 1349.99
        print(f"✓ Emergency 24/7 total: £{data['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
