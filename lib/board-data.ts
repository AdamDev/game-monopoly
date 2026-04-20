import { BoardSpace } from '@/types/game'

export const BOARD: BoardSpace[] = [
  // Bottom row (right to left)
  { index: 0, name: 'GO', type: 'go' },
  { index: 1, name: 'Mediterranean Avenue', type: 'property', color: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgageValue: 30 },
  { index: 2, name: 'Community Chest', type: 'community-chest' },
  { index: 3, name: 'Baltic Avenue', type: 'property', color: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgageValue: 30 },
  { index: 4, name: 'Income Tax', type: 'tax', taxAmount: 200 },
  { index: 5, name: 'Reading Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { index: 6, name: 'Oriental Avenue', type: 'property', color: 'light-blue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
  { index: 7, name: 'Chance', type: 'chance' },
  { index: 8, name: 'Vermont Avenue', type: 'property', color: 'light-blue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
  { index: 9, name: 'Connecticut Avenue', type: 'property', color: 'light-blue', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgageValue: 60 },

  // Left column (bottom to top)
  { index: 10, name: 'Jail / Just Visiting', type: 'jail' },
  { index: 11, name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
  { index: 12, name: 'Electric Company', type: 'utility', price: 150, mortgageValue: 75 },
  { index: 13, name: 'States Avenue', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
  { index: 14, name: 'Virginia Avenue', type: 'property', color: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgageValue: 80 },
  { index: 15, name: 'Pennsylvania Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { index: 16, name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
  { index: 17, name: 'Community Chest', type: 'community-chest' },
  { index: 18, name: 'Tennessee Avenue', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
  { index: 19, name: 'New York Avenue', type: 'property', color: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },

  // Top row (left to right)
  { index: 20, name: 'Free Parking', type: 'free-parking' },
  { index: 21, name: 'Kentucky Avenue', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 22, name: 'Chance', type: 'chance' },
  { index: 23, name: 'Indiana Avenue', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 24, name: 'Illinois Avenue', type: 'property', color: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgageValue: 120 },
  { index: 25, name: 'B&O Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { index: 26, name: 'Atlantic Avenue', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
  { index: 27, name: 'Ventnor Avenue', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
  { index: 28, name: 'Water Works', type: 'utility', price: 150, mortgageValue: 75 },
  { index: 29, name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgageValue: 140 },

  // Right column (top to bottom)
  { index: 30, name: 'Go To Jail', type: 'go-to-jail' },
  { index: 31, name: 'Pacific Avenue', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
  { index: 32, name: 'North Carolina Avenue', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
  { index: 33, name: 'Community Chest', type: 'community-chest' },
  { index: 34, name: 'Pennsylvania Avenue', type: 'property', color: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgageValue: 160 },
  { index: 35, name: 'Short Line', type: 'railroad', price: 200, mortgageValue: 100 },
  { index: 36, name: 'Chance', type: 'chance' },
  { index: 37, name: 'Park Place', type: 'property', color: 'dark-blue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgageValue: 175 },
  { index: 38, name: 'Luxury Tax', type: 'tax', taxAmount: 100 },
  { index: 39, name: 'Boardwalk', type: 'property', color: 'dark-blue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgageValue: 200 },
]

/** All board positions that are buyable (properties, railroads, utilities) */
export const BUYABLE_POSITIONS = BOARD
  .filter(s => s.type === 'property' || s.type === 'railroad' || s.type === 'utility')
  .map(s => s.index)

/** Get all property positions for a given color group */
export function getColorGroup(color: string): number[] {
  return BOARD.filter(s => s.color === color).map(s => s.index)
}

/** Railroad positions */
export const RAILROAD_POSITIONS = [5, 15, 25, 35]

/** Utility positions */
export const UTILITY_POSITIONS = [12, 28]
