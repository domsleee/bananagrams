import { trigger, animate, transition, style, query, sequence } from '@angular/animations';

export const fadeAnimation =
  trigger('fadeAnimation', [
    // transition( 'INACTIVE => *', []),
    transition( '* => *', [
      query(':enter', [
        style({ opacity: 0 }),
      ], {optional: true}),
      sequence([
        query(':leave', [
          sequence([
            animate('100ms', style({opacity: 0})),
            style({position: 'absolute', visibility: 'hidden'})
          ])
        ], { optional: true }),
        query(':enter', [
          animate('100ms', style({ opacity: 1 }))
        ], {optional: true})
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