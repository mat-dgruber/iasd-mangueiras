import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DailyVerse, StoryBackground, StoryFormat } from '../models/story.models';

export interface RenderStoryOptions {
  verse: DailyVerse;
  background: StoryBackground;
  format?: StoryFormat;
  overlayOpacity?: number;
  customImageUrl?: string | null;
  headerSubtitle?: string;
}

export type RenderOptions = RenderStoryOptions;

export interface ShareStoryOptions {
  blob: Blob;
  filename?: string;
  title?: string;
  text?: string;
}

export type ShareOptions = ShareStoryOptions;

@Injectable({
  providedIn: 'root',
})
export class StoryCanvasService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Renders a verse story or feed graphic into an HTML5 Canvas and exports as a PNG Blob.
   */
  async renderStoryToBlob(options: RenderStoryOptions): Promise<Blob> {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') {
      return new Blob([''], { type: 'image/png' });
    }

    const canvas = await this.renderCanvas(options);
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob([], { type: 'image/png' }));
      }, 'image/png');
    });
  }

  /**
   * Renders a verse story or feed graphic to a Data URL (base64 PNG) for instant preview.
   */
  async renderStoryToDataUrl(options: RenderStoryOptions): Promise<string> {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') {
      return '';
    }

    const canvas = await this.renderCanvas(options);
    return canvas.toDataURL('image/png');
  }

  /**
   * Shares story via Web Share API (File array) if supported; falls back to download.
   */
  async shareStory(options: ShareStoryOptions): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId) || typeof navigator === 'undefined') {
      return false;
    }

    const filename = options.filename || 'iasd-mangueiras-versiculo.png';
    const title = options.title || 'Versículo do Dia — IASD Mangueiras';
    const text =
      options.text ||
      'Versículo bíblico do dia compartilhado da Igreja Adventista do Sétimo Dia das Mangueiras.';

    try {
      if (navigator.share && typeof File !== 'undefined') {
        const file = new File([options.blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title,
            text,
          });
          return true;
        }
      }
    } catch (err: unknown) {
      // If user aborted/canceled native share modal, don't trigger download fallback
      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }
      console.warn('Native share failed or unsupported, falling back to download:', err);
    }

    // Fallback: download directly to device
    this.downloadStory(options.blob, filename);
    return false;
  }

  /**
   * Triggers browser direct file download for a generated Blob.
   */
  downloadStory(blob: Blob, filename: string): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /**
   * Generates a sanitized descriptive filename for export.
   */
  generateFilename(verse: DailyVerse, format: StoryFormat = 'story'): string {
    const cleanRef = verse.referencia
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `versiculo-${cleanRef}-${format}.png`;
  }

  /**
   * Main 2D Canvas rendering engine.
   */
  private async renderCanvas(options: RenderStoryOptions): Promise<HTMLCanvasElement> {
    const format = options.format || 'story';
    const width = 1080;
    const height = format === 'story' ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }

    const { verse, background } = options;
    const imageSrc = options.customImageUrl || (background.tipo === 'photo' ? background.imageUrl : null);

    // 1. Draw Base Background (Image with cover ratio or Linear Gradient)
    if (imageSrc) {
      await this.drawCoverBackground(ctx, imageSrc, width, height, background.canvasColors);
    } else {
      this.drawGradientBackground(ctx, background.canvasColors, width, height);
    }

    // 2. Contrast Dark Overlay (Adjustable opacity for WCAG AAA readability)
    const overlayOpacity =
      options.overlayOpacity !== undefined
        ? options.overlayOpacity
        : (background.defaultOverlayOpacity ?? 0.5);

    ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Perimeter Vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 4. Aesthetic Borders and Corner Accents
    const margin = 60;
    ctx.strokeStyle = background.accentColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.globalAlpha = 0.75;
    const cornerSize = 40;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();

    ctx.globalAlpha = 1.0;

    // 5. Institutional Header Branding
    const isFeed = format === 'feed';
    const headerTitleY = isFeed ? 140 : 220;
    const headerSubtitleY = isFeed ? 185 : 280;

    ctx.textAlign = 'center';
    ctx.fillStyle = background.accentColor;
    ctx.font = `bold ${isFeed ? 28 : 34}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('IASD MANGUEIRAS • TATUÍ', width / 2, headerTitleY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isFeed ? 18 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(options.headerSubtitle || 'VERSÍCULO DO DIA', width / 2, headerSubtitleY);
    ctx.globalAlpha = 1.0;

    // 6. Dynamic Typography Wrapping
    const maxTextWidth = 860;
    const text = verse.texto;
    const textLen = text.length;

    let fontSize = isFeed ? 44 : 54;
    let lineHeight = isFeed ? 64 : 80;

    if (textLen > 280) {
      fontSize = isFeed ? 28 : 36;
      lineHeight = isFeed ? 42 : 56;
    } else if (textLen > 180) {
      fontSize = isFeed ? 32 : 42;
      lineHeight = isFeed ? 48 : 64;
    } else if (textLen > 100) {
      fontSize = isFeed ? 38 : 48;
      lineHeight = isFeed ? 56 : 72;
    }

    ctx.font = `italic ${fontSize}px Georgia, Cambria, "Times New Roman", Times, serif`;
    const lines = this.calculateWrappedLines(ctx, text, maxTextWidth);
    const totalTextHeight = lines.length * lineHeight;
    const centerY = isFeed ? 520 : height / 2;
    const startY = centerY - totalTextHeight / 2 - (isFeed ? 10 : 20);

    // Decorative Upper Quotes
    ctx.fillStyle = background.accentColor;
    ctx.font = `bold ${isFeed ? 80 : 110}px Georgia, serif`;
    ctx.globalAlpha = 0.35;
    ctx.fillText('“', width / 2, startY - (isFeed ? 25 : 35));
    ctx.globalAlpha = 1.0;

    // Verse Text Lines
    ctx.fillStyle = background.primaryTextColor || '#FFFFFF';
    ctx.font = `italic ${fontSize}px Georgia, Cambria, "Times New Roman", Times, serif`;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // 7. Scripture Reference Pill
    const pillY = startY + totalTextHeight + (isFeed ? 50 : 65);
    const refText = `— ${verse.referencia} —`;
    ctx.font = `bold ${isFeed ? 28 : 34}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const refMetrics = ctx.measureText(refText);
    const pillWidth = Math.max(refMetrics.width + 60, isFeed ? 280 : 320);
    const pillHeight = isFeed ? 54 : 64;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.drawRoundedRect(
      ctx,
      width / 2 - pillWidth / 2,
      pillY - pillHeight * 0.68,
      pillWidth,
      pillHeight,
      pillHeight / 2,
    );
    ctx.fill();

    ctx.strokeStyle = background.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = background.accentColor;
    ctx.fillText(refText, width / 2, pillY);

    // 8. Institutional Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = `${isFeed ? 20 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('iasdmangueiras.org.br', width / 2, height - (isFeed ? 100 : 140));

    return canvas;
  }

  /**
   * Draws a photo background scaled with CSS 'cover' aspect ratio.
   */
  private async drawCoverBackground(
    ctx: CanvasRenderingContext2D,
    src: string,
    width: number,
    height: number,
    fallbackColors?: [string, string, string],
  ): Promise<void> {
    try {
      const img = await this.loadImage(src);
      const canvasRatio = width / height;
      const imgRatio = img.width / img.height;

      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;

      if (imgRatio > canvasRatio) {
        sWidth = img.height * canvasRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / canvasRatio;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
    } catch {
      // Graceful fallback to gradient on image load error or offline mode
      this.drawGradientBackground(ctx, fallbackColors, width, height);
    }
  }

  /**
   * Draws a 3-stop linear gradient background.
   */
  private drawGradientBackground(
    ctx: CanvasRenderingContext2D,
    colors: [string, string, string] | undefined,
    width: number,
    height: number,
  ): void {
    const activeColors = colors || ['#041d33', '#0b3d68', '#062642'];
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, activeColors[0]);
    gradient.addColorStop(0.5, activeColors[1]);
    gradient.addColorStop(1, activeColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Asynchronously loads an image from URL or Data URL with anonymous CORS.
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  /**
   * Calculates word wrapping lines for Canvas text rendering.
   */
  private calculateWrappedLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Draws a rounded rectangle path on the canvas context.
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
}
