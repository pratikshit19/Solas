import { pipeline } from '@huggingface/transformers';

class LocalSentry {
  private static instance: LocalSentry;
  private classifier: any = null;
  private isLoading = false;

  private constructor() {}

  public static getInstance(): LocalSentry {
    if (!LocalSentry.instance) {
      LocalSentry.instance = new LocalSentry();
    }
    return LocalSentry.instance;
  }

  public async init() {
    if (typeof window === 'undefined' || this.classifier || this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Using a small, fast model for browser-based emotion classification
      this.classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      console.log('✅ In-House Local Sentry Initialized');
    } catch (error) {
      console.error('❌ Local Sentry Initialization Failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public async analyze(text: string) {
    if (!this.classifier) {
      await this.init();
    }

    if (!this.classifier) return null;

    try {
      const results = await this.classifier(text);
      // Map basic sentiment to refined therapeutic emotions for our 'In-House' logic
      const primary = results[0];
      return {
        label: primary.label,
        score: primary.score,
        isPositive: primary.label === 'POSITIVE',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Local Analysis Error:', error);
      return null;
    }
  }
}

export const localSentry = LocalSentry.getInstance();
