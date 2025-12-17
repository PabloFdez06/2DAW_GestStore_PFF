import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { TagComponent } from '../../components/atoms/tag/tag.component';
import { ThemeSwitcherComponent } from '../../components/atoms/theme-switcher/theme-switcher.component';
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

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    TagComponent,
    ThemeSwitcherComponent,
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
  
  currentView: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' | 'interactive' = 'components';

  selectOptions: SelectOption[] = [
    { value: 'opt1', label: 'Opción 1' },
    { value: 'opt2', label: 'Opción 2' },
    { value: 'opt3', label: 'Opción 3' },
    { value: 'opt4', label: 'Opción 4' }
  ];

  switchView(view: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' | 'interactive') {
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
}

