
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

    this.frameTimer = new FrameTimer();
    let t = 0;
    this.frameTimer.onGenerateFrame = () => {
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
    this.frameTimer.start();

    //this.timer = setTimeout(() => this.stopAnimation(), 30*1000);
  }

  stopAnimation() {
    clearTimeout(this.timer);
    if (this.frameTimer) this.frameTimer.stop();
  }
}

const FPS = 60.098;

export class FrameTimer {
  onGenerateFrame: () => void;
  running = false;
  lastFrameTime = null;
  interval: number;

  private requestId;

  constructor() {
    // Run at 60 FPS
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.running = true;
    this.interval = 1e3 / FPS;
    this.lastFrameTime = false;
  }

  start() {
    this.running = true;
    this.requestAnimationFrame();
  }

  stop() {
    this.running = false;
    if (this.requestId) window.cancelAnimationFrame(this.requestId);
    this.lastFrameTime = false;
  }

  private requestAnimationFrame() {
    this.requestId = window.requestAnimationFrame(this.onAnimationFrame);
  }

  private generateFrame() {
    this.onGenerateFrame();
    this.lastFrameTime += this.interval;
  }

  private onAnimationFrame = time => {
    this.requestAnimationFrame();
    // how many ms after 60fps frame time
    let excess = time % this.interval;

    // newFrameTime is the current time aligned to 60fps intervals.
    // i.e. 16.6, 33.3, etc ...
    let newFrameTime = time - excess;

    // first frame, do nothing
    if (!this.lastFrameTime) {
      this.lastFrameTime = newFrameTime;
      return;
    }

    let numFrames = Math.round(
      (newFrameTime - this.lastFrameTime) / this.interval
    );

    // This can happen a lot on a 144Hz display
    if (numFrames === 0) {
      //console.log("WOAH, no frames");
      return;
    }

    this.generateFrame();

    let timeToNextFrame = this.interval - excess;
    for (let i = 1; i < numFrames; i++) {
      setTimeout(() => {
        this.generateFrame();
      }, (i * timeToNextFrame) / numFrames);
    }
    if (numFrames > 1) {
      // skip frames
    }
  };
}