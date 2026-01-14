import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../atoms/icon/icon.component';
import { Task, TaskPriority } from '../../../models/task.model';

interface Priority {
  label: string;
  value: string;
  color: string;
}

export interface TaskFormData {
  id?: string | number;
  title: string;
  date: string;
  description: string;
  priority: string;
  important?: boolean;
}

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss'
})
export class AddTaskModalComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Input() isEditMode: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() taskAdded = new EventEmitter<TaskFormData>();
  @Output() taskUpdated = new EventEmitter<TaskFormData>();

  @ViewChild('modalRoot', { read: ElementRef }) modalRoot?: ElementRef<HTMLElement>;
  @ViewChild('titleInput', { read: ElementRef }) titleInput?: ElementRef<HTMLInputElement>;

  private focusGuardStart: HTMLElement | null = null;
  private focusGuardEnd: HTMLElement | null = null;
  private removeKeydownListener: (() => void) | null = null;
  private removeGuardStartListener: (() => void) | null = null;
  private removeGuardEndListener: (() => void) | null = null;

  // Form data
  title: string = '';
  date: string = '';
  description: string = '';
  selectedPriority: string = '';

  priorities: Priority[] = [
    { label: 'Absoluta', value: 'absolute', color: '#F21E1E' },
    { label: 'Moderada', value: 'moderate', color: '#42ADE2' },
    { label: 'Baja', value: 'low', color: '#05A301' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task && this.isEditMode) {
      this.populateFormFromTask(this.task);
    }
  }

  private populateFormFromTask(task: Task): void {
    this.title = task.title || '';
    this.description = task.description || '';
    this.selectedPriority = this.convertPriorityToModal(task.priority);
    
    // Convertir fecha de API (ISO) a formato input date (YYYY-MM-DD)
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      this.date = date.toISOString().split('T')[0];
    } else {
      this.date = '';
    }
  }

  private convertPriorityToModal(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'absolute';
      case TaskPriority.MEDIUM:
        return 'moderate';
      case TaskPriority.LOW:
        return 'low';
      default:
        return 'moderate';
    }
  }

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.titleInput?.nativeElement?.focus();
    this.createFocusGuards();
    this.attachKeydownTrap();
  }

  ngOnDestroy(): void {
    this.detachKeydownTrap();
    this.removeFocusGuards();
  }

  selectPriority(priority: string) {
    this.selectedPriority = priority;
  }

  onSubmit(event?: Event) {
    event?.preventDefault();
    if (!this.title || !this.date || !this.description || !this.selectedPriority) {
      return;
    }

    const taskData: TaskFormData = {
      title: this.title,
      date: this.date,
      description: this.description,
      priority: this.selectedPriority
    };

    if (this.isEditMode && this.task) {
      taskData.id = this.task.id ?? this.task._id;
      taskData.important = this.task.important;
      this.taskUpdated.emit(taskData);
    } else {
      this.taskAdded.emit(taskData);
    }
    
    this.resetForm();
    this.close.emit();
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm(): void {
    this.title = '';
    this.date = '';
    this.description = '';
    this.selectedPriority = '';
  }

  private attachKeydownTrap(): void {
    const root = this.modalRoot?.nativeElement;
    if (!root) return;

    this.removeKeydownListener = this.renderer.listen(root, 'keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = this.getFocusableElements(root);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || active === this.focusGuardStart) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || active === this.focusGuardEnd) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  private detachKeydownTrap(): void {
    if (this.removeKeydownListener) {
      this.removeKeydownListener();
      this.removeKeydownListener = null;
    }
  }

  private createFocusGuards(): void {
    const root = this.modalRoot?.nativeElement;
    if (!root || this.focusGuardStart || this.focusGuardEnd) return;

    const start = this.renderer.createElement('span') as HTMLElement;
    const end = this.renderer.createElement('span') as HTMLElement;

    this.renderer.setAttribute(start, 'tabindex', '0');
    this.renderer.setAttribute(end, 'tabindex', '0');
    this.renderer.addClass(start, 'visually-hidden');
    this.renderer.addClass(end, 'visually-hidden');

    this.renderer.insertBefore(root, start, root.firstChild);
    this.renderer.appendChild(root, end);

    this.removeGuardStartListener = this.renderer.listen(start, 'focus', () => {
      const focusables = this.getFocusableElements(root);
      focusables[focusables.length - 1]?.focus();
    });

    this.removeGuardEndListener = this.renderer.listen(end, 'focus', () => {
      const focusables = this.getFocusableElements(root);
      focusables[0]?.focus();
    });

    this.focusGuardStart = start;
    this.focusGuardEnd = end;
  }

  private removeFocusGuards(): void {
    const root = this.modalRoot?.nativeElement;
    if (!root) return;

    if (this.removeGuardStartListener) {
      this.removeGuardStartListener();
      this.removeGuardStartListener = null;
    }

    if (this.removeGuardEndListener) {
      this.removeGuardEndListener();
      this.removeGuardEndListener = null;
    }

    if (this.focusGuardStart) {
      this.renderer.removeChild(root, this.focusGuardStart);
      this.focusGuardStart = null;
    }

    if (this.focusGuardEnd) {
      this.renderer.removeChild(root, this.focusGuardEnd);
      this.focusGuardEnd = null;
    }
  }

  private getFocusableElements(root: HTMLElement): HTMLElement[] {
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    return nodes.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }
}
