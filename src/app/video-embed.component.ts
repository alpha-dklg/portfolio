import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-embed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-embed.component.html',
  styleUrls: ['./video-embed.component.css']
})
export class VideoEmbedComponent implements OnChanges {
  @Input() videoId?: string; // ID de la vidéo YouTube ou URL complète
  @Input() title: string = 'Vidéo de présentation';

  safeUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.videoId) {
      const extractedId = this.extractYouTubeId(this.videoId);
      if (extractedId) {
        const url = `https://www.youtube.com/embed/${extractedId}`;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    }
  }

  private extractYouTubeId(urlOrId?: string): string | null {
    if (!urlOrId) {
      return null;
    }

    // Si c'est déjà un ID simple (pas d'URL), on le retourne tel quel
    if (!urlOrId.includes('youtube.com') && !urlOrId.includes('youtu.be')) {
      return urlOrId;
    }

    // Extraction de l'ID depuis différentes formats d'URL YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
