export const COLORS = [
  { name: 'red', class: 'bg-[#ff5252]', lightClass: 'bg-[#ff8a80]', hex: '#ff5252' },
  { name: 'blue', class: 'bg-[#448aff]', lightClass: 'bg-[#82b1ff]', hex: '#448aff' },
  { name: 'green', class: 'bg-[#69f0ae]', lightClass: 'bg-[#00e676]', hex: '#69f0ae' },
  { name: 'yellow', class: 'bg-[#ffd740]', lightClass: 'bg-[#ffe57f]', hex: '#ffd740' },
  { name: 'purple', class: 'bg-[#e040fb]', lightClass: 'bg-[#ea80fc]', hex: '#e040fb' },
  { name: 'orange', class: 'bg-[#ff9100]', lightClass: 'bg-[#ffb74d]', hex: '#ff9100' }
];

export type GameStatus = 'playing' | 'won' | 'lost';
export type AiMood = 'thinking' | 'happy' | 'neutral' | 'sad';

export interface GuessHistory {
  guess: number[];
  blackDots: number;
  whiteDots: number;
}
