import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setTitle(newTitle: string) {
    this.title.setTitle(newTitle);
  }

  setMetaTags(tags: Array<{ name?: string; property?: string; content: string }>) {
    tags.forEach(tag => {
      if (tag.property) {
        this.meta.updateTag({ property: tag.property, content: tag.content });
      } else if (tag.name) {
        this.meta.updateTag({ name: tag.name, content: tag.content });
      }
    });
  }

  setStructuredData(data: any) {
    // Only manipulate DOM in browser, not during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const id = 'seo-structured-data';
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.text = JSON.stringify(data);
  }
}
