import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  onlyLettersValidator,
  spanishPhoneValidator,
  spanishPostalCodeValidator,
  nifNieValidator,
  getErrorMessage,
  createUniqueEmailValidator,
  ValidationApiService
} from '../../../validators';

interface Address {
  street: string;
  number: string;
  city: string;
  postalCode: string;
  province: string;
  isMain: boolean;
}

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  providers: [ValidationApiService]
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private validationApi = inject(ValidationApiService);

  // Signals para estados del formulario
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  // Lista de provincias españolas
  provincias = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
    'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
    'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada',
    'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares',
    'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lleida',
    'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
    'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
    'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia',
    'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ];

  // Formulario reactivo con FormArray para direcciones
  profileForm: FormGroup = this.fb.group({
    // Datos personales
    personalInfo: this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        onlyLettersValidator()
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        onlyLettersValidator()
      ]],
      nif: ['', [
        Validators.required,
        nifNieValidator()
      ]],
      email: ['', {
        validators: [
          Validators.required,
          Validators.email
        ],
        asyncValidators: [createUniqueEmailValidator(this.validationApi)],
        updateOn: 'blur'
      }],
      telefono: ['', [
        Validators.required,
        spanishPhoneValidator()
      ]],
      telefonoSecundario: ['', [
        spanishPhoneValidator()
      ]]
    }),

    // FormArray de direcciones
    direcciones: this.fb.array([])
  });

  constructor() {
    // Añadir una dirección por defecto
    this.addAddress(true);
  }

  /**
   * Getter para acceder al FormArray de direcciones
   */
  get direcciones(): FormArray {
    return this.profileForm.get('direcciones') as FormArray;
  }

  /**
   * Getter para acceder al grupo de información personal
   */
  get personalInfo(): FormGroup {
    return this.profileForm.get('personalInfo') as FormGroup;
  }

  /**
   * Crea un nuevo grupo de dirección
   */
  private createAddressGroup(isMain: boolean = false): FormGroup {
    return this.fb.group({
      street: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      number: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+[A-Za-z]?$/)
      ]],
      floor: ['', [
        Validators.pattern(/^[0-9]+[A-Za-zº]*$/)
      ]],
      door: ['', [
        Validators.maxLength(10)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      postalCode: ['', [
        Validators.required,
        spanishPostalCodeValidator()
      ]],
      province: ['', [
        Validators.required
      ]],
      isMain: [isMain]
    });
  }

  /**
   * Añade una nueva dirección al FormArray
   */
  addAddress(isMain: boolean = false): void {
    // Si la nueva dirección es principal, desmarcar las demás
    if (isMain) {
      this.direcciones.controls.forEach(control => {
        control.get('isMain')?.setValue(false);
      });
    }
    this.direcciones.push(this.createAddressGroup(isMain));
  }

  /**
   * Elimina una dirección del FormArray
   */
  removeAddress(index: number): void {
    if (this.direcciones.length > 1) {
      const wasMain = this.direcciones.at(index).get('isMain')?.value;
      this.direcciones.removeAt(index);
      
      // Si eliminamos la principal, hacer la primera como principal
      if (wasMain && this.direcciones.length > 0) {
        this.direcciones.at(0).get('isMain')?.setValue(true);
      }
    }
  }

  /**
   * Establece una dirección como principal
   */
  setMainAddress(index: number): void {
    this.direcciones.controls.forEach((control, i) => {
      control.get('isMain')?.setValue(i === index);
    });
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(path: string): boolean {
    const control = this.profileForm.get(path);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(path: string): string {
    const control = this.profileForm.get(path);
    if (control && control.errors) {
      return getErrorMessage(control.errors);
    }
    return '';
  }

  /**
   * Verifica si un campo es válido
   */
  isFieldValid(path: string): boolean {
    const control = this.profileForm.get(path);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  /**
   * Verifica si un campo está validando
   */
  isFieldValidating(path: string): boolean {
    const control = this.profileForm.get(path);
    return !!(control && control.pending);
  }

  /**
   * Verifica si una dirección específica tiene errores
   */
  hasAddressFieldError(addressIndex: number, fieldName: string): boolean {
    return this.hasFieldError(`direcciones.${addressIndex}.${fieldName}`);
  }

  /**
   * Obtiene el error de una dirección específica
   */
  getAddressFieldError(addressIndex: number, fieldName: string): string {
    return this.getFieldError(`direcciones.${addressIndex}.${fieldName}`);
  }

  /**
   * Verifica si un campo de dirección es válido
   */
  isAddressFieldValid(addressIndex: number, fieldName: string): boolean {
    return this.isFieldValid(`direcciones.${addressIndex}.${fieldName}`);
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    // Marcar todos los campos como touched
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      this.submitError.set('Por favor, corrige los errores del formulario');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      // Simular llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));

      const formData = this.profileForm.value;
      console.log('Perfil guardado:', formData);
      
      this.submitSuccess.set(true);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.submitSuccess.set(false);
      }, 3000);

    } catch (error) {
      this.submitError.set('Error al guardar el perfil. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Navega hacia atrás
   */
  onBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  resetForm(): void {
    this.profileForm.reset();
    // Limpiar direcciones y añadir una por defecto
    while (this.direcciones.length > 0) {
      this.direcciones.removeAt(0);
    }
    this.addAddress(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }
}
