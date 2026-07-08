export type AnimationType = "fade-in" | "fade-out" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "bounce" | "rotate" | "pulse" | "shake" | "flip" | "pop" | "motion-path";

export interface MotionPath {
  type: "linear" | "curve" | "zigzag" | "spiral" | "bounce";
  points: { x: number; y: number }[];
}

export interface AnimationDef {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: string;
  direction?: "normal" | "reverse" | "alternate";
  fillMode?: "none" | "forwards" | "backwards" | "both";
  iterationCount?: number | "infinite";
  motionPath?: MotionPath;
}

export function getAnimationCSS(anim: AnimationDef): string {
  const d = anim.duration || 500;
  const del = anim.delay || 0;
  const name = anim.type;
  const fill = anim.fillMode || "both";
  const dir = anim.direction || "normal";
  const iter = anim.iterationCount !== undefined ? anim.iterationCount : 1;
  switch (anim.type) {
    case "fade-in": return `@keyframes fade-in{from{opacity:0}to{opacity:1}}.a{animation:fade-in ${d}ms ${del}ms ${fill}}`;
    case "fade-out": return `@keyframes fade-out{from{opacity:1}to{opacity:0}}.a{animation:fade-out ${d}ms ${del}ms ${fill}}`;
    case "slide-up": return `@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.a{animation:slide-up ${d}ms ${del}ms ${fill}}`;
    case "slide-down": return `@keyframes slide-down{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}.a{animation:slide-down ${d}ms ${del}ms ${fill}}`;
    case "slide-left": return `@keyframes slide-left{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}.a{animation:slide-left ${d}ms ${del}ms ${fill}}`;
    case "slide-right": return `@keyframes slide-right{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}.a{animation:slide-right ${d}ms ${del}ms ${fill}}`;
    case "zoom-in": return `@keyframes zoom-in{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}.a{animation:zoom-in ${d}ms ${del}ms ${fill}}`;
    case "zoom-out": return `@keyframes zoom-out{from{transform:scale(1.5);opacity:0}to{transform:scale(1);opacity:1}}.a{animation:zoom-out ${d}ms ${del}ms ${fill}}`;
    case "bounce": return `@keyframes bounce{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}.a{animation:bounce ${d}ms ${del}ms ${fill}}`;
    case "rotate": return `@keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.a{animation:rotate ${d}ms ${del}ms ${fill}}`;
    case "pulse": return `@keyframes pulse{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}.a{animation:pulse ${d}ms ${del}ms ${fill} infinite}`;
    case "shake": return `@keyframes shake{0%{transform:translateX(0)}10%{transform:translateX(-5px)}20%{transform:translateX(5px)}30%{transform:translateX(-5px)}40%{transform:translateX(5px)}50%{transform:translateX(0)}}.a{animation:shake ${d}ms ${del}ms ${fill}}`;
    case "flip": return `@keyframes flip{0%{transform:perspective(400px) rotateX(90deg);opacity:0}40%{transform:perspective(400px) rotateX(-20deg)}100%{transform:perspective(400px) rotateX(0);opacity:1}}.a{animation:flip ${d}ms ${del}ms ${fill}}`;
    case "pop": return `@keyframes pop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}.a{animation:pop ${d}ms ${del}ms ${fill}}`;
    case "motion-path":
      if (anim.motionPath) {
        const pts = anim.motionPath.points;
        const steps = pts.map((p, idx) => `${Math.round(idx / (pts.length - 1) * 100)}%{transform:translate(${p.x}px,${p.y}px)}`).join("");
        return `@keyframes motion-path{${steps}}.a{animation:motion-path ${d}ms ${del}ms ${fill}}`;
      }
      return "";
    default: return "";
  }
}

export function getAllAnimationCSS(): string {
  return animationNames.map(a => getAnimationCSS({ type: a.value, duration: 500, delay: 0, easing: "ease-out" })).join("\n");
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

export const easingOptions = [
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "linear", label: "Linear" },
  { value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "Spring" },
  { value: "cubic-bezier(0.68, 0.15, 0.265, 1.15)", label: "Bounce" },
];

export const directionOptions = [
  { value: "normal", label: "Normal" },
  { value: "reverse", label: "Reverse" },
  { value: "alternate", label: "Alternate" },
];

export const fillModeOptions = [
  { value: "none", label: "None" },
  { value: "forwards", label: "Forwards" },
  { value: "backwards", label: "Backwards" },
  { value: "both", label: "Both" },
];
