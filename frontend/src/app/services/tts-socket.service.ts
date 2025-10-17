import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TtsSocketService {
  private socket: Socket | null = null;
  private response$ = new Subject<{ ok: boolean; audioDataUrl?: string; error?: string }>();

  connect() {
    if (!this.socket) {
      this.socket = io('http://34.129.3.229:8080');
      this.socket.on('tts:response', (data) => this.response$.next(data));
    }
  }

  requestTts(text: string) {
    this.connect();
    this.socket?.emit('tts:request', { text });
  }

  onResponse(): Observable<{ ok: boolean; audioDataUrl?: string; error?: string }> {
    this.connect();
    return this.response$.asObservable();
  }
}

