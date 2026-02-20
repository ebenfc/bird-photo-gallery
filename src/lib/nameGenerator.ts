/**
 * Bird-themed display name generator.
 * Produces names like "CuriousWren42", "SwiftHeron77".
 */

const adjectives = [
  "Curious", "Swift", "Gentle", "Bold", "Bright",
  "Keen", "Quiet", "Nimble", "Perky", "Serene",
  "Daring", "Mellow", "Cheerful", "Plucky", "Spirited",
  "Stealthy", "Graceful", "Wandering", "Soaring", "Golden",
  "Mossy", "Misty", "Twilight", "Coastal", "Feathered",
];

const birds = [
  "Wren", "Heron", "Finch", "Sparrow", "Falcon",
  "Owl", "Robin", "Cardinal", "Jay", "Hawk",
  "Dove", "Crane", "Lark", "Thrush", "Warbler",
  "Oriole", "Tanager", "Kinglet", "Vireo", "Nuthatch",
  "Osprey", "Kestrel", "Merlin", "Pipit", "Bunting",
];

export function generateBirdName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const bird = birds[Math.floor(Math.random() * birds.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}${bird}${num}`;
}

/**
 * Generate a bird-themed username in lowercase-hyphenated format.
 * Produces names like "curious-wren-42", "swift-heron-77".
 * These pass validateUsername() rules (3-30 chars, lowercase, letters/numbers/hyphens).
 */
export function generateBirdUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)] ?? "keen";
  const bird = birds[Math.floor(Math.random() * birds.length)] ?? "wren";
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj.toLowerCase()}-${bird.toLowerCase()}-${num}`;
}
