// frontend/src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex bg-white font-sans">
      
      <!-- Left Side: Image & Branding (Hidden on smaller screens) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <!-- High-quality Logistics Image -->
        <img class="absolute inset-0 h-full w-full object-cover transform hover:scale-105 transition-transform duration-1000" 
             src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop" 
             alt="Solora Logistics Network" />
             
        <!-- Gradient Overlays for readability -->
        <div class="absolute inset-0 bg-indigo-900/60 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        <!-- Left Side Content -->
        <div class="relative z-10 flex flex-col justify-end p-12 lg:p-16 h-full text-white">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <span class="text-2xl font-bold tracking-widest uppercase">Solora</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Smart logistics for a sustainable future.
          </h2>
          <p class="text-lg text-indigo-100 max-w-md font-medium leading-relaxed">
            Join the next generation of eco-conscious shipping. Streamline your routes, track in real-time, and lower your carbon footprint.
          </p>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-20 xl:px-24 bg-slate-50 lg:bg-white relative">
        
        <!-- Mobile Logo (Only visible on small screens) -->
        <div class="pt-8 lg:hidden flex items-center justify-center gap-2 text-primary font-bold text-2xl tracking-wider uppercase">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
           </svg>
           SOLORA
        </div>
        <div class="hidden lg:block"></div> <!-- Spacer for flex-between on desktop -->

        <!-- Form Container -->
        <div class="mx-auto w-full max-w-sm mt-12 lg:mt-0">
          <div class="text-center lg:text-left">
            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p class="mt-3 text-base text-slate-500 font-medium">
              Sign up to claim your ₹500 Welcome Bonus and start booking shipments.
            </p>
          </div>

          <div class="mt-10">
            <!-- Google Login Button -->
            <button 
              (click)="onGoogleLogin()" 
              [disabled]="isLoading()"
              class="w-full flex justify-center items-center py-3.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
              
              <img *ngIf="!isLoading()" class="h-6 w-6 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo">
              
              <svg *ngIf="isLoading()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              {{ isLoading() ? 'Securing your session...' : 'Continue with Google' }}
            </button>
            
            <!-- Error Alert -->
            <div *ngIf="errorMessage()" class="mt-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-sm">
              <svg class="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span class="font-medium">{{ errorMessage() }}</span>
            </div>
          </div>
        </div>

        <!-- Custom Footer -->
        <div class="pb-8 pt-12 text-center lg:text-left text-sm text-slate-400 font-semibold tracking-wide">
          &copy; 2026 - Monjeeta Sinha Roy
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async onGoogleLogin() {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      await this.authService.loginWithGoogle();
      // Navigate to dashboard on successful sync
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Authentication failed. Please try again.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}