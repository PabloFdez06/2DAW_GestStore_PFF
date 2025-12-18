import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-header.component.html',
  styleUrl: './home-header.component.scss'
})
export class HomeHeaderComponent {
  // Assets URLs desde Figma
  readonly backgroundImg = 'https://www.figma.com/api/mcp/asset/420c21a5-1b67-482c-aa9f-cc289aef9531';
  readonly logoImg = 'https://www.figma.com/api/mcp/asset/f5b97be8-5b01-4aff-9838-8e63c483fa6f';

  // Idiomas disponibles
  languages: Language[] = [
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' }
  ];

  currentLanguage: Language = this.languages[0];
  isLanguageMenuOpen = false;

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  selectLanguage(language: Language): void {
    this.currentLanguage = language;
    this.isLanguageMenuOpen = false;
    // Aquí puedes agregar lógica para cambiar el idioma de la aplicación
    console.log('Idioma seleccionado:', language.code);
  }

  closeLanguageMenu(): void {
    this.isLanguageMenuOpen = false;
  }
}
