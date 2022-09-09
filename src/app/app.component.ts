import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

interface LogData {
  ts: Date;
  msg: string;
}

interface SendResponse {
  status: boolean;
  data?: {
    accepted: string[];
    rejected: string[];
    envelopeTime: number;
    messageTime: number;
    messageSize: number;
    response: string;
    envelope: {
      from: string;
      to: string[];
    };
    messageId: string;
  };
  message?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly emailAddress = new FormControl<string>('', Validators.email);
  private _logs = new Array<LogData>();
  public get logs() {
    return this._logs;
  }

  public constructor(
    private readonly client: HttpClient,
    private readonly snack: MatSnackBar,
  ) { }

  private send(target: string) {
    return this.client.post<SendResponse>('/api/send', { target });
  }

  private append(msg: string) {
    this._logs = [
      ...this._logs,
      { ts: new Date(), msg },
    ];
  }

  public async sendAsync() {
    try {
      const value = this.emailAddress.value;
      if (!this.emailAddress.valid || this.emailAddress.pristine || !value) {
        this.emailAddress.setErrors({ email: true });
        this.emailAddress.markAllAsTouched();
      } else {
        const response = await firstValueFrom(this.send(value));
        this.append(response.data?.response || 'No Response');
      }
    } catch (e) {
      console.error('Error:', e);
      this.snack.open('Error occurred!', 'Dismiss', {
        verticalPosition: 'top',
        horizontalPosition: 'end',
        duration: 3000,
      });
      this.append(e instanceof HttpErrorResponse ? e.message : (e as object).toString());
    }
  }
}
