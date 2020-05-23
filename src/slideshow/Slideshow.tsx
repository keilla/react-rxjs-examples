import React from 'react';
import { fromEvent, Observable, Subscription, merge } from 'rxjs';
import { map, filter, throttleTime, startWith, distinctUntilChanged, scan } from 'rxjs/operators';
import './Slideshow.scss';

// Adapted from https://codepen.io/mutebg/pen/RRykAr

const isLeftOrRightArrow = (code: number) => isRightArrow(code) || isLeftArrow(code);
const isLeftArrow = (code: number) => code === 37;
const isRightArrow = (code: number) => code === 39;

enum Direction {
  Right = 1,
  Left = -1,
}

interface Props {
  initialIndex: number;
  transitionTime: number;
  backgroundItems: string[];
}

interface State {
  sliderIndex: number;
}

export class Slideshow extends React.Component<Props, State> {
  private previousButton = React.createRef<HTMLButtonElement>();
  private nextButton = React.createRef<HTMLButtonElement>();
  private mergedEvents$?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = { sliderIndex: props.initialIndex };
  }

  public componentDidMount() {
    const prevBtnClick$ = this.createClickObservable(this.previousButton, Direction.Left);
    const nextBtnClick$ = this.createClickObservable(this.nextButton, Direction.Right);
    const keyDown$ = this.createKeyPressedObservable();
    const mouseWheel$ = this.createMouseWheelObservable();

    const mergedEventsObservable$ = this.mergeEvents(prevBtnClick$, nextBtnClick$, keyDown$, mouseWheel$);

    this.mergedEvents$ = mergedEventsObservable$.subscribe((sliderIndex: number) =>
      this.setState({ sliderIndex })
    );
  }

  public componentWillUnmount() {
    this.mergedEvents$?.unsubscribe();
  }

  public render() {
    const { backgroundItems } = this.props;
    const transition = this.state.sliderIndex * -100;
    const style = {
      width: backgroundItems.length * 100 + 'vw',
      transitionDuration: this.props.transitionTime + 'ms',
      transform: `translateX(${transition}vw)`,
    };

    const slides = backgroundItems.map((color, index) => (
      <div className="item" key={index} style={{ background: color }}>
        {index}
      </div>
    ));

    return (
      <div className="slider">
        <div className="wrapper" style={style}>
          {slides}
        </div>
        <button className="btn prev" ref={this.previousButton}>
          prev
        </button>
        <button className="btn next" ref={this.nextButton}>
          next
        </button>
      </div>
    );
  }

  private createClickObservable(buttonRef: React.RefObject<HTMLButtonElement>, valueToMap: Direction) {
    return fromEvent(buttonRef.current || new HTMLButtonElement(), 'click').pipe(map(() => valueToMap));
  }

  private createKeyPressedObservable() {
    return fromEvent(window, 'keydown').pipe(
      map((event: any) => event.which),
      filter((keyCode: number) => isLeftOrRightArrow(keyCode)),
      map((keyCode: number) => (isLeftArrow(keyCode) ? Direction.Left : Direction.Right))
    );
  }

  private detectMouseWheelDirection(event: any): Direction {
    let delta = null;

    if (event.wheelDelta) {
      delta = event.wheelDelta / 60;
    } else if (event.detail) {
      delta = -event.detail / 2;
    }

    return delta !== null && delta > 0 ? Direction.Left : Direction.Right;
  }

  private createMouseWheelObservable() {
    return fromEvent(window, 'mousewheel').pipe(map((event: any) => this.detectMouseWheelDirection(event)));
  }

  private mergeEvents(
    prevBtnClick$: Observable<Direction>,
    nextBtnClick$: Observable<Direction>,
    keyDown$: Observable<Direction>,
    mouseWheel$: Observable<Direction>
  ) {
    const { transitionTime, backgroundItems, initialIndex } = this.props;

    return merge(prevBtnClick$, nextBtnClick$, keyDown$, mouseWheel$).pipe(
      throttleTime(transitionTime),
      startWith(initialIndex),
      scan((previousIndex: number, currentDirection: Direction) => {
        let next = previousIndex + currentDirection;
        const isValidIndex = next >= 0 && next < backgroundItems.length;

        return isValidIndex ? next : previousIndex;
      }, 0),
      distinctUntilChanged()
    );
  }
}
