// Defino los niveles de severidad que puede tener una incidencia
// Estos deben coincidir exactamente con los del backend
export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Interface para crear una nueva incidencia
// Solo necesito estos datos del usuario, el resto los establece el backend
export interface IssueRequest {
  title: string;
  description: string;
  severity: IssueSeverity;
}

// Interface completa de una incidencia
// Representa todos los datos que devuelve el backend
export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  createdAt: string; // Como string porque viene del backend en formato ISO
  reportedBy: string;
}

// Respuesta del API cuando creamos o consultamos incidencias
export interface IssueApiResponse {
  success: boolean;
  message: string;
  data: Issue | Issue[];
  timestamp?: string;
}