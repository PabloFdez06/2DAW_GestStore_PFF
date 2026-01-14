import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
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

  @ViewChild('textareaEl', { read: ElementRef }) textareaEl?: ElementRef<HTMLTextAreaElement>;

  constructor(private renderer: Renderer2) {}

  onInput(event: any): void {
    const newValue = event.target.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onFocus(): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'boxShadow', '0 0 0 3px rgba(107, 90, 255, 0.1)');
  }

  onBlur(): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    this.renderer.removeStyle(el, 'boxShadow');
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      (event.target as HTMLTextAreaElement | null)?.blur();
    }
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.helpText) ids.push(`${this.id}-help`);
    if (this.error) ids.push(`${this.id}-error`);
    return ids.length > 0 ? ids.join(' ') : null;
  }
}
