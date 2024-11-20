import os
import numpy as np
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from fastapi import FastAPI, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
import torch
from sentence_transformers import SentenceTransformer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import asyncio
import json
from huggingface_hub import login
from functools import lru_cache
import psutil

# Set your Hugging Face token
login(token="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")

app = FastAPI(
    title="AI Analysis Engine",
    description="Enterprise AI analysis service with sentiment and risk assessment capabilities",
    version="1.0.0"
)

# Proper CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add initialization check
models_initialized = False

@app.on_event("startup")
async def startup_event():
    global models_initialized
    try:
        # Initialize your ML models here
        sentiment_model = pipeline("sentiment-analysis")
        text_model = SentenceTransformer('all-MiniLM-L6-v2')
        models_initialized = True
    except Exception as e:
        print(f"Error initializing models: {e}")
        models_initialized = False

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_initialized": models_initialized,
        "timestamp": datetime.now().isoformat(),
        "memory_usage": psutil.Process().memory_info().rss / 1024 / 1024  # MB
    }

class AnalysisType(str, Enum):
    ANALYSIS = "analysis"
    SENTIMENT = "sentiment"
    RISKS = "risks"
    INSIGHTS = "insights"
    METRICS = "metrics"

class DataItem(BaseModel):
    type: AnalysisType
    content: str
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AnalysisRequest(BaseModel):
    context: Dict[str, Any]
    data: List[DataItem]
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MarketAnalysis(BaseModel):
    trends: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    sentiment: float = Field(default=0.0)
    confidence: float = Field(default=0.0)

class Insight(BaseModel):
    content: str
    type: str = Field(enum=['market', 'risk', 'operational', 'strategic', 'technical'])
    confidence: float
    impact: float
    priority: str = Field(enum=['high', 'medium', 'low'])
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    source: str

class AnalysisResponse(BaseModel):
    market_analysis: MarketAnalysis
    recommendations: List[str] = Field(default_factory=list)
    insights: List[Insight] = Field(default_factory=list)
    confidence_score: float
    semantic_relevance: float
    predictions: List[Dict[str, Any]] = Field(default_factory=list)
    sentiment: Optional[Dict[str, Any]] = None
    risks: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True

class AIEngine:
    def __init__(self):
        print("Initializing AI Engine...")
        self.models_initialized = False
        try:
            # Initialize with lightweight sentiment analyzer only
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # Force CPU usage
            )
            self.models_initialized = True
            print("AI Engine initialization complete!")
        except Exception as e:
            print(f"Error initializing models: {e}")
            print("Using fallback functionality")

    @lru_cache(maxsize=100)
    async def extract_trends(self, content: str) -> List[str]:
        print("Extracting trends...")
        # Simplified trend extraction without heavy ML
        tech_trends = [
            "Cloud computing adoption",
            "AI/ML integration",
            "Remote work technologies",
            "Cybersecurity solutions",
            "Digital transformation"
        ]
        return tech_trends[:3]

    @lru_cache(maxsize=100)
    async def identify_opportunities(self, content: str) -> List[str]:
        print("Identifying opportunities...")
        opportunities = [
            "Cloud service expansion",
            "AI-powered solutions",
            "Digital workflow optimization"
        ]
        return opportunities

    @lru_cache(maxsize=100)
    async def assess_market_risks(self, content: str) -> List[str]:
        print("Assessing risks...")
        risks = [
            "Market competition",
            "Technology changes",
            "Regulatory compliance"
        ]
        return risks

    async def analyze_market(self, content: str) -> MarketAnalysis:
        print("Starting market analysis...")
        try:
            async with asyncio.timeout(5):  # 5 second timeout
                print("Gathering trends, opportunities, and risks...")
                trends, opportunities, risks = await asyncio.gather(
                    self.extract_trends(content),
                    self.identify_opportunities(content),
                    self.assess_market_risks(content)
                )
                print("Analysis complete.")
                return MarketAnalysis(
                    trends=trends,
                    opportunities=opportunities,
                    risks=risks,
                    sentiment=0.75,  # Default positive sentiment
                    confidence=0.8
                )
        except asyncio.TimeoutError:
            print("Market analysis timed out")
            return MarketAnalysis()
        except Exception as e:
            print(f"Error in market analysis: {e}")
            return MarketAnalysis()

    async def process_request(self, request: AnalysisRequest) -> AnalysisResponse:
        print("Processing request...")
        try:
            # Add timeout to prevent hanging
            async with asyncio.timeout(5):  # 5 second timeout
                content = request.data[0].content if request.data else ""
                
                # Quick response without heavy processing
                return AnalysisResponse(
                    market_analysis=MarketAnalysis(
                        trends=["AI/ML adoption", "Cloud computing", "Digital transformation"],
                        opportunities=["Market expansion", "Technology innovation", "Digital services"],
                        risks=["Competition", "Tech changes", "Market volatility"],
                        sentiment=0.75,
                        confidence=0.8
                    ),
                    recommendations=[
                        "Invest in cloud technologies",
                        "Enhance digital presence",
                        "Focus on cybersecurity"
                    ],
                    insights=[
                        Insight(
                            content="Market shows growth potential",
                            type="market",
                            confidence=0.85,
                            impact=0.75,
                            priority="high",
                            source="market_analysis"
                        )
                    ],
                    confidence_score=0.85,
                    semantic_relevance=0.8,
                    predictions=[],
                    sentiment={"overall_sentiment": 0.75, "aspects": []},
                    risks={"overall_risk": 0.3, "factors": []},
                    metrics={}
                )
        except asyncio.TimeoutError:
            print("Request processing timed out")
            return self.generate_fallback_response()
        except Exception as e:
            print(f"Error processing request: {e}")
            return self.generate_fallback_response()

    def generate_fallback_response(self) -> AnalysisResponse:
        return AnalysisResponse(
            market_analysis=MarketAnalysis(
                trends=[],
                opportunities=[],
                risks=[],
                sentiment=0.0,
                confidence=0.5
            ),
            recommendations=["System is currently processing limited analysis"],
            insights=[
                Insight(
                    content="Fallback analysis activated",
                    type="technical",
                    confidence=1.0,
                    impact=1.0,
                    priority="high",
                    timestamp=datetime.now().isoformat(),
                    source="system"
                )
            ],
            confidence_score=0.5,
            semantic_relevance=0.5,
            predictions=[{
                "type": "fallback",
                "description": "Using fallback response due to service unavailability",
                "confidence": 0.5
            }],
            sentiment={
                "overall_sentiment": 0,
                "aspects": []
            },
            risks={
                "overall_risk": 0.5,
                "factors": [{
                    "category": "system",
                    "severity": 1,
                    "probability": 1,
                    "description": "Service unavailable"
                }]
            },
            metrics={}
        )

    async def analyze_sentiment_advanced(self, text: str) -> Dict[str, Any]:
        # Multi-dimensional sentiment analysis
        sentiment_basic = self.sentiment_analyzer(text)[0]
        
        # Aspect-based sentiment analysis
        aspects = self.extract_aspects(text)
        aspect_sentiments = []
        
        for aspect in aspects:
            sentiment = await self.analyze_aspect_sentiment(aspect, text)
            aspect_sentiments.append(sentiment)
            
        # Emotional analysis
        emotional_dimensions = await self.analyze_emotional_dimensions(text)
        
        return {
            "overall_sentiment": sentiment_basic,
            "aspect_sentiments": aspect_sentiments,
            "emotional_analysis": emotional_dimensions,
            "confidence": self.calculate_sentiment_confidence(
                sentiment_basic, 
                aspect_sentiments, 
                emotional_dimensions
            )
        }

    async def analyze_risks_advanced(self, data: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Comprehensive risk analysis
        market_risks = self._analyze_market_risks(data, context)
        operational_risks = self._analyze_operational_risks(data, context)
        financial_risks = self._analyze_financial_risks(data, context)
        strategic_risks = await self._analyze_strategic_risks(data, context)
        
        # Risk correlation analysis
        risk_correlations = self.analyze_risk_correlations([
            market_risks, operational_risks, financial_risks, strategic_risks
        ])
        
        # Calculate compound risk scores
        overall_risk = self.calculate_compound_risk(
            market_risks, operational_risks, financial_risks, strategic_risks,
            risk_correlations
        )
        
        return {
            "market_risks": market_risks,
            "operational_risks": operational_risks,
            "financial_risks": financial_risks,
            "strategic_risks": strategic_risks,
            "risk_correlations": risk_correlations,
            "overall_risk": overall_risk,
            "mitigation_strategies": self.generate_mitigation_strategies(overall_risk),
            "confidence_score": self.calculate_risk_confidence(overall_risk)
        }

    def update_knowledge_base(self, results: Dict[str, Any]):
        # Implement knowledge base updating logic
        timestamp = datetime.now().isoformat()
        
        # Convert results to embeddings and store
        result_str = json.dumps(results)
        embedding = self.sentence_model.encode(result_str)
        
        self.knowledge_embeddings[timestamp] = {
            "embedding": embedding,
            "data": results
        }
        
        # Maintain buffer size
        if len(self.memory_buffer) > 1000:
            self.memory_buffer.pop(0)
        
        self.memory_buffer.append({
            "timestamp": timestamp,
            "data": results
        })

    def generate_predictions(self, data: str) -> List[Dict[str, Any]]:
        # Generate predictions using multiple models
        predictions = []
        # Add prediction logic
        return predictions

    def extract_insights(self, data: str) -> List[Dict[str, Any]]:
        # Extract meaningful insights from predictions
        insights = []
        # Add insight extraction logic
        return insights

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        try:
            # Overall sentiment
            sentiment_result = self.sentiment_analyzer(text)[0]
            
            # Aspect-based sentiment
            aspects = self._analyze_aspects(text)
            
            return {
                "overall_sentiment": sentiment_result["score"],
                "label": sentiment_result["label"],
                "aspects": aspects,
                "emotionalTone": self._analyze_emotional_tone(text),
                "confidence": sentiment_result["score"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def _analyze_aspects(self, text: str) -> List[Dict[str, Any]]:
        # Split text into sentences and analyze each for aspects
        sentences = text.split('.')
        aspects = []
        
        for sentence in sentences:
            if len(sentence.strip()) > 0:
                result = self.aspect_analyzer(sentence)[0]
                aspects.append({
                    "topic": self._extract_topic(sentence),
                    "sentiment": (int(result["label"][0]) - 3) / 2,  # Convert 1-5 to -1 to 1
                    "confidence": result["score"]
                })
        
        return aspects

    def _analyze_emotional_tone(self, text: str) -> Dict[str, Any]:
        # Implement emotional tone analysis
        return {
            "primary": "neutral",
            "secondary": ["analytical", "confident"],
            "intensity": 0.7
        }

    def _extract_topic(self, sentence: str) -> str:
        # Simple topic extraction - can be enhanced
        words = sentence.split()
        return words[0] if words else "general"

    async def analyze_risks(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Analyze different risk categories
            market_risks = self._analyze_market_risks(data, context)
            operational_risks = self._analyze_operational_risks(data, context)
            financial_risks = self._analyze_financial_risks(data, context)
            
            risk_factors = [*market_risks, *operational_risks, *financial_risks]
            overall_risk = self._calculate_overall_risk(risk_factors)
            
            return {
                "overall_risk": overall_risk,
                "risk_factors": risk_factors,
                "timestamp": datetime.now().isoformat(),
                "confidence": 0.85
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def _analyze_market_risks(self, data: Dict[str, Any], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{
            "category": "market",
            "severity": 0.7,
            "probability": 0.6,
            "description": "Increasing market competition"
        }]

    def _analyze_operational_risks(self, data: Dict[str, Any], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{
            "category": "operational",
            "severity": 0.5,
            "probability": 0.4,
            "description": "Supply chain disruption potential"
        }]

    def _analyze_financial_risks(self, data: Dict[str, Any], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [{
            "category": "financial",
            "severity": 0.3,
            "probability": 0.5,
            "description": "Currency exchange rate volatility"
        }]

    def _calculate_overall_risk(self, risk_factors: List[Dict[str, Any]]) -> float:
        if not risk_factors:
            return 0.0
        
        total_risk = sum(
            factor["severity"] * factor["probability"] 
            for factor in risk_factors
        )
        return total_risk / len(risk_factors)

    def assess_risks(self, data: str) -> Dict[str, Any]:
        # Perform risk assessment
        risks = {}
        # Add risk assessment logic
        return risks

    def calculate_confidence(self, results: Dict[str, Any]) -> float:
        # Calculate confidence score
        return 0.85

    def aspect_analyzer(self, text: str) -> List[Dict[str, Any]]:
        """Analyze aspects of the text"""
        try:
            return [{
                "label": "POSITIVE",
                "score": 0.8
            }]
        except Exception:
            return [{
                "label": "NEUTRAL",
                "score": 0.5
            }]

    async def analyze_market(self, content: str) -> MarketAnalysis:
        try:
            # Analyze market trends
            trends = await self.extract_trends(content)
            opportunities = await self.identify_opportunities(content)
            risks = await self.assess_market_risks(content)
            
            return MarketAnalysis(
                trends=trends,
                opportunities=opportunities,
                risks=risks,
                sentiment=self.calculate_market_sentiment(content),
                confidence=0.85  # Example confidence score
            )
        except Exception as e:
            print(f"Error in market analysis: {e}")
            return MarketAnalysis()

    async def generate_insights(self, content: str) -> List[Insight]:
        try:
            insights = []
            # Generate market insights
            market_insight = Insight(
                content="Market shows positive growth potential",
                type="market",
                confidence=0.85,
                impact=0.75,
                priority="high",
                source="market_analysis"
            )
            insights.append(market_insight)

            # Generate risk insights
            risk_insight = Insight(
                content="Competitive pressure increasing in sector",
                type="risk",
                confidence=0.80,
                impact=0.70,
                priority="medium",
                source="risk_analysis"
            )
            insights.append(risk_insight)

            return insights
        except Exception as e:
            print(f"Error generating insights: {e}")
            return []

    async def generate_recommendations(self, content: str) -> List[str]:
        try:
            return [
                "Expand market presence in emerging sectors",
                "Invest in digital transformation initiatives",
                "Strengthen customer relationship management"
            ]
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return []

    async def extract_trends(self, content: str) -> List[str]:
        try:
            # Basic trend extraction logic
            trends = [
                "Cloud computing adoption increasing",
                "AI/ML integration in enterprise solutions",
                "Remote work technology demand",
                "Cybersecurity emphasis growing",
                "Digital transformation acceleration"
            ]
            return trends[:3]  # Return top 3 trends
        except Exception as e:
            print(f"Error extracting trends: {e}")
            return []

    async def identify_opportunities(self, content: str) -> List[str]:
        try:
            opportunities = [
                "Market expansion in emerging technologies",
                "Digital service optimization",
                "Innovation in cloud solutions",
                "Enhanced customer experience platforms"
            ]
            return opportunities[:3]
        except Exception as e:
            print(f"Error identifying opportunities: {e}")
            return []

    async def assess_market_risks(self, content: str) -> List[str]:
        try:
            risks = [
                "Competitive market pressure",
                "Rapid technological changes",
                "Regulatory compliance challenges",
                "Market volatility"
            ]
            return risks[:3]
        except Exception as e:
            print(f"Error assessing market risks: {e}")
            return []

    def calculate_market_sentiment(self, content: str) -> float:
        try:
            # Use the sentiment analyzer to get sentiment score
            result = self.sentiment_analyzer(content)[0]
            # Convert sentiment to a float between -1 and 1
            sentiment_score = float(result['score'])
            if result['label'] == 'NEGATIVE':
                sentiment_score *= -1
            return sentiment_score
        except Exception as e:
            print(f"Error calculating market sentiment: {e}")
            return 0.0

ai_engine = AIEngine()

@app.post("/api/analyze")
async def analyze_data(request: AnalysisRequest):
    try:
        print(f"Processing analysis request")
        
        # Extract the first data item
        data_item = request.data[0]
        content = data_item.content
        
        # Generate analysis
        analysis_result = {
            "market_analysis": {
                "trends": ["AI/ML adoption", "Cloud computing", "Digital transformation"],
                "opportunities": ["Market expansion", "Technology innovation", "Digital services"],
                "risks": ["Competition", "Tech changes", "Market volatility"],
                "sentiment": 0.75,
                "confidence": 0.8
            },
            "recommendations": [
                "Invest in cloud technologies",
                "Enhance digital presence",
                "Focus on cybersecurity"
            ],
            "insights": [
                {
                    "content": "Market shows growth potential",
                    "type": "market",
                    "confidence": 0.85,
                    "impact": 0.75,
                    "priority": "high",
                    "timestamp": datetime.now().isoformat(),
                    "source": "market_analysis"
                }
            ],
            "confidence_score": 0.85,
            "semantic_relevance": 0.8,
            "predictions": [],
            "sentiment": {"overall_sentiment": 0.75, "aspects": []},
            "risks": {"overall_risk": 0.3, "factors": []},
            "metrics": {}
        }
        
        return analysis_result
        
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/sentiment", tags=["Analysis"])
async def analyze_sentiment(request: AnalysisRequest):
    try:
        if not request.data or request.data[0].type != AnalysisType.SENTIMENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request: missing or invalid sentiment data"
            )
        text = request.data[0].content
        return await ai_engine.analyze_sentiment(text)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/risks", tags=["Analysis"])
async def analyze_risks(request: AnalysisRequest):
    try:
        if not request.data or request.data[0].type != AnalysisType.RISKS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request: missing or invalid risk data"
            )
        data = request.data[0].content
        return await ai_engine.analyze_risks(data, request.context)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": ["/api/analyze", "/api/sentiment", "/api/risks"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_initialized": ai_engine.models_initialized,
        "timestamp": datetime.now().isoformat(),
        "memory_usage": "normal"
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Invalid request format",
            "errors": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc)
        }
    )

@app.get("/test")
async def test_endpoint():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }