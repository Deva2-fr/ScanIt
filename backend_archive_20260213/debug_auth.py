import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"
EMAIL = f"test_debug_{int(time.time())}@example.com"
PASSWORD = "Password123!"

def test_auth():
    print(f"--- DIAGNOSTIC AUTHENTIFICATION ---")
    print(f"Cible: {BASE_URL}")
    
    # 1. Check Health
    try:
        r = requests.get(f"http://127.0.0.1:8000/api/health")
        print(f"[CHECK] Health: {r.status_code} (Attendu: 200)")
    except Exception as e:
        print(f"[FAIL] Impossible de contacter le serveur: {e}")
        return

    # 2. Register
    print(f"\n[STEP] Tentative d'inscription ({EMAIL})...")
    payload = {
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Debug User"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Reponse: {r.text}")
    
    if r.status_code not in [200, 201]:
        print("[FAIL] Inscription échouée")
        return

    # 3. Login
    print(f"\n[STEP] Tentative de connexion...")
    payload = {
        "email": EMAIL,
        "password": PASSWORD
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=payload)
    print(f"Status: {r.status_code}")
    
    if r.status_code != 200:
        print(f"[FAIL] Connexion échouée: {r.text}")
        return
        
    token = r.json().get("access_token")
    print(f"[SUCCESS] Token récupéré: {token[:10]}...")

    # 4. Get Profile (Test DB connection + Token)
    print(f"\n[STEP] Récupération du profil...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/users/me", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"User: {r.json()}")
    
    if r.status_code == 200:
        print("\n>>> CONCLUSION: LE BACKEND FONCTIONNE PARFAITEMENT <<<")
    else:
        print("\n>>> CONCLUSION: PROBLEME SUR LE PROFIL UTILISATEUR <<<")

if __name__ == "__main__":
    try:
        test_auth()
    except ImportError:
        print("Erreur: requests n'est pas installé. Installation...")
        import os
        os.system("pip install requests")
        test_auth()
