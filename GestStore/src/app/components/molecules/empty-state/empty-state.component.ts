import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() message = 'No hay elementos';
  @Input() buttonText = '';
  @Input() buttonIcon = '';
  @Input() size: 'default' | 'small' = 'default';

  @Output() buttonClick = new EventEmitter<void>();

  get showButton(): boolean {
    return this.buttonText.length > 0;
  }

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
