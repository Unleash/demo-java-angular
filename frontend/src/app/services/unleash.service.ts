import { Injectable } from '@angular/core';
import { UnleashClient, IContext, IVariant } from 'unleash-proxy-client';
import { initUnleashToolbar } from '@unleash/toolbar';
import '@unleash/toolbar/toolbar.css';
import { unleashConfig } from '../config/unleash.config';

@Injectable({
  providedIn: 'root'
})
export class UnleashService {
  private unleash: UnleashClient;
  private initialized = false;
  private currentUserId: string = '';
  private currentContext: Partial<IContext> = {};

  constructor() {
    // Generate or retrieve userId from localStorage FIRST
    this.currentUserId = this.getOrCreateUserId();
    
    // Initialize context with userId BEFORE creating the client
    this.currentContext = {
      userId: this.currentUserId
    };
    
    // Create the Unleash client with the userId already in context
    // This ensures the FIRST fetch to the proxy includes the userId

    this.unleash = initUnleashToolbar(new UnleashClient({
      url: unleashConfig.url,
      clientKey: unleashConfig.clientKey,
      appName: unleashConfig.appName,
      refreshInterval: unleashConfig.refreshInterval,
      context: {
        userId: this.currentUserId,
        properties: {
          country: "IT",
          beta: "false",
        }
      }
    }));
    
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      // The context is already set in the constructor, so start() will use it
      await this.unleash.start();
      this.initialized = true;
    }
  }

  async start(): Promise<void> {
    return this.initialize();
  }

  isEnabled(featureName: string): boolean {
    // The unleash client uses the context set via constructor or updateContext
    // Ensure userId is in the current context
    return this.unleash.isEnabled(featureName);
  }

  getVariant(featureName: string): IVariant {
    // The unleash client uses the context set via constructor or updateContext
    // Ensure userId is in the current context
    return this.unleash.getVariant(featureName);
  }

  updateContext(context: Partial<IContext>): Promise<void> {
    // Merge with current context to maintain userId and other fields
    this.currentContext = {
      ...this.currentContext,
      ...context
    };
    
    // Ensure userId is always present
    if (!this.currentContext.userId) {
      this.currentContext.userId = this.currentUserId;
    }
    
    // Update the Unleash client context
    return this.unleash.updateContext(this.currentContext as IContext);
  }

  on(event: string, callback: () => void): void {
    this.unleash.on(event, callback);
  }

  onUpdate(callback: () => void): void {
    this.unleash.on('update', callback);
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  private getOrCreateUserId(): string {
    if (typeof localStorage !== 'undefined') {
      let userId = localStorage.getItem('unleash_user_id');
      if (!userId) {
        userId = this.generateUserId();
        localStorage.setItem('unleash_user_id', userId);
      }
      return userId;
    }
    return this.generateUserId();
  }

  private generateUserId(): string {
    return `user-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  async simulateNewUser(): Promise<void> {
    // Generate a new userId
    this.currentUserId = this.generateUserId();
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('unleash_user_id', this.currentUserId);
    }
    
    // Update the current context with new userId
    this.currentContext.userId = this.currentUserId;
    
    // Update Unleash context with new userId (and maintain other context fields)
    await this.unleash.updateContext(this.currentContext as IContext);
  }

  getCurrentContext(): Partial<IContext> {
    return { ...this.currentContext };
  }
}
