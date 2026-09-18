import json
import random
from pathlib import Path


FIRST_NAMES = [
    "Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Ananya", "Rahul", "Neha",
    "Karthik", "Sneha", "Arjun", "Meera", "Siddharth", "Pooja", "Dev", "Isha",
    "Manish", "Divya", "Karan", "Tanvi", "Rhea", "Nikhil", "Shreya", "Kabir",
    "Tara", "Varun", "Ritu", "Sameer", "Simran", "Aryan", "Dia", "Aditya"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Rao", "Gupta",
    "Mehta", "Singh", "Kumar", "Chopra", "Joshi", "Bose", "Menon", "Deshmukh"
]

DEPARTMENTS = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
]

COURSES = {
    "Computer Science": ["CS-301", "CS-502", "CS-504"],
    "Electrical Engineering": ["EE-301", "EE-502"],
    "Mechanical Engineering": ["ME-301", "ME-502"],
    "Civil Engineering": ["CE-301", "CE-502"],
    "Information Technology": ["IT-301", "IT-502"]
}


def generate_synthetic_dataset(output_path: str = "backend/data/synthetic_students.json"):
    random.seed(42)  # Deterministic seed for reproducible testing
    records = []

    # 1. Deliberate boundary records specified in correction #12:
    # 70, 75, 77, 79, 79.9, 80, 81, 82, 85, 91
    boundary_cases = [
        {"id": "S001", "name": "Aditi Rao", "pct": 70.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 42, "total": 60, "rem": 20, "gpa": 3.4},
        {"id": "S002", "name": "Rohan Verma", "pct": 77.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 46, "total": 60, "rem": 20, "gpa": 3.6},  # Demo hero student
        {"id": "S003", "name": "Aarav Sharma", "pct": 75.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 45, "total": 60, "rem": 20, "gpa": 3.2},
        {"id": "S004", "name": "Priya Nair", "pct": 79.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 47, "total": 60, "rem": 20, "gpa": 3.7},
        {"id": "S005", "name": "Karthik Iyer", "pct": 79.9, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 799, "total": 1000, "rem": 200, "gpa": 3.8},
        {"id": "S006", "name": "Neha Gupta", "pct": 80.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 48, "total": 60, "rem": 20, "gpa": 3.5},
        {"id": "S007", "name": "Vikram Patel", "pct": 81.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 49, "total": 60, "rem": 20, "gpa": 3.9},
        {"id": "S008", "name": "Ananya Joshi", "pct": 82.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 49, "total": 60, "rem": 20, "gpa": 3.85},
        {"id": "S009", "name": "Rahul Mehta", "pct": 85.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 51, "total": 60, "rem": 20, "gpa": 3.9},
        {"id": "S010", "name": "Tanvi Bose", "pct": 91.0, "sem": "S5", "dept": "Computer Science", "course": "CS-502", "attended": 55, "total": 60, "rem": 20, "gpa": 4.0},
    ]

    for b in boundary_cases:
        records.append({
            "student_id": b["id"],
            "display_name": b["name"],
            "department": b["dept"],
            "semester": b["sem"],
            "course_id": b["course"],
            "enrollment_status": "ENROLLED",
            "attended_sessions": b["attended"],
            "total_sessions": b["total"],
            "remaining_sessions": b["rem"],
            "attendance_pct": b["pct"],
            "gpa": b["gpa"]
        })

    # 2. Add remaining synthetic students to reach 250 records across departments and courses
    for i in range(11, 251):
        dept = random.choice(DEPARTMENTS)
        course = random.choice(COURSES[dept])
        sem = "S5" if "50" in course else "S3"
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        
        # Attendance distribution: mostly between 72% and 96%
        # 10% severely low (<75%), 15% borderline (75-80%), 25% at risk (80-85%), 50% comfortable (>85%)
        rand_bucket = random.random()
        total_sessions = 60
        rem_sessions = 20

        if rand_bucket < 0.10:
            pct = round(random.uniform(62.0, 74.5), 1)
        elif rand_bucket < 0.25:
            pct = round(random.uniform(75.0, 79.8), 1)
        elif rand_bucket < 0.50:
            pct = round(random.uniform(80.0, 84.9), 1)
        else:
            pct = round(random.uniform(85.0, 97.5), 1)

        attended = int(round((pct / 100.0) * total_sessions))
        # Re-sync pct exactly to attended / total
        pct = round((attended / total_sessions) * 100.0, 1)

        records.append({
            "student_id": f"S{i:03d}",
            "display_name": name,
            "department": dept,
            "semester": sem,
            "course_id": course,
            "enrollment_status": "ENROLLED",
            "attended_sessions": attended,
            "total_sessions": total_sessions,
            "remaining_sessions": rem_sessions,
            "attendance_pct": pct,
            "gpa": round(random.uniform(2.6, 4.0), 2)
        })

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"Generated {len(records)} synthetic student records in {output_path}")
    return records


if __name__ == "__main__":
    generate_synthetic_dataset()
