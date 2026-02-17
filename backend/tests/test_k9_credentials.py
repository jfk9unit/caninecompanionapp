"""
K9 Handler Credentials and PWA Testing
Tests for:
- GET /api/k9/credentials - Handler credential info (requires auth)
- POST /api/k9/generate-certificate - Generate downloadable certificate (requires auth)
- GET /api/k9/certificates - Certificate history (requires auth)
- PWA manifest.json accessibility
- Service worker accessibility
- App icons accessibility
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestK9Credentials:
    """K9 Handler Credentials API tests"""
    
    def test_k9_credentials_requires_auth(self):
        """GET /api/k9/credentials should require authentication"""
        response = requests.get(f"{BASE_URL}/api/k9/credentials")
        assert response.status_code == 401
        print("✓ GET /api/k9/credentials requires auth (401)")
    
    def test_k9_generate_certificate_requires_auth(self):
        """POST /api/k9/generate-certificate should require authentication"""
        response = requests.post(f"{BASE_URL}/api/k9/generate-certificate")
        assert response.status_code == 401
        print("✓ POST /api/k9/generate-certificate requires auth (401)")
    
    def test_k9_certificates_list_requires_auth(self):
        """GET /api/k9/certificates should require authentication"""
        response = requests.get(f"{BASE_URL}/api/k9/certificates")
        assert response.status_code == 401
        print("✓ GET /api/k9/certificates requires auth (401)")


class TestPWAAssets:
    """PWA Asset accessibility tests"""
    
    def test_manifest_accessible(self):
        """manifest.json should be accessible at /manifest.json"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        # Validate manifest structure
        assert "name" in data
        assert "short_name" in data
        assert "icons" in data
        assert "start_url" in data
        assert "display" in data
        assert "theme_color" in data
        
        # Validate specific values
        assert data["name"] == "CanineCompass - Dog Training & Care"
        assert data["short_name"] == "CanineCompass"
        assert data["display"] == "standalone"
        assert data["theme_color"] == "#22c55e"
        
        print(f"✓ manifest.json accessible with name: {data['name']}")
        print(f"  - Has {len(data['icons'])} icons defined")
        print(f"  - display: {data['display']}, theme_color: {data['theme_color']}")
    
    def test_manifest_icons_defined(self):
        """manifest.json should define required app icons"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        icons = data.get("icons", [])
        assert len(icons) >= 4  # At least 4 icon sizes
        
        # Check for required sizes
        sizes = [icon.get("sizes") for icon in icons]
        required_sizes = ["192x192", "512x512"]
        for size in required_sizes:
            assert size in sizes, f"Missing icon size: {size}"
        
        print(f"✓ manifest.json has {len(icons)} icons including 192x192 and 512x512")
    
    def test_manifest_shortcuts_defined(self):
        """manifest.json should define PWA shortcuts"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        shortcuts = data.get("shortcuts", [])
        assert len(shortcuts) >= 1  # At least 1 shortcut
        
        shortcut_urls = [s.get("url") for s in shortcuts]
        assert "/dashboard" in shortcut_urls or "/training" in shortcut_urls
        
        print(f"✓ manifest.json has {len(shortcuts)} shortcuts defined")
    
    def test_service_worker_accessible(self):
        """Service worker should be accessible at /service-worker.js"""
        response = requests.get(f"{BASE_URL}/service-worker.js")
        assert response.status_code == 200
        
        content = response.text
        assert "CACHE_NAME" in content or "cache" in content.lower()
        assert "install" in content.lower()
        assert "fetch" in content.lower()
        
        print("✓ service-worker.js accessible and contains caching logic")
    
    def test_icon_192x192_accessible(self):
        """192x192 app icon should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-192x192.png")
        assert response.status_code == 200
        assert "image/png" in response.headers.get("content-type", "")
        
        print(f"✓ icon-192x192.png accessible ({len(response.content)} bytes)")
    
    def test_icon_512x512_accessible(self):
        """512x512 app icon should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-512x512.png")
        assert response.status_code == 200
        assert "image/png" in response.headers.get("content-type", "")
        
        print(f"✓ icon-512x512.png accessible ({len(response.content)} bytes)")
    
    def test_icon_72x72_accessible(self):
        """72x72 app icon should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-72x72.png")
        assert response.status_code == 200
        
        print(f"✓ icon-72x72.png accessible")
    
    def test_icon_144x144_accessible(self):
        """144x144 app icon should be accessible"""
        response = requests.get(f"{BASE_URL}/icons/icon-144x144.png")
        assert response.status_code == 200
        
        print(f"✓ icon-144x144.png accessible")


class TestK9CredentialTiers:
    """Test K9 credential tier configuration"""
    
    def test_k9_training_lessons_exist(self):
        """Verify K9 training lessons exist for credentials"""
        response = requests.get(f"{BASE_URL}/api/training/lessons?level=security")
        assert response.status_code == 200
        lessons = response.json()
        
        # K9 lessons required for credentials
        assert len(lessons) >= 15  # Should have 15 K9 lessons
        
        # Verify all start with k9_
        k9_lessons = [l for l in lessons if l.get("lesson_id", "").startswith("k9_")]
        assert len(k9_lessons) >= 15
        
        print(f"✓ {len(k9_lessons)} K9 security lessons available for credentials")
        
        # Verify tier requirements - lessons needed per tier
        # Tier 1: 1 lesson, Tier 2: 3, Tier 3: 6, Tier 4: 10, Tier 5: 15
        assert len(k9_lessons) >= 15, "Need 15 K9 lessons for K9 Master tier (tier 5)"
        
        print("✓ Sufficient K9 lessons for all 5 credential tiers")


class TestAPIHealthAndRouting:
    """Test API health and routing"""
    
    def test_api_root(self):
        """API root should be accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "healthy"
        assert "breeds_count" in data
        assert "lessons_count" in data
        
        print(f"✓ API root: status={data['status']}, lessons={data['lessons_count']}")
    
    def test_training_lessons_endpoint(self):
        """Training lessons endpoint should return all lessons"""
        response = requests.get(f"{BASE_URL}/api/training/lessons")
        assert response.status_code == 200
        lessons = response.json()
        
        assert isinstance(lessons, list)
        assert len(lessons) >= 75  # At least 75 regular + 15 K9 = 90
        
        print(f"✓ Training lessons: {len(lessons)} total lessons")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
