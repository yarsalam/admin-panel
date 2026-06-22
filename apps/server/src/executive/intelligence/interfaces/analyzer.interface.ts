import { Recommendation } from './recommendation.interface';

export interface IAnalyzerService {
  analyze(): Promise<Recommendation[]>;
}
