import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { User } from '../models/auth.model';
import { ApiResponse } from '../models/task.model';

export interface UserProfileUpdateRequest {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string | null;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(map(r => r.data));
  }

  updateMe(payload: UserProfileUpdateRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/me`, payload).pipe(map(r => r.data));
  }

  updateMyPassword(payload: UpdatePasswordRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/me/password`, payload).pipe(map(() => void 0));
  }
}
