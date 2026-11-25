from typing import List, Optional
import httpx
from app.core.config import settings
from app.models.user import User
from app.schemas.ai_coach import (
    CoachChatResponse,
    ChronotypeSchedule,
    BedtimeCalculatorResponse,
    BedtimeOption,
)


CHRONOTYPE_MAP = {
    "lion": ChronotypeSchedule(
        chronotype="lion",
        title="🦁 The Lion (Early Morning Riser)",
        description="Naturally energetic in the early morning; tires in early evening. Highly focused before noon.",
        wake_time="05:30 AM",
        morning_sunlight="06:00 AM (15-20 mins direct outdoor light)",
        peak_focus_window="08:00 AM - 12:00 PM",
        caffeine_cutoff="12:00 PM",
        wind_down_start="09:00 PM",
        optimal_bedtime="10:00 PM",
    ),
    "bear": ChronotypeSchedule(
        chronotype="bear",
        title="🐻 The Bear (Solar Cycle Synchronized)",
        description="Follows the sun's trajectory. Sharpest mid-morning, needs 8 solid hours of sleep for peak cognitive recovery.",
        wake_time="07:00 AM",
        morning_sunlight="07:30 AM (15-20 mins direct outdoor light)",
        peak_focus_window="10:00 AM - 02:00 PM",
        caffeine_cutoff="02:00 PM",
        wind_down_start="10:15 PM",
        optimal_bedtime="11:00 PM",
    ),
    "wolf": ChronotypeSchedule(
        chronotype="wolf",
        title="🐺 The Wolf (Evening Creative Owl)",
        description="Classic evening owl. Peak creative and intellectual momentum occurs late afternoon and evening.",
        wake_time="08:30 AM",
        morning_sunlight="09:00 AM (20-30 mins high lux outdoor light)",
        peak_focus_window="04:00 PM - 09:00 PM",
        caffeine_cutoff="03:30 PM",
        wind_down_start="11:30 PM",
        optimal_bedtime="12:30 AM",
    ),
    "dolphin": ChronotypeSchedule(
        chronotype="dolphin",
        title="🐬 The Dolphin (Light & Alert Sleeper)",
        description="Light sleeper with alert autonomic arousal. Often experiences nocturnal micro-awakenings.",
        wake_time="06:30 AM",
        morning_sunlight="07:00 AM (15-20 mins outdoor light)",
        peak_focus_window="02:00 PM - 06:00 PM",
        caffeine_cutoff="11:30 AM",
        wind_down_start="10:30 PM",
        optimal_bedtime="11:30 PM",
    ),
}


async def generate_coach_response(
    user: User,
    message: str,
    context_tags: Optional[List[str]] = None,
) -> CoachChatResponse:
    provider = settings.AI_PROVIDER.lower()
    api_key = settings.AI_API_KEY

    # 1. External LLM Provider Integration (if configured)
    if provider in ["openai", "gemini", "anthropic"] and api_key:
        try:
            if provider == "openai":
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {
                                    "role": "system",
                                    "content": (
                                        "You are Somna AI, an expert neurobiological circadian sleep coach. "
                                        f"User chronotype: {user.chronotype}. Target sleep: {user.target_sleep_minutes}m. "
                                        "Provide concise, evidence-based sleep science recommendations citing Matthew Walker, Andrew Huberman, or Stanford Sleep Center."
                                    ),
                                },
                                {"role": "user", "content": message},
                            ],
                            "max_tokens": 400,
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply_text = data["choices"][0]["message"]["content"]
                        return CoachChatResponse(
                            reply=reply_text,
                            citation="OpenAI GPT-4o Mini & Somna Sleep Science Engine",
                            action_items=[
                                "Maintain consistent morning sunlight exposure",
                                "Adhere strictly to evening amber light wind-down",
                            ],
                            provider="openai",
                        )
        except Exception:
            pass  # Fall through to expert sleep science engine

    # 2. Built-in Clinical Chronobiology Expert System
    lower = message.lower()
    chronotype = (user.chronotype or "bear").lower()

    if "3 am" in lower or "waking up" in lower or "wake up at night" in lower:
        return CoachChatResponse(
            reply=(
                "Waking up between 3:00 AM and 4:00 AM corresponds to a critical circadian transition point: "
                "your nocturnal core body temperature reaches its lowest point (the circadian nadir) while your "
                "first three deep slow-wave delta cycles complete, shifting you into lighter REM cycles. "
                "Blood sugar dips or evening alcohol metabolism can easily trigger micro-arousal spikes during this window."
            ),
            citation="Stanford Sleep Medicine & Matthew Walker, PhD (Why We Sleep)",
            action_items=[
                "Eliminate alcohol within 3 to 4 hours of bedtime to prevent rebound sympathetic arousals.",
                "Ensure your bedroom thermostat is set between 18°C and 19°C.",
                "Consume a spoonful of raw almond butter or light complex protein 45 minutes before sleep to stabilize nighttime glucose.",
            ],
            provider="neuro_science",
        )

    if "caffeine" in lower or "coffee" in lower or "tea" in lower:
        cutoff = CHRONOTYPE_MAP.get(chronotype, CHRONOTYPE_MAP["bear"]).caffeine_cutoff
        return CoachChatResponse(
            reply=(
                f"Caffeine has a biological half-life of 5 to 7 hours and a quarter-life of up to 12 hours. "
                f"Residual caffeine molecules competitively bind to adenosine receptors in the brain, reducing "
                f"deep restorative slow-wave sleep by up to 30% even if you fall asleep promptly. "
                f"For your {chronotype.upper()} chronotype, your cutoff is strictly {cutoff}."
            ),
            citation="Journal of Clinical Sleep Medicine (Drake et al.)",
            action_items=[
                f"Cease all caffeinated coffee, tea, and pre-workouts after {cutoff}.",
                "Switch to chamomile or roasted dandelion root tea in the afternoon.",
                "Consider 200mg L-Theanine if caffeine was consumed past your window.",
            ],
            provider="neuro_science",
        )

    if "deep sleep" in lower or "slow wave" in lower or "delta" in lower:
        return CoachChatResponse(
            reply=(
                "Deep slow-wave delta sleep (non-REM Stage 3) is when cellular repair, human growth hormone (HGH) "
                "release, and cerebral glymphatic waste clearance occur. The most potent natural catalyst is "
                "thermoregulation: your body must drop its core temperature by approximately 1°C to access sustained delta waves."
            ),
            citation="Dr. Andrew Huberman, Stanford University Neurobiology",
            action_items=[
                "Take a warm shower or bath 90 minutes before bed; vasodilation cools internal core temperature rapidly.",
                "Maintain your bedroom between 18°C - 19°C with breathable linen bedding.",
                "Listen to 8Hz Alpha or 5Hz Theta binaural entrainment soundscapes during wind-down.",
            ],
            provider="neuro_science",
        )

    if "jet lag" in lower or "shift" in lower or "time zone" in lower:
        return CoachChatResponse(
            reply=(
                "Circadian adaptation is primarily driven by three zeitgebers (time-givers): photon exposure to retinal "
                "ganglion cells, meal timing, and physical movement. Morning bright sunlight advances your circadian phase, "
                "while late evening light delays it."
            ),
            citation="Harvard Medical School Division of Sleep Medicine",
            action_items=[
                "Get 20 minutes of outdoor sunlight within 30 minutes of local destination waking.",
                "Fast until the first normal morning breakfast in the new time zone.",
                "Avoid blue-spectrum artificial lighting after 9:00 PM local time.",
            ],
            provider="neuro_science",
        )

    # General tailored guidance
    schedule = CHRONOTYPE_MAP.get(chronotype, CHRONOTYPE_MAP["bear"])
    return CoachChatResponse(
        reply=(
            f"Hello {user.name}! Based on your {chronotype.upper()} chronotype profile, your internal circadian pacemaker "
            f"thrives on consistent anchors: sunlight at {schedule.morning_sunlight}, caffeine cessation by {schedule.caffeine_cutoff}, "
            f"andlights out around {schedule.optimal_bedtime}. Synchronizing your daily routines to these natural hormone pulses "
            f"significantly boosts daytime cognitive stamina and nightly REM recovery."
        ),
        citation="Sleep Research Society & American Academy of Sleep Medicine",
        action_items=[
            f"Anchor your morning wake time to {schedule.wake_time} within a 20-minute window daily.",
            "Dim household overhead ambient lighting by 50% starting at 10:00 PM.",
            "Ensure 8 hours of total wind-down and sleep allocation tonight.",
        ],
        provider="neuro_science",
    )


def get_chronotype_schedule(chronotype: str) -> ChronotypeSchedule:
    key = chronotype.lower() if chronotype else "bear"
    return CHRONOTYPE_MAP.get(key, CHRONOTYPE_MAP["bear"])


def calculate_bedtimes(
    wake_time_str: str = "07:00",
    latency_minutes: int = 15,
    desired_cycles: int = 5,
) -> BedtimeCalculatorResponse:
    try:
        parts = wake_time_str.split(":")
        w_hour = int(parts[0])
        w_min = int(parts[1])
    except Exception:
        w_hour, w_min = 7, 0

    wake_total_minutes = w_hour * 60 + w_min

    options: List[BedtimeOption] = []
    # 90-minute sleep cycles: 6 cycles (9h), 5 cycles (7.5h), 4 cycles (6h), 3 cycles (4.5h)
    cycle_counts = [6, 5, 4, 3]

    for c in cycle_counts:
        sleep_minutes = c * 90
        total_time_needed = sleep_minutes + latency_minutes
        bed_total_mins = wake_total_minutes - total_time_needed

        if bed_total_mins < 0:
            bed_total_mins += 1440

        b_hour = (bed_total_mins // 60) % 24
        b_min = bed_total_mins % 60
        ampm = "AM" if b_hour < 12 else "PM"
        display_hour = b_hour if (1 <= b_hour <= 12) else (b_hour - 12 if b_hour > 12 else 12)
        lights_out = f"{display_hour}:{b_min:02d} {ampm}"

        wind_total_mins = (bed_total_mins - 45) % 1440
        w_h = (wind_total_mins // 60) % 24
        w_m = wind_total_mins % 60
        w_ampm = "AM" if w_h < 12 else "PM"
        w_display_h = w_h if (1 <= w_h <= 12) else (w_h - 12 if w_h > 12 else 12)
        wind_down = f"{w_display_h}:{w_m:02d} {w_ampm}"

        if c == 6:
            profile = "Maximal Recovery (Long Sleeper / Heavy Athletic Training)"
        elif c == 5:
            profile = "Optimal Restorative (Ideal Human Baseline • 7.5 Hours)"
        elif c == 4:
            profile = "Light / Fast Turnaround (Sub-optimal, Minimal Debt)"
        else:
            profile = "Emergency Survival (High Sleep Inertia Risk)"

        options.append(
            BedtimeOption(
                cycles=c,
                duration_hours=round(sleep_minutes / 60, 1),
                lights_out_time=lights_out,
                wind_down_time=wind_down,
                feel_profile=profile,
            )
        )

    return BedtimeCalculatorResponse(
        wake_time=wake_time_str,
        options=options,
        circadian_note=(
            "Human sleep operates in ultradian ~90-minute cycles alternating from Light to Deep to REM. "
            "Waking at the boundary of a 90-minute cycle prevents waking during deep delta sleep and eliminates morning grogginess."
        ),
    )
