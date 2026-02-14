"""
Simple debug test for Battle Mode
"""
import requests
import json

print("🔍 Testing Battle Mode - Quick Debug")
print("=" * 60)

url = "http://localhost:8000/api/analyze"
payload = {
    "url": "https://google.com",
    "competitor_url": "https://bing.com",
    "lang": "fr"
}

print(f"\n📤 Sending request to: {url}")
print(f"   Payload: {json.dumps(payload, indent=2)}")
print("\n⏳ Waiting for response (max 2 minutes)...\n")

try:
    response = requests.post(url, json=payload, timeout=120)
    print(f"✅ Response received! Status: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        
        print("🔍 Checking Battle Mode fields:")
        print(f"   - Has 'competitor' field: {'competitor' in data}")
        print(f"   - versus_mode: {data.get('versus_mode', 'NOT FOUND')}")
        print(f"   - winner: {data.get('winner', 'NOT FOUND')}")
        
        if 'competitor' in data:
            print(f"\n✅ Competitor data EXISTS")
            print(f"   - Competitor URL: {data['competitor'].get('url', 'Unknown')}")
            print(f"   - Main Score: {data.get('global_score', 0)}")
            print(f"   - Competitor Score: {data['competitor'].get('global_score', 0)}")
        else:
            print(f"\n❌ NO COMPETITOR DATA - This is the problem!")
            print(f"\n📋 Available keys in response:")
            for key in data.keys():
                print(f"   - {key}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
except requests.exceptions.Timeout:
    print("❌ REQUEST TIMED OUT (>120s)")
except requests.exceptions.ConnectionError:
    print("❌ CONNECTION REFUSED - Backend not running?")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
