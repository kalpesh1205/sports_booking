import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // Temporarily bypass real JWT, instead pass the mock identity
  const userId = authService.getUserId();
  const mockUserId = userId ? userId.toString() : '1';
  const mockRole = localStorage.getItem('role') || 'USER';

  const cloned = req.clone({
    setHeaders: { 
      'X-Mock-User-Id': mockUserId,
      'X-Mock-Role': mockRole
    }
  });
  return next(cloned);

  return next(req);
};
