export interface RatingModel {
  emotionalImpact: number;
  character: number;
  pacing: number;
  storyline: number;
  writingStyle: number;
  overallRating: number;
}

export function createDefaultRating(): RatingModel {
  return {
    emotionalImpact: 0,
    character: 0,
    pacing: 0,
    storyline: 0,
    writingStyle: 0,
    overallRating: 0,
  };
}
