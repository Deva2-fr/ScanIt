import sys
import os
import asyncio

# Ensure backend folder is in path
sys.path.append(os.getcwd())

from app.core.plans import PLANS
from app.core.permissions import FeatureGuard
from app.models.user import User

async def test_permissions():
    print("🧪 Testing Permission Enforcement...\n")

    # 1. Test "Starter" Plan Constraints
    print("--- [Test 1] Starter Plan Constraints ---")
    starter_features = PLANS["starter"]["features"]
    
    # Mock a "Security" scan request for Starter
    if "security_scan" in starter_features:
        print("❌ FAIL: Starter should NOT have security_scan")
    else:
        print("✅ PASS: Starter properly excludes security_scan")

    # 2. Test FeatureGuard Logic
    print("\n--- [Test 2] FeatureGuard Logic ---")
    mock_user = User(email="test@test.com", plan_tier="starter")
    
    can_security = FeatureGuard.can_perform_action(mock_user, "security_scan")
    if can_security:
        print("❌ FAIL: FeatureGuard allowed security_scan for Starter")
    else:
        print("✅ PASS: FeatureGuard blocked security_scan for Starter")
        
    can_seo = FeatureGuard.can_perform_action(mock_user, "seo_scan")
    if can_seo:
        print("✅ PASS: FeatureGuard allowed seo_scan for Starter")
    else:
        print("❌ FAIL: FeatureGuard blocked seo_scan for Starter")

    print("\n🏁 Verification Complete.")

if __name__ == "__main__":
    asyncio.run(test_permissions())
