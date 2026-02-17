"""
Daily Rewards, Health Hub, and Achievements API Testing
Tests for:
- Daily Reward Status: GET /api/daily-reward/status
- Daily Reward Claim: POST /api/daily-reward/claim
- Health Records: GET /api/health/{dog_id}, POST /api/health, DELETE /api/health/{record_id}
- Vets: GET /api/vets, POST /api/vets, DELETE /api/vets/{vet_id}
- Achievements: GET /api/achievements
- K9 Credentials: GET /api/k9/credentials
- K9 Certificates: GET /api/k9/certificates
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDailyRewardsNoAuth:
    """Test daily reward endpoints without authentication - should require auth"""
    
    def test_daily_reward_status_requires_auth(self):
        """GET /api/daily-reward/status should require authentication"""
        response = requests.get(f"{BASE_URL}/api/daily-reward/status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/daily-reward/status requires auth (401)")
    
    def test_daily_reward_claim_requires_auth(self):
        """POST /api/daily-reward/claim should require authentication"""
        response = requests.post(f"{BASE_URL}/api/daily-reward/claim")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/daily-reward/claim requires auth (401)")


class TestHealthHubNoAuth:
    """Test health hub endpoints without authentication - should require auth"""
    
    def test_health_records_requires_auth(self):
        """GET /api/health/{dog_id} should require authentication"""
        response = requests.get(f"{BASE_URL}/api/health/test_dog_123")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/health/{dog_id} requires auth (401)")
    
    def test_create_health_record_requires_auth(self):
        """POST /api/health should require authentication"""
        response = requests.post(f"{BASE_URL}/api/health", json={
            "dog_id": "test_dog",
            "record_type": "checkup",
            "title": "Test Checkup"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/health requires auth (401)")
    
    def test_delete_health_record_requires_auth(self):
        """DELETE /api/health/{record_id} should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/health/test_record_123")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ DELETE /api/health/{record_id} requires auth (401)")


class TestVetsNoAuth:
    """Test vets endpoints without authentication - should require auth"""
    
    def test_get_vets_requires_auth(self):
        """GET /api/vets should require authentication"""
        response = requests.get(f"{BASE_URL}/api/vets")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/vets requires auth (401)")
    
    def test_add_vet_requires_auth(self):
        """POST /api/vets should require authentication"""
        response = requests.post(f"{BASE_URL}/api/vets", json={
            "name": "Dr. Test",
            "clinic": "Test Clinic",
            "phone": "123-456-7890"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/vets requires auth (401)")
    
    def test_delete_vet_requires_auth(self):
        """DELETE /api/vets/{vet_id} should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/vets/test_vet_123")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ DELETE /api/vets/{vet_id} requires auth (401)")


class TestAchievementsNoAuth:
    """Test achievements endpoints without authentication - should require auth"""
    
    def test_achievements_requires_auth(self):
        """GET /api/achievements should require authentication"""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/achievements requires auth (401)")
    
    def test_share_achievement_requires_auth(self):
        """POST /api/achievements/{id}/share should require authentication"""
        response = requests.post(f"{BASE_URL}/api/achievements/test_ach_123/share")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/achievements/{id}/share requires auth (401)")


class TestK9CredentialsNoAuth:
    """Test K9 credentials endpoints without authentication - should require auth"""
    
    def test_k9_credentials_requires_auth(self):
        """GET /api/k9/credentials should require authentication"""
        response = requests.get(f"{BASE_URL}/api/k9/credentials")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/k9/credentials requires auth (401)")
    
    def test_k9_certificates_requires_auth(self):
        """GET /api/k9/certificates should require authentication"""
        response = requests.get(f"{BASE_URL}/api/k9/certificates")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/k9/certificates requires auth (401)")
    
    def test_generate_certificate_requires_auth(self):
        """POST /api/k9/generate-certificate should require authentication"""
        response = requests.post(f"{BASE_URL}/api/k9/generate-certificate")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/k9/generate-certificate requires auth (401)")


class TestDogProfilesNoAuth:
    """Test dog profile endpoints without authentication"""
    
    def test_get_dogs_requires_auth(self):
        """GET /api/dogs should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dogs")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/dogs requires auth (401)")
    
    def test_create_dog_requires_auth(self):
        """POST /api/dogs should require authentication"""
        response = requests.post(f"{BASE_URL}/api/dogs", json={
            "name": "TestDog",
            "breed": "Labrador"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/dogs requires auth (401)")


class TestVirtualPetNoAuth:
    """Test virtual pet endpoints without authentication"""
    
    def test_get_virtual_pet_requires_auth(self):
        """GET /api/virtual-pet should require authentication"""
        response = requests.get(f"{BASE_URL}/api/virtual-pet")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/virtual-pet requires auth (401)")
    
    def test_feed_pet_requires_auth(self):
        """POST /api/virtual-pet/feed should require authentication"""
        response = requests.post(f"{BASE_URL}/api/virtual-pet/feed")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/virtual-pet/feed requires auth (401)")
    
    def test_play_pet_requires_auth(self):
        """POST /api/virtual-pet/play should require authentication"""
        response = requests.post(f"{BASE_URL}/api/virtual-pet/play")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/virtual-pet/play requires auth (401)")


class TestTrainingEndpoints:
    """Test training endpoints (some public, some auth required)"""
    
    def test_get_training_lessons_public(self):
        """GET /api/training/lessons should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return training lessons"
        print(f"✓ GET /api/training/lessons returns {len(data)} lessons")
    
    def test_get_training_lessons_by_level(self):
        """GET /api/training/lessons?level=beginner should filter by level"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=beginner")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for lesson in data:
            assert lesson.get("level") == "beginner", f"Expected beginner, got {lesson.get('level')}"
        print(f"✓ GET /api/training/lessons?level=beginner returns {len(data)} beginner lessons")
    
    def test_get_training_lesson_detail_public(self):
        """GET /api/training/lessons/{lesson_id} should be publicly accessible"""
        # First get a lesson_id
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        lessons = response.json()
        if lessons:
            lesson_id = lessons[0].get("lesson_id")
            detail_response = requests.get(f"{BASE_URL}/api/training/lessons/{lesson_id}")
            assert detail_response.status_code == 200
            lesson = detail_response.json()
            assert "lesson_id" in lesson
            assert "title" in lesson
            assert "steps" in lesson
            print(f"✓ GET /api/training/lessons/{lesson_id} returns lesson detail")
        else:
            pytest.skip("No lessons available")


class TestAPIRoot:
    """Test API root and health check"""
    
    def test_api_root_status(self):
        """API root should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "healthy"
        assert "breeds_count" in data
        assert "lessons_count" in data
        assert data.get("message") == "CanineCompass API v2"
        
        print(f"✓ API root: {data.get('message')}, breeds={data.get('breeds_count')}, lessons={data.get('lessons_count')}")


class TestShareLinksNoAuth:
    """Test share link endpoints (some public)"""
    
    def test_share_lesson_link_public(self):
        """GET /api/share/lesson/{lesson_id} should work for public lessons"""
        # First get a lesson_id
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        lessons = response.json()
        if lessons:
            lesson_id = lessons[0].get("lesson_id")
            share_response = requests.get(f"{BASE_URL}/api/share/lesson/{lesson_id}")
            assert share_response.status_code == 200
            data = share_response.json()
            assert "share_url" in data
            assert "lesson_title" in data
            print(f"✓ GET /api/share/lesson/{lesson_id} returns share link")
        else:
            pytest.skip("No lessons available")


class TestDailyRewardStreakConfig:
    """Test that daily reward streak configuration matches expected values"""
    
    def test_streak_rewards_exist_in_api(self):
        """Verify the daily reward endpoint exists and is protected"""
        # This just confirms the endpoint exists and is properly protected
        response = requests.get(f"{BASE_URL}/api/daily-reward/status")
        assert response.status_code == 401  # Protected by auth
        print("✓ Daily reward endpoint exists and is protected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
