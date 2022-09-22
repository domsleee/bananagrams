import { trigger, animate, transition, style, query, group } from '@angular/animations';

export const fadeAnimation =

trigger('fadeAnimation', [
  transition( '* => *', [
    query(':enter', [
      style({ opacity: 0 }),
    ], { optional: true }),

    query(':leave', [
      style({ display: 'none' }),
    ], { optional: true }),

    query(':enter', [
      animate('0.1s', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);
