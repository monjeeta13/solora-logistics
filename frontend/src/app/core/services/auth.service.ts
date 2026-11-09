// frontend/src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, idToken } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, from, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Observables directly from Firebase Auth state
  public authState$ = user(this.auth);
  public idToken$ = idToken(this.auth);

  constructor() {
    // Sync internal state when Firebase auth state changes
    this.authState$.subscribe(user => {
      if (!user) {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(this.auth, provider);
      const token = await credential.user.getIdToken();
      await this.syncUserWithBackend(token);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  private async syncUserWithBackend(token: string): Promise<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/auth/sync`, {}, { headers })
        .subscribe({
          next: (response: any) => {
            this.currentUserSubject.next(response.user);
            resolve();
          },
          error: (err) => {
            console.error('Backend Sync Error:', err);
            reject(err);
          }
        });
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }
  
  getCurrentToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.getIdToken() : Promise.resolve(null);
  }
}