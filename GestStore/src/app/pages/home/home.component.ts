import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { BadgeComponent } from '../../components/atoms/badge/badge.component';
import { SpinnerComponent } from '../../components/atoms/spinner/spinner.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { AuthService } from '../../services/auth.service';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
}

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface NewsletterForm {
  name: string;
  lastName: string;
  city: string;
  email: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
    BadgeComponent,
    SpinnerComponent,
    FormInputComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);

  // Header state
  isScrolled = false;
  isMobileMenuOpen = false;

  /**
   * Verifica si el usuario está autenticado
   */
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Hero image from Figma
  readonly heroImage = 'https://www.figma.com/api/mcp/asset/8dfedf63-446f-4931-8045-483587628b09';

  // Newsletter form
  newsletterForm: NewsletterForm = {
    name: '',
    lastName: '',
    city: '',
    email: ''
  };
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  // Footer columns
  footerColumns: FooterColumn[] = [
    {
      title: 'Producto',
      links: [
        { label: 'Características', href: '#servicios' },
        { label: 'Precios', href: '#precios' },
        { label: 'Integraciones', href: '#' },
        { label: 'Actualizaciones', href: '#' }
      ]
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carreras', href: '#' },
        { label: 'Contacto', href: '#' }
      ]
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Documentación', href: '#' },
        { label: 'Guías', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Soporte', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidad', href: '#' },
        { label: 'Términos', href: '#' },
        { label: 'Cookies', href: '#' },
        { label: 'Licencias', href: '#' }
      ]
    }
  ];

  // Subscription plans
  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Básico',
      price: '0€',
      period: 'para siempre',
      description: 'Ideal para pequeños negocios que comienzan su digitalización.',
      features: [
        'Hasta 50 productos',
        'Gestión de tareas básica',
        'Reportes mensuales',
        'Soporte por email',
        '1 usuario'
      ],
      isPopular: false,
      ctaText: 'Comenzar gratis'
    },
    {
      id: 'pro',
      name: 'Profesional',
      price: '29€',
      period: '/mes',
      description: 'La solución completa para equipos que buscan eficiencia.',
      features: [
        'Productos ilimitados',
        'Gestión avanzada de tareas',
        'Reportes en tiempo real',
        'Soporte prioritario 24/7',
        'Hasta 15 usuarios',
        'Alertas de stock inteligentes',
        'Integraciones API',
        'Exportación de datos'
      ],
      isPopular: true,
      ctaText: 'Probar 14 días gratis'
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: '79€',
      period: '/mes',
      description: 'Solución escalable para grandes organizaciones.',
      features: [
        'Todo lo de Profesional',
        'Usuarios ilimitados',
        'SSO/SAML',
        'Gestor de cuenta dedicado',
        'SLA garantizado 99.9%',
        'Personalización avanzada',
        'Auditoría y cumplimiento',
        'Onboarding personalizado'
      ],
      isPopular: false,
      ctaText: 'Contactar ventas'
    }
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth >= 1024) {
      this.isMobileMenuOpen = false;
    }
    this.updateVisibleServicesCount();
  }

  constructor() {
    this.updateVisibleServicesCount();
  }

  private updateVisibleServicesCount(): void {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        this.visibleServicesCount = 1;
      } else if (window.innerWidth < 1024) {
        this.visibleServicesCount = 2;
      } else {
        this.visibleServicesCount = 3;
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  // Services
  services: Service[] = [
    {
      id: 'inventory',
      icon: 'package',
      title: 'Gestión de Inventario',
      description: 'Control total de tu almacén con seguimiento en tiempo real de stock, movimientos y ubicaciones.'
    },
    {
      id: 'tasks',
      icon: 'check-square',
      title: 'Gestión de Tareas',
      description: 'Organiza, asigna y supervisa tareas de tu equipo con prioridades y fechas límite.'
    },
    {
      id: 'alerts',
      icon: 'bell',
      title: 'Alertas Inteligentes',
      description: 'Recibe notificaciones automáticas de stock bajo, tareas pendientes y vencimientos.'
    },
    {
      id: 'reports',
      icon: 'clipboard',
      title: 'Reportes y Analíticas',
      description: 'Visualiza métricas clave y toma decisiones basadas en datos de tu negocio.'
    },
    {
      id: 'collaboration',
      icon: 'user-plus',
      title: 'Colaboración en Equipo',
      description: 'Trabaja con tu equipo en tiempo real, asigna responsabilidades y comunica eficientemente.'
    },
    {
      id: 'calendar',
      icon: 'calendar',
      title: 'Calendario Integrado',
      description: 'Visualiza todas tus tareas y eventos importantes en un calendario unificado.'
    }
  ];

  // Carousel control
  currentServiceIndex = 0;
  visibleServicesCount = 3;

  get visibleServices(): Service[] {
    const services: Service[] = [];
    for (let i = 0; i < this.visibleServicesCount; i++) {
      const index = (this.currentServiceIndex + i) % this.services.length;
      services.push(this.services[index]);
    }
    return services;
  }

  nextServices(): void {
    this.currentServiceIndex = (this.currentServiceIndex + 1) % this.services.length;
  }

  prevServices(): void {
    this.currentServiceIndex = (this.currentServiceIndex - 1 + this.services.length) % this.services.length;
  }

  // Newsletter form submission
  submitNewsletter(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.resetForm();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }

  private validateForm(): boolean {
    if (!this.newsletterForm.name.trim()) {
      this.submitError = 'Por favor, introduce tu nombre';
      return false;
    }
    if (!this.newsletterForm.lastName.trim()) {
      this.submitError = 'Por favor, introduce tus apellidos';
      return false;
    }
    if (!this.newsletterForm.email.trim()) {
      this.submitError = 'Por favor, introduce tu email';
      return false;
    }
    if (!this.isValidEmail(this.newsletterForm.email)) {
      this.submitError = 'Por favor, introduce un email válido';
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm(): void {
    this.newsletterForm = {
      name: '',
      lastName: '',
      city: '',
      email: ''
    };
  }
}
