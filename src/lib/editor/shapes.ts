export interface ShapeDef {
  id: string;
  name: string;
  path: string; // SVG path data
  defaultRatio: number; // width/height
}

export const shapes: ShapeDef[] = [
  { id: "rect", name: "Rectangle", path: "M0,0 L100,0 L100,100 L0,100 Z", defaultRatio: 1 },
  { id: "rounded-rect", name: "Rounded Rectangle", path: "M10,0 L90,0 Q100,0 100,10 L100,90 Q100,100 90,100 L10,100 Q0,100 0,90 L0,10 Q0,0 10,0 Z", defaultRatio: 1 },
  { id: "circle", name: "Circle", path: "M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z", defaultRatio: 1 },
  { id: "triangle", name: "Triangle", path: "M50,0 L100,86.6 L0,86.6 Z", defaultRatio: 1.15 },
  { id: "diamond", name: "Diamond", path: "M50,0 L100,50 L50,100 L0,50 Z", defaultRatio: 1 },
  { id: "pentagon", name: "Pentagon", path: "M50,0 L97.6,34.5 L79.4,90.5 L20.6,90.5 L2.4,34.5 Z", defaultRatio: 1.05 },
  { id: "hexagon", name: "Hexagon", path: "M50,0 L93.3,25 L93.3,75 L50,100 L6.7,75 L6.7,25 Z", defaultRatio: 1.15 },
  { id: "octagon", name: "Octagon", path: "M29.3,0 L70.7,0 L100,29.3 L100,70.7 L70.7,100 L29.3,100 L0,70.7 L0,29.3 Z", defaultRatio: 1 },
  { id: "star", name: "Star", path: "M50,0 L61,34.5 L97.5,34.5 L68,55.5 L77.5,90.5 L50,70 L22.5,90.5 L32,55.5 L2.5,34.5 L39,34.5 Z", defaultRatio: 1.05 },
  { id: "heart", name: "Heart", path: "M50,92 C50,92 0,60 0,35 C0,15 15,0 35,0 C45,0 50,10 50,10 C50,10 55,0 65,0 C85,0 100,15 100,35 C100,60 50,92 50,92 Z", defaultRatio: 1 },
  { id: "arrow-right", name: "Arrow Right", path: "M0,40 L60,40 L60,10 L100,50 L60,90 L60,60 L0,60 Z", defaultRatio: 2 },
  { id: "arrow-up", name: "Arrow Up", path: "M40,100 L40,40 L10,40 L50,0 L90,40 L60,40 L60,100 Z", defaultRatio: 1 },
  { id: "arrow-left", name: "Arrow Left", path: "M100,40 L40,40 L40,10 L0,50 L40,90 L40,60 L100,60 Z", defaultRatio: 2 },
  { id: "arrow-down", name: "Arrow Down", path: "M40,0 L40,60 L10,60 L50,100 L90,60 L60,60 L60,0 Z", defaultRatio: 1 },
  { id: "cross", name: "Cross", path: "M30,0 L70,0 L70,30 L100,30 L100,70 L70,70 L70,100 L30,100 L30,70 L0,70 L0,30 L30,30 Z", defaultRatio: 1 },
  { id: "line", name: "Line", path: "M0,50 L100,50", defaultRatio: 3 },
  { id: "arrow-line", name: "Arrow Line", path: "M0,45 L80,45 L80,30 L100,50 L80,70 L80,55 L0,55 Z", defaultRatio: 3 },
  { id: "double-arrow", name: "Double Arrow", path: "M10,30 L30,50 L10,70 L10,55 L90,55 L90,70 L100,50 L90,30 L90,45 L10,45 Z", defaultRatio: 3 },
  { id: "callout", name: "Callout", path: "M10,0 L90,0 Q100,0 100,10 L100,80 Q100,90 90,90 L50,90 L30,100 L35,90 L10,90 Q0,90 0,80 L0,10 Q0,0 10,0 Z", defaultRatio: 1.2 },
  { id: "cloud", name: "Cloud", path: "M70,20 C75,10 85,5 95,10 C105,15 110,30 105,40 C112,45 115,55 110,65 C105,75 95,80 85,78 L65,80 C55,85 45,85 35,80 L15,82 C8,78 5,70 8,62 C2,55 2,45 8,38 C5,30 8,22 15,18 C25,10 40,10 48,18 C52,15 60,15 65,20 Z", defaultRatio: 1.3 },
  { id: "check", name: "Checkmark", path: "M10,50 L35,75 L90,20", defaultRatio: 1.5 },
  { id: "x-shape", name: "X Mark", path: "M10,10 L90,90 M90,10 L10,90", defaultRatio: 1 },
  { id: "chevron-right", name: "Chevron Right", path: "M20,10 L70,50 L20,90", defaultRatio: 1.5 },
  { id: "chevron-left", name: "Chevron Left", path: "M80,10 L30,50 L80,90", defaultRatio: 1.5 },
  { id: "bracket-left", name: "Bracket Left", path: "M80,0 L100,0 L100,10 L90,10 L90,90 L100,90 L100,100 L80,100 Z", defaultRatio: 1 },
  { id: "bracket-right", name: "Bracket Right", path: "M20,0 L0,0 L0,10 L10,10 L10,90 L0,90 L0,100 L20,100 Z", defaultRatio: 1 },
];

export function getShapeById(id: string): ShapeDef | undefined {
  return shapes.find(s => s.id === id);
}
