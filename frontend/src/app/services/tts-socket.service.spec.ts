import { TestBed } from '@angular/core/testing';

import { TtsSocketService } from './tts-socket.service';

describe('TtsSocketService', () => {
  let service: TtsSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TtsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
