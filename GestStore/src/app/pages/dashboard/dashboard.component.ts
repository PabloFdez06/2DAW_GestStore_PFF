import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { AddTaskModalComponent } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { TaskMenuComponent, TaskMenuAction } from '../../components/molecules/task-menu/task-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    BadgeComponent,
    CalendarComponent,
    AddTaskModalComponent,
    TaskMenuComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Fecha actual
  currentDayName: string = '';
  currentDate: string = '';
  
  // Control del calendario
  isCalendarOpen: boolean = false;
  
  // Control del modal de añadir tarea
  isTaskModalOpen: boolean = false;
  
  // Control del menú de tarea (índice de la tarea con menú abierto, -1 si ninguno)
  openTaskMenuIndex: number = -1;
  
  ngOnInit() {
    this.updateCurrentDate();
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar el menú de tarea cuando se hace clic fuera
    if (this.openTaskMenuIndex !== -1) {
      this.closeTaskMenu();
    }
  }
  
  updateCurrentDate() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.currentDayName = days[now.getDay()];
    this.currentDate = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }
  
  toggleCalendar() {
    this.isCalendarOpen = !this.isCalendarOpen;
  }
  
  closeCalendar() {
    this.isCalendarOpen = false;
  }
  
  toggleTaskModal() {
    this.isTaskModalOpen = !this.isTaskModalOpen;
  }
  
  closeTaskModal() {
    this.isTaskModalOpen = false;
  }
  
  handleTaskAdded(task: any) {
    // Añadir la nueva tarea al principio de la lista
    this.todoTasks.unshift({
      title: task.title,
      description: task.description,
      priority: task.priority === 'absolute' ? 'Absoluta' : task.priority === 'moderate' ? 'Moderada' : 'Baja',
      priorityColor: task.priority === 'absolute' ? 'high' : task.priority === 'moderate' ? 'moderate' : 'low',
      status: 'Sin Comenzar',
      statusColor: 'notstarted',
      createdAt: new Date().toLocaleDateString('es-ES')
    });
    this.closeTaskModal();
  }
  
  toggleTaskMenu(index: number, event: Event) {
    event.stopPropagation();
    this.openTaskMenuIndex = this.openTaskMenuIndex === index ? -1 : index;
  }
  
  closeTaskMenu() {
    this.openTaskMenuIndex = -1;
  }
  
  handleTaskAction(action: TaskMenuAction, taskIndex: number) {
    const task = this.todoTasks[taskIndex];
    
    switch (action.type) {
      case 'important':
        console.log('Quitar de importante:', task.title);
        // Lógica para quitar de importante
        break;
      case 'edit':
        console.log('Editar tarea:', task.title);
        // Lógica para editar tarea
        break;
      case 'delete':
        this.todoTasks.splice(taskIndex, 1);
        console.log('Tarea eliminada');
        break;
      case 'complete':
        // Mover a tareas completadas
        this.completedTasks.unshift({
          title: task.title,
          description: task.description,
          status: 'Completada',
          completedAgo: 'Hace un momento'
        });
        this.todoTasks.splice(taskIndex, 1);
        console.log('Tarea completada:', task.title);
        break;
    }
    
    this.closeTaskMenu();
  }
  // Tareas To-Do (del diseño de Figma)
  todoTasks = [
    {
      title: 'Llevar máquinas a apartamentos sevilla.',
      description: 'Llevarlos antes del día 22, tenemos que tenerlo listo para ese día',
      priority: 'Moderada',
      priorityColor: 'moderate',
      status: 'Sin Comenzar',
      statusColor: 'notstarted',
      createdAt: '20/06/2023'
    },
    {
      title: 'Limpiar almacén',
      description: 'Sacar cajas y sobrante de tuberias y llevar las sobras y restos al punto limpio',
      priority: 'Moderada',
      priorityColor: 'moderate',
      status: 'En Progreso',
      statusColor: 'inprogress',
      createdAt: '20/06/2023'
    },
    {
      title: 'Revisar máquina cliente',
      description: 'En calle ejemplo numero 1, piso x escalera 4. La máquina no echa frio.',
      priority: 'Moderada',
      priorityColor: 'moderate',
      status: 'En Progreso',
      statusColor: 'inprogress',
      createdAt: '19/06/2023'
    }
  ];

  // Tareas completadas (del diseño de Figma)
  completedTasks = [
    {
      title: 'Revisión cableado',
      description: 'En la obra de calle x, revisar y terminar cableado.',
      status: 'Completada',
      completedAgo: '2 días'
    },
    {
      title: 'Revisión herramientas',
      description: 'Revisar las herramientas; taladro, brocas, etc.',
      status: 'Completada',
      completedAgo: '2 días'
    }
  ];
}
