def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Sarah Connor",
            "email": "sarah@cyberdyne.sleep",
            "password": "strongPassword!456",
            "chronotype": "wolf",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "sarah@cyberdyne.sleep"
    assert data["name"] == "Sarah Connor"


def test_register_duplicate_email(client):
    req_body = {
        "name": "Duplicate User",
        "email": "duplicate@test.com",
        "password": "password123",
        "chronotype": "bear",
    }
    # First registration
    r1 = client.post("/api/v1/auth/register", json=req_body)
    assert r1.status_code == 201

    # Second registration with same email
    r2 = client.post("/api/v1/auth/register", json=req_body)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]


def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user_id"] == test_user.id


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrongPasswordXYZ"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_demo_login(client):
    response = client.post("/api/v1/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "naveen@sleepcycle.premium"


def test_get_me_authenticated(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "tester@sleepcycle.premium"
    assert data["plan"] == "Celestial Pro"


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
