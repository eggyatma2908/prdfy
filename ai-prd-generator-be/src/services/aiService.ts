import { Response as ExpressResponse } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';

export interface PRDSection {
  id: string;
  title: string;
  content: string;
}

const SYSTEM_INSTRUCTIONS_SINGLE_SECTION = `You are a Senior Product Owner, Senior Software Architect, and Senior Business Analyst tasked with creating a specific section of an enterprise-grade PRD (Product Requirements Document) that is implementable, scalable, and production-ready.

# WRITING PRINCIPLES:
- Use professional English and clean Markdown.
- Avoid excessive boilerplate, dead code, duplicate logic, circular dependency, god object, and over-abstraction.
- Avoid overly long paragraphs, filler text, and sentence repetition. Focus on concrete implementation quality and details.
- A valid Mermaid diagram MUST be used if requested in that section. Ensure the diagram is wrapped with \`\`\`mermaid ... \`\`\`.
- If the user's information is incomplete, make realistic and pragmatic MVP-first assumptions.

# MERMAID FLOWCHART RULES (MUST BE FOLLOWED):
Node labels containing SPECIAL CHARACTERS such as parentheses (), slashes /, colons :, or other special characters MUST be wrapped in double quotes.
WRONG (will error)  : A[Presentation Layer (Next.js)]
RIGHT (must be this): A["Presentation Layer (Next.js)"]
WRONG (will error)  : B[Auth/Session Service]
RIGHT (must be this): B["Auth/Session Service"]
Double quotes ARE REQUIRED if the label contains: () / \\ | {} # @ ! ? ~ < > & * or long spaces.

# OUTPUT RULES (REQUIRED):
- Output ONLY the clean markdown content for the section.
- DO NOT include the section header (e.g., "# 1. Overview") at the beginning of your output, as it is automatically prepended by the system. Start directly with the first sub-section or content body.
- DO NOT use JSON wrapper, and do not use opening or closing text outside the markdown. Do not wrap the entire output in markdown code blocks (except for diagrams/code blocks inside the content).`;

const SECTIONS_CONFIG = [
  {
    id: 'overview',
    title: '1. Overview',
    maxTokens: 12000,
    prompt: 'Write a professional and concrete overview including product background, problem solved, and main objectives.',
  },
  {
    id: 'requirements_specification',
    title: '2. Requirements Specification',
    maxTokens: 12000,
    prompt: 'Write a professional and concrete requirements specification, including user roles/personas, system-level functional requirements, and non-functional requirements such as security, performance, and availability.',
  },
  {
    id: 'core_features',
    title: '3. Core Features',
    maxTokens: 12000,
    prompt: 'Write core features professionally and concretely, including lists of main MVP (Minimum Viable Product) features, detailed descriptions of each feature, implementation priorities (using MoSCoW), and brief acceptance criteria.',
  },
  {
    id: 'user_flow',
    title: '4. User Flow',
    maxTokens: 12000,
    prompt: 'Write a professional and concrete user flow. Make sure to include a Mermaid sequenceDiagram for the main happy path showing interactions between: Actor/Customer, Frontend, Backend, Database, and other relevant roles. Format: sequenceDiagram\n  Actor Customer\n  participant Frontend\n  ... Ensure special character labels are wrapped in double quotes. After the diagram, explain the alternative and error paths in a narrative form.',
  },
  {
    id: 'system_architecture',
    title: '5. System Architecture',
    maxTokens: 12000,
    prompt: 'Explain the system architecture using Clean Architecture, SOLID, and modular design. Make sure to include TWO Mermaid diagrams:\n1. A sequenceDiagram depicting request/response flows between components (Actor/User, Frontend, Backend/API, Database, Third-party Services). Format: sequenceDiagram\n   Actor User\n   participant Frontend\n   participant Backend\n   participant Database\n   ...\n2. A flowchart TD diagram depicting architectural layers (Presentation, Application, Domain, Infrastructure).\nEnsure special character node labels are wrapped in double quotes (e.g. A["Label (Detail)"]). After the diagrams, explain each layer and component briefly.',
  },
  {
    id: 'database_schema',
    title: '6. Database Schema',
    maxTokens: 12000,
    prompt: 'Must start with an ERD diagram using Mermaid erDiagram (erDiagram ...). Use snake_case for database naming (tables and columns). After the diagram, include a data dictionary table with columns: Column Name | Data Type | Constraint | Description. Each table must have clear PK, FK, index recommendation, audit fields (created_at, updated_at, deleted_at), and soft delete strategy.',
  },
  {
    id: 'tech_stack_recommendation',
    title: '7. Tech Stack Recommendation',
    maxTokens: 12000,
    prompt: 'Recommendation for framework, database, ORM, authentication, deployment, observability, state management, and testing strategy. Include concrete reasons for choices, brief tradeoffs, and suitability for the use case.',
  },
] as const;

const MODEL_GENERATION_CONFIGS: Record<string, {
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}> = {
  // Text Models
  'gemini-flash-latest': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-3.5-flash': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-3.1-flash-lite': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-3.1-flas-tts': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-3.1-pro': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-3.0-flash': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-flash': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-flash-lite': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-flash-tts': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-flas-tts': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-pro': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2.5-pro-tts': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2-flash': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-2-flash-lite': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },

  // Gemma Models
  'gemma-4-26b': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemma-4-27b': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemma-4-31b': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },

  // Embedding / Robotics / Image Models
  'gemini-embedding-1': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-embedding-1.0': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-embedding-2.0': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-robotics-er-1.5-preview': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'gemini-robotics-er-1.6-preview': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'imagen-4-generate': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'imagen-4-ultra-generate': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
  'imagen-4-fast-generate': { maxOutputTokens: 8192, temperature: 0.15, topP: 0.8, topK: 20 },
};

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : []),
]);

const FETCH_TIMEOUT_MS = 30_000;

export class AIService {
  private validateApiKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }
  }

  private sanitizeInput(s: string): string {
    return s
      .replace(/`{3,}/g, '')
      .replace(/[\u0000-\u001F]/g, '')
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 1000);
  }

  private escapeControlCharacters(str: string): string {
    let result = '';
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const wasEscaped = isEscaped;
      isEscaped = false;

      if (char === '"' && !wasEscaped) {
        inString = !inString;
        result += char;
        continue;
      }

      if (char === '\\') {
        if (inString && !wasEscaped) isEscaped = true;
        result += char;
        continue;
      }

      if (inString && !wasEscaped) {
        if (char === '\n') { result += '\\n'; continue; }
        if (char === '\r') { result += '\\r'; continue; }
        if (char === '\t') { result += '\\t'; continue; }
        const code = char.charCodeAt(0);
        if (code < 32) {
          result += '\\u' + code.toString(16).padStart(4, '0');
          continue;
        }
      }

      result += char;
    }

    return result;
  }

  private cleanJsonString(str: string): string {
    let cleaned = str.trim();

    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const start = cleaned.indexOf('[');
    if (start === -1) return this.escapeControlCharacters(cleaned);

    let end = cleaned.lastIndexOf(']');
    while (end > start) {
      const candidate = this.escapeControlCharacters(cleaned.slice(start, end + 1));
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        end = cleaned.lastIndexOf(']', end - 1);
      }
    }

    return this.escapeControlCharacters(cleaned);
  }

  private cleanMarkdownString(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```markdown')) {
      cleaned = cleaned.slice(11);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    } else if (cleaned.startsWith('```') && !cleaned.startsWith('```mermaid')) {
      cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
  }

  private async generateWithSDK(
    apiKey: string,
    preferredModel: string,
    options: {
      contents: Content[];
      systemInstruction?: string;
      generationConfig?: {
        maxOutputTokens?: number;
        temperature?: number;
        topP?: number;
        topK?: number;
      };
    },
  ): Promise<{ text: string; finishReason?: string }> {
    const primaryModel = preferredModel || 'gemini-2.5-flash';
    const candidates = [
      primaryModel,
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-flas-tts',
      'gemini-3.1-pro',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash-tts',
      'gemini-2.5-flas-tts',
      'gemini-2.5-pro',
      'gemini-2.5-pro-tts',
      'gemini-2-flash',
      'gemini-2-flash-lite',
      'gemma-4-26b',
      'gemma-4-27b',
      'gemma-4-31b',
      'gemini-embedding-1',
      'gemini-embedding-1.0',
      'gemini-embedding-2.0',
      'gemini-robotics-er-1.5-preview',
      'gemini-robotics-er-1.6-preview',
      'imagen-4-generate',
      'imagen-4-ultra-generate',
      'imagen-4-fast-generate',
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: Error | null = null;
    const genAI = new GoogleGenerativeAI(apiKey);


    for (const candidateModel of candidates) {
      const modelConfig = MODEL_GENERATION_CONFIGS[candidateModel]
        ?? MODEL_GENERATION_CONFIGS['gemini-2.5-flash'];

      const customConfig = options.generationConfig ?? {};
      const mergedConfig = {
        ...modelConfig,
        ...customConfig,
        maxOutputTokens: Math.min(
          modelConfig.maxOutputTokens,
          customConfig.maxOutputTokens ?? modelConfig.maxOutputTokens,
        ),
      };

      console.log(`[Gemini SDK] Mencoba model: ${candidateModel}...`);

      try {
        const modelInstance = genAI.getGenerativeModel({
          model: candidateModel,
          systemInstruction: options.systemInstruction,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ],
        });

        const sdkCall = modelInstance.generateContent({
          contents: options.contents,
          generationConfig: mergedConfig,
        });

        const result = await new Promise<any>((resolve, reject) => {
          const timer = setTimeout(
            () => reject(new Error(`Timeout setelah ${FETCH_TIMEOUT_MS / 1000}s: ${candidateModel}`)),
            FETCH_TIMEOUT_MS,
          );
          sdkCall.then(
            (res: unknown) => { clearTimeout(timer); resolve(res); },
            (err: unknown) => { clearTimeout(timer); reject(err); },
          );
        });

        const response = result.response;
        const text: string = response.text ? response.text() : '';
        const finishReason: string | undefined = response.candidates?.[0]?.finishReason;

        console.log(`[Gemini SDK] Berhasil: ${candidateModel}`);
        return { text, finishReason };

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // Error sementara — langsung skip ke model berikutnya tanpa logging panjang:
        // 429 = rate limit quota habis
        // 503 = model sedang overload / high demand
        const isFastSkip =
          errMsg.includes('429') ||
          errMsg.includes('503') ||
          errMsg.toLowerCase().includes('too many requests') ||
          errMsg.toLowerCase().includes('service unavailable') ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('overloaded');

        if (isFastSkip) {
          const code = errMsg.includes('429') ? '429' : errMsg.includes('503') ? '503' : 'limit';
          console.warn(`[Gemini SDK] ${candidateModel} skip (${code}). Mencoba model berikutnya...`);
        } else {
          console.error(`[Gemini SDK] Error ${candidateModel}:`, err);
        }

        lastError = err instanceof Error ? err : new Error(errMsg);
      }
    }

    throw lastError ?? new Error('All Gemini models in fallback chain failed');
  }

  private async generateSingleSection(
    apiKey: string,
    model: string,
    prompt: string,
    title: string,
    options: { techStack?: string; targetUser?: string; locale?: string },
    sectionConfig: typeof SECTIONS_CONFIG[number],
    contextSections: PRDSection[],
  ): Promise<string> {
    const name = title || 'New Digital Solution';
    const tech = options.techStack || 'React, Node.js, PostgreSQL';
    const user = options.targetUser || 'General Users';

    const contextText = contextSections.length > 0
      ? '\n\nFor 100% logical consistency, here are the PRD sections generated previously:\n' +
      contextSections.map(s => `=== SECTION: ${s.id} (${s.title}) ===\n${s.content}`).join('\n\n')
      : '';

    const userPrompt =
      `We are building a product:\n` +
      `Product/Feature Name: ${this.sanitizeInput(name)}\n` +
      `Target Users: ${this.sanitizeInput(user)}\n` +
      `Tech Stack: ${this.sanitizeInput(tech)}\n` +
      `Feature Idea: ${this.sanitizeInput(prompt)}\n` +
      `${contextText}\n\n` +
      `Now, create the specific content for the following section:\n` +
      `Section ID: "${sectionConfig.id}"\n` +
      `Section Title: "${sectionConfig.title}"\n` +
      `Content Instructions:\n${sectionConfig.prompt}\n\n` +
      `Remember: Generate ONLY the clean markdown content for the section "${sectionConfig.title}" above. ` +
      `Do not include the section title at the start of your output.`;

    const isIndonesian = options.locale === 'id';
    const systemInstruction = isIndonesian
      ? SYSTEM_INSTRUCTIONS_SINGLE_SECTION.replace(
          '- Use professional English and clean Markdown.',
          '- Use professional Indonesian (Bahasa Indonesia) and clean Markdown.',
        )
      : SYSTEM_INSTRUCTIONS_SINGLE_SECTION;

    const result = await this.generateWithSDK(apiKey, model, {
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction,
      generationConfig: { maxOutputTokens: sectionConfig.maxTokens },
    });

    console.log(
      `[Gemini] Bagian: ${sectionConfig.id}, ` +
      `finishReason: ${result.finishReason ?? '(tidak tersedia)'}, ` +
      `panjang: ${result.text.length} karakter`,
    );

    return this.cleanMarkdownString(result.text);
  }

  async generatePRD(
    apiKey: string,
    model: string,
    prompt: string,
    title: string,
    options: { techStack?: string; targetUser?: string; locale?: string },
  ): Promise<PRDSection[]> {
    this.validateApiKey(apiKey);

    const promises = SECTIONS_CONFIG.map(async (config) => {
      try {
        const text = await this.generateSingleSection(
          apiKey, model, prompt, title, options, config, [],
        );
        return { id: config.id, title: config.title, content: text };
      } catch (err) {
        console.error(`Error generating section ${config.id}:`, err);
        return {
          id: config.id,
          title: config.title,
          content: `*Note: Failed to generate this section automatically. (${(err as Error).message})*`,
        };
      }
    });

    return Promise.all(promises);
  }

  async getChatRevision(
    apiKey: string,
    model: string,
    userMessage: string,
    currentPRD: { title: string; description: string; sections: PRDSection[] },
  ): Promise<{
    reply: string;
    suggestedDiff?: {
      sectionId: string;
      oldContent: string;
      newContent: string;
      summary: string;
    } | null;
  }> {
    this.validateApiKey(apiKey);

    const MAX_SECTION_CHARS = 3000;
    const sectionsText = currentPRD.sections
      .map(s => {
        const truncated = s.content.length > MAX_SECTION_CHARS
          ? s.content.slice(0, MAX_SECTION_CHARS) + '\n... [dipotong untuk efisiensi]'
          : s.content;
        return `=== BAGIAN: ${s.id} (${s.title}) ===\n${truncated}`;
      })
      .join('\n\n');

    const systemPrompt =
      `You are an AI PO/PM assistant helping developers.\n` +
      `The user wants to revise a section of the PRD document.\n\n` +
      `Return ONLY a valid JSON with the following structure:\n` +
      `{\n` +
      `  "reply": "Friendly explanation of what was changed",\n` +
      `  "suggestedDiff": {\n` +
      `    "sectionId": "section_id",\n` +
      `    "oldContent": "exact old content",\n` +
      `    "newContent": "COMPLETE content of the section after applying the revision (MUST include all unmodified parts of the section, do not truncate, omit, or summarize)",\n` +
      `    "summary": "brief summary of revision"\n` +
      `  }\n` +
      `}\n\n` +
      `IMPORTANT: The 'newContent' field must contain the full markdown content of the modified section, not just the new changes or additions. Keep all original unmodified parts of this section intact within the 'newContent'.\n\n` +
      `If no PRD changes are required, set suggestedDiff to null.\n` +
      `Do not output any text outside of the JSON block.`;

    const userContent =
      `PRD: "${currentPRD.title}" (${currentPRD.description})\n\n` +
      `${sectionsText}\n\n` +
      `User instructions: "${userMessage}"`;

    const work = async () => {
      const result = await this.generateWithSDK(apiKey, model, {
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        systemInstruction: systemPrompt,
      });

      const cleaned = this.cleanJsonString(result.text);
      try {
        return JSON.parse(cleaned);
      } catch (err) {
        throw new Error(
          `Failed to parse revision response from Gemini: ${(err as Error).message}`,
        );
      }
    };

    let timeoutHandle: ReturnType<typeof setTimeout>;

    const timeoutGuard = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error('getChatRevision timeout after 2 minutes')),
        FETCH_TIMEOUT_MS,
      );
    });

    try {
      return await Promise.race([work(), timeoutGuard]);
    } finally {
      clearTimeout(timeoutHandle!);
    }
  }

  generatePRDStream(
    res: ExpressResponse,
    apiKey: string,
    model: string,
    prompt: string,
    title: string,
    options: { techStack?: string; targetUser?: string; locale?: string },
    onFinished: () => void,
  ): void {
    const requestOrigin = (res as unknown as { req?: { headers?: { origin?: string } } })
      .req?.headers?.origin ?? '';

    if (!ALLOWED_ORIGINS.has(requestOrigin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Origin not allowed' }));
      return;
    }

    try {
      this.validateApiKey(apiKey);
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (err as Error).message }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Credentials': 'true',
    });

    const safeWrite = (data: string): boolean => {
      if (res.headersSent && !res.writableEnded) {
        res.write(data);
        return true;
      }
      return false;
    };

    const safeEnd = (): void => {
      if (!res.writableEnded) res.end();
    };

    const currentSections: PRDSection[] = SECTIONS_CONFIG.map(s => ({
      id: s.id,
      title: s.title,
      content: '',
    }));

    let isDisconnected = false;
    res.on('close', () => { isDisconnected = true; });

    // Send the initial empty sections immediately
    safeWrite(`data: ${JSON.stringify(currentSections)}\n\n`);

    const runBackgroundGeneration = async (): Promise<void> => {
      try {
        const promises = SECTIONS_CONFIG.map(async (config, index) => {
          if (isDisconnected) return;
          try {
            // Generate each section in parallel
            const text = await this.generateSingleSection(
              apiKey, model, prompt, title, options, config, [],
            );
            if (isDisconnected) return;
            currentSections[index].content = text;

            // Immediately notify client of updated content
            safeWrite(`data: ${JSON.stringify(currentSections)}\n\n`);
          } catch (err) {
            console.error(`[Stream] Error generating section ${config.id}:`, err);
            if (isDisconnected) return;
            currentSections[index].content =
              `*Note: Failed to generate this section automatically. (${(err as Error).message})*`;

            safeWrite(`data: ${JSON.stringify(currentSections)}\n\n`);
          }
        });

        await Promise.all(promises);

        if (!isDisconnected) {
          safeWrite(`data: ${JSON.stringify({ finished: true })}\n\n`);
          safeEnd();
          onFinished();
        }
      } catch (err) {
        console.error('[Stream] Fatal background generation error:', err);
        if (!isDisconnected) {
          safeWrite(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`);
          safeEnd();
        }
      }
    };

    runBackgroundGeneration();
  }
}