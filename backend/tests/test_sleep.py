def test_create_and_get_sleep_session(client, auth_headers):
    # Create manual sleep session
    create_payload = {
        "date": "2026-11-21",
        "day_of_week": "Sat",
        "bedtime": "23:15",
        "wake_time": "07:15",
        "duration_minutes": 480,
        "score": 92,
        "efficiency": 94,
        "deep_minutes": 110,
        "rem_minutes": 120,
        "light_minutes": 220,
        "awake_minutes": 30,
        "avg_heart_rate": 54,
        "hrv": 72,
        "respiratory_rate": 14.2,
        "snore_minutes": 5,
        "sleep_debt_minutes": 0,
        "notes": "Test night of sleep",
        "tags": ["Chamomile", "Cool Room"],
    }
    create_resp = client.post(
        "/api/v1/sleep/sessions",
        json=create_payload,
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    session_id = created_data["id"]
    assert created_data["score"] == 92
    assert created_data["tags"] == ["Chamomile", "Cool Room"]

    # Retrieve single session
    get_resp = client.get(f"/api/v1/sleep/sessions/{session_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == session_id

    # List sessions
    list_resp = client.get("/api/v1/sleep/sessions", headers=auth_headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1


def test_update_sleep_session(client, auth_headers):
    # Create session
    create_resp = client.post(
        "/api/v1/sleep/sessions",
        json={
            "date": "2026-11-20",
            "day_of_week": "Fri",
            "bedtime": "23:00",
            "wake_time": "07:00",
            "duration_minutes": 480,
            "score": 88,
        },
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    session_id = create_resp.json()["id"]

    # Update session notes and score
    update_resp = client.put(
        f"/api/v1/sleep/sessions/{session_id}",
        json={"notes": "Updated restful evening", "score": 95},
        headers=auth_headers,
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["notes"] == "Updated restful evening"
    assert updated_data["score"] == 95


def test_delete_sleep_session(client, auth_headers):
    # Create session
    create_resp = client.post(
        "/api/v1/sleep/sessions",
        json={
            "date": "2026-11-19",
            "day_of_week": "Thu",
            "bedtime": "22:30",
            "wake_time": "06:30",
            "duration_minutes": 480,
            "score": 85,
        },
        headers=auth_headers,
    )
    session_id = create_resp.json()["id"]

    # Delete session
    del_resp = client.delete(f"/api/v1/sleep/sessions/{session_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Verify 404
    get_resp = client.get(f"/api/v1/sleep/sessions/{session_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_active_tracking_lifecycle(client, auth_headers):
    # Start tracking session
    start_resp = client.post(
        "/api/v1/sleep/start",
        json={"tags": ["Acoustic Sensor", "Screen Free"]},
        headers=auth_headers,
    )
    assert start_resp.status_code == 200
    active_data = start_resp.json()
    assert active_data["is_active"] is True
    assert "Acoustic Sensor" in active_data["tags"]

    # Finish tracking session
    finish_resp = client.post(
        "/api/v1/sleep/finish",
        json={"rating_score": 93, "notes": "Woke up feeling deeply refreshed"},
        headers=auth_headers,
    )
    assert finish_resp.status_code == 200
    finished_data = finish_resp.json()
    assert finished_data["is_active"] is False
    assert finished_data["score"] == 93
    assert finished_data["duration_minutes"] >= 30
