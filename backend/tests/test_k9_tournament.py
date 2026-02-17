"""
Test K9 Security Training and Seasonal Tournaments
Tests for:
- 90 total training lessons
- 15 K9 security lessons with 18-25 token costs
- Seasonal tournament endpoints (Winter Guardian Championship)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTrainingLessons:
    """Training lesson endpoint tests"""
    
    def test_get_all_lessons_returns_90_total(self):
        """Verify total lesson count is 90"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 90, f"Expected 90 lessons, got {len(lessons)}"
    
    def test_get_k9_security_lessons_returns_15(self):
        """Verify K9 security lessons count is 15"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 15, f"Expected 15 K9 lessons, got {len(lessons)}"
    
    def test_k9_lesson_ids_are_correct(self):
        """Verify K9 lesson IDs are k9_001 to k9_015"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        expected_ids = [f"k9_{str(i).zfill(3)}" for i in range(1, 16)]
        actual_ids = [lesson["lesson_id"] for lesson in lessons]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing lesson_id: {expected_id}"
    
    def test_k9_lessons_token_costs_between_18_and_25(self):
        """Verify all K9 lessons have token costs between 18-25"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        for lesson in lessons:
            token_cost = lesson["token_cost"]
            assert 18 <= token_cost <= 25, (
                f"Lesson {lesson['lesson_id']} has token_cost {token_cost}, "
                f"expected between 18-25"
            )
    
    def test_k9_lessons_have_badge_rewards(self):
        """Verify K9 lessons have badge_reward field"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        for lesson in lessons:
            assert "badge_reward" in lesson, f"Lesson {lesson['lesson_id']} missing badge_reward"
            assert lesson["badge_reward"] is not None, f"Lesson {lesson['lesson_id']} has null badge_reward"
    
    def test_k9_lessons_are_in_k9_protection_category(self):
        """Verify K9 lessons are in k9_protection category"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        for lesson in lessons:
            assert lesson["category"] == "k9_protection", (
                f"Lesson {lesson['lesson_id']} has category '{lesson['category']}', "
                f"expected 'k9_protection'"
            )
    
    def test_lessons_have_required_fields(self):
        """Verify lessons have all required fields"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        required_fields = [
            "lesson_id", "title", "description", "level", "category",
            "difficulty", "token_cost", "duration_minutes", "steps",
            "tips", "order"
        ]
        
        for lesson in lessons:
            for field in required_fields:
                assert field in lesson, f"Lesson {lesson['lesson_id']} missing field: {field}"


class TestSeasonalTournaments:
    """Seasonal tournament endpoint tests"""
    
    def test_get_current_tournament_returns_active(self):
        """Verify current tournament endpoint returns active tournament"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        assert data.get("active") == True, "Expected active tournament"
    
    def test_current_tournament_is_winter_guardian(self):
        """Verify Winter Guardian Championship is active in Feb"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        tournament = data.get("tournament", {})
        assert tournament.get("id") == "winter_guardian", f"Expected winter_guardian, got {tournament.get('id')}"
        assert tournament.get("name") == "Winter Guardian Championship"
    
    def test_tournament_has_k9_protection_theme(self):
        """Verify Winter Guardian has k9_protection theme"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        tournament = data.get("tournament", {})
        assert tournament.get("theme") == "k9_protection"
    
    def test_tournament_has_prizes(self):
        """Verify tournament has prize structure"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        prizes = data.get("tournament", {}).get("prizes", {})
        assert "1st" in prizes, "Missing 1st place prize"
        assert "2nd" in prizes, "Missing 2nd place prize"
        assert "3rd" in prizes, "Missing 3rd place prize"
        assert "top_10" in prizes, "Missing top_10 prize"
        
        # Verify prize amounts for Winter Guardian
        assert prizes["1st"]["tokens"] == 150, "1st place should be 150 tokens"
        assert prizes["2nd"]["tokens"] == 75, "2nd place should be 75 tokens"
        assert prizes["3rd"]["tokens"] == 35, "3rd place should be 35 tokens"
        assert prizes["top_10"]["tokens"] == 15, "Top 10 should be 15 tokens"
    
    def test_tournament_has_leaderboard(self):
        """Verify tournament has leaderboard array"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data, "Missing leaderboard"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
    
    def test_tournament_has_days_remaining(self):
        """Verify tournament shows days remaining"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        assert "days_remaining" in data, "Missing days_remaining"
        assert isinstance(data["days_remaining"], int), "days_remaining should be integer"
        assert data["days_remaining"] >= 0, "days_remaining should be non-negative"
    
    def test_tournament_scoring_is_k9_training(self):
        """Verify Winter Guardian scores by k9_training"""
        response = requests.get(f"{BASE_URL}/api/tournaments/current")
        assert response.status_code == 200
        data = response.json()
        
        tournament = data.get("tournament", {})
        assert tournament.get("scoring") == "k9_training"
    
    def test_my_position_requires_auth(self):
        """Verify /tournaments/my-position requires authentication"""
        response = requests.get(f"{BASE_URL}/api/tournaments/my-position")
        assert response.status_code == 401, "Expected 401 Unauthorized"
    
    def test_tournament_history_requires_auth(self):
        """Verify /tournaments/history requires authentication"""
        response = requests.get(f"{BASE_URL}/api/tournaments/history")
        assert response.status_code == 401, "Expected 401 Unauthorized"


class TestTrainingLevels:
    """Test all training levels exist"""
    
    def test_beginner_lessons_exist(self):
        """Verify beginner level lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=beginner")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) > 0, "No beginner lessons found"
        
        # Check token costs are 6-8
        for lesson in lessons:
            assert 6 <= lesson["token_cost"] <= 8, f"Beginner lesson {lesson['lesson_id']} has cost {lesson['token_cost']}"
    
    def test_intermediate_lessons_exist(self):
        """Verify intermediate level lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=intermediate")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) > 0, "No intermediate lessons found"
        
        # Check token costs are 9-11
        for lesson in lessons:
            assert 9 <= lesson["token_cost"] <= 11, f"Intermediate lesson {lesson['lesson_id']} has cost {lesson['token_cost']}"
    
    def test_advanced_lessons_exist(self):
        """Verify advanced level lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=advanced")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) > 0, "No advanced lessons found"
        
        # Check token costs are 12-15
        for lesson in lessons:
            assert 12 <= lesson["token_cost"] <= 15, f"Advanced lesson {lesson['lesson_id']} has cost {lesson['token_cost']}"
    
    def test_expert_lessons_exist(self):
        """Verify expert level lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=expert")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) > 0, "No expert lessons found"
        
        # Check token costs are 14-15
        for lesson in lessons:
            assert 14 <= lesson["token_cost"] <= 15, f"Expert lesson {lesson['lesson_id']} has cost {lesson['token_cost']}"


class TestWeeklyChallenges:
    """Test weekly challenges include K9 challenge"""
    
    def test_challenges_endpoint_requires_auth(self):
        """Verify challenges endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/competitions/challenges")
        assert response.status_code == 401, "Expected 401 Unauthorized"


class TestLessonSpecificEndpoint:
    """Test individual lesson retrieval"""
    
    def test_get_k9_lesson_by_id(self):
        """Verify can get specific K9 lesson by ID"""
        response = requests.get(f"{BASE_URL}/api/training/lessons/k9_001")
        assert response.status_code == 200
        lesson = response.json()
        
        assert lesson["lesson_id"] == "k9_001"
        assert lesson["title"] == "K9 Foundation: Alert & Watch"
        assert lesson["token_cost"] == 18
        assert lesson["level"] == "security"
    
    def test_get_last_k9_lesson(self):
        """Verify k9_015 exists (Master Certification)"""
        response = requests.get(f"{BASE_URL}/api/training/lessons/k9_015")
        assert response.status_code == 200
        lesson = response.json()
        
        assert lesson["lesson_id"] == "k9_015"
        assert lesson["title"] == "K9 Master Protection Certification"
        assert lesson["token_cost"] == 25
    
    def test_get_nonexistent_lesson_returns_404(self):
        """Verify 404 for non-existent lesson"""
        response = requests.get(f"{BASE_URL}/api/training/lessons/k9_999")
        assert response.status_code == 404


class TestAPIHealth:
    """API health and lessons count in root"""
    
    def test_root_shows_90_lessons(self):
        """Verify root endpoint shows 90 lessons count"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("lessons_count") == 90, f"Expected 90 lessons, got {data.get('lessons_count')}"
