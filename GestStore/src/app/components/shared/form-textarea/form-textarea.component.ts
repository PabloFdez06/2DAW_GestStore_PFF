import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-textarea.component.html',
  styleUrls: ['./form-textarea.component.scss']
})
export class FormTextareaComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() value: string = '';
  @Input() error: string = '';
  @Input() helpText: string = '';
  @Input() rows: number = 4;
  
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: any): void {
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
