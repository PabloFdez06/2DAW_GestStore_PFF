import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-footer.component.html',
  styleUrl: './home-footer.component.scss'
})
export class HomeFooterComponent {
  // Assets URLs desde Figma
  readonly logoImg = 'https://www.figma.com/api/mcp/asset/f5b97be8-5b01-4aff-9838-8e63c483fa6f';
  readonly instagramLogo = 'https://www.figma.com/api/mcp/asset/12de58ce-8f79-4d4f-924a-700cd1a2b07b';
  readonly androidBadge = 'https://www.figma.com/api/mcp/asset/43bdc702-989e-480d-98d3-3c6b26490db1';
  readonly appleBadge = 'https://www.figma.com/api/mcp/asset/848b3b3a-dbd7-4af7-b3de-c39c5f0d14ec';
}
