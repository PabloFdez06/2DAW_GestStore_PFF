import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueCardComponent } from './issue-card.component';
import { Issue, IssueSeverity } from '../../../models/issue.model';

/**
 * Tests para IssueCardComponent
 * 
 * He creado tests básicos para verificar que el componente se renderiza
 * correctamente con diferentes niveles de severidad.
 */
describe('IssueCardComponent', () => {
  let component: IssueCardComponent;
  let fixture: ComponentFixture<IssueCardComponent>;

  // Issue de ejemplo para los tests
  const mockIssue: Issue = {
    id: '1',
    title: 'Estante dañado en zona A',
    description: 'El estante de la zona A presenta grietas en el soporte inferior',
    severity: IssueSeverity.HIGH,
    createdAt: new Date().toISOString(),
    reportedBy: 'juan.perez@example.com'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueCardComponent);
    component = fixture.componentInstance;
    component.issue = mockIssue;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el título de la incidencia', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.issue-card__title');
    expect(title?.textContent).toContain(mockIssue.title);
  });

  it('debería mostrar la descripción', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const description = compiled.querySelector('.issue-card__description');
    expect(description?.textContent).toContain(mockIssue.description);
  });

  it('debería aplicar la clase correcta según severidad', () => {
    const badge = fixture.nativeElement.querySelector('.issue-card__severity');
    expect(badge?.classList.contains('issue-card__severity--high')).toBeTruthy();
  });

  it('debería mostrar "Urgente" para severidad HIGH', () => {
    expect(component.getSeverityLabel()).toBe('Urgente');
  });

  it('debería aplicar clase clickable cuando clickable es true', () => {
    component.clickable = true;
    const classes = component.getCardClasses();
    expect(classes).toContain('issue-card--clickable');
  });
});
