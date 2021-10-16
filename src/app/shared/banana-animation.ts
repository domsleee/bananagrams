
export class BananaAnimation {
  timer: any;
  children: HTMLElement[];
  frameTimer: FrameTimer;

  runAnimation() {
    let animations: Array<{
      div: HTMLElement,
      endX: number,
      offsetT: number,
      rot: number}> = [];
    for (let i = 0; i < 50; ++i) {
      const div = document.createElement('div');
      div.classList.add('banana');
      animations.push({
        div,
        endX: -300 + Math.random() * 600,
        rot: (Math.random() <= 0.5 ? -1 : 1) * (720 + Math.random() * 360 * 5),
        offsetT: Math.random() * 140
      });
    }

    for (let animation of animations) {
      document.getElementById('board').appendChild(animation.div);
    }

    const nFrames = 140;
    let t = 0;
    const onGenerateFrame = (numFrames: number) => {
      for (let animation of animations) {
        let myT = (t + animation.offsetT) % nFrames;
        const rot = animation.rot * (myT / nFrames);
        const x = animation.endX * (myT / nFrames);
        const y = 0.035 * (myT + 80) * (myT - 140);
        const opacity = myT >= 40 && myT <= 100
          ? 1
          : (myT < 40 ? myT/40 : ((140-myT)/40));
        animation.div.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${rot}deg)`;
        animation.div.style.opacity = opacity.toString();
      }

      t += 1;
      t %= nFrames;
    };

    this.frameTimer = new FrameTimer({onGenerateFrame});
    this.frameTimer.start();
  }

  stopAnimation() {
    clearTimeout(this.timer);
    if (this.frameTimer) this.frameTimer.stop();
  }
}

const FPS = 60.098;

export class FrameTimer {
  private readonly onGenerateFrame: (numFrames: number) => void;

  private readonly interval: number;
  private lastFrameTime?: number;
  private requestId?: number;

  running = false;

  constructor(options: {onGenerateFrame?: (numFrames: number) => void}) {
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.onGenerateFrame = options.onGenerateFrame;
    this.interval = 1e3 / FPS;
    this.lastFrameTime = null;
  }

  start() {
    this.running = true;
    this.requestAnimationFrame();
  }

  stop() {
    this.running = false;
    if (this.requestId) window.cancelAnimationFrame(this.requestId);
    this.lastFrameTime = null;
  }

  private requestAnimationFrame() {
    this.requestId = window.requestAnimationFrame(this.onAnimationFrame);
  }

  private generateFrame(numFrames: number) {
    if (this.onGenerateFrame) this.onGenerateFrame(numFrames);
  }

  private onAnimationFrame = time => {
    this.requestAnimationFrame();

    let frameDelta = time - this.lastFrameTime;

    let numFrames = Math.floor(frameDelta / this.interval);
    // first frame
    if (!this.lastFrameTime) {
      this.lastFrameTime = time;
      numFrames = 1;
    } else {
      this.lastFrameTime += numFrames * this.interval;
    }

    // This can happen a lot on a 144Hz display
    if (numFrames === 0) {
      return;
    }

    this.generateFrame(numFrames);
  };
}