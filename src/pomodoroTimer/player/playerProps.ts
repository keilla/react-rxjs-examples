import { Observable } from "rxjs";

export interface PlayerProps {
  isPlaying$: Observable<boolean>;
  onPlay: () => void;
  onPause: () => void;
}
