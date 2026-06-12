export interface PRDSection {
  id: string;
  title: string;
  content: string;
}

export interface PRDDocument {
  id: string;
  title: string;
  description: string;
  sections: PRDSection[];
  version: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface PRDVersion {
  id: string;
  prd_id: string;
  version: number;
  sections: PRDSection[];
  change_summary: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedDiff?: {
    sectionId: string;
    oldContent: string;
    newContent: string;
    summary: string;
  };
}

export interface PRDTemplate {
  id: string;
  name: string;
  category: 'saas' | 'mobile' | 'api' | 'internal' | 'general';
  description: string;
  icon: string;
  sections: {
    id: string;
    title: string;
    placeholder: string;
  }[];
}

export interface AppSettings {
  aiMode: 'mock' | 'real';
  apiKey: string;
  defaultModel: string;
  dataSource: 'local' | 'server';
  serverUrl: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
