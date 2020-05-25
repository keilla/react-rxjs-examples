import React from 'react';
import { Subscription, Subject } from 'rxjs';
import { SwipeUtils, Coordinate } from './swipeUtils';
import './SwipeRefresh.scss';

type SwipeState = 'refreshing' | 'pull-more' | 'can-release' | 'idle';

interface Props {
  text: string[];
}

interface State {
  dragState: SwipeState;
  refreshMessageHeight: number;
}

const MAX_HEIGHT = 60;

function getIcon(state: string) {
  if (state === 'refreshing') return '...';
  else if (state === 'can-release') return '↑';
  else return '⇣';
}

function getMessage(state: string) {
  if (state === 'refreshing') return 'Refreshing';
  else if (state === 'can-release') return 'Release to refresh';
  else return 'Pull down to refresh';
}

export class SwipeRefresh extends React.Component<Props, State> {
  private readonly contentRef: React.RefObject<any> = React.createRef();
  private readonly contentUpdateSubject = new Subject();
  private swipeUtils?: SwipeUtils;
  private verticalMoves$?: Subscription;
  private verticalMovesEnds$?: Subscription;
  private contentUpdate$?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = { refreshMessageHeight: 0, dragState: 'idle' };
  }

  public componentDidMount() {
    this.swipeUtils = new SwipeUtils(this.contentRef.current);

    this.contentUpdate$ = this.subscribeRefresher();
    this.verticalMoves$ = this.subscribeVerticalMoves();
    this.verticalMovesEnds$ = this.subscribeVerticalMovesEnds();
  }

  public componentWillUnmount() {
    this.contentUpdate$?.unsubscribe();
    this.verticalMoves$?.unsubscribe();
    this.verticalMovesEnds$?.unsubscribe();
    this.contentUpdateSubject.complete();
  }

  public render() {
    const { refreshMessageHeight, dragState } = this.state;
    return (
      <div className="swipe-refresh">
        {refreshMessageHeight > 0 ? (
          <div
            className="refresh-message-container"
            style={{ maxHeight: MAX_HEIGHT, height: refreshMessageHeight }}>
            <div className="box">
              <span>{getIcon(dragState)}</span>
              <p>{getMessage(dragState)}</p>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="content" ref={this.contentRef}>
          {this.props.text.map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  private subscribeRefresher() {
    return this.contentUpdateSubject.asObservable().subscribe(() => {
      console.log('updating');
      setTimeout(() => this.setState({ dragState: 'idle', refreshMessageHeight: 0 }), 1000);
    });
  }

  private subscribeVerticalMoves() {
    return this.swipeUtils?.verticalMoves().subscribe(
      (coordinate: Coordinate) => {
        const { dragState, refreshMessageHeight } = this.state;
        if (dragState !== 'refreshing') {
          this.setState({
            dragState: coordinate.y > MAX_HEIGHT ? 'can-release' : 'pull-more',
            refreshMessageHeight: coordinate.y,
          });

          if (refreshMessageHeight > 0) {
            this.swipeUtils?.blockSwipe();
          } else {
            this.swipeUtils?.unblockSwipe();
          }
        }
      },
      () => console.error('error when moving')
    );
  }

  private subscribeVerticalMovesEnds() {
    return this.swipeUtils?.verticalMoveEnds().subscribe(
      (coordinate: Coordinate) => {
        const { dragState } = this.state;
        if (dragState !== 'refreshing') {
          if (coordinate.y > MAX_HEIGHT) {
            this.setState({
              dragState: 'refreshing',
            });
            this.contentUpdateSubject.next();
          } else {
            this.setState({ refreshMessageHeight: 0, dragState: 'idle' });
          }

          this.swipeUtils?.unblockSwipe();
        }
      },
      () => console.error('error when moving ends')
    );
  }
}
