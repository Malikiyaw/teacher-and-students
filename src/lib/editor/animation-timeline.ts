import type { AnimationDef } from "./animate";

export interface AnimationSequenceItem {
  id: string;
  elementId: string;
  animation: AnimationDef;
  startTime: number;
  duration: number;
}

export type AnimationSequence = AnimationSequenceItem[];

interface AnimatableElement {
  id: string;
  zIndex?: number;
  animation?: AnimationDef;
  animations?: AnimationDef[];
}

export function sequencifyAnimations(elements: AnimatableElement[]): AnimationSequence {
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const sequence: AnimationSequence = [];
  let currentTime = 0;

  for (const el of sorted) {
    const anims = (el.animations && el.animations.length > 0) ? el.animations : (el.animation ? [el.animation] : []);
    for (const anim of anims) {
      const dur = anim.duration || 500;
      sequence.push({
        id: `${el.id}-${sequence.length}`,
        elementId: el.id,
        animation: anim,
        startTime: currentTime,
        duration: dur,
      });
      currentTime += dur + 200;
    }
  }

  return sequence;
}

export function getTimelineCSS(sequence: AnimationSequence): string {
  if (sequence.length === 0) return "";
  return sequence.map((item, i) => {
    const name = `seq-${i}`;
    const anim = item.animation;
    const d = anim.duration || 500;
    const easing = anim.easing || "ease-out";
    const fill = anim.fillMode || "both";
    const dir = anim.direction || "normal";
    const iter = anim.iterationCount || 1;

    let keyframes = "";
    switch (anim.type) {
      case "fade-in":
        keyframes = `@keyframes ${name}{from{opacity:0}to{opacity:1}}`;
        break;
      case "fade-out":
        keyframes = `@keyframes ${name}{from{opacity:1}to{opacity:0}}`;
        break;
      case "slide-up":
        keyframes = `@keyframes ${name}{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`;
        break;
      case "slide-down":
        keyframes = `@keyframes ${name}{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`;
        break;
      case "slide-left":
        keyframes = `@keyframes ${name}{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`;
        break;
      case "slide-right":
        keyframes = `@keyframes ${name}{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}`;
        break;
      case "zoom-in":
        keyframes = `@keyframes ${name}{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`;
        break;
      case "zoom-out":
        keyframes = `@keyframes ${name}{from{transform:scale(1.5);opacity:0}to{transform:scale(1);opacity:1}}`;
        break;
      case "bounce":
        keyframes = `@keyframes ${name}{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}`;
        break;
      case "rotate":
        keyframes = `@keyframes ${name}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;
        break;
      case "pulse":
        keyframes = `@keyframes ${name}{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}`;
        break;
      case "shake":
        keyframes = `@keyframes ${name}{0%{transform:translateX(0)}10%{transform:translateX(-5px)}20%{transform:translateX(5px)}30%{transform:translateX(-5px)}40%{transform:translateX(5px)}50%{transform:translateX(0)}}`;
        break;
      case "flip":
        keyframes = `@keyframes ${name}{0%{transform:perspective(400px) rotateX(90deg);opacity:0}40%{transform:perspective(400px) rotateX(-20deg)}100%{transform:perspective(400px) rotateX(0);opacity:1}}`;
        break;
      case "pop":
        keyframes = `@keyframes ${name}{0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`;
        break;
      case "motion-path":
        if (anim.motionPath) {
          const pts = anim.motionPath.points;
          if (pts.length >= 2) {
            const steps = pts.map((p, idx) => `${Math.round(idx / (pts.length - 1) * 100)}%{transform:translate(${p.x}px,${p.y}px)}`).join("");
            keyframes = `@keyframes ${name}{${steps}}`;
          }
        }
        break;
      default:
        keyframes = `@keyframes ${name}{from{opacity:0}to{opacity:1}}`;
    }

    return `${keyframes}[data-seq-id="${item.elementId}"]{animation:${name} ${d}ms ${item.startTime}ms ${easing} ${iter} ${dir} ${fill}}`;
  }).join("\n");
}

export function getTotalDuration(sequence: AnimationSequence): number {
  if (sequence.length === 0) return 0;
  const last = sequence[sequence.length - 1];
  return last.startTime + last.duration;
}
