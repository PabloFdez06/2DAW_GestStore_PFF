import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { TagComponent } from '../../components/atoms/tag/tag.component';
import { AlertComponent } from '../../components/molecules/alert/alert.component';
import { CardComponent } from '../../components/molecules/card/card.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { LoginFormComponent } from '../../components/shared/login-form/login-form.component';
import { RegisterFormComponent } from '../../components/shared/register-form/register-form.component';
import { HeaderComponent } from '../../components/layout/header/header.component';
import { MainComponent } from '../../components/layout/main/main.component';
import { FooterComponent } from '../../components/layout/footer/footer.component';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BadgeComponent,
    TagComponent,
    AlertComponent,
    CardComponent,
    FormInputComponent,
    LoginFormComponent,
    RegisterFormComponent,
    HeaderComponent,
    MainComponent,
    FooterComponent
  ],
  templateUrl: './style-guide.component.html',
  styleUrl: './style-guide.component.scss'
})
export class StyleGuideComponent {
  currentView: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page' = 'components';

  switchView(view: 'components' | 'colors' | 'typography' | 'login' | 'register' | 'page') {
    this.currentView = view;
  }
}
