def test_coach_chat_caffeine_query(client, auth_headers):
    response = client.post(
        "/api/v1/coach/chat",
        json={"message": "What is my caffeine cutoff time and half-life?"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "caffeine" in data["reply"].lower()
    assert len(data["action_items"]) >= 1
    assert data["citation"] is not None


def test_coach_chat_3am_awakening(client, auth_headers):
    response = client.post(
        "/api/v1/coach/chat",
        json={"message": "Why do I keep waking up around 3 AM?"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "3:00" in data["reply"] or "3 AM" in data["reply"]
    assert "Walker" in data["citation"] or "Stanford" in data["citation"]


def test_chronotype_schedule(client, auth_headers):
    response = client.get("/api/v1/coach/chronotype-schedule?chronotype=lion", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["chronotype"] == "lion"
    assert "05:30 AM" in data["wake_time"]
    assert "10:00 PM" in data["optimal_bedtime"]


def test_bedtime_calculator(client, auth_headers):
    response = client.post(
        "/api/v1/coach/calculate-bedtime",
        json={"wake_time": "07:00", "sleep_latency_minutes": 15, "desired_cycles": 5},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["wake_time"] == "07:00"
    assert len(data["options"]) == 4
    # Check 5 cycle option is 7.5h
    five_cycle = next(o for o in data["options"] if o["cycles"] == 5)
    assert five_cycle["duration_hours"] == 7.5
