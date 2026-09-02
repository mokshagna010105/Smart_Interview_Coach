/**
 * Deterministic Filler Word Detection Utility
 */

const COMMON_FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'actually',
  'basically',
  'literally',
  'you know',
  'i mean',
  'sort of',
  'kind of',
  'right'
];

/**
 * Analyze transcript text for filler words and return count, breakdown, and percentage
 * @param {string} text
 * @returns {{ totalCount: number, breakdown: Record<string, number>, fillerPercentage: number }}
 */
export const detectFillerWords = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      totalCount: 0,
      breakdown: {},
      fillerPercentage: 0
    };
  }

  const cleanText = text.toLowerCase().replace(/[^\w\s']/g, ' ');
  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      totalCount: 0,
      breakdown: {},
      fillerPercentage: 0
    };
  }

  const breakdown = {};
  let totalFillerCount = 0;

  // 1. Check multi-word phrases (e.g. "you know", "i mean", "sort of", "kind of")
  const multiWordFillers = COMMON_FILLER_WORDS.filter(w => w.includes(' '));
  for (const phrase of multiWordFillers) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      breakdown[phrase] = matches.length;
      totalFillerCount += matches.length;
    }
  }

  // 2. Check single word fillers
  const singleWordFillers = COMMON_FILLER_WORDS.filter(w => !w.includes(' '));
  for (const word of singleWordFillers) {
    // Exact word boundary match
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      // Avoid over-counting "so" or "like" if used in technical context (e.g. "SQL LIKE"), but flag conversational density
      breakdown[word] = matches.length;
      totalFillerCount += matches.length;
    }
  }

  const fillerPercentage = totalWords > 0 ? Number(((totalFillerCount / totalWords) * 100).toFixed(1)) : 0;

  return {
    totalCount: totalFillerCount,
    breakdown,
    fillerPercentage
  };
};

export default detectFillerWords;
