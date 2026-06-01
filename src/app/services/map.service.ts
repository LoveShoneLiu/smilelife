import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';

interface MapTarget {
  address: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly sanitizer = inject(DomSanitizer);

  readonly platform = Capacitor.getPlatform();

  get providerLabel(): string {
    return this.platform === 'ios' ? 'Apple Maps' : 'Google Maps';
  }

  get previewProviderLabel(): string {
    return 'Google Maps';
  }

  async openNavigation(target: MapTarget): Promise<void> {
    const fallbackUrl = this.googleWebUrl(target);
    const candidates = this.navigationCandidates(target);

    for (const candidate of candidates) {
      if (await this.tryOpen(candidate)) {
        return;
      }
    }

    await AppLauncher.openUrl({ url: fallbackUrl });
  }

  mapPreviewUrl(target: MapTarget): SafeResourceUrl {
    // Apple Maps web does not reliably render inside an iframe, so the MVP preview uses Google Maps.
    // Native navigation still prefers Apple Maps on iOS through AppLauncher.
    const rawUrl = this.googleEmbedUrl(target);
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  private navigationCandidates(target: MapTarget): string[] {
    if (this.platform === 'ios') {
      return [
        this.appleAppUrl(target),
        this.googleAppUrl(target),
      ];
    }

    if (this.platform === 'android') {
      return [
        `google.navigation:q=${encodeURIComponent(this.query(target))}`,
      ];
    }

    return [];
  }

  private async tryOpen(url: string): Promise<boolean> {
    try {
      const result = await AppLauncher.canOpenUrl({ url });

      if (!result.value) {
        return false;
      }

      const opened = await AppLauncher.openUrl({ url });
      return opened.completed;
    } catch {
      return false;
    }
  }

  private appleAppUrl(target: MapTarget): string {
    return `maps://?q=${encodeURIComponent(this.query(target))}`;
  }

  private googleAppUrl(target: MapTarget): string {
    return `comgooglemaps://?q=${encodeURIComponent(this.query(target))}`;
  }

  private googleWebUrl(target: MapTarget): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.query(target))}`;
  }

  private googleEmbedUrl(target: MapTarget): string {
    return `https://maps.google.com/maps?q=${encodeURIComponent(this.query(target))}&output=embed`;
  }

  private query(target: MapTarget): string {
    if (typeof target.latitude === 'number' && typeof target.longitude === 'number') {
      return `${target.latitude},${target.longitude}`;
    }

    return target.address;
  }
}
