import { Injectable } from '@nestjs/common';

export interface Chunk {
  id: string;
  source: string;
  content: string;
  vector?: number[];
}

@Injectable()
export class EmbeddingService {
  // Simple TF-IDF term occurrence array constructor for similarity search
  generateEmbedding(text: string): number[] {
    const vocab = [
      'protein', 'carb', 'fat', 'calorie', 'kcal', 'weight', 'workout', 'diet', 'meal',
      'breakfast', 'lunch', 'dinner', 'snack', 'water', 'creatine', 'supplement', 'travel',
      'recovery', 'deficit', 'surplus', 'macro', 'habit', 'streak', 'adherence', 'allergy',
      'dislike', 'vegetarian', 'vegan', 'keto', 'profile', 'goal', 'maintenance', 'gain'
    ];

    const words = text.toLowerCase().split(/[^a-z]+/);
    const wordCounts: Record<string, number> = {};
    for (const w of words) {
      if (vocab.includes(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    }

    // Return embedding vector matching vocab dimensions
    return vocab.map(term => wordCounts[term] || 0);
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
export default EmbeddingService;
