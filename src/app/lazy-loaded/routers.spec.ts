import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { routes as gameRoutes } from './game/game-routing.module';

describe('game-router redirects', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(gameRoutes),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should navigate', fakeAsync(() => {
    router.initialNavigation();
    router.navigate(['/context.html']);
    const navigateSpy = spyOn(router, 'navigate');
    tick();
    expect(navigateSpy).toHaveBeenCalledWith(['join/context.html']);
  }));
});

describe('lobby-router redirects', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(gameRoutes),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should navigate', fakeAsync(() => {
    router.initialNavigation();
    router.navigate(['/context.html']);
    const navigateSpy = spyOn(router, 'navigate');
    tick();
    expect(navigateSpy).toHaveBeenCalledWith(['join/context.html']);
  }));
});