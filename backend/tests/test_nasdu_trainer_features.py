"""
Test Suite for NASDU Courses, K9 Trainer Booking, and Multi-Language Support
Tests: GET /api/nasdu/courses, GET /api/nasdu/courses/{id}, GET /api/trainers,
GET /api/trainers/pricing/info, POST /api/trainers/calculate-cost, GET /api/settings/languages
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestNasduCourses:
    """NASDU Course Catalog API Tests"""
    
    def test_get_all_courses(self):
        """GET /api/nasdu/courses - should return 6 courses"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "courses" in data
        assert "total" in data
        
        # Verify 6 courses returned
        courses = data["courses"]
        assert len(courses) == 6, f"Expected 6 courses, got {len(courses)}"
        
        # Verify course structure
        for course in courses:
            assert "course_id" in course
            assert "title" in course
            assert "level" in course
            assert "category" in course
            assert "price" in course
            assert "commission_price" in course
            assert "duration_days" in course
            assert "sia_recognized" in course
            assert "prerequisites" in course
            assert "units" in course
            assert "skills_learned" in course
        
        print(f"SUCCESS: Retrieved {len(courses)} NASDU courses")
    
    def test_courses_have_correct_commission_pricing(self):
        """Verify courses include 12% commission in price"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        
        for course in courses:
            base_price = course["price"]
            commission_price = course["commission_price"]
            expected_commission_price = round(base_price * 1.12, 2)
            
            # Allow small float variance
            assert abs(commission_price - expected_commission_price) < 0.5, \
                f"Course {course['course_id']}: Expected ~{expected_commission_price}, got {commission_price}"
        
        print("SUCCESS: All courses have correct 12% commission pricing")
    
    def test_get_specific_course_patrol(self):
        """GET /api/nasdu/courses/nasdu_level2_patrol - returns specific course"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses/nasdu_level2_patrol")
        assert response.status_code == 200
        
        course = response.json()
        assert course["course_id"] == "nasdu_level2_patrol"
        assert course["title"] == "NASDU Level 2 Award - Patrol Dog Handler"
        assert course["level"] == 2
        assert course["category"] == "patrol"
        assert course["duration_days"] == 5
        assert course["duration_hours"] == 50
        assert course["price"] == 1299.00
        assert course["commission_price"] == 1454.88
        assert course["sia_recognized"] == True
        assert "HABC" in course["certification_body"]
        assert len(course["units"]) >= 4
        assert len(course["skills_learned"]) >= 5
        
        print(f"SUCCESS: Retrieved course: {course['title']}")
    
    def test_get_course_not_found(self):
        """GET /api/nasdu/courses/invalid_course - returns 404"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses/invalid_course_xyz")
        assert response.status_code == 404
        print("SUCCESS: Returns 404 for non-existent course")
    
    def test_filter_courses_by_category(self):
        """GET /api/nasdu/courses?category=detection - filters by category"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses?category=detection")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        for course in courses:
            assert course["category"] == "detection"
        
        print(f"SUCCESS: Filtered {len(courses)} detection courses")
    
    def test_filter_courses_by_level(self):
        """GET /api/nasdu/courses?level=3 - filters by level"""
        response = requests.get(f"{BASE_URL}/api/nasdu/courses?level=3")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        for course in courses:
            assert course["level"] == 3
        
        print(f"SUCCESS: Filtered {len(courses)} Level 3 courses")


class TestK9Trainers:
    """K9 Trainer Booking API Tests"""
    
    def test_get_all_trainers(self):
        """GET /api/trainers - returns 5 approved trainers"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        
        data = response.json()
        assert "trainers" in data
        assert "total" in data
        
        trainers = data["trainers"]
        assert len(trainers) == 5, f"Expected 5 trainers, got {len(trainers)}"
        
        # Verify trainer structure
        for trainer in trainers:
            assert "trainer_id" in trainer
            assert "name" in trainer
            assert "title" in trainer
            assert "experience_years" in trainer
            assert "specializations" in trainer
            assert "certifications" in trainer
            assert "rating" in trainer
            assert "reviews" in trainer
            assert "bio" in trainer
            assert "location" in trainer
            assert "image_url" in trainer
            assert "availability" in trainer
            assert "verified" in trainer
        
        print(f"SUCCESS: Retrieved {len(trainers)} approved K9 trainers")
    
    def test_trainer_data_quality(self):
        """Verify trainer data has expected quality"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        trainers = response.json()["trainers"]
        
        for trainer in trainers:
            # All trainers should be verified
            assert trainer["verified"] == True
            # Rating should be 4.5+
            assert trainer["rating"] >= 4.5
            # Should have multiple certifications
            assert len(trainer["certifications"]) >= 2
            # Should have at least one specialization
            assert len(trainer["specializations"]) >= 1
        
        print("SUCCESS: All trainers have high quality verified data")
    
    def test_get_trainer_pricing_info(self):
        """GET /api/trainers/pricing/info - returns pricing and equipment info"""
        response = requests.get(f"{BASE_URL}/api/trainers/pricing/info")
        assert response.status_code == 200
        
        data = response.json()
        assert "pricing" in data
        assert "equipment" in data
        assert "behavioural_issues" in data
        
        # Check pricing structure
        pricing = data["pricing"]
        assert "virtual" in pricing
        assert "in_person" in pricing
        assert "travel" in pricing
        
        # Virtual pricing
        assert pricing["virtual"]["30min"]["price"] == 29.99
        assert pricing["virtual"]["60min"]["price"] == 45.00
        
        # In-person pricing
        assert pricing["in_person"]["60min"]["price"] == 179.99
        assert pricing["in_person"]["120min"]["price"] == 320.00
        assert pricing["in_person"]["180min"]["price"] == 420.00
        
        # Travel costs
        assert pricing["travel"]["call_out_fee"] == 25.00
        assert pricing["travel"]["per_mile"] == 0.85
        
        # Admin fee for rescheduling
        assert "admin_fee" in pricing
        assert pricing["admin_fee"] == 25.00
        
        # Check equipment info
        assert len(data["equipment"]) >= 3
        
        # Check behavioural issues
        assert len(data["behavioural_issues"]) >= 5
        
        print("SUCCESS: Retrieved complete pricing, equipment, and behavioural issues info")
    
    def test_calculate_virtual_cost_30min(self):
        """POST /api/trainers/calculate-cost - virtual 30min"""
        payload = {
            "session_type": "virtual",
            "duration": "30min"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 29.99
        assert data["call_out_fee"] == 0
        assert data["travel_cost"] == 0
        assert data["total"] == 29.99
        
        print(f"SUCCESS: Virtual 30min cost: £{data['total']}")
    
    def test_calculate_virtual_cost_60min(self):
        """POST /api/trainers/calculate-cost - virtual 60min"""
        payload = {
            "session_type": "virtual",
            "duration": "60min"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 45.00
        assert data["total"] == 45.00
        
        print(f"SUCCESS: Virtual 60min cost: £{data['total']}")
    
    def test_calculate_in_person_cost_with_travel(self):
        """POST /api/trainers/calculate-cost - in-person with travel calculation"""
        payload = {
            "session_type": "in_person",
            "duration": "60min",
            "from_postcode": "SW1A 1AA",
            "to_postcode": "EC1A 1BB"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 179.99
        assert data["call_out_fee"] == 25.00
        assert data["travel_cost"] > 0  # Variable based on estimated miles
        assert data["estimated_miles"] > 0
        assert data["total"] > 179.99 + 25.00  # Should include travel
        assert "admin_fee_note" in data
        
        print(f"SUCCESS: In-person 1hr with travel cost: £{data['total']} (includes £{data['travel_cost']} travel for {data['estimated_miles']} miles)")
    
    def test_calculate_in_person_2hour_cost(self):
        """POST /api/trainers/calculate-cost - in-person 2 hours"""
        payload = {
            "session_type": "in_person",
            "duration": "120min"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 320.00
        
        print(f"SUCCESS: In-person 2hr cost: £{data['total']}")
    
    def test_calculate_in_person_3hour_intensive(self):
        """POST /api/trainers/calculate-cost - in-person 3 hour intensive"""
        payload = {
            "session_type": "in_person",
            "duration": "180min"
        }
        response = requests.post(f"{BASE_URL}/api/trainers/calculate-cost", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_cost"] == 420.00
        
        print(f"SUCCESS: In-person 3hr intensive cost: £{data['total']}")


class TestLanguageSupport:
    """Multi-Language Support API Tests"""
    
    def test_get_supported_languages(self):
        """GET /api/settings/languages - returns 5 supported languages"""
        response = requests.get(f"{BASE_URL}/api/settings/languages")
        assert response.status_code == 200
        
        data = response.json()
        assert "languages" in data
        
        languages = data["languages"]
        
        # Should have 5 languages
        assert len(languages) == 5, f"Expected 5 languages, got {len(languages)}"
        
        # Expected languages
        expected_langs = ["en-GB", "en-US", "es", "fr", "de"]
        for lang_code in expected_langs:
            assert lang_code in languages, f"Missing language: {lang_code}"
            lang = languages[lang_code]
            assert "name" in lang
            assert "flag" in lang
            assert "currency" in lang
            assert "currency_symbol" in lang
        
        # Verify specific language data
        assert languages["en-GB"]["name"] == "English (UK)"
        assert languages["en-GB"]["flag"] == "🇬🇧"
        assert languages["en-GB"]["currency"] == "GBP"
        assert languages["en-GB"]["currency_symbol"] == "£"
        
        assert languages["en-US"]["name"] == "English (US)"
        assert languages["en-US"]["flag"] == "🇺🇸"
        
        assert languages["es"]["name"] == "Español"
        assert languages["es"]["flag"] == "🇪🇸"
        
        assert languages["fr"]["name"] == "Français"
        assert languages["fr"]["flag"] == "🇫🇷"
        
        assert languages["de"]["name"] == "Deutsch"
        assert languages["de"]["flag"] == "🇩🇪"
        
        print(f"SUCCESS: Retrieved {len(languages)} supported languages: {list(languages.keys())}")


class TestAPIHealth:
    """Basic API Health Tests"""
    
    def test_api_root(self):
        """GET /api/ - API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        print("SUCCESS: API is healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
