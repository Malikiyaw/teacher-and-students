export type AnimationType = "fade-in" | "fade-out" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "bounce" | "rotate" | "pulse" | "shake" | "flip" | "pop";

export interface AnimationDef {
  type: AnimationType;
  duration: number; // ms
  delay: number; // ms
  easing: string;
}

export function getAnimationCSS(anim: AnimationDef): string {
  const d = anim.duration || 500;
  const del = anim.delay || 0;
  switch (anim.type) {
    case "fade-in": return `@keyframes fi{from{opacity:0}to{opacity:1}}.a{animation:fi ${d}ms ${del}ms both ease-out}`;
    case "fade-out": return `@keyframes fo{from{opacity:1}to{opacity:0}}.a{animation:fo ${d}ms ${del}ms both ease-in}`;
    case "slide-up": return `@keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.a{animation:su ${d}ms ${del}ms both ease-out}`;
    case "slide-down": return `@keyframes sd{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}.a{animation:sd ${d}ms ${del}ms both ease-out}`;
    case "slide-left": return `@keyframes sl{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}.a{animation:sl ${d}ms ${del}ms both ease-out}`;
    case "slide-right": return `@keyframes sr{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}.a{animation:sr ${d}ms ${del}ms both ease-out}`;
    case "zoom-in": return `@keyframes zi{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}.a{animation:zi ${d}ms ${del}ms both ease-out}`;
    case "zoom-out": return `@keyframes zo{from{transform:scale(1.5);opacity:0}to{transform:scale(1);opacity:1}}.a{animation:zo ${d}ms ${del}ms both ease-out}`;
    case "bounce": return `@keyframes bo{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}.a{animation:bo ${d}ms ${del}ms both ease}`;
    case "rotate": return `@keyframes ro{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.a{animation:ro ${d}ms ${del}ms both linear}`;
    case "pulse": return `@keyframes pu{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}.a{animation:pu ${d}ms ${del}ms both ease-in-out infinite}`;
    case "shake": return `@keyframes sh{0%{transform:translateX(0)}10%{transform:translateX(-5px)}20%{transform:translateX(5px)}30%{transform:translateX(-5px)}40%{transform:translateX(5px)}50%{transform:translateX(0)}}.a{animation:sh ${d}ms ${del}ms both ease}`;
    case "flip": return `@keyframes fl{0%{transform:perspective(400px) rotateX(90deg);opacity:0}40%{transform:perspective(400px) rotateX(-20deg)}100%{transform:perspective(400px) rotateX(0);opacity:1}}.a{animation:fl ${d}ms ${del}ms both ease-out}`;
    case "pop": return `@keyframes po{0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}.a{animation:po ${d}ms ${del}ms both ease-out}`;
    default: return "";
  }
}

export const animationNames: { value: AnimationType; label: string }[] = [
  { value: "fade-in", label: "Fade In" },
  { value: "fade-out", label: "Fade Out" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
  { value: "bounce", label: "Bounce" },
  { value: "rotate", label: "Rotate" },
  { value: "pulse", label: "Pulse" },
  { value: "shake", label: "Shake" },
  { value: "flip", label: "Flip" },
  { value: "pop", label: "Pop" },
];
