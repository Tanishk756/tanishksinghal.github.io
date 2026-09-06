import { ContentItemRow, AuditLogRow, MediaRow } from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  /**
   * Fetch content items by domain type.
   * STRICT ISOLATION: When isPublic is true, drafts and unverified records are completely excluded.
   */
  async getContentList(
    contentType: string,
    statusFilter?: string,
    isPublic = false
  ): Promise<any[]> {
    let query: string;
    let params: any[];

    if (isPublic) {
      // Public site constraint: ONLY published + production-verified records
      query = `
        SELECT data_json FROM content_items
        WHERE content_type = ?
          AND publication_status = 'published'
          AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
        ORDER BY created_at DESC
      `;
      params = [contentType];
    } else {
      // Admin dashboard view: returns requested status or all items
      if (statusFilter && statusFilter !== 'all') {
        query = `
          SELECT * FROM content_items
          WHERE content_type = ? AND publication_status = ?
          ORDER BY updated_at DESC
        `;
        params = [contentType, statusFilter];
      } else {
        query = `
          SELECT * FROM content_items
          WHERE content_type = ?
          ORDER BY updated_at DESC
        `;
        params = [contentType];
      }
    }

    const { results } = await this.db.prepare(query).bind(...params).all<ContentItemRow>();
    
    return results.map((row) => {
      try {
        const parsed = JSON.parse(row.data_json);
        if (!isPublic) {
          parsed._systemMetadata = {
            id: row.id,
            contentType: row.content_type,
            publicationStatus: row.publication_status,
            verificationStatus: row.verification_status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            publishedAt: row.published_at,
          };
        }
        return parsed;
      } catch {
        return row;
      }
    });
  }

  async getContentItem(
    contentType: string,
    idOrSlug: string,
    isPublic = false
  ): Promise<any | null> {
    let query = `
      SELECT * FROM content_items
      WHERE content_type = ? AND (id = ? OR slug = ?)
    `;
    const params: any[] = [contentType, idOrSlug, idOrSlug];

    if (isPublic) {
      query += `
        AND publication_status = 'published'
        AND verification_status IN ('USER_PROVIDED', 'GITHUB_VERIFIED', 'PUBLIC_WEB_VERIFIED')
      `;
    }

    const row = await this.db.prepare(query).bind(...params).first<ContentItemRow>();
    if (!row) return null;

    try {
      const parsed = JSON.parse(row.data_json);
      if (!isPublic) {
        parsed._systemMetadata = {
          id: row.id,
          contentType: row.content_type,
          publicationStatus: row.publication_status,
          verificationStatus: row.verification_status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          publishedAt: row.published_at,
        };
      }
      return parsed;
    } catch {
      return row;
    }
  }

  async saveContentItem(
    contentType: string,
    itemData: any,
    userEmail: string
  ): Promise<{ id: string; isNew: boolean }> {
    const id = itemData.id || `${contentType}-${Date.now()}`;
    const slug = itemData.slug || null;
    const title = itemData.title || itemData.fullName || itemData.name || id;
    const summary = itemData.tagline || itemData.shortBio || itemData.summary || itemData.excerpt || null;
    const pubStatus = itemData.publicationStatus || 'draft';
    const verStatus = itemData.verificationStatus || 'USER_PROVIDED';
    const source = itemData.source || 'USER_PROVIDED';
    const sourceUrl = itemData.sourceUrl || null;
    const lastVerified = itemData.lastVerified || new Date().toISOString().split('T')[0];
    const notes = itemData.notes || null;

    const existing = await this.db
      .prepare('SELECT id, publication_status FROM content_items WHERE id = ?')
      .bind(id)
      .first<ContentItemRow>();

    const isNew = !existing;
    const now = new Date().toISOString();

    if (isNew) {
      await this.db
        .prepare(`
          INSERT INTO content_items (
            id, content_type, slug, title, summary, data_json,
            publication_status, verification_status, source, source_url,
            last_verified, provenance_notes, created_by, updated_by,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          id,
          contentType,
          slug,
          title,
          summary,
          JSON.stringify(itemData),
          pubStatus,
          verStatus,
          source,
          sourceUrl,
          lastVerified,
          notes,
          userEmail,
          userEmail,
          now,
          now
        )
        .run();

      await this.recordAuditLog({
        userEmail,
        action: `${contentType.toUpperCase()}_CREATED`,
        contentType,
        contentId: id,
        previousStatus: null,
        newStatus: pubStatus,
        metadata: { title, slug },
      });
    } else {
      await this.db
        .prepare(`
          UPDATE content_items SET
            slug = ?, title = ?, summary = ?, data_json = ?,
            publication_status = ?, verification_status = ?, source = ?,
            source_url = ?, last_verified = ?, provenance_notes = ?,
            updated_by = ?, updated_at = ?
          WHERE id = ?
        `)
        .bind(
          slug,
          title,
          summary,
          JSON.stringify(itemData),
          pubStatus,
          verStatus,
          source,
          sourceUrl,
          lastVerified,
          notes,
          userEmail,
          now,
          id
        )
        .run();

      await this.recordAuditLog({
        userEmail,
        action: `${contentType.toUpperCase()}_UPDATED`,
        contentType,
        contentId: id,
        previousStatus: existing.publication_status,
        newStatus: pubStatus,
        metadata: { title, slug },
      });
    }

    return { id, isNew };
  }

  async setPublicationStatus(
    id: string,
    newStatus: 'draft' | 'published' | 'archived',
    userEmail: string
  ): Promise<boolean> {
    const existing = await this.db
      .prepare('SELECT * FROM content_items WHERE id = ?')
      .bind(id)
      .first<ContentItemRow>();

    if (!existing) return false;

    const now = new Date().toISOString();
    const publishedAt = newStatus === 'published' ? now : existing.published_at;

    // Also update data_json payload with the publication status
    let updatedJson = existing.data_json;
    try {
      const parsed = JSON.parse(existing.data_json);
      parsed.publicationStatus = newStatus;
      updatedJson = JSON.stringify(parsed);
    } catch {}

    await this.db
      .prepare(`
        UPDATE content_items SET
          publication_status = ?,
          data_json = ?,
          published_at = ?,
          updated_by = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(newStatus, updatedJson, publishedAt, userEmail, now, id)
      .run();

    await this.recordAuditLog({
      userEmail,
      action: `${existing.content_type.toUpperCase()}_${newStatus.toUpperCase()}`,
      contentType: existing.content_type,
      contentId: id,
      previousStatus: existing.publication_status,
      newStatus,
      metadata: { title: existing.title },
    });

    return true;
  }

  async deleteContentItem(id: string, userEmail: string): Promise<boolean> {
    const existing = await this.db
      .prepare('SELECT * FROM content_items WHERE id = ?')
      .bind(id)
      .first<ContentItemRow>();

    if (!existing) return false;

    await this.db.prepare('DELETE FROM content_items WHERE id = ?').bind(id).run();

    await this.recordAuditLog({
      userEmail,
      action: `${existing.content_type.toUpperCase()}_DELETED`,
      contentType: existing.content_type,
      contentId: id,
      previousStatus: existing.publication_status,
      newStatus: null,
      metadata: { title: existing.title },
    });

    return true;
  }

  async recordAuditLog(log: {
    userEmail: string;
    action: string;
    contentType: string;
    contentId: string;
    previousStatus: string | null;
    newStatus: string | null;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await this.db
      .prepare(`
        INSERT INTO audit_logs (
          id, user_email, action, content_type, content_id,
          previous_status, new_status, metadata_json, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        log.userEmail,
        log.action,
        log.contentType,
        log.contentId,
        log.previousStatus,
        log.newStatus,
        log.metadata ? JSON.stringify(log.metadata) : null,
        log.ipAddress || null,
        log.userAgent || null
      )
      .run();
  }

  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLogRow[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all<AuditLogRow>();
    return results;
  }

  async getStats(): Promise<any> {
    const counts = await this.db
      .prepare(`
        SELECT content_type, publication_status, verification_status, count(*) as count
        FROM content_items
        GROUP BY content_type, publication_status, verification_status
      `)
      .all();

    const auditCount = await this.db
      .prepare('SELECT count(*) as total FROM audit_logs')
      .first<{ total: number }>();

    return {
      distribution: counts.results,
      totalAuditEvents: auditCount?.total || 0,
      timestamp: new Date().toISOString(),
    };
  }

  async createPublishJob(job: {
    id: string;
    triggeredBy: string;
    contentType: string;
    contentId: string;
    status: 'pending' | 'committed' | 'failed';
  }): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO publish_jobs (id, triggered_by, content_type, content_id, status)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(job.id, job.triggeredBy, job.contentType, job.contentId, job.status)
      .run();
  }

  async updatePublishJob(
    id: string,
    updates: {
      status: 'committed' | 'failed';
      gitCommitSha?: string;
      gitCommitMessage?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(`
        UPDATE publish_jobs SET
          status = ?,
          git_commit_sha = ?,
          git_commit_message = ?,
          error_message = ?,
          completed_at = ?
        WHERE id = ?
      `)
      .bind(
        updates.status,
        updates.gitCommitSha || null,
        updates.gitCommitMessage || null,
        updates.errorMessage || null,
        now,
        id
      )
      .run();
  }
}

