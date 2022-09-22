import { trigger, animate, transition, style, query, group, keyframes, sequence } from '@angular/animations';

export const fadeAnimation =
  trigger('fadeAnimation', [
    transition( '* => *', [
      query(':enter', [
        style({ opacity: 0 }),
      ]),

      query(':leave', [
        sequence([
          animate('0.1s', style({opacity: 0})),
          style({display: 'none', position: 'absolute'})
        ])
      ], { optional: true }),

      query(':enter', [
        animate('0.1s 0.1s', style({ opacity: 1 }))
      ])
    ])
  ]);

export const myInsertRemoveTrigger =
  trigger('myInsertRemoveTrigger', [
    transition(':leave', [
      animate('200ms', style({ opacity: 0, fontSize: 0 }))
    ]),
    transition(':enter', [
      style({ opacity: 0 }),
      animate('200ms', style({ opacity: 1 })),
    ]),
  ]);