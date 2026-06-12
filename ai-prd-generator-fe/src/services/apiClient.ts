import type { PRDDocument, PRDVersion, ChatMessage } from '../types';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new Event('session-expired'));
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async fetchDocuments(): Promise<PRDDocument[]> {
    return this.request<PRDDocument[]>('/api/prd/documents');
  }

  async fetchDocumentDetail(id: string): Promise<PRDDocument> {
    return this.request<PRDDocument>(`/api/prd/documents/${id}`);
  }

  async createDocument(doc: PRDDocument): Promise<PRDDocument> {
    return this.request<PRDDocument>('/api/prd/documents', {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  }

  async updateDocument(id: string, doc: Partial<PRDDocument>): Promise<PRDDocument> {
    return this.request<PRDDocument>(`/api/prd/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    });
  }

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/prd/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async fetchVersions(prdId: string): Promise<PRDVersion[]> {
    return this.request<PRDVersion[]>(`/api/prd/documents/${prdId}/versions`);
  }

  async saveVersion(prdId: string, version: PRDVersion): Promise<PRDVersion> {
    return this.request<PRDVersion>(`/api/prd/documents/${prdId}/versions`, {
      method: 'POST',
      body: JSON.stringify({
        version: version.version,
        change_summary: version.change_summary,
        sections: version.sections,
      }),
    });
  }

  async getChatResponse(
    message: string,
    currentPRD: PRDDocument
  ): Promise<{ reply: string; suggestedDiff?: ChatMessage['suggestedDiff'] }> {
    return this.request<{ reply: string; suggestedDiff?: ChatMessage['suggestedDiff'] }>('/api/prd/chat', {
      method: 'POST',
      body: JSON.stringify({ message, currentPRD }),
    });
  }

  async upgradeSubscription(tier?: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/prd/user/subscribe', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async fetchConfig(): Promise<{ creatorEmail: string }> {
    return this.request<{ creatorEmail: string }>('/api/prd/config');
  }

  async submitFeedback(rating: number, comment: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/prd/user/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async streamPRD(
    prompt: string,
    title: string,
    options: { techStack?: string; targetUser?: string; tags?: string[]; locale?: string },
    onChunk: (sections: any[]) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/prd/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          title,
          options,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event('session-expired'));
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Gagal membaca body stream dari server.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.finished) {
                onComplete();
                return;
              } else {
                onChunk(data);
              }
            } catch (e) {
              console.error('Gagal parse SSE chunk:', e);
            }
          }
        }
      }
      onComplete();
    } catch (err) {
      onError(err);
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
