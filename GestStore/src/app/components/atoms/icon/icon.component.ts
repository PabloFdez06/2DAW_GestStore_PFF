import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Bell, Calendar, Home, Star, CheckSquare, Folder, Package, Settings, LogOut, UserPlus, Clipboard, MoreVertical, Plus, Minus, CheckCircle, BookOpen, ChevronLeft, ChevronRight, ChevronDown, X, Check, Sun, Moon, User, Mail, Phone, Upload, Pencil, AlertCircle, Trash2, Camera, Box, icons } from 'lucide-angular';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <i-lucide 
      [img]="iconImg" 
      [class]="getIconClasses()"
      [size]="getIconSize()"
      [strokeWidth]="2"
    ></i-lucide>
  `,
  styleUrl: './icon.component.scss'
})
export class IconComponent implements OnInit, OnChanges {
  @Input() name: string = 'search';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  iconImg: any;
  
  // Mapa de iconos
  private iconMap: { [key: string]: any } = {
    'search': Search,
    'bell': Bell,
    'calendar': Calendar,
    'home': Home,
    'star': Star,
    'check-square': CheckSquare,
    'folder': Folder,
    'package': Package,
    'settings': Settings,
    'log-out': LogOut,
    'user-plus': UserPlus,
    'clipboard': Clipboard,
    'more-vertical': MoreVertical,
    'plus': Plus,
    'minus': Minus,
    'check-circle': CheckCircle,
    'book-open': BookOpen,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'x': X,
    'check': Check,
    'sun': Sun,
    'moon': Moon,
    'user': User,
    'mail': Mail,
    'phone': Phone,
    'upload': Upload,
    'pencil': Pencil,
    'alert-circle': AlertCircle,
    'trash': Trash2,
    'camera': Camera,
    'box': Box
  };

  ngOnInit() {
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      this.updateIcon();
    }
  }

  private updateIcon(): void {
    this.iconImg = this.iconMap[this.name] || Search;
  }

  getIconClasses(): string {
    return `icon icon--${this.size}`;
  }

  getIconSize(): number {
    switch (this.size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  }
}
