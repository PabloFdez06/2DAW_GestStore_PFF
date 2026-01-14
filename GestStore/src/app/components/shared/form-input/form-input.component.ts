import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() value: string = '';
  @Input() error: string = '';
  @Input() helpText: string = '';
  
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputEl', { read: ElementRef }) inputEl?: ElementRef<HTMLInputElement>;

  constructor(private renderer: Renderer2) {}

  onInput(event: any): void {
    const newValue = event.target.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onFocus(): void {
    const el = this.inputEl?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'boxShadow', '0 0 0 3px rgba(107, 90, 255, 0.1)');
  }

  onBlur(): void {
    const el = this.inputEl?.nativeElement;
    if (!el) return;
    this.renderer.removeStyle(el, 'boxShadow');
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      (event.target as HTMLInputElement | null)?.blur();
    }
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.helpText) ids.push(`${this.id}-help`);
    if (this.error) ids.push(`${this.id}-error`);
    return ids.length > 0 ? ids.join(' ') : null;
  }
}
