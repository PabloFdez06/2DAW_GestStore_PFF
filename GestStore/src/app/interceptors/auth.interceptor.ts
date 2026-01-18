import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token y usuario del localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('currentUser');
  
  console.log('[AuthInterceptor] URL:', req.url);
  console.log('[AuthInterceptor] Token:', token ? 'Existe' : 'No existe');
  console.log('[AuthInterceptor] UserStr:', userStr);
  
  let headers: any = {};
  
  // Si existe el token, agregarlo a los headers
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Si existe el usuario, agregar su ID a los headers
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('[AuthInterceptor] User parsed:', user);
      const userId = user?.id ?? user?._id;
      console.log('[AuthInterceptor] UserId extraído:', userId);
      if (userId) {
        headers['X-User-Id'] = String(userId);
        console.log('[AuthInterceptor] X-User-Id header añadido:', String(userId));
      } else {
        console.error('[AuthInterceptor] No se pudo extraer userId del user');
      }
    } catch (e) {
      console.error('[AuthInterceptor] Error al parsear user:', e);
    }
  } else {
    console.warn('[AuthInterceptor] No hay currentUser en localStorage');
  }
  
  console.log('[AuthInterceptor] Headers a añadir:', headers);
  
  // Clonar la request con los nuevos headers si existen
  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req);
};
