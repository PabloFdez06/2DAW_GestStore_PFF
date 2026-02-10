import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../services/issue';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Issue, IssueRequest, IssueSeverity } from '../../models/issue.model';
import { IssueCardComponent } from '../../components/molecules/issue-card/issue-card.component';
import { SidebarLayoutComponent } from '../../components/layout/sidebar-layout/sidebar-layout.component';
import { NavHeaderComponent } from '../../components/layout/nav-header/nav-header.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { LoadingStateComponent } from '../../components/molecules/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../components/molecules/empty-state/empty-state.component';
import { ModalWrapperComponent } from '../../components/molecules/modal-wrapper/modal-wrapper.component';
import { FooterComponent } from "../../components/layout/footer/footer.component";
import { HeaderComponent } from "../../components/layout/header/header.component";

/**
 * Página de Incidencias
 * 
 * Aquí centralizo todo el sistema de incidencias. Los trabajadores pueden reportar
 * problemas con el inventario y los managers pueden ver todas las incidencias para priorizarlas.
 * 
 * He usado signals para el estado reactivo, como en el resto del proyecto.
 */
@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SidebarLayoutComponent,
    NavHeaderComponent,
    ButtonComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ModalWrapperComponent,
    FooterComponent,
    HeaderComponent
],
  templateUrl: './issues.html',
  styleUrls: ['./issues.scss']
})
export class IssuesComponent implements OnInit {
  // Signals de estado
  protected issues = computed(() => this.issueService.issues());
  protected isLoading = computed(() => this.issueService.isLoading());
  protected highCount = computed(() => this.issueService.highSeverityCount());
  protected mediumCount = computed(() => this.issueService.mediumSeverityCount());
  protected lowCount = computed(() => this.issueService.lowSeverityCount());

  // Estado local
  isModalOpen = signal(false);
  selectedSeverityFilter = signal<IssueSeverity | 'ALL'>('ALL');
  searchTerm = signal('');

  // Formulario para nueva incidencia
  newIssue: IssueRequest = {
    title: '',
    description: '',
    severity: IssueSeverity.MEDIUM
  };

  // Enum para el template
  IssueSeverity = IssueSeverity;

  // Issues filtradas según búsqueda y severidad
  filteredIssues = computed(() => {
    let filtered = this.issues();
    
    // Filtro por severidad
    const severity = this.selectedSeverityFilter();
    if (severity !== 'ALL') {
      filtered = filtered.filter(i => i.severity === severity);
    }
    
    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  });

  constructor(
    protected issueService: IssueService,
    protected authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  /**
   * Carga las incidencias según el rol del usuario
   * Si es ADMIN o MANAGER carga todas, si no, solo las suyas
   */
  loadIssues(): void {
    const user = this.authService.currentUserValue;
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    if (isAdminOrManager) {
      this.issueService.getIssues().subscribe({
        error: (err) => {
          console.error('Error cargando incidencias:', err);
          this.notificationService.error('Error al cargar las incidencias');
        }
      });
    } else {
      this.issueService.getMyIssues().subscribe({
        error: (err) => {
          console.error('Error cargando mis incidencias:', err);
          this.notificationService.error('Error al cargar tus incidencias');
        }
      });
    }
  }

  /**
   * Abre el modal para crear una nueva incidencia
   */
  openModal(): void {
    this.isModalOpen.set(true);
    this.resetForm();
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  closeModal(): void {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  /**
   * Resetea el formulario a sus valores por defecto
   */
  resetForm(): void {
    this.newIssue = {
      title: '',
      description: '',
      severity: IssueSeverity.MEDIUM
    };
  }

  /**
   * Crea una nueva incidencia
   */
  createIssue(): void {
    if (!this.newIssue.title || !this.newIssue.description) {
      this.notificationService.warning('Completa todos los campos');
      return;
    }

    this.issueService.createIssue(this.newIssue).subscribe({
      next: () => {
        this.notificationService.success('Incidencia reportada correctamente');
        this.closeModal();
      },
      error: (err) => {
        console.error('Error creando incidencia:', err);
        this.notificationService.error('Error al reportar la incidencia');
      }
    });
  }

  /**
   * Cambia el filtro de severidad
   */
  filterBySeverity(severity: IssueSeverity | 'ALL'): void {
    this.selectedSeverityFilter.set(severity);
  }

  /**
   * Actualiza el término de búsqueda
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Retorna si el usuario es admin o manager
   */
  isAdminOrManager(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }
}