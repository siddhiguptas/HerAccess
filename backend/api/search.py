from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.database import get_db
from backend.models.schemas import SearchRequest, SearchResponse
from backend.services.intent_parser import IntentParser
from backend.services.matching_engine import MatchingEngine

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("", response_model=SearchResponse)
def search_resources(req: SearchRequest, db: Session = Depends(get_db)):
    """
    Core search endpoint:
    1. Converts natural language query into structured requirements
    2. Deterministically matches and ranks resources in database
    3. Returns explainable results, evidence cards, and local support chains
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    # 1. Parse Intent
    parsed_intent = IntentParser.parse_query(
        query=req.query,
        user_city=req.city,
        user_budget=req.budget_max
    )

    if req.target_location:
        parsed_intent.target_location = req.target_location
    if req.required_categories:
        parsed_intent.required_categories = req.required_categories

    # 2. Execute Matching
    response = MatchingEngine.execute_search(db, parsed_intent)
    return response
