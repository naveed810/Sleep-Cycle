def test_analytics_summary_and_weekly_report(client, auth_headers):
    # Log 3 sample sleep sessions
    for i, score in enumerate([90, 85, 95]):
        client.post(
            "/api/v1/sleep/sessions",
            json={
                "date": f"2026-11-2{i}",
                "day_of_week": ["Thu", "Fri", "Sat"][i],
                "bedtime": "23:00",
                "wake_time": "07:00",
                "duration_minutes": 480,
                "score": score,
                "efficiency": 92,
                "deep_minutes": 110,
                "rem_minutes": 120,
                "light_minutes": 220,
                "awake_minutes": 30,
                "avg_heart_rate": 54,
                "hrv": 72,
            },
            headers=auth_headers,
        )

    # 1. Test Summary
    summary_resp = client.get("/api/v1/analytics/summary?period_days=7", headers=auth_headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_sessions"] >= 3
    assert summary["average_score"] == 90
    assert summary["average_duration_hours"] == 8.0
    assert "stage_breakdown" in summary
    assert len(summary["habit_correlations"]) >= 1

    # 2. Test Weekly Report
    report_resp = client.get("/api/v1/analytics/weekly-report", headers=auth_headers)
    assert report_resp.status_code == 200
    report = report_resp.json()
    assert report["total_nights_logged"] >= 3
    assert report["best_night"] is not None
    assert report["best_night"]["score"] == 95
    assert "clinical_recommendation" in report
