import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbsService } from '../../../services/breadcrumbs.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumbs">
      <ol class="breadcrumbs__list">
        <li class="breadcrumbs__item">
          <a class="breadcrumbs__link" routerLink="/dashboard">Dashboard</a>
        </li>

        <ng-container *ngFor="let bc of breadcrumbsService.breadcrumbs(); let last = last">
          <li class="breadcrumbs__sep" aria-hidden="true">/</li>
          <li class="breadcrumbs__item">
            <a *ngIf="!last" class="breadcrumbs__link" [routerLink]="bc.url">{{ bc.label }}</a>
            <span *ngIf="last" class="breadcrumbs__current" aria-current="page">{{ bc.label }}</span>
          </li>
        </ng-container>
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent {
  constructor(public breadcrumbsService: BreadcrumbsService) {}
}
