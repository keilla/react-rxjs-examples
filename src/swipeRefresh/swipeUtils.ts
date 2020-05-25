import { merge, fromEvent, Observable, empty } from 'rxjs';
import { first, map, takeUntil, elementAt, concatMap, filter, catchError } from 'rxjs/operators';

// Adapted version of https://codepen.io/HunorMarton/post/handling-complex-mouse-and-touch-events-with-rxjs

export interface Coordinate {
  x: number;
  y: number;
}

export class SwipeUtils {
  private readonly touchStarts$: Observable<Coordinate>;
  private readonly touchMoves$: Observable<Coordinate>;
  private readonly touchEnds$: Observable<Coordinate>;

  constructor(element: Element | Window) {
    this.movesUntilEnds = this.movesUntilEnds.bind(this);
    this.lastMovesAtEnds = this.lastMovesAtEnds.bind(this);
    this.touchEventToCoordinate = this.touchEventToCoordinate.bind(this);
    this.blockSwipe = this.blockSwipe.bind(this);
    this.unblockSwipe = this.unblockSwipe.bind(this);

    this.touchStarts$ = fromEvent(element, 'touchstart').pipe(
      filter((touchEvent: any) => touchEvent.view.scrollY <= 0),
      map(this.touchEventToCoordinate)
    );
    this.touchMoves$ = fromEvent(element, 'touchmove').pipe(map(this.touchEventToCoordinate));
    this.touchEnds$ = merge(fromEvent(window, 'touchend'), fromEvent(window, 'touchcancel')).pipe(
      map(this.touchEventToCoordinate)
    );
  }

  public verticalMoves() {
    return this.verticalMoveStarts().pipe(concatMap(this.movesUntilEnds));
  }

  public verticalMoveEnds() {
    return this.verticalMoveStarts().pipe(concatMap(this.lastMovesAtEnds));
  }

  public blockSwipe() {
    document.body.style.position = 'fixed';
  }

  public unblockSwipe() {
    document.body.style.position = 'relative';
  }

  private verticalMoveStarts() {
    return this.moveStartsDirection().pipe(
      filter(dragStartEvent => {
        return Math.abs(dragStartEvent.initialDeltaY) > Math.abs(dragStartEvent.intialDeltaX);
      })
    );
  }

  private lastMovesAtEnds(dragStartEvent: any) {
    return this.touchEnds$.pipe(
      first(),
      map((dragEndEvent: any) => {
        const x = dragEndEvent.x - dragStartEvent.x;
        const y = dragEndEvent.y - dragStartEvent.y;
        return { x, y };
      })
    );
  }

  private movesUntilEnds(dragStartEvent: any) {
    return this.touchMoves$.pipe(
      takeUntil(this.touchEnds$),
      map(dragEvent => {
        const x = dragEvent.x - dragStartEvent.x;
        const y = dragEvent.y - dragStartEvent.y;
        return { x, y };
      })
    );
  }

  private touchEventToCoordinate(touchEvent: any) {
    return {
      x: touchEvent.changedTouches[0].clientX,
      y: touchEvent.changedTouches[0].clientY,
    };
  }

  private moveStartsDirection() {
    return this.touchStarts$.pipe(
      concatMap((dragStartEvent: any) =>
        this.touchMoves$.pipe(
          takeUntil(this.touchEnds$),
          elementAt(3),
          catchError(() => empty()),
          map((dragEvent: any) => {
            const intialDeltaX = dragEvent.x - dragStartEvent.x;
            const initialDeltaY = dragEvent.y - dragStartEvent.y;
            return {
              x: dragStartEvent.x,
              y: dragStartEvent.y,
              intialDeltaX,
              initialDeltaY,
            };
          })
        )
      )
    );
  }
}
