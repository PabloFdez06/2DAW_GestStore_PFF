import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token y usuario del localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('currentUser');
  
  let headers: any = {};
  
  // Si existe el token, agregarlo a los headers
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Si existe el usuario, agregar su ID a los headers
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        headers['X-User-Id'] = String(user.id);
        console.log('Interceptor: Añadiendo X-User-Id:', user.id);
      }
    } catch (e) {
      console.error('Error al parsear usuario del localStorage', e);
    }
  }
  
  console.log('Interceptor: Headers a enviar:', headers);
  
  // Clonar la request con los nuevos headers si existen
  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req);
};
