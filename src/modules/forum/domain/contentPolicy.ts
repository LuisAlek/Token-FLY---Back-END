import { ValidationError } from '../../../shared/domain/errors';

export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 500;

const FORBIDDEN_PATTERNS: RegExp[] = [
  /(?:https?:\/\/|ftp:\/\/|www\.)\S+/i,
  /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|co|net|org|io|ly|me|tv|gg|app|dev|edu|gov|info|xyz|link|site|online|store)(?:[/?#]\S*)?/i,
  /!?\[[^\]]*\]\([^)]*\)/,
  /<\s*(?:a|img|video|audio|iframe|source|picture|svg|object|embed)\b[^>]*>/i,
  /\bdata:(?:image|video|audio|application)\//i,
  /\bbase64,/i,
  /\S+\.(?:png|jpe?g|gif|webp|svg|mp4|mov|avi|mkv|webm|mp3|wav|ogg)\b/i,
  /\b(?:javascript|vbscript):/i,
];

export type ContentInspection =
  | { ok: true; content: string }
  | { ok: false; message: string; field: 'content' };

export abstract class ContentRule {
  abstract inspect(content: string): string | null;
}

export class LengthRule extends ContentRule {
  inspect(content: string): string | null {
    if (content.length < COMMENT_MIN_LENGTH) {
      return 'El comentario no puede estar vacío. Escribe al menos 1 carácter.';
    }
    if (content.length > COMMENT_MAX_LENGTH) {
      return `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`;
    }
    return null;
  }
}

export class ForbiddenPatternRule extends ContentRule {
  constructor(private readonly patterns: RegExp[] = FORBIDDEN_PATTERNS) {
    super();
  }

  inspect(content: string): string | null {
    if (this.patterns.some((pattern) => pattern.test(content))) {
      return 'No se permiten enlaces, URLs, imágenes ni videos en el foro.';
    }
    return null;
  }
}

export class ContentPolicy {
  constructor(
    private readonly rules: ContentRule[] = [
      new LengthRule(),
      new ForbiddenPatternRule(),
    ],
  ) {}

  inspect(raw: string): ContentInspection {
    const content = raw.trim();

    for (const rule of this.rules) {
      const message = rule.inspect(content);
      if (message) {
        return { ok: false, field: 'content', message };
      }
    }

    return { ok: true, content };
  }

  assert(raw: string): string {
    const inspection = this.inspect(raw);
    if (!inspection.ok) {
      throw new ValidationError(
        { [inspection.field]: inspection.message },
        inspection.message,
      );
    }
    return inspection.content;
  }
}
