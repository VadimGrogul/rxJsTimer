import { Component, ViewChild, ElementRef } from '@angular/core';
import { Subject, Subscription, fromEvent, interval, of } from 'rxjs';
import { switchMap, map, takeUntil, buffer, delay, filter } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('startBtn') startBtn: ElementRef;
  @ViewChild('waitBtn') waitBtn: ElementRef;

  private startTimerBtn: Subscription;
  private startStop = false;
  private subj = new Subject();
  
  public seconds: number = 0;
  public currState = 'Play'
 
  constructor() {}
  ngOnInit() {}

  ngAfterViewInit() {    
      this.startTimerBtn = fromEvent(this.startBtn.nativeElement, 'click')
        .pipe(
          switchMap(() => {
            this.subj.next()
            if(this.startStop) {
              return interval(1000)
              .pipe(
                map(() => 1),
                takeUntil(this.subj)
              )
            } else {
              return of(0)
            }
          })
        ).subscribe(res => {
          this.seconds += res;
        })

    const waitTimer = fromEvent(this.waitBtn.nativeElement, 'click')
    waitTimer.pipe(
      buffer( waitTimer.pipe(delay(300)) ),
      filter(i => i.length === 2)
    ).subscribe(() => {
      this.startStop = false
      this.currState = 'Play'
      this.subj.next()
    })
    
  }

  startStopTimer() {
    this.startStop = !this.startStop;
    !this.startStop ? this.currState = 'Play' : this.currState = 'Stop'
  }

  resetTimer() {
    this.seconds = 0;
    this.subj.next()
    this.currState = 'Play'
  }

  addZero(seconds: number) {
    return seconds > 9 ? seconds : `0${seconds}`;
  }

  getSeconds() {
    return this.addZero(this.seconds % 60)
  }

  getMinutes() {
    return this.addZero(Math.floor((this.seconds / 60) % 60))
  }

  getHours() {
    return this.addZero(Math.floor(this.seconds / 3600))
  }
}
