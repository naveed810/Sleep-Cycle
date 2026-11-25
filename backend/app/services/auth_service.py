import uuid
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.goal import SleepGoal
from app.models.alarm import Alarm
from app.models.sleep import SleepSession
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserUpdate


def _hydrate_user(db: Session, row) -> User:
    """Construct or populate a User model instance from a raw database mapping."""
    user = User()
    for col in User.__table__.columns:
        if col.name in row:
            setattr(user, col.name, row[col.name])
    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    clean_email = email.strip().lower()
    if db.bind and db.bind.dialect.name == "postgresql":
        try:
            with db.begin_nested():
                row = db.execute(
                    text("SELECT * FROM public.auth_lookup_user_by_email(:email)"),
                    {"email": clean_email},
                ).mappings().first()
                if row:
                    return _hydrate_user(db, row)
        except Exception:
            pass

    return db.query(User).filter(User.email == clean_email).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    clean_email = email.strip().lower()

    if db.bind and db.bind.dialect.name == "postgresql":
        row = None
        try:
            with db.begin_nested():
                row = db.execute(
                    text("SELECT * FROM public.auth_lookup_user_by_email(:email)"),
                    {"email": clean_email},
                ).mappings().first()
        except Exception:
            pass

        if row:
            if not verify_password(password, row["hashed_password"]):
                return None
            user_id = row["id"]
            db.execute(
                text("SELECT set_config('app.current_user_id', :user_id, true)"),
                {"user_id": user_id},
            )
            user = get_user_by_id(db, user_id)
            return user or _hydrate_user(db, row)

    # Standard fallback for SQLite or direct PostgreSQL query
    user = get_user_by_email(db, clean_email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(
            text("SELECT set_config('app.current_user_id', :user_id, true)"),
            {"user_id": user.id},
        )

    return user


def register_user(db: Session, req: RegisterRequest) -> User:
    hashed_password = get_password_hash(req.password)
    user_id = str(uuid.uuid4())

    # Establish transaction-scoped tenant identity in PostgreSQL
    # so that RLS policies pass seamlessly for user, sleep_goals and alarms
    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(
            text("SELECT set_config('app.current_user_id', :user_id, true)"),
            {"user_id": user_id},
        )

    user = User(
        id=user_id,
        email=req.email.strip().lower(),
        name=req.name.strip(),
        hashed_password=hashed_password,
        chronotype=req.chronotype or "bear",
    )
    db.add(user)
    db.flush()

    # Create default SleepGoal
    default_goal = SleepGoal(
        id=str(uuid.uuid4()),
        user_id=user.id,
        target_duration_minutes=480,
        target_bedtime="23:00",
        target_wake_time="07:00",
        target_consistency_percent=90,
    )
    db.add(default_goal)

    # Create default alarms
    default_alarm = Alarm(
        id=str(uuid.uuid4()),
        user_id=user.id,
        label="Weekday Morning Light",
        time="07:00",
        period="AM",
        days=["Mon", "Tue", "Wed", "Thu", "Fri"],
        enabled=True,
        smart_window_minutes=20,
        sound_track="forest_dawn",
        vibration=True,
    )
    db.add(default_alarm)

    db.commit()
    db.refresh(user)
    return user


def update_user_profile(db: Session, user: User, req: UserUpdate) -> User:
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    # Sync target changes to SleepGoal
    if user.sleep_goal:
        if req.target_sleep_minutes is not None:
            user.sleep_goal.target_duration_minutes = req.target_sleep_minutes
        if req.target_bedtime is not None:
            user.sleep_goal.target_bedtime = req.target_bedtime
        if req.target_wake_time is not None:
            user.sleep_goal.target_wake_time = req.target_wake_time

    db.commit()
    db.refresh(user)
    return user


def seed_demo_user_if_needed(db: Session) -> User:
    """Ensure a rich demo user exists for immediate evaluation."""
    demo_email = "naveen@sleepcycle.premium"
    existing = get_user_by_email(db, demo_email)
    if existing:
        return existing

    user = User(
        id="usr_premium_01",
        email=demo_email,
        name="Naveen Kumar",
        hashed_password=get_password_hash("password123"),
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
        plan="Celestial Pro",
        streak_days=14,
        member_since="October 2024",
        target_sleep_minutes=480,
        target_bedtime="23:00",
        target_wake_time="07:00",
        chronotype="bear",
        room_temp_preference=19.0,
        smart_alarm_enabled=True,
        haptic_feedback=True,
        snore_detection=True,
        sound_volume_default=0.7,
        wind_down_reminder=True,
        morning_briefing=True,
        circadian_alerts=True,
    )
    db.add(user)
    db.flush()

    # Sleep Goal
    db.add(
        SleepGoal(
            id=str(uuid.uuid4()),
            user_id=user.id,
            target_duration_minutes=480,
            target_bedtime="23:00",
            target_wake_time="07:00",
            target_consistency_percent=94,
        )
    )

    # Default alarms
    db.add(
        Alarm(
            id="alm_demo_1",
            user_id=user.id,
            label="Weekday Morning Light",
            time="07:00",
            period="AM",
            days=["Mon", "Tue", "Wed", "Thu", "Fri"],
            enabled=True,
            smart_window_minutes=20,
            sound_track="forest_dawn",
            vibration=True,
        )
    )
    db.add(
        Alarm(
            id="alm_demo_2",
            user_id=user.id,
            label="Weekend Restorative Rise",
            time="08:15",
            period="AM",
            days=["Sat", "Sun"],
            enabled=True,
            smart_window_minutes=30,
            sound_track="harp",
            vibration=False,
        )
    )

    # 7 historical sleep sessions
    mock_sessions = [
        {
            "date": "2026-11-21",
            "day": "Sat",
            "bed": "23:12",
            "wake": "07:24",
            "duration": 492,
            "score": 92,
            "deep": 110,
            "rem": 125,
            "light": 227,
            "awake": 30,
            "hr": 54,
            "hrv": 72,
            "debt": -12,
            "tags": ["Chamomile", "Book reading", "Dim lights"],
            "notes": "Optimal wind-down with warm herbal infusion. Room cooled to 19°C.",
        },
        {
            "date": "2026-11-20",
            "day": "Fri",
            "bed": "23:28",
            "wake": "07:18",
            "duration": 470,
            "score": 88,
            "deep": 98,
            "rem": 118,
            "light": 216,
            "awake": 38,
            "hr": 56,
            "hrv": 68,
            "debt": 10,
            "tags": ["Evening stretch", "Magnesium", "Cool room"],
            "notes": "Mild fatigue after workout session. Deep sleep recovered quickly.",
        },
        {
            "date": "2026-11-19",
            "day": "Thu",
            "bed": "22:58",
            "wake": "06:55",
            "duration": 477,
            "score": 91,
            "deep": 115,
            "rem": 122,
            "light": 208,
            "awake": 32,
            "hr": 53,
            "hrv": 74,
            "debt": 3,
            "tags": ["Smart Alarm window", "Meditation 10m"],
            "notes": "High sleep consistency score. Woke during light phase.",
        },
        {
            "date": "2026-11-18",
            "day": "Wed",
            "bed": "23:45",
            "wake": "07:05",
            "duration": 440,
            "score": 83,
            "deep": 82,
            "rem": 105,
            "light": 205,
            "awake": 48,
            "hr": 59,
            "hrv": 61,
            "debt": 40,
            "tags": ["Late screen", "Work stress"],
            "notes": "Late working on laptop pushed circadian onset.",
        },
        {
            "date": "2026-11-17",
            "day": "Tue",
            "bed": "23:05",
            "wake": "07:10",
            "duration": 485,
            "score": 89,
            "deep": 104,
            "rem": 120,
            "light": 224,
            "awake": 37,
            "hr": 55,
            "hrv": 70,
            "debt": -5,
            "tags": ["Morning sun 20m", "Soundscape rain"],
            "notes": "Circadian rhythm aligned with outdoor morning sunlight.",
        },
        {
            "date": "2026-11-16",
            "day": "Mon",
            "bed": "23:15",
            "wake": "06:58",
            "duration": 463,
            "score": 86,
            "deep": 92,
            "rem": 110,
            "light": 221,
            "awake": 40,
            "hr": 57,
            "hrv": 65,
            "debt": 17,
            "tags": ["Dim bedroom", "Breathing routine"],
            "notes": "Solid start to weekly sleep bank.",
        },
        {
            "date": "2026-11-15",
            "day": "Sun",
            "bed": "22:50",
            "wake": "07:30",
            "duration": 520,
            "score": 95,
            "deep": 130,
            "rem": 135,
            "light": 230,
            "awake": 25,
            "hr": 51,
            "hrv": 82,
            "debt": -40,
            "tags": ["Weekend recovery", "Hot bath", "Lavender aroma"],
            "notes": "Exceptional restorative sleep. Rebound deep sleep and high HRV peak.",
        },
    ]

    for s in mock_sessions:
        session = SleepSession(
            id=str(uuid.uuid4()),
            user_id=user.id,
            date=s["date"],
            day_of_week=s["day"],
            bedtime=s["bed"],
            wake_time=s["wake"],
            duration_minutes=s["duration"],
            score=s["score"],
            efficiency=93,
            deep_minutes=s["deep"],
            rem_minutes=s["rem"],
            light_minutes=s["light"],
            awake_minutes=s["awake"],
            avg_heart_rate=s["hr"],
            hrv=s["hrv"],
            respiratory_rate=14.1,
            snore_minutes=6,
            sleep_debt_minutes=s["debt"],
            notes=s["notes"],
            tags=s["tags"],
        )
        db.add(session)

    db.commit()
    db.refresh(user)
    return user
