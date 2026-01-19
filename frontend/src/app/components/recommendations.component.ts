import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { UnleashService } from '../services/unleash.service';

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  imageUrl: string;
}

@Component({
  selector: 'app-recommendations',
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300"
         [style.padding-bottom]="isPanelOpen() ? '22rem' : '6rem'">
      <!-- Page Title -->
      <div class="text-center mb-6">
        <h1 class="text-3xl text-unleash dark:text-blue-400 mb-1 font-bold transition-colors">
          Unleash Demo (Recommendations)
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-base transition-colors">
          Personalized recommendations using feature flag variants
        </p>
        </div>

        <!-- Best Practices Content -->
        <div class="bg-white dark:bg-gray-800 p-6 mb-6 rounded-lg shadow-xl border-t-4 border-unleash dark:border-blue-500 transition-colors">
          <h2 class="text-2xl text-unleash dark:text-blue-400 mb-4 font-bold transition-colors">
            11 Principles for Building Large-Scale Feature Flag Systems
          </h2>
          
          <div class="space-y-4 text-gray-700 dark:text-gray-300 text-sm transition-colors">
            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">1. Enable Runtime Control</h3>
              <p>A scalable feature management system evaluates flags at runtime, not at build time. If you need to restart your application to turn on a flag, that's configuration, not a feature flag.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">2. Make Flags Short-Lived</h3>
              <p>Feature flags should be temporary. Once a rollout is complete, remove the flag from your code and archive it. Treat flags like technical debt and set expiration dates.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">3. Prioritize Availability Over Consistency</h3>
              <p>Your application shouldn't depend on the availability of your feature flag system. SDKs should work with locally cached data, ensuring uninterrupted functionality even when the network is down.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">4. Ensure Unique Flag Names</h3>
              <p>All flags within the same control service should have unique names across your entire system. This prevents conflicts, simplifies management, and improves collaboration across teams.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">5. Choose Open by Default</h3>
              <p>Make feature flag systems open by default to enable engineers, product owners, and support teams to collaborate effectively. Provide access to codebase, configuration, and analytics.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">6. Protect PII by Evaluating Flags Server-Side</h3>
              <p>Follow the principle of least privilege by evaluating flags server-side. Keep sensitive information like user IDs and email addresses confined to your application, not exposed to the client.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">7. Evaluate Flags as Close to the User as Possible</h3>
              <p>For optimal performance, evaluate feature flags locally. This reduces latency, enables offline functionality, lowers bandwidth costs, and improves resilience during service downtime.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">8. Scale Horizontally by Decoupling Reads and Writes</h3>
              <p>Separate read and write operations into distinct APIs. This allows you to scale each component independently, provides better performance, and enables granular access control.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">9. Limit Feature Flag Payload</h3>
              <p>Keep payloads small to reduce network load, speed up flag evaluation, and improve memory efficiency. Use group identifiers instead of storing large user lists in flag configurations.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">10. Prioritize Consistent User Experience</h3>
              <p>Ensure the same user consistently gets the same experience. Use user hashing, segmentation control, and robust monitoring to maintain consistency in percentage-based gradual rollouts.</p>
            </div>

            <div>
              <h3 class="text-base font-semibold text-unleash dark:text-blue-400 mb-1 transition-colors">11. Optimize for Developer Experience</h3>
              <p>Provide testable SDKs, visibility into flag behavior, effective monitoring, and comprehensive documentation. A positive developer experience enhances efficiency and contributes to overall success.</p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors">
              Learn more: <a href="https://docs.getunleash.io/guides/feature-flag-best-practices" target="_blank" rel="noopener noreferrer" class="text-unleash dark:text-blue-400 hover:underline font-semibold">Feature Flag Best Practices</a>
            </p>
          </div>
        </div>

        <!-- Movie Recommendations (injected when flag is enabled) -->
        @if (recommendationsEnabled() && movies().length > 0) {
          <div class="bg-white dark:bg-gray-800 p-6 mb-6 rounded-lg shadow-xl border-t-4 border-unleash dark:border-blue-500 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl text-unleash dark:text-blue-400 font-bold transition-colors">
                Recommended Movies For You
              </h2>
              @if (algorithm()) {
                <span class="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors">
                  {{ algorithm() === 'v2-ml' ? 'ML Algorithm' : 'Simple Algorithm' }}
                </span>
              }
            </div>
            
            <!-- Horizontal Movie List with top padding for hover expansion -->
            <div class="flex gap-4 overflow-x-auto pb-3 pt-3 -mx-2 px-2">
              @for (movie of movies(); track movie.id) {
                <button 
                  (click)="onMovieClick(movie)"
                  class="group flex-shrink-0 w-56 h-[380px] rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-transparent hover:border-unleash dark:hover:border-blue-400 text-left relative overflow-hidden">
                  <!-- Movie Poster Background -->
                  <img 
                    [src]="movie.imageUrl" 
                    [alt]="movie.title"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  <!-- Gradient Overlay - darkens from top to bottom -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                  
                  <!-- Movie Info Overlay - positioned at bottom -->
                  <div class="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 class="text-base font-bold text-white mb-1 drop-shadow-lg line-clamp-2">{{ movie.title }}</h3>
                    <p class="text-xs text-gray-200 mb-2 drop-shadow-md">{{ movie.year }}</p>
                    <div class="flex items-center gap-1">
                      <span class="text-yellow-400 text-sm drop-shadow-md">⭐</span>
                      <span class="text-sm font-semibold text-white drop-shadow-md">{{ movie.rating }}</span>
                    </div>
                  </div>
                  
                  <!-- Shine effect on hover -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              }
            </div>
          </div>
        }
      </div>
  `,
  standalone: true
})
export class RecommendationsComponent implements OnInit {
  recommendationsEnabled = signal<boolean>(false);
  movies = signal<Movie[]>([]);
  algorithm = signal<string | null>(null);
  currentUserId = signal<string>('');
  isPanelOpen = signal<boolean>(
    typeof localStorage !== 'undefined' && localStorage.getItem('featureFlagsPanelOpen') === 'true'
  );
  isInitialized = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private unleashService: UnleashService
  ) {}

  async ngOnInit() {
    // Initialize Unleash
    await this.unleashService.initialize();
    
    // Get current userId
    this.currentUserId.set(this.unleashService.getCurrentUserId());
    
    // Check the recommendations flag
    this.checkRecommendationsFlag();
    
    // Listen for flag updates
    this.unleashService.onUpdate(() => {
      this.checkRecommendationsFlag();
    });
    
    // Mark as initialized after a brief delay to avoid FOUC
    setTimeout(() => this.isInitialized.set(true), 0);
  }

  togglePanel() {
    const newState = !this.isPanelOpen();
    this.isPanelOpen.set(newState);
    // Save panel state to localStorage
    localStorage.setItem('featureFlagsPanelOpen', String(newState));
  }

  checkRecommendationsFlag() {
    // Check if the flag is enabled (will also check variant)
    const isEnabled = this.unleashService.isEnabled('movie-recommendations');
    this.recommendationsEnabled.set(isEnabled);
    
    if (isEnabled) {
      // Flag is enabled - load recommendations from backend
      this.loadRecommendations();
    } else {
      // Flag is disabled - clear recommendations
      this.movies.set([]);
      this.algorithm.set(null);
    }
  }

  loadRecommendations() {
    // Pass the current userId to the backend so it can use the same context
    const userId = this.unleashService.getCurrentUserId();
    this.apiService.getRecommendations(userId).subscribe({
      next: (data) => {
        this.movies.set(data.movies);
        this.algorithm.set(data.algorithm);
      },
      error: (err) => {
        console.error('Failed to load recommendations:', err);
        this.movies.set([]);
      }
    });
  }

  onMovieClick(movie: Movie) {
    // TODO: integrate the new Impact Metrics to track experiment performance
    
    console.log(`🎬 User clicked on: ${movie.title} (${movie.year}) [ID: ${movie.id}] - Algorithm: ${this.algorithm()}`);
  }

  async simulateNewUser() {
    // Generate a new user and update context
    await this.unleashService.simulateNewUser();
    
    // Update the displayed userId
    this.currentUserId.set(this.unleashService.getCurrentUserId());
    
    // Refresh the recommendations with the new user context
    this.checkRecommendationsFlag();
  }
}

