import { NgZone } from "@angular/core";
import { getLogger } from "../services/logger";

type AnimationFrameInfo = {
  transform: string;
  opacity: string;
  skip?: boolean;
};

type AnimationInfo = {
  div: HTMLElement,
  endX: number,
  offsetT: number,
  rot: number,
  calcFrames?: Array<AnimationFrameInfo>;
  calcOffsets?: Array<number>;
};

const logger = getLogger('banana-animation');
const nFrames = 140;

export class BananaAnimation {
  private timer: any;
  private frameTimer: FrameTimer;

  constructor(private ngZone: NgZone) {}

  runAnimation() {
    const animationsToAnimate = this.getAnimationsToAnimate();

    let t = 0;
    const onGenerateFrame = () => {
      for (let animation of animationsToAnimate[t]) {
        const calcFrame = animation.calcFrames[t];
        //if (!calcFrame) throw new Error(`null?? ${t} + ${animation.offsetT} = ${myT}`);
        //if (calcFrame.skip) throw new Error('cannot be skip.');
        animation.div.style.transform = calcFrame.transform;
        animation.div.style.opacity = calcFrame.opacity;
      }

      if (++t >= nFrames) t = 0;
    };

    this.frameTimer = new FrameTimer({onGenerateFrame});
    this.frameTimer.start();
  }

  stopAnimation() {
    clearTimeout(this.timer);
    if (this.frameTimer) this.frameTimer.stop();
  }

  private getAnimationsToAnimate() {
    let animations: Array<AnimationInfo> = [];
    for (let i = 0; i < 50; ++i) {
      const div = document.createElement('div');
      div.classList.add('banana');
      const animationInfo: AnimationInfo = {
        div,
        endX: -300 + Math.random() * 600,
        rot: (Math.random() <= 0.5 ? -1 : 1) * (720 + Math.random() * 360 * 5),
        offsetT: Math.floor(Math.random() * nFrames)
      };
      animationInfo.calcFrames = this.calculateFrames(animationInfo);

      animations.push(animationInfo);
    }

    for (let animation of animations) {
      document.getElementById('board').appendChild(animation.div);
    }

    let animationsToAnimate = new Array<Array<AnimationInfo>>(nFrames).fill(null);
    for (let t = 0; t < nFrames; ++t) {
      animationsToAnimate[t] = animations
        .filter(animation => !animation.calcFrames[t].skip);
    }

    this.debugInfo(animations);

    return animationsToAnimate;
  }

  private calculateFrames(animation: AnimationInfo): AnimationFrameInfo[] {
    let ret: AnimationFrameInfo[] = [];
    for (let t = 0; t < nFrames; ++t) {
      const rot = this.roundToPrecision(animation.rot * (t / nFrames), 0);
      const x = this.roundToPrecision(animation.endX * (t / nFrames), 0);
      const y = this.roundToPrecision(350 + (0.035 * (t + 80) * (t - 140)), 0);
      const opacity = t >= 40 && t <= 100
        ? 1
        : (t < 40 ? t/40 : ((nFrames-t)/40));
      
      const frameInfo: AnimationFrameInfo = {
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        opacity: this.roundToPrecision(opacity).toString(),
        skip: y <= -43
      }

      ret.push(frameInfo);
    }
    let newRet: AnimationFrameInfo[] = Array(nFrames).fill(null);
    const offsets = this.calculateOffsets(animation, nFrames);
    for (let i = 0; i < offsets.length; ++i) {
      newRet[offsets[i]] = ret[i];
    }

    return newRet;
  }

  private calculateOffsets(animation: AnimationInfo, nFrames: number): number[] {
    return Array(nFrames).fill(null).map((_, t) => (animation.offsetT + t) % nFrames);
  }

  // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
  private roundToPrecision(num: number, precision: number = 2) {  
    const pow = 10 ** precision;
    return Math.round((num + Number.EPSILON) * pow) / pow;
  }

  private debugInfo(animations: AnimationInfo[]) {
    let skipped = 0, total = 0;
    for (let animation of animations) {
      for (let frame of animation.calcFrames) {
        skipped += (frame.skip ? 1 : 0);
        total++;
      }
    }
    logger.info(`skipping ${skipped}/${total} frames (${(skipped*100/total).toFixed(1)}%)`)
  }
}

const FPS = 60.098;

export class FrameTimer {
  private readonly onGenerateFrame: () => void;
  private readonly interval: number;

  private lastFrameTime?: number = null;
  private requestId?: number = null;

  running = false;

  constructor(
    options: {onGenerateFrame: () => void}
  ) {
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.onGenerateFrame = options.onGenerateFrame;
    this.interval = 1e3 / FPS;
  }

  start() {
    this.running = true;
    this.lastFrameTime = 0;
    this.onAnimationFrame(0);
  }

  stop() {
    this.running = false;
    if (this.requestId) cancelAnimationFrame(this.requestId);
    this.lastFrameTime = null;
  }

  private onAnimationFrame = time => {
    // see https://github.com/angular/zone.js/issues/875
    this.requestId = window['__zone_symbol__requestAnimationFrame'](this.onAnimationFrame);

    const frameDelta = time - this.lastFrameTime;
    const numFrames = ~~(frameDelta / this.interval);
    this.lastFrameTime += numFrames * this.interval;

    // This can happen a lot on a 144Hz displays
    if (numFrames === 0) {
      return;
    }

    this.onGenerateFrame();
  };
}