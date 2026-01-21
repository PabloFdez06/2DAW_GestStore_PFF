import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';

export type SpinnerSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent {
  @Input() message = 'Cargando...';
  @Input() spinnerSize: SpinnerSize = 'medium';
}
