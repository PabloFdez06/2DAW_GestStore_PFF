import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
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

  @ViewChild('selectEl', { read: ElementRef }) selectEl?: ElementRef<HTMLSelectElement>;

  constructor(private renderer: Renderer2) {}

  onChange(event: any): void {
    const newValue = event.target.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onFocus(): void {
    const el = this.selectEl?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'boxShadow', '0 0 0 3px rgba(107, 90, 255, 0.1)');
  }

  onBlur(): void {
    const el = this.selectEl?.nativeElement;
    if (!el) return;
    this.renderer.removeStyle(el, 'boxShadow');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      (event.target as HTMLSelectElement | null)?.blur();
    }
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.helpText) ids.push(`${this.id}-help`);
    if (this.error) ids.push(`${this.id}-error`);
    return ids.length > 0 ? ids.join(' ') : null;
  }
}
