"""
Backend API tests for CanineCompass V2 Features
Tests: Token packages, breeds, training lessons, and health endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Test API health and status"""
    
    def test_api_health(self):
        """GET /api/ - API health check returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["message"] == "CanineCompass API v2"
        assert "breeds_count" in data
        assert "lessons_count" in data
        print(f"API Health: {data}")


class TestTokenPackages:
    """Test token packages endpoint"""
    
    def test_get_token_packages(self):
        """GET /api/tokens/packages - Returns all token packages"""
        response = requests.get(f"{BASE_URL}/api/tokens/packages")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all packages exist
        assert "starter" in data
        assert "value" in data
        assert "premium" in data
        assert "ultimate" in data
        
        # Verify starter package structure
        starter = data["starter"]
        assert starter["tokens"] == 10
        assert starter["price"] == 2.89
        assert starter["currency"] == "gbp"
        
        # Verify value package
        value = data["value"]
        assert value["tokens"] == 25
        assert value["price"] == 6.49
        
        # Verify premium package
        premium = data["premium"]
        assert premium["tokens"] == 50
        assert premium["price"] == 11.99
        
        # Verify ultimate package
        ultimate = data["ultimate"]
        assert ultimate["tokens"] == 100
        assert ultimate["price"] == 21.99
        
        print(f"Token packages count: {len(data)}")


class TestBreeds:
    """Test dog breeds endpoint"""
    
    def test_get_all_breeds(self):
        """GET /api/breeds - Returns 132+ breeds"""
        response = requests.get(f"{BASE_URL}/api/breeds")
        assert response.status_code == 200
        data = response.json()
        
        # Should have 132+ breeds
        assert len(data) >= 132, f"Expected 132+ breeds, got {len(data)}"
        print(f"Total breeds: {len(data)}")
        
    def test_breed_structure(self):
        """GET /api/breeds - Verify breed data structure"""
        response = requests.get(f"{BASE_URL}/api/breeds")
        assert response.status_code == 200
        data = response.json()
        
        # Check first breed has required fields
        breed = data[0]
        required_fields = ["breed_id", "name", "size", "temperament", "exercise_needs"]
        for field in required_fields:
            assert field in breed, f"Missing field: {field}"
            
    def test_breeds_filter_by_size(self):
        """GET /api/breeds?size=small - Filter breeds by size"""
        response = requests.get(f"{BASE_URL}/api/breeds?size=small")
        assert response.status_code == 200
        data = response.json()
        
        # All returned breeds should be small
        for breed in data:
            assert breed["size"] == "small", f"Expected small breed, got {breed['size']}"
        print(f"Small breeds: {len(data)}")
        
    def test_breeds_search(self):
        """GET /api/breeds?search=labrador - Search breeds"""
        response = requests.get(f"{BASE_URL}/api/breeds?search=labrador")
        assert response.status_code == 200
        data = response.json()
        
        # Should find Labrador breeds
        assert len(data) > 0, "No Labrador breeds found"
        for breed in data:
            assert "labrador" in breed["name"].lower()
        print(f"Labrador breeds found: {len(data)}")


class TestTrainingLessons:
    """Test training lessons endpoint"""
    
    def test_get_all_lessons(self):
        """GET /api/training/lessons - Returns 75 lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200
        data = response.json()
        
        # Should have exactly 75 lessons
        assert len(data) == 75, f"Expected 75 lessons, got {len(data)}"
        print(f"Total lessons: {len(data)}")
        
    def test_lesson_structure(self):
        """GET /api/training/lessons - Verify lesson data structure"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200
        data = response.json()
        
        # Check first lesson has required fields
        lesson = data[0]
        required_fields = ["lesson_id", "title", "description", "level", "category", "token_cost", "steps"]
        for field in required_fields:
            assert field in lesson, f"Missing field: {field}"
            
    def test_lessons_filter_by_level(self):
        """GET /api/training/lessons?level=beginner - Filter by level"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=beginner")
        assert response.status_code == 200
        data = response.json()
        
        # All returned lessons should be beginner
        for lesson in data:
            assert lesson["level"] == "beginner"
        print(f"Beginner lessons: {len(data)}")
        
    def test_lessons_filter_by_category(self):
        """GET /api/training/lessons?category=obedience - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?category=obedience")
        assert response.status_code == 200
        data = response.json()
        
        # All returned lessons should be obedience category
        for lesson in data:
            assert lesson["category"] == "obedience"
        print(f"Obedience lessons: {len(data)}")
        
    def test_get_single_lesson(self):
        """GET /api/training/lessons/{lesson_id} - Get specific lesson"""
        response = requests.get(f"{BASE_URL}/api/training/lessons/lesson_001")
        assert response.status_code == 200
        data = response.json()
        
        assert data["lesson_id"] == "lesson_001"
        assert "title" in data
        assert "steps" in data


class TestParentingTips:
    """Test parenting tips endpoint"""
    
    def test_get_parenting_tips(self):
        """GET /api/tips/parenting - Returns dos, donts, risks"""
        response = requests.get(f"{BASE_URL}/api/tips/parenting")
        assert response.status_code == 200
        data = response.json()
        
        assert "dos" in data
        assert "donts" in data
        assert "risks" in data
        assert len(data["dos"]) >= 1
        assert len(data["donts"]) >= 1
        assert len(data["risks"]) >= 1
        print(f"Tips - Dos: {len(data['dos'])}, Donts: {len(data['donts'])}, Risks: {len(data['risks'])}")


class TestTravelDefaults:
    """Test travel defaults endpoint"""
    
    def test_get_travel_items(self):
        """GET /api/travel/defaults/items - Returns default travel items"""
        response = requests.get(f"{BASE_URL}/api/travel/defaults/items")
        assert response.status_code == 200
        data = response.json()
        
        # Should have travel items
        assert len(data) >= 10, f"Expected 10+ travel items, got {len(data)}"
        
        # Each item should have item and checked fields
        for item in data:
            assert "item" in item
            assert "checked" in item
        print(f"Travel items count: {len(data)}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
