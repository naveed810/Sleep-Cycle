def test_alarm_crud(client, auth_headers):
    # 1. Create Alarm
    create_resp = client.post(
        "/api/v1/alarms",
        json={
            "label": "Morning Sun Rise",
            "time": "06:45",
            "period": "AM",
            "days": ["Mon", "Wed", "Fri"],
            "enabled": True,
            "smart_window_minutes": 20,
            "sound_track": "forest_dawn",
            "vibration": True,
        },
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    alarm_data = create_resp.json()
    alarm_id = alarm_data["id"]
    assert alarm_data["label"] == "Morning Sun Rise"
    assert alarm_data["smart_window_minutes"] == 20
    assert alarm_data["enabled"] is True

    # 2. List Alarms
    list_resp = client.get("/api/v1/alarms", headers=auth_headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1

    # 3. Toggle Alarm
    toggle_resp = client.post(f"/api/v1/alarms/{alarm_id}/toggle", headers=auth_headers)
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["enabled"] is False

    # 4. Update Alarm
    update_resp = client.put(
        f"/api/v1/alarms/{alarm_id}",
        json={"label": "Weekend Gentle Rise", "time": "08:30"},
        headers=auth_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["label"] == "Weekend Gentle Rise"
    assert update_resp.json()["time"] == "08:30"

    # 5. Delete Alarm
    del_resp = client.delete(f"/api/v1/alarms/{alarm_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 6. Verify 404
    get_resp = client.get(f"/api/v1/alarms/{alarm_id}", headers=auth_headers)
    assert get_resp.status_code == 404
