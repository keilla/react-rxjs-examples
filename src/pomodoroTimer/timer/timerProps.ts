import { Observable } from "rxjs";

export interface TimerProps {
  initialMinutes: number;
  timeout: () => void;
  isRunning$: Observable<boolean>;
}
