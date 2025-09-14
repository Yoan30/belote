import * as PIXI from 'pixi.js';

export interface AnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface CardDealAnimation {
  card: PIXI.Container;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
}

export class AnimationManager {
  private activeAnimations: Set<AnimationInstance> = new Set();
  private animationSpeed: number = 1.0;

  constructor() {
    this.startAnimationLoop();
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0.5, Math.min(3.0, speed));
  }

  // Basic tween animation
  tween(
    target: any,
    properties: Record<string, number>,
    options: AnimationOptions = {}
  ): void {
    const duration = (options.duration || 1000) / this.animationSpeed;
    const easing = options.easing || this.easeOutCubic;
    const startTime = Date.now();
    const startValues: Record<string, number> = {};

    // Store initial values
    for (const key in properties) {
      startValues[key] = target[key];
    }

    const animation: AnimationInstance = {
      update: (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        // Update properties
        for (const key in properties) {
          const startValue = startValues[key];
          const endValue = properties[key];
          if (startValue !== undefined && endValue !== undefined) {
            target[key] = startValue + (endValue - startValue) * easedProgress;
          }
        }

        options.onUpdate?.(progress);

        // Check if animation is complete
        if (progress >= 1) {
          options.onComplete?.();
          this.activeAnimations.delete(animation);
          return false; // Remove from active animations
        }

        return true; // Continue animation
      }
    };

    this.activeAnimations.add(animation);
  }

  // Card dealing animation (3+2+3 pattern)
  dealCards(animations: CardDealAnimation[]): Promise<void> {
    return new Promise(resolve => {
      let completedCount = 0;
      const totalAnimations = animations.length;

      const onCardComplete = () => {
        completedCount++;
        if (completedCount >= totalAnimations) {
          resolve();
        }
      };

      animations.forEach(anim => {
        // Apply delay
        setTimeout(() => {
          // Set initial position
          anim.card.x = anim.fromX;
          anim.card.y = anim.fromY;
          anim.card.visible = true;

          // Animate to target position
          this.tween(
            anim.card,
            { x: anim.toX, y: anim.toY },
            {
              duration: 300,
              easing: this.easeOutQuad,
              onComplete: onCardComplete
            }
          );
        }, anim.delay);
      });
    });
  }

  // Card flip animation
  flipCard(card: PIXI.Container, _showFront = true): Promise<void> {
    return new Promise(resolve => {
      // Scale down to 0 width (flip effect)
      this.tween(
        card.scale,
        { x: 0 },
        {
          duration: 150 / this.animationSpeed,
          easing: this.easeInQuad,
          onComplete: () => {
            // Change card appearance here (front/back)
            // This would be implemented in the calling code
            
            // Scale back up
            this.tween(
              card.scale,
              { x: 1 },
              {
                duration: 150 / this.animationSpeed,
                easing: this.easeOutQuad,
                onComplete: resolve
              }
            );
          }
        }
      );
    });
  }

  // Collect cards animation (trick collection)
  collectCards(cards: PIXI.Container[], targetX: number, targetY: number): Promise<void> {
    return new Promise(resolve => {
      let completedCount = 0;
      const totalCards = cards.length;

      const onCardCollected = () => {
        completedCount++;
        if (completedCount >= totalCards) {
          resolve();
        }
      };

      cards.forEach((card, index) => {
        setTimeout(() => {
          this.tween(
            card,
            { 
              x: targetX + index * 2, // Slight offset for stacking effect
              y: targetY + index * 2,
              alpha: 0.7
            },
            {
              duration: 400,
              easing: this.easeInOutQuad,
              onComplete: onCardCollected
            }
          );
        }, index * 50); // Stagger the collection
      });
    });
  }

  // Pulse animation for highlighting
  pulse(target: PIXI.Container, intensity = 0.2): Promise<void> {
    return new Promise(resolve => {
      const originalScale = target.scale.x;
      
      this.tween(
        target.scale,
        { x: originalScale + intensity, y: originalScale + intensity },
        {
          duration: 300,
          easing: this.easeInOutSine,
          onComplete: () => {
            this.tween(
              target.scale,
              { x: originalScale, y: originalScale },
              {
                duration: 300,
                easing: this.easeInOutSine,
                onComplete: resolve
              }
            );
          }
        }
      );
    });
  }

  // Stop all animations
  stopAll(): void {
    this.activeAnimations.clear();
  }

  private startAnimationLoop(): void {
    const animate = () => {
      const currentTime = Date.now();
      
      // Update all active animations
      for (const animation of this.activeAnimations) {
        const shouldContinue = animation.update(currentTime);
        if (!shouldContinue) {
          this.activeAnimations.delete(animation);
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // Easing functions
  private easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  private easeOutQuad = (t: number): number => {
    return 1 - (1 - t) * (1 - t);
  };

  private easeInQuad = (t: number): number => {
    return t * t;
  };

  private easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  private easeInOutSine = (t: number): number => {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  };
}

interface AnimationInstance {
  update: (currentTime: number) => boolean;
}