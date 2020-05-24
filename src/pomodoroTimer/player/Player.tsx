import React from 'react';
import './Player.scss';
import { PlayerProps } from './playerProps';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface PlayPauseState {
  btnPlayPauseClass: string;
}

export class Player extends React.Component<PlayerProps, PlayPauseState> {

  constructor(props: PlayerProps, private unSub$: Subject<void>) {
    super(props);
    this.state = {
      btnPlayPauseClass: this.classPlay,
    }
    this.clickPlayPause = this.clickPlayPause.bind(this);
    this.unSub$ = new Subject();
  }

  componentDidMount() {
    this.props.isPlaying$.pipe(
      takeUntil(this.unSub$))
      .subscribe(
        (isPlaying: boolean) => {
          const btnClass = isPlaying ? this.classPause : this.classPlay;
          this.setState({ btnPlayPauseClass: btnClass });
        }
      )
  }

  get classPlay() {
    return 'btn -play';
  }

  get classPause() {
    return 'btn -pause';
  }

  clickPlayPause() {
    if (this.state.btnPlayPauseClass === this.classPlay) {
      this.props.onPlay();
    } else {
      this.props.onPause();
    }
  }

  componentWillUnmount() {
    this.unSub$.next();
    this.unSub$.complete();
  }

  render() {
    return (
      <div className={this.state.btnPlayPauseClass} onClick={this.clickPlayPause}>
        <span className="bar -first"></span>
        <span className="bar -second"></span>
      </div>
    );
  }
}