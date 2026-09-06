import { Env } from '../types';
import { DatabaseService } from './db';

/**
 * Server-Side GitHub App Publishing Adapter with Transactional Failure Safety.
 * 
 * NEVER executes in the browser.
 * Generates temporary GitHub App Installation tokens server-side using the private key.
 * Directly commits verified canonical content to the repository branch.
 * Enforces strict failure safety: Never marks records as published if git commit fails.
 */
export class GitHubPublisherService {
  constructor(
    private env: Env,
    private dbService: DatabaseService
  ) {}

  /**
   * Publishes all verified, published content of a given domain to the GitHub repository.
   */
  async publishDomainToGitHub(
    contentType: string,
    contentId: string,
    userEmail: string
  ): Promise<{ success: boolean; commitSha?: string; message: string; jobId: string }> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create a pending publish job record
    await this.dbService.createPublishJob({
      id: jobId,
      triggeredBy: userEmail,
      contentType,
      contentId,
      status: 'pending',
    });

    // 2. Validate GitHub App Configuration
    if (!this.env.GITHUB_APP_ID || !this.env.GITHUB_APP_INSTALLATION_ID || !this.env.GITHUB_APP_PRIVATE_KEY_PEM) {
      const err = 'GitHub App server-side credentials are not configured. Set GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, and GITHUB_APP_PRIVATE_KEY_PEM in Cloudflare secrets.';
      await this.dbService.updatePublishJob(jobId, { status: 'failed', errorMessage: err });
      return { success: false, message: err, jobId };
    }

    // 3. Fetch all published + verified items for this domain
    const publishedItems = await this.dbService.getContentList(contentType, 'published', true);

    // 4. Generate canonical file path in repository
    const filePath = `src/content/${contentType === 'project' ? 'projects/index.ts' : `${contentType}.ts`}`;
    const fileContent = this.generateCanonicalContentModule(contentType, publishedItems);

    try {
      // 5. Get GitHub Installation Access Token
      const installationToken = await this.getInstallationToken();

      // 6. Check if file already exists in repository to get current SHA
      const owner = this.env.GITHUB_REPO_OWNER;
      const repo = this.env.GITHUB_REPO_NAME;
      const branch = this.env.GITHUB_REPO_BRANCH || 'main';

      const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
      
      const existingFileRes = await fetch(fileUrl, {
        headers: {
          Authorization: `token ${installationToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Tanishk-Portfolio-CMS-Publisher',
        },
      });

      let existingSha: string | undefined;
      if (existingFileRes.ok) {
        const existingData: any = await existingFileRes.json();
        existingSha = existingData.sha;
      }

      // 7. Commit and push updated canonical file
      const commitMessage = `cms(publish): update ${contentType} via private CMS [skip ci]\n\nPublished by: ${userEmail}\nTimestamp: ${new Date().toISOString()}`;
      const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${installationToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Tanishk-Portfolio-CMS-Publisher',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch,
          sha: existingSha,
        }),
      });

      if (!putRes.ok) {
        const errBody = await putRes.text();
        const errorMsg = `GitHub API commit failed (${putRes.status}): ${errBody}`;
        await this.dbService.updatePublishJob(jobId, { status: 'failed', errorMessage: errorMsg });
        return { success: false, message: errorMsg, jobId };
      }

      const putData: any = await putRes.json();
      const commitSha = putData.commit?.sha || putData.content?.sha;

      // 8. Record Publication Success in publish_jobs and audit_logs
      await this.dbService.updatePublishJob(jobId, {
        status: 'committed',
        gitCommitSha: commitSha,
        gitCommitMessage: commitMessage,
      });

      await this.dbService.recordAuditLog({
        userEmail,
        action: `GITHUB_PUBLISHED_${contentType.toUpperCase()}`,
        contentType,
        contentId: filePath,
        previousStatus: null,
        newStatus: 'PUBLISHED_TO_GIT',
        metadata: { commitSha, branch, totalItems: publishedItems.length, jobId },
      });

      return {
        success: true,
        commitSha,
        message: `Successfully published ${publishedItems.length} verified ${contentType} items to ${filePath} (Commit: ${commitSha?.substring(0, 7)})`,
        jobId,
      };
    } catch (e: any) {
      console.error('GitHub publishing error:', e);
      const errorMsg = `GitHub publishing exception: ${e.message}`;
      await this.dbService.updatePublishJob(jobId, { status: 'failed', errorMessage: errorMsg });
      return {
        success: false,
        message: errorMsg,
        jobId,
      };
    }
  }

  private async getInstallationToken(): Promise<string> {
    const appId = this.env.GITHUB_APP_ID!;
    const installationId = this.env.GITHUB_APP_INSTALLATION_ID!;
    const privateKeyPem = this.env.GITHUB_APP_PRIVATE_KEY_PEM!;

    const appJwt = await this.generateAppJwt(appId, privateKeyPem);

    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Tanishk-Portfolio-CMS-Publisher',
        },
      }
    );

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Failed to obtain GitHub App installation token: ${errText}`);
    }

    const data: any = await tokenRes.json();
    return data.token;
  }

  private async generateAppJwt(appId: string, pemKey: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    };

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const message = `${encodedHeader}.${encodedPayload}`;

    const cleanPem = pemKey
      .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
      .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '');

    const binaryKey = Uint8Array.from(atob(cleanPem), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(message)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${message}.${encodedSignature}`;
  }

  private generateCanonicalContentModule(contentType: string, items: any[]): string {
    const jsonPretty = JSON.stringify(items, null, 2);
    return `// CANONICAL PRODUCTION CONTENT — AUTO-GENERATED BY PRIVATE CMS
// DO NOT MANUALLY EDIT THIS FILE DIRECTLY.
// Source: Cloudflare D1 Private Database -> GitHub App Publishing Pipeline

export const ${contentType}Data = ${jsonPretty};
`;
  }
}
