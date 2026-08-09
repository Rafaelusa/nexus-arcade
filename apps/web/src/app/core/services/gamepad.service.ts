import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GamepadService {
  readonly connectedGamepadName = signal<string | null>(null);
  readonly showNotification = signal(false);

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    window.addEventListener('gamepadconnected', (event: GamepadEvent) => {
      const gamepad = event.gamepad;
      console.log('[GamepadService] Controle Conectado:', gamepad.id);
      this.connectedGamepadName.set(gamepad.id);
      this.showNotification.set(true);

      setTimeout(() => {
        this.showNotification.set(false);
      }, 5000);
    });

    window.addEventListener('gamepaddisconnected', (event: GamepadEvent) => {
      console.log('[GamepadService] Controle Desconectado:', event.gamepad.id);
      this.connectedGamepadName.set(null);
    });
  }
}
