from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.ai_advisor import generate_executive_summary, AiSummaryResponse
from app.deps import requires_pro_plan

router = APIRouter()

class GenerateSummaryRequest(BaseModel):
    scan_results: dict

@router.post("/summary", response_model=AiSummaryResponse)
async def get_ai_summary(
    request: GenerateSummaryRequest,
    _user=Depends(requires_pro_plan),
):
    if not request.scan_results:
        raise HTTPException(status_code=400, detail="Scan results are required")
    return await generate_executive_summary(request.scan_results)


class FixRequest(BaseModel):
    issue_type: str
    context: dict

@router.post("/fix")
async def get_fix(
    request: FixRequest,
    _user=Depends(requires_pro_plan),
):
    from app.services.ai_fixer import generate_fix
    if not request.issue_type:
        raise HTTPException(status_code=400, detail="Issue type is required")
    result = await generate_fix(request.issue_type, request.context)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result
