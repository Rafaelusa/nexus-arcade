import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from '../config/api.config';

export interface SaveStateSlot {
  id: string;
  slotIndex: number;
  name: string;
  storageKey: string;
  screenshotUrl?: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class SaveStateService {
  private http = inject(HttpClient);

  private get API_URL() {
    return `${getApiUrl()}/saves`;
  }

  saveSlot(gameId: string, slotNumber: number, stateData: string, screenshotUrl?: string): Observable<SaveStateSlot> {
    return this.http.post<SaveStateSlot>(this.API_URL, {
      gameId,
      slotNumber,
      stateData,
      screenshotUrl,
    });
  }

  getGameSaveSlots(gameId: string): Observable<SaveStateSlot[]> {
    return this.http.get<SaveStateSlot[]>(`${this.API_URL}/game/${gameId}`);
  }

  deleteSlot(saveId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${saveId}`);
  }
}
