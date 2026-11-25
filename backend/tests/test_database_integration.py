import uuid
from app.models.user import User
from app.models.sleep import SleepSession
from app.models.alarm import Alarm
from app.models.goal import SleepGoal
from app.schemas.auth import RegisterRequest
from app.schemas.sleep import SleepSessionUpdate
from app.services import auth_service, sleep_service, alarm_service


def test_schema_model_parity(db_session):
    """Test that all models have expected attributes and relationships."""
    assert hasattr(User, "email")
    assert hasattr(User, "hashed_password")
    assert hasattr(User, "chronotype")
    assert hasattr(SleepSession, "duration_minutes")
    assert hasattr(SleepSession, "score")
    assert hasattr(Alarm, "smart_window_minutes")
    assert hasattr(SleepGoal, "target_duration_minutes")


def test_tenant_context_and_isolation(db_session):
    """Test user registration, tenant context setting, and data isolation."""
    email_a = f"tenant_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"tenant_b_{uuid.uuid4().hex[:6]}@example.com"

    # Register User A
    user_a = auth_service.register_user(
        db_session,
        RegisterRequest(
            name="Tenant A",
            email=email_a,
            password="Password123!",
            chronotype="bear",
        ),
    )
    assert user_a.id is not None

    # Register User B
    user_b = auth_service.register_user(
        db_session,
        RegisterRequest(
            name="Tenant B",
            email=email_b,
            password="Password123!",
            chronotype="wolf",
        ),
    )
    assert user_b.id is not None

    # Authenticate User A
    auth_a = auth_service.authenticate_user(db_session, email_a, "Password123!")
    assert auth_a is not None
    assert auth_a.id == user_a.id

    # Create session for User A
    session_a = SleepSession(
        id=str(uuid.uuid4()),
        user_id=user_a.id,
        date="2026-11-21",
        day_of_week="Sat",
        bedtime="23:00",
        wake_time="07:00",
        duration_minutes=480,
        score=90,
        efficiency=92,
        is_active=False,
    )
    db_session.add(session_a)
    db_session.commit()

    # User B queries sessions
    sessions_b = sleep_service.get_sessions(db_session, user_id=user_b.id)
    assert all(s.id != session_a.id for s in sessions_b)

    # User B cannot update User A's session
    updated = sleep_service.update_session(
        db_session,
        session_id=session_a.id,
        user_id=user_b.id,
        req=SleepSessionUpdate(score=50),
    )
    assert updated is None

    # User B cannot delete User A's session
    deleted = sleep_service.delete_session(
        db_session, session_id=session_a.id, user_id=user_b.id
    )
    assert deleted is False
