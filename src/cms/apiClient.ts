/**
 * Private CMS Backend API Client for Supabase.
 * 
 * Communicates with deployed Supabase Edge Functions:
 * - admin-content
 * - admin-publish
 * - admin-media
 * - admin-audit
 * - public-content
 * 
 * Uses the authenticated Supabase session access token automatically.
 * NEVER logs JWT tokens, passwords, service-role keys, or private keys.
 */

import { supabase } from './supabaseClient';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fpjaijgbcdalrdgwbece.supabase.co';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  id?: string;
  isNew?: boolean;
  jobId?: string;
  commitSha?: string;
  status?: string;
}

export class CMSApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Invokes a deployed Supabase Edge Function with the active user session.
   */
  async invokeFunction<T = any>(
    functionName: string,
    options: {
      body?: any;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      query?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 1. Retrieve session access token
      let token = this.authToken;
      if (!token) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token ?? null;
      }

      // Build query string if provided
      let queryString = '';
      if (options.query) {
        const params = new URLSearchParams(options.query);
        queryString = `?${params.toString()}`;
      }

      // 2. Perform authenticated request
      const endpoint = `${SUPABASE_URL}/functions/v1/${functionName}${queryString}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        method: options.method || 'POST',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: json.error || `HTTP ${res.status}: ${res.statusText}`,
          status: String(res.status),
        };
      }

      return json;
    } catch (e: any) {
      return {
        success: false,
        error: `Network error connecting to Supabase function (${functionName}): ${e.message}`,
      };
    }
  }

  // --- Content Management Operations ---

  async getStats() {
    return this.invokeFunction<any>('admin-content', {
      method: 'GET',
      query: { action: 'stats' },
    });
  }

  async getAuditLogs(limit = 50, offset = 0) {
    return this.invokeFunction<any[]>('admin-audit', {
      method: 'GET',
      query: { limit: String(limit), offset: String(offset) },
    });
  }

  async exportContent() {
    return this.invokeFunction<any>('admin-content', {
      method: 'GET',
      query: { action: 'export' },
    });
  }

  async getContentList<T>(contentType: string, status?: string) {
    const query: Record<string, string> = { type: contentType };
    if (status) query.status = status;

    return this.invokeFunction<T[]>('admin-content', {
      method: 'GET',
      query,
    });
  }

  async getContentItem<T>(contentType: string, idOrSlug: string) {
    return this.invokeFunction<T>('admin-content', {
      method: 'GET',
      query: { type: contentType, id: idOrSlug },
    });
  }

  async saveContentItem(contentType: string, data: any) {
    return this.invokeFunction<{ id: string; isNew: boolean }>('admin-content', {
      method: 'POST',
      body: { contentType, ...data },
    });
  }

  async updateContentItem(contentType: string, id: string, data: any) {
    return this.invokeFunction<{ id: string }>('admin-content', {
      method: 'PUT',
      query: { type: contentType, id },
      body: { contentType, id, ...data },
    });
  }

  async deleteContentItem(contentType: string, id: string) {
    return this.invokeFunction('admin-content', {
      method: 'DELETE',
      query: { type: contentType, id },
    });
  }

  async publishContentItem(contentType: string, id: string, currentStatus = 'approved', verificationStatus = 'USER_PROVIDED') {
    return this.invokeFunction<{ message: string; jobId?: string; commitSha?: string }>('admin-publish', {
      method: 'POST',
      body: {
        contentType,
        contentId: id,
        currentStatus,
        verificationStatus,
      },
    });
  }

  async verifyGitHubAccess() {
    return this.invokeFunction<{ success: boolean; repository?: string; error?: string }>('admin-publish', {
      method: 'POST',
      body: { action: 'verify_github' },
    });
  }
}

export const cmsApiClient = new CMSApiClient();
