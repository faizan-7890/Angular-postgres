import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { ClerkAuthService } from '../services/clerk-auth.service';
import { UserRole } from '../models/auth.models';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(ClerkAuthService);

  private allowedRoles: UserRole[] = [];
  private isVisible = false;

  constructor() {
    effect(() => {
      const currentRole = this.authService.userRole();
      this.updateView(currentRole);
    });
  }

  @Input()
  set appHasRole(roles: UserRole[] | UserRole) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView(this.authService.userRole());
  }

  private updateView(currentRole: UserRole): void {
    const hasPermission =
      this.allowedRoles.length === 0 || this.allowedRoles.includes(currentRole);

    if (hasPermission && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPermission && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
