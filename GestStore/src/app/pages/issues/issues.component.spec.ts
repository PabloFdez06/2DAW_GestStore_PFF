import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IssuesComponent } from './issues.component';
import { IssueService } from '../../services/issue.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Tests para IssuesComponent
 * 
 * Suite de pruebas básicas para verificar que la página se inicializa correctamente
 * y maneja los casos de usuario autenticado.
 */
describe('IssuesComponent', () => {
  let component: IssuesComponent;
  let fixture: ComponentFixture<IssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IssuesComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        IssueService,
        AuthService,
        NotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssuesComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el modal cerrado inicialmente', () => {
    expect(component.isModalOpen()).toBe(false);
  });

  it('debería abrir el modal al llamar openModal', () => {
    component.openModal();
    expect(component.isModalOpen()).toBe(true);
  });

  it('debería cerrar el modal al llamar closeModal', () => {
    component.openModal();
    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it('debería resetear el formulario al abrir el modal', () => {
    component.newIssue.title = 'Test';
    component.openModal();
    expect(component.newIssue.title).toBe('');
  });
});
