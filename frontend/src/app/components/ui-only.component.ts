import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnleashService } from '../services/unleash.service';

@Component({
  selector: 'app-ui-only',
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300"
         [style.padding-bottom]="isPanelOpen() ? '22rem' : '6rem'">
      <!-- Page Title -->
      <div class="text-center mb-6">
        <h1 class="text-3xl text-unleash dark:text-blue-400 mb-1 font-bold transition-colors">
          Unleash Demo (UI-only)
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-base transition-colors">
          Show a light/dark mode toggle based on a frontend-only feature flag.
        </p>
      </div>

      <!-- Main Content Area -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border-t-4 border-unleash dark:border-blue-500 transition-colors">
        <h2 class="text-xl text-unleash dark:text-blue-400 mb-3 font-semibold transition-colors">
          About UI-only Feature Flags
        </h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm transition-colors">
          This page demonstrates a UI-only feature flag. The dark mode toggle in the navigation bar is controlled by the "dark-mode" feature flag. 
          When the flag is enabled, users can see and use the dark mode toggle. When disabled, the toggle is hidden.
        </p>
      </div>
    </div>
  `,
  standalone: true
})
export class UiOnlyComponent implements OnInit {
  flagEnabled = signal<boolean>(false);
  currentUserId = signal<string>('');
  isPanelOpen = signal<boolean>(
    typeof localStorage !== 'undefined' && localStorage.getItem('featureFlagsPanelOpen') === 'true'
  );
  isInitialized = signal<boolean>(false);

  constructor(private unleashService: UnleashService) {}

  async ngOnInit() {
    await this.unleashService.initialize();
    
    // Get current userId
    this.currentUserId.set(this.unleashService.getCurrentUserId());
    
    this.checkFlag();
    
    this.unleashService.onUpdate(() => {
      this.checkFlag();
    });
    
    // Mark as initialized after a brief delay to avoid FOUC
    setTimeout(() => this.isInitialized.set(true), 0);
  }

  checkFlag() {
    this.flagEnabled.set(this.unleashService.isEnabled('dark-mode'));
  }

  togglePanel() {
    const newState = !this.isPanelOpen();
    this.isPanelOpen.set(newState);
    // Save panel state to localStorage
    localStorage.setItem('featureFlagsPanelOpen', String(newState));
  }

  async simulateNewUser() {
    await this.unleashService.simulateNewUser();
    this.currentUserId.set(this.unleashService.getCurrentUserId());
    this.checkFlag();
  }
}
