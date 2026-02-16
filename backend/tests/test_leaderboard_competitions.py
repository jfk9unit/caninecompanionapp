"""
Backend API tests for CanineCompass Leaderboard & Competitions Features
Tests: Leaderboard endpoints, category filtering, competitions/challenges endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLeaderboardPublic:
    """Test public leaderboard endpoints (no auth required)"""
    
    def test_get_overall_leaderboard(self):
        """GET /api/leaderboard - Returns overall rankings with scores"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "leaderboard" in data
        assert "category" in data
        assert data["category"] == "overall"
        
        # Leaderboard should be a list
        assert isinstance(data["leaderboard"], list)
        print(f"Overall leaderboard entries: {len(data['leaderboard'])}")
        
        # If there are entries, verify structure
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            assert "user_id" in entry
            assert "name" in entry
            assert "score" in entry
            # Overall category should have breakdown fields
            assert "training_completed" in entry
            assert "achievements" in entry
            assert "pet_xp" in entry
            assert "referrals" in entry
            print(f"First entry score: {entry['score']}, Name: {entry['name']}")
    
    def test_leaderboard_category_training(self):
        """GET /api/leaderboard?category=training - Returns training rankings"""
        response = requests.get(f"{BASE_URL}/api/leaderboard?category=training")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data
        assert "category" in data
        assert data["category"] == "training"
        assert isinstance(data["leaderboard"], list)
        print(f"Training leaderboard entries: {len(data['leaderboard'])}")
    
    def test_leaderboard_category_pet(self):
        """GET /api/leaderboard?category=pet - Returns pet XP rankings"""
        response = requests.get(f"{BASE_URL}/api/leaderboard?category=pet")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data
        assert "category" in data
        assert data["category"] == "pet"
        assert isinstance(data["leaderboard"], list)
        
        # If entries exist, verify pet-specific fields
        if len(data["leaderboard"]) > 0:
            entry = data["leaderboard"][0]
            assert "rank" in entry
            assert "user_id" in entry
            assert "score" in entry
            # Pet category has pet_name field
            assert "pet_name" in entry
            print(f"Top pet: {entry.get('pet_name')} with score {entry['score']}")
        print(f"Pet leaderboard entries: {len(data['leaderboard'])}")
    
    def test_leaderboard_category_achievements(self):
        """GET /api/leaderboard?category=achievements - Returns achievements rankings"""
        response = requests.get(f"{BASE_URL}/api/leaderboard?category=achievements")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data
        assert "category" in data
        assert data["category"] == "achievements"
        assert isinstance(data["leaderboard"], list)
        print(f"Achievements leaderboard entries: {len(data['leaderboard'])}")
    
    def test_leaderboard_with_limit(self):
        """GET /api/leaderboard?limit=5 - Returns limited rankings"""
        response = requests.get(f"{BASE_URL}/api/leaderboard?limit=5")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data
        # Should have at most 5 entries
        assert len(data["leaderboard"]) <= 5
        print(f"Leaderboard with limit=5: {len(data['leaderboard'])} entries")


class TestLeaderboardAuthenticated:
    """Test authenticated leaderboard endpoints"""
    
    def test_my_rank_requires_auth(self):
        """GET /api/leaderboard/my-rank - Returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/my-rank")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "Not authenticated" in data["detail"]
        print("my-rank correctly requires authentication")


class TestCompetitionsAuthenticated:
    """Test authenticated competitions/challenges endpoints"""
    
    def test_challenges_requires_auth(self):
        """GET /api/competitions/challenges - Returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/competitions/challenges")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "Not authenticated" in data["detail"]
        print("challenges correctly requires authentication")
    
    def test_claim_requires_auth(self):
        """POST /api/competitions/claim/{challenge_id} - Returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/competitions/claim/training_master")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "Not authenticated" in data["detail"]
        print("claim correctly requires authentication")


class TestScoreCalculation:
    """Test that score calculation is working correctly"""
    
    def test_score_formula_validation(self):
        """Validate score formula: training*10 + achievements*5 + pet_xp + referrals*15"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        
        # Verify score calculation for each entry
        for entry in data["leaderboard"]:
            expected_score = (
                (entry.get("training_completed", 0) * 10) +
                (entry.get("achievements", 0) * 5) +
                entry.get("pet_xp", 0) +
                (entry.get("referrals", 0) * 15)
            )
            actual_score = entry.get("score", 0)
            assert actual_score == expected_score, f"Score mismatch: expected {expected_score}, got {actual_score}"
            print(f"Score validated for {entry['name']}: {actual_score}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
