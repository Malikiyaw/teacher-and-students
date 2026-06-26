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
  { id: "parallelogram", name: "Parallelogram", path: "M20,0 L100,0 L80,100 L0,100 Z", defaultRatio: 1.5 },
  { id: "trapezoid", name: "Trapezoid", path: "M20,0 L80,0 L100,100 L0,100 Z", defaultRatio: 1.5 },
  { id: "document", name: "Document", path: "M0,0 L100,0 L100,85 Q50,95 0,85 Z", defaultRatio: 0.8 },
  { id: "folded-corner", name: "Folded Corner", path: "M0,0 L70,0 L100,30 L100,100 L0,100 Z M70,0 L70,30 L100,30", defaultRatio: 0.8 },
  { id: "pill", name: "Pill / Capsule", path: "M30,0 L70,0 Q100,0 100,50 Q100,100 70,100 L30,100 Q0,100 0,50 Q0,0 30,0 Z", defaultRatio: 2 },
  { id: "half-circle", name: "Half Circle", path: "M0,100 C0,44.8 44.8,0 100,0 L100,100 Z", defaultRatio: 1 },
  { id: "ribbon", name: "Ribbon", path: "M0,0 L100,0 L100,80 L50,65 L0,80 Z", defaultRatio: 2 },
  { id: "burst-5", name: "Burst 5-Point", path: "M50,0 L58,38 L98,31 L70,58 L81,98 L50,75 L19,98 L30,58 L2,31 L42,38 Z", defaultRatio: 1 },
  { id: "burst-8", name: "Burst 8-Point", path: "M50,0 L54,25 L79,10 L68,34 L97,43 L75,58 L97,73 L68,83 L79,100 L54,88 L50,100 L46,88 L21,100 L32,83 L3,73 L25,58 L3,43 L32,34 L21,10 L46,25 Z", defaultRatio: 1 },
  { id: "teardrop", name: "Teardrop", path: "M50,0 C78,0 100,30 100,65 C100,88 78,100 50,100 C22,100 0,88 0,65 C0,45 20,20 50,0 Z", defaultRatio: 1 },
  { id: "sun", name: "Sun", path: "M50,10 C55,10 55,0 50,0 C45,0 45,10 50,10 Z M50,90 C45,90 45,100 50,100 C55,100 55,90 50,90 Z M10,50 C10,45 0,45 0,50 C0,55 10,55 10,50 Z M90,50 C90,45 100,45 100,50 C100,55 90,55 90,50 Z M22,22 C25,19 19,15 16,18 C13,21 17,27 22,22 Z M78,78 C75,81 81,85 84,82 C87,79 83,73 78,78 Z M78,22 C81,19 87,23 84,26 C81,29 75,25 78,22 Z M22,78 C19,75 15,79 18,82 C21,85 25,81 22,78 Z M50,25 C36,25 25,36 25,50 C25,64 36,75 50,75 C64,75 75,64 75,50 C75,36 64,25 50,25 Z", defaultRatio: 1 },
  { id: "moon", name: "Moon", path: "M60,0 C35,10 20,35 20,60 C20,85 40,105 65,100 C45,90 35,75 35,55 C35,35 45,15 60,0 Z", defaultRatio: 1 },
  { id: "cross-small", name: "Cross Small", path: "M35,0 L65,0 L65,35 L100,35 L100,65 L65,65 L65,100 L35,100 L35,65 L0,65 L0,35 L35,35 Z", defaultRatio: 1 },
  { id: "arrow-curved", name: "Arrow Curved", path: "M10,40 Q40,10 80,20 L90,5 L90,30 L65,30 L80,15 Q50,5 20,30 L10,40 Z", defaultRatio: 1.5 },
  { id: "arrow-chevron", name: "Arrow Chevron", path: "M0,20 L60,50 L0,80 L0,65 L40,50 L0,35 Z M60,20 L100,50 L60,80 L60,65 L82,50 L60,35 Z", defaultRatio: 2 },
  { id: "plus", name: "Plus", path: "M40,0 L60,0 L60,40 L100,40 L100,60 L60,60 L60,100 L40,100 L40,60 L0,60 L0,40 L40,40 Z", defaultRatio: 1 },
  { id: "minus-shape", name: "Minus", path: "M0,40 L100,40 L100,60 L0,60 Z", defaultRatio: 2.5 },
  { id: "speech-bubble", name: "Speech Bubble", path: "M10,0 L90,0 Q100,0 100,10 L100,80 Q100,90 90,90 L60,90 L50,100 L55,90 L10,90 Q0,90 0,80 L0,10 Q0,0 10,0 Z", defaultRatio: 1.2 },
  { id: "thought-bubble", name: "Thought Bubble", path: "M80,10 C88,5 95,10 95,20 C95,30 88,35 80,30 C72,35 65,30 65,20 C65,10 72,5 80,10 Z M40,25 C55,15 70,25 70,40 C70,55 55,65 40,60 C25,65 10,55 10,40 C10,25 25,15 40,25 Z M40,60 C55,65 65,78 55,88 C50,95 40,95 35,88 C25,78 25,65 40,60 Z", defaultRatio: 1.5 },
  { id: "flag", name: "Flag / Pin", path: "M10,0 L90,0 L90,60 L50,45 L10,60 Z", defaultRatio: 1.5 },
];

export function getShapeById(id: string): ShapeDef | undefined {
  return shapes.find(s => s.id === id);
}
