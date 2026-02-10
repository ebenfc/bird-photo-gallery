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
