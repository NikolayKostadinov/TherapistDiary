import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { AnimationBuilder, AnimationFactory, AnimationPlayer, style, animate } from '@angular/animations';

@Directive({
    selector: '[appScrollAnimation]',
    standalone: true
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
    @Input() animationType: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' = 'fadeInUp';
    @Input() animationDelay: number = 0;
    @Input() animationDuration: number = 600;

    private player?: AnimationPlayer;
    private observer?: IntersectionObserver;

    constructor(
        private el: ElementRef,
        private animationBuilder: AnimationBuilder
    ) { }

    ngOnInit() {
        this.setupIntersectionObserver();
        this.setInitialState();
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.player) {
            this.player.destroy();
        }
    }

    private setInitialState() {
        const element = this.el.nativeElement;

        switch (this.animationType) {
            case 'fadeInUp':
                element.style.opacity = '0';
                element.style.transform = 'translateY(50%)';
                break;
            case 'fadeInDown':
                element.style.opacity = '0';
                element.style.transform = 'translateY(-50%)';
                break;
            case 'fadeInLeft':
                element.style.opacity = '0';
                element.style.transform = 'translateX(-50%)';
                break;
            case 'fadeInRight':
                element.style.opacity = '0';
                element.style.transform = 'translateX(50%)';
                break;
            case 'fadeIn':
                element.style.opacity = '0';
                break;
        }
    }

    private setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateIn();
                        this.observer?.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '3%'
            }
        );

        this.observer.observe(this.el.nativeElement);
    }

    private animateIn() {
        setTimeout(() => {
            const animation = this.createAnimation();
            this.player = animation.create(this.el.nativeElement);
            this.player.play();
        }, this.animationDelay);
    }

    private createAnimation(): AnimationFactory {
        switch (this.animationType) {
            case 'fadeInUp':
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    }))
                ]);
            case 'fadeInDown':
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    }))
                ]);
            case 'fadeInLeft':
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    }))
                ]);
            case 'fadeInRight':
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    }))
                ]);
            case 'fadeIn':
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1
                    }))
                ]);
            default:
                return this.animationBuilder.build([
                    animate(`${this.animationDuration}ms ease-out`, style({
                        opacity: 1,
                        transform: 'translateY(0)'
                    }))
                ]);
        }
    }
}
