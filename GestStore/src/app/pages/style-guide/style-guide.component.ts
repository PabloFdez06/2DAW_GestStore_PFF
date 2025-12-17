import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { TagComponent } from '../../components/atoms/tag/tag.component';
import { ThemeSwitcherComponent } from '../../components/atoms/theme-switcher/theme-switcher.component';
import { SpinnerComponent, ButtonSpinnerComponent } from '../../components/atoms/spinner/spinner.component';
import { AlertComponent } from '../../components/molecules/alert/alert.component';
import { CardComponent } from '../../components/molecules/card/card.component';
import { ModalComponent } from '../../components/molecules/modal/modal.component';
import { AccordionComponent, AccordionItemComponent } from '../../components/molecules/accordion/accordion.component';
import { TabsComponent, TabPanelComponent } from '../../components/molecules/tabs/tabs.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea.component';
import { FormSelectComponent, SelectOption } from '../../components/shared/form-select/form-select.component';
import { LoginFormComponent } from '../../components/shared/login-form/login-form.component';
import { RegisterFormComponent } from '../../components/shared/register-form/register-form.component';
import { HeaderComponent } from '../../components/layout/header/header.component';
import { MainComponent } from '../../components/layout/main/main.component';
import { FooterComponent } from '../../components/layout/footer/footer.component';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { EventBusService } from '../../services/event-bus.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    TagComponent,
    ThemeSwitcherComponent,
    SpinnerComponent,
    ButtonSpinnerComponent,
    AlertComponent,
    CardComponent,
    ModalComponent,
    AccordionComponent,
    AccordionItemComponent,
    TabsComponent,
    TabPanelComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    LoginFormComponent,
    RegisterFormComponent,
    HeaderComponent,
    MainComponent,
    FooterComponent,
    TooltipDirective
  ],
  templateUrl: './style-guide.component.html',
  styleUrl: './style-guide.component.scss'
})
export class StyleGuideComponent {
  @ViewChild('demoModal') demoModal!: ModalComponent;
  @ViewChild('confirmModal') confirmModal!: ModalComponent;
  
  // Servicios de Fase 2
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private eventBusService = inject(EventBusService);
  private stateService = inject(StateService);
  
  // Estados para demos
  isButtonLoading = signal(false);
  localSpinnerKey = 'demo-spinner';
  eventLog = signal<string[]>([]);
  
  currentView: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' | 'interactive' | 'services' = 'components';

  selectOptions: SelectOption[] = [
    { value: 'opt1', label: 'Opción 1' },
    { value: 'opt2', label: 'Opción 2' },
    { value: 'opt3', label: 'Opción 3' },
    { value: 'opt4', label: 'Opción 4' }
  ];

  switchView(view: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' | 'interactive' | 'services') {
    this.currentView = view;
  }
  
  // Métodos para modales
  openDemoModal(): void {
    this.demoModal.open();
  }
  
  openConfirmModal(): void {
    this.confirmModal.open();
  }
  
  onModalClosed(): void {
    console.log('Modal cerrado');
  }
  
  onConfirmAction(): void {
    console.log('Acción confirmada');
    this.confirmModal.close();
  }
  
  // Método para tabs
  onTabChanged(index: number): void {
    console.log('Tab cambiado a:', index);
  }
  
  // ==========================================
  // Métodos de demostración Fase 2
  // ==========================================
  
  // Notificaciones Toast
  showSuccessToast(): void {
    this.notificationService.success('Operación completada con éxito', 'Éxito');
  }
  
  showErrorToast(): void {
    this.notificationService.error('Ha ocurrido un error inesperado', 'Error');
  }
  
  showWarningToast(): void {
    this.notificationService.warning('Esta acción podría tener consecuencias', 'Advertencia');
  }
  
  showInfoToast(): void {
    this.notificationService.info('Información importante para el usuario', 'Información');
  }
  
  showMultipleToasts(): void {
    this.notificationService.success('Primera notificación');
    setTimeout(() => this.notificationService.info('Segunda notificación'), 300);
    setTimeout(() => this.notificationService.warning('Tercera notificación'), 600);
  }
  
  // Loading States
  async simulateGlobalLoading(): Promise<void> {
    await this.loadingService.withGlobalLoading(
      () => new Promise(resolve => setTimeout(resolve, 2000)),
      'Cargando datos del servidor...'
    );
    this.notificationService.success('Datos cargados correctamente');
  }
  
  async simulateLocalLoading(): Promise<void> {
    this.loadingService.startLocalLoading(this.localSpinnerKey, 'Procesando...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.loadingService.stopLocalLoading(this.localSpinnerKey);
  }
  
  async simulateButtonLoading(): Promise<void> {
    this.isButtonLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isButtonLoading.set(false);
    this.notificationService.success('Formulario enviado');
  }
  
  // Event Bus
  emitCustomEvent(): void {
    const timestamp = new Date().toLocaleTimeString();
    this.eventBusService.emit('demo:custom_event', { timestamp, source: 'StyleGuide' });
    this.addEventLog(`Evento emitido: demo:custom_event - ${timestamp}`);
  }
  
  emitUserEvent(): void {
    this.eventBusService.emit('user:action', { action: 'click', element: 'demo-button' });
    this.addEventLog('Evento emitido: user:action');
  }
  
  private addEventLog(message: string): void {
    this.eventLog.update(logs => [...logs.slice(-4), message]);
  }
  
  clearEventLog(): void {
    this.eventLog.set([]);
  }
  
  // State Service
  toggleSidebar(): void {
    this.stateService.toggleSidebar();
    const isOpen = this.stateService.sidebarOpen();
    this.notificationService.info(`Sidebar ${isOpen ? 'abierto' : 'cerrado'}`);
  }
  
  setPageTitle(): void {
    const title = `Demo Page - ${new Date().toLocaleTimeString()}`;
    this.stateService.setPageTitle(title);
    this.notificationService.info(`Título establecido: ${title}`);
  }
  
  get currentPageTitle(): string {
    return this.stateService.selectSnapshot(state => state.ui.pageTitle) || 'Sin título';
  }
  
  get isSidebarOpen(): boolean {
    return this.stateService.sidebarOpen();
  }
}

