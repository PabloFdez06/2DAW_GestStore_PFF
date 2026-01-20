import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { TagComponent } from '../../components/atoms/tag/tag.component';
import { AlertComponent } from '../../components/molecules/alert/alert.component';
import { CardComponent } from '../../components/molecules/card/card.component';
import { TaskCardComponent } from '../../components/molecules/task-card/task-card.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea.component';
import { FormSelectComponent, SelectOption } from '../../components/shared/form-select/form-select.component';
import { LoginFormComponent } from '../../components/shared/login-form/login-form.component';
import { RegisterFormComponent } from '../../components/shared/register-form/register-form.component';
import { HomeHeaderComponent } from '../../components/molecules/home-header/home-header.component';
import { HomeFooterComponent } from '../../components/molecules/home-footer/home-footer.component';
import { AccordionComponent, AccordionItem } from '../../components/molecules/accordion/accordion.component';
import { TabsComponent, TabItem } from '../../components/molecules/tabs/tabs.component';
import { TooltipDirective } from '../../directives/tooltip.directive';

type TaskStatus = 'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'CANCELLED' | 'NOT_STARTED';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    TagComponent,
    AlertComponent,
    CardComponent,
    TaskCardComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    LoginFormComponent,
    RegisterFormComponent,
    HomeHeaderComponent,
    HomeFooterComponent,
    AccordionComponent,
    TabsComponent,
    TooltipDirective
  ],
  templateUrl: './style-guide.component.html',
  styleUrl: './style-guide.component.scss'
})
export class StyleGuideComponent {
  currentView: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' = 'components';

  selectOptions: SelectOption[] = [
    { value: 'opt1', label: 'Opción 1' },
    { value: 'opt2', label: 'Opción 2' },
    { value: 'opt3', label: 'Opción 3' },
    { value: 'opt4', label: 'Opción 4' }
  ];

  // Datos de ejemplo para Task Cards
  taskExamples = {
    completed: {
      title: 'Revisión cableado',
      description: 'En la obra de calle x, revisar y terminar cableado.',
      status: 'COMPLETED' as TaskStatus,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Hace 2 días
    },
    pending: {
      title: 'Inspección equipos',
      description: 'Revisar estado de los equipos del almacén principal.',
      status: 'PENDING' as TaskStatus,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    inProgress: {
      title: 'Actualizar inventario',
      description: 'Registrar nuevos productos recibidos esta semana.',
      status: 'IN_PROGRESS' as TaskStatus,
      completedAt: new Date()
    },
    cancelled: {
      title: 'Mantenimiento cancelado',
      description: 'El mantenimiento programado ha sido cancelado.',
      status: 'CANCELLED' as TaskStatus,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  };

  demoTabs: TabItem[] = [
    {
      id: 'resumen',
      label: 'Resumen',
      content: 'Vista rápida con métricas clave y accesos directos.'
    },
    {
      id: 'tareas',
      label: 'Tareas',
      content: 'Listado de tareas con filtros y acciones.'
    },
    {
      id: 'inventario',
      label: 'Inventario',
      content: 'Control de stock y movimientos del almacén.'
    }
  ];

  demoAccordionItems: AccordionItem[] = [
    {
      id: 'a1',
      title: '¿Cómo se crea una tarea?',
      content: 'Desde el panel principal puedes abrir el modal, completar el formulario y guardar.'
    },
    {
      id: 'a2',
      title: '¿Cómo funciona la prioridad?',
      content: 'La prioridad se refleja visualmente y permite organizar el trabajo por urgencia.'
    },
    {
      id: 'a3',
      title: '¿Puedo navegar con teclado?',
      content: 'Sí, los componentes interactivos soportan navegación con teclas y enfoque visible.'
    }
  ];

  switchView(view: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page') {
    this.currentView = view;
  }

  onTaskMenuClick(taskName: string): void {
    // Acción al hacer clic en el menú de una tarea
  }
}

