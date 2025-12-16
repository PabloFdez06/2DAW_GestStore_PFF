import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss']
})
export class FormSelectComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '-- Selecciona una opción --';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() value: string | number = '';
  @Input() error: string = '';
  @Input() helpText: string = '';
  @Input() options: SelectOption[] = [];
  
  @Output() valueChange = new EventEmitter<string | number>();

  onChange(event: any): void {
    const newValue = event.target.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.helpText) ids.push(`${this.id}-help`);
    if (this.error) ids.push(`${this.id}-error`);
    return ids.length > 0 ? ids.join(' ') : null;
  }
}
