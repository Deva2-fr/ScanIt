from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.models.lead import Lead
from app.models.user import User
from app.core.permissions import FeatureGuard
from pydantic import BaseModel

router = APIRouter()

class WidgetScanRequest(BaseModel):
    url: str
    email: str
    agency_id: int

from app.services.security import SecurityAnalyzer
from app.models.audit import Audit
from app.models.schemas import AnalyzeResponse

@router.post("/scan")
async def scan_widget(
    payload: WidgetScanRequest,
    session: Session = Depends(get_session)
):
    # 1. Verify Agency
    agency = session.get(User, payload.agency_id)
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    # 2. Verify Feature Access
    if not FeatureGuard.can_perform_action(agency, "lead_widget"):
        raise HTTPException(status_code=403, detail="This widget is currently disabled by the provider.")

    # 3. Perform Real Scan
    try:
        analyzer = SecurityAnalyzer()
        result = await analyzer.analyze(payload.url)
        score = result.score
    except Exception as e:
        score = 0
        result = None # Handle error case if needed

    message = "Assessment complete."
    if score >= 80:
        message = "Excellent security posture! Your site is defending well."
    elif score >= 50:
        message = "Room for improvement. Several risks detected."
    else:
        message = "Critical vulnerabilities potential. Immediate action recommended."

    # 4. Save Lead
    lead = Lead(
        agency_id=agency.id,
        prospect_email=payload.email,
        prospect_url=payload.url,
        scan_score=score,
        status="new"
    )
    session.add(lead)
    
    # 5. Save to History (Audit)
    if result:
        # Wrap in AnalyzeResponse for consistency with Dashboard
        full_response = AnalyzeResponse(
            url=payload.url,
            security=result,
            global_score=score
            # Other fields use defaults (empty/0)
        )
        
        audit = Audit(
            user_id=agency.id,
            url=payload.url,
            score=score,
            summary=full_response.model_dump_json()
        )
        session.add(audit)

    session.commit()
    session.refresh(lead)

    return {"score": score, "message": message}
