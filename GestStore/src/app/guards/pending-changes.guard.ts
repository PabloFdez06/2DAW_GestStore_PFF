import { type CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (!component?.canDeactivate) {
    return true;
  }

  return component.canDeactivate();
};
