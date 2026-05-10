import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model


def _sim(a: str, b: str) -> float:
    if not a or not b: return 0.0
    m = get_model()
    embs = m.encode([a, b])
    return float(np.clip(cosine_similarity([embs[0]], [embs[1]])[0][0], 0, 1))


def score_skills(candidate_skills: List[str], required: List[str], nice: List[str]) -> tuple[float, str]:
    if not required: return 0.5, "No required skills specified in JD."
    cset = {s.lower().strip() for s in candidate_skills}
    rset = {s.lower().strip() for s in required}
    exact = cset & rset
    exact_score = len(exact) / len(rset)
    unmatched = [s for s in required if s.lower() not in cset]
    sem = _sim(" ".join(candidate_skills), " ".join(unmatched)) * 0.5 if unmatched and candidate_skills else 0
    nice_bonus = min(len({s.lower() for s in nice} & cset) * 0.03, 0.1)
    total = min(exact_score * 0.7 + sem * 0.3 + nice_bonus, 1.0)
    just = f"Matched {len(exact)}/{len(rset)} required skills exactly; semantic coverage for remaining."
    return round(total, 4), just


def score_experience(years_candidate: int, years_required: int, exp_list: List[str], jd_text: str) -> tuple[float, str]:
    if years_required == 0: years_score = 1.0
    elif years_candidate == 0: years_score = 0.1
    elif years_candidate >= years_required: years_score = 1.0
    else: years_score = years_candidate / years_required

    # Semantic relevance
    sem = _sim(" ".join(exp_list), jd_text) if exp_list else 0.3
    total = min(years_score * 0.65 + sem * 0.35, 1.0)
    just = f"Candidate has ~{years_candidate}yr vs {years_required}yr required; experience relevance: {sem:.0%}."
    return round(total, 4), just


def score_education(edu_list: List[str], qualifications: List[str]) -> tuple[float, str]:
    if not edu_list: return 0.1, "No education data found in resume."
    edu_text = " ".join(edu_list).lower()
    tiers = [("phd",1.0),("doctorate",1.0),("master",0.85),("mtech",0.85),("msc",0.85),
             ("mba",0.8),("bachelor",0.7),("btech",0.7),("be ",0.7),("bsc",0.65),("diploma",0.4)]
    kw_score = next((s for k,s in tiers if k in edu_text), 0.3)
    sem = _sim(edu_text, " ".join(qualifications)) if qualifications else 0.5
    total = max(kw_score * 0.6 + sem * 0.4, 0.1)
    just = f"Degree tier score {kw_score:.0%}; semantic match to qualifications {sem:.0%}."
    return round(min(total, 1.0), 4), just


def score_projects(projects: List[str], jd_text: str) -> tuple[float, str]:
    if not projects: return 0.1, "No projects found in resume."
    sem = _sim(" ".join(projects), jd_text)
    count_bonus = min(len(projects) * 0.04, 0.15)
    total = min(sem + count_bonus, 1.0)
    just = f"{len(projects)} projects found; relevance to role: {sem:.0%}."
    return round(total, 4), just


def score_communication(quality: float, raw_text: str) -> tuple[float, str]:
    action_verbs = ["developed","built","led","managed","designed","implemented","created",
                    "optimized","improved","achieved","delivered","architected","launched","reduced"]
    verb_count = sum(1 for v in action_verbs if v in raw_text.lower())
    bonus = min(verb_count * 0.025, 0.2)
    total = min(float(quality or 0.5) + bonus, 1.0)
    just = f"LLM quality score {quality:.0%}; {verb_count} strong action verbs detected."
    return round(total, 4), just


def score_candidate(candidate_data: dict, jd_data: dict, jd_raw_text: str) -> dict:
    sk, sk_j = score_skills(
        candidate_data.get("skills", []),
        jd_data.get("required_skills", []),
        jd_data.get("nice_to_have_skills", [])
    )
    ex, ex_j = score_experience(
        candidate_data.get("total_years_experience", 0),
        jd_data.get("min_experience_years", 0),
        candidate_data.get("experience", []),
        jd_raw_text
    )
    ed, ed_j = score_education(
        candidate_data.get("education", []),
        jd_data.get("qualifications", [])
    )
    pr, pr_j = score_projects(candidate_data.get("projects", []), jd_raw_text)
    co, co_j = score_communication(
        candidate_data.get("communication_quality", 0.5),
        candidate_data.get("_raw_text", "")
    )
    total = round(sk*0.30 + ex*0.25 + ed*0.15 + pr*0.20 + co*0.10, 4)
    confidence = round(min(0.95, 0.5 + total * 0.5), 4)

    return {
        "skills_score": sk, "experience_score": ex, "education_score": ed,
        "projects_score": pr, "communication_score": co, "total_score": total,
        "confidence_score": confidence,
        "justifications": {
            "skills": sk_j, "experience": ex_j, "education": ed_j,
            "projects": pr_j, "communication": co_j
        }
    }