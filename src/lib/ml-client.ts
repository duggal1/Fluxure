import axios from 'axios';

const ML_API_BASE = 'http://localhost:5000/api/ml';

export interface RiskAssessmentInput {
  features: number[];
}

export interface RiskAssessmentResult {
  risk_score: number;
  confidence: number;
}

export interface DemandPredictionInput {
  features: number[];
}

export interface DemandPredictionResult {
  predicted_demand: number;
}

export class MLClient {
  static async assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    try {
      const response = await axios.post(`${ML_API_BASE}/risk-assessment`, input);
      return response.data;
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }

  static async predictDemand(input: DemandPredictionInput): Promise<DemandPredictionResult> {
    try {
      const response = await axios.post(`${ML_API_BASE}/demand-prediction`, input);
      return response.data;
    } catch (error) {
      console.error('Demand prediction failed:', error);
      throw error;
    }
  }

  static async trainModel(type: string, data: any): Promise<void> {
    try {
      await axios.post(`${ML_API_BASE}/train`, { type, data });
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    }
  }
}