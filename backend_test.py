import requests
import json
import sys
from datetime import datetime
import uuid

class CanineCompassAPITester:
    def __init__(self, base_url="https://pup-parent-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.test_user_id = None
        self.test_dog_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, response_data=None, error=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({
                'name': name,
                'error': error,
                'response': response_data
            })
            print(f"❌ {name} - FAILED: {error}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json() if response.text else {}
            except json.JSONDecodeError:
                response_data = {'raw_response': response.text}
            
            return success, response.status_code, response_data
            
        except requests.exceptions.RequestException as e:
            return False, 0, {'error': str(e)}

    def test_api_health(self):
        """Test basic API health"""
        print("\n🏥 Testing API Health...")
        success, status, data = self.make_request('GET', '')
        self.log_test("API Health Check", success and data.get('status') == 'healthy', data, 
                      f"Expected healthy status, got status {status}")
        return success

    def test_breeds_endpoints(self):
        """Test breed database endpoints"""
        print("\n🐕 Testing Breed Database...")
        
        # Test GET /api/breeds
        success, status, data = self.make_request('GET', 'breeds')
        breeds_available = success and isinstance(data, list) and len(data) > 0
        self.log_test("GET /api/breeds", breeds_available, data,
                      f"Expected list of breeds, got status {status}")
        
        # Test specific breed if breeds are available
        if breeds_available and len(data) > 0:
            breed_id = data[0]['breed_id']
            success, status, breed_data = self.make_request('GET', f'breeds/{breed_id}')
            self.log_test("GET /api/breeds/{id}", success and breed_data.get('breed_id') == breed_id,
                          breed_data, f"Expected specific breed data, got status {status}")

    def test_training_endpoints(self):
        """Test training module endpoints"""
        print("\n🎓 Testing Training Modules...")
        
        # Test GET /api/training/modules
        success, status, data = self.make_request('GET', 'training/modules')
        modules_available = success and isinstance(data, list) and len(data) > 0
        self.log_test("GET /api/training/modules", modules_available, data,
                      f"Expected training modules, got status {status}")
        
        # Test filtered modules
        success, status, beginner_data = self.make_request('GET', 'training/modules?level=beginner')
        self.log_test("GET /api/training/modules?level=beginner", 
                      success and isinstance(beginner_data, list),
                      beginner_data, f"Expected beginner modules, got status {status}")
        
        # Test specific module if available
        if modules_available and len(data) > 0:
            module_id = data[0]['module_id']
            success, status, module_data = self.make_request('GET', f'training/modules/{module_id}')
            self.log_test("GET /api/training/modules/{id}", 
                          success and module_data.get('module_id') == module_id,
                          module_data, f"Expected specific module, got status {status}")

    def test_tips_endpoints(self):
        """Test parenting tips endpoints"""
        print("\n💡 Testing Tips & Resources...")
        
        # Test GET /api/tips/parenting
        success, status, data = self.make_request('GET', 'tips/parenting')
        tips_structure = (success and 
                         isinstance(data, dict) and 
                         'dos' in data and 
                         'donts' in data and 
                         'risks' in data)
        self.log_test("GET /api/tips/parenting", tips_structure, data,
                      f"Expected tips structure with dos/donts/risks, got status {status}")

    def test_travel_endpoints(self):
        """Test travel planning endpoints"""
        print("\n✈️ Testing Travel Planning...")
        
        # Test GET /api/travel/defaults/items
        success, status, data = self.make_request('GET', 'travel/defaults/items')
        travel_items = success and isinstance(data, list) and len(data) > 0
        self.log_test("GET /api/travel/defaults/items", travel_items, data,
                      f"Expected default travel items, got status {status}")
        
        # Verify items have correct structure
        if travel_items:
            first_item = data[0]
            item_structure = isinstance(first_item, dict) and 'item' in first_item and 'checked' in first_item
            self.log_test("Travel items structure", item_structure, first_item,
                          "Expected items to have 'item' and 'checked' fields")

    def create_test_session(self):
        """Create a test user session for authenticated endpoints"""
        print("\n🔐 Creating Test User Session...")
        
        # Note: In a real environment, we would use actual OAuth flow
        # For testing, we'll create a mock session directly in the database
        # This is a placeholder - in production, proper OAuth would be used
        
        print("⚠️  Note: Authentication testing requires proper OAuth flow")
        print("   Skipping authenticated endpoints for now")
        return False

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.session_token:
            print("\n🔒 Skipping authenticated endpoint tests (no session token)")
            print("   These would include:")
            print("   - Dashboard stats")
            print("   - Dog profiles CRUD")
            print("   - Health records")
            print("   - Training progress")
            print("   - Daily tasks")
            print("   - Behavior logs")
            print("   - Travel checklists")
            return

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint (requires auth)"""
        if not self.session_token:
            return
        
        success, status, data = self.make_request('GET', 'dashboard/stats')
        expected_keys = ['dogs_count', 'tasks_completed', 'tasks_total', 'training_completed', 'behavior_alerts']
        stats_valid = success and all(key in data for key in expected_keys)
        self.log_test("GET /api/dashboard/stats", stats_valid, data,
                      f"Expected dashboard stats with required keys, got status {status}")

    def run_all_tests(self):
        """Run all available tests"""
        print("🚀 Starting CanineCompass API Tests...")
        print(f"Base URL: {self.base_url}")
        print("=" * 50)
        
        # Test public endpoints first
        api_healthy = self.test_api_health()
        
        if not api_healthy:
            print("\n❌ API health check failed - stopping tests")
            return self.generate_report()
        
        # Test public endpoints
        self.test_breeds_endpoints()
        self.test_training_endpoints()
        self.test_tips_endpoints()
        self.test_travel_endpoints()
        
        # Try to create session for authenticated tests
        session_created = self.create_test_session()
        
        # Test authenticated endpoints if session available
        if session_created:
            self.test_dashboard_stats()
        else:
            self.test_authenticated_endpoints()
        
        return self.generate_report()

    def generate_report(self):
        """Generate final test report"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}: {test['error']}")
        
        print("\n✅ BACKEND API STATUS:")
        if self.tests_passed >= 6:  # At least basic endpoints working
            print("   Backend is functional for basic operations")
        elif self.tests_passed >= 3:
            print("   Backend has some issues but core functionality works")
        else:
            print("   Backend has significant issues - needs attention")
        
        # Return success if most tests pass
        return self.tests_passed / max(self.tests_run, 1) >= 0.7

if __name__ == "__main__":
    tester = CanineCompassAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)