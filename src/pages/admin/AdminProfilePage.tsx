import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsApiClient } from '../../cms/apiClient';
import { ProfileData } from '../../cms/store';
import { ProfileSchema } from '../../cms/schemas';
import { TextInput, TextareaInput } from '../../components/admin/FormFields';
import { Save, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ZodIssue } from 'zod';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApiClient.getContentList<ProfileData>('profile');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const p: any = res.data[0];
        const normalized: ProfileData = {
          ...p,
          id: p.id ? String(p.id) : undefined,
          fullName: String(p.fullName || p.full_name || 'Tanishk Singhal'),
          displayName: String(p.displayName || p.display_name || 'Tanishk Singhal'),
          headline: String(p.headline || ''),
          subheadline: String(p.subheadline || p.social_links_json?.subheadline || p.availability_status || 'Focused on aerial autonomy, multi-agent coordination, and embedded systems'),
          shortBio: String(p.shortBio || p.short_bio || ''),
          longBio: p.longBio || p.long_bio || '',
          location: String(p.location || 'India'),
          email: String(p.email || 'tanishksinghal6285@gmail.com'),
          websiteUrl: String(p.websiteUrl || p.website_url || ''),
          profileImage: p.profileImage || p.profile_image_url || p.avatar_url || '',
          socials: {
            github: String(p.socials?.github || p.github_url || 'https://github.com/Tanishk756'),
            linkedin: String(p.socials?.linkedin || p.linkedin_url || ''),
            googleScholar: String(p.socials?.googleScholar || p.google_scholar_url || ''),
            researchGate: String(p.socials?.researchGate || p.researchgate_url || ''),
            orcid: p.socials?.orcid || p.social_links_json?.orcid || '',
            twitter: p.socials?.twitter || p.social_links_json?.twitter || '',
          },
          source: String(p.source || 'USER_PROVIDED'),
          sourceUrl: String(p.sourceUrl || p.source_url || p.evidence_url || ''),
          verificationStatus: (p.verificationStatus || p.verification_status || 'USER_PROVIDED') as any,
          publicationStatus: (p.publicationStatus || p.publication_status || 'published') as any,
          lastVerified: String(p.lastVerified || p.last_verified || new Date().toISOString().split('T')[0]),
          notes: String(p.notes || p.verification_notes || ''),
        };
        setProfile(normalized);
      } else {
        // Safe default structure
        setProfile({
          fullName: 'Tanishk Singhal',
          displayName: 'Tanishk Singhal',
          headline: 'Robotics, Autonomous Systems & Embedded Software Engineer',
          subheadline: 'Focused on aerial autonomy, multi-agent coordination, and embedded systems',
          shortBio: 'Robotics and Embedded Systems Engineer specializing in ROS 2 kinematics and aerial autonomy.',
          location: 'India',
          email: 'tanishksinghal6285@gmail.com',
          websiteUrl: '',
          socials: {
            github: 'https://github.com/Tanishk756',
            linkedin: 'https://www.linkedin.com/in/tanishk-singhal-847385227/',
            googleScholar: 'https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en',
            researchGate: '',
          },
          source: 'USER_PROVIDED',
          sourceUrl: '',
          verificationStatus: 'USER_PROVIDED',
          publicationStatus: 'draft',
          lastVerified: new Date().toISOString().split('T')[0],
          notes: 'Owner verified profile anchor',
        });
      }
    } catch (e: any) {
      console.error('Error loading profile:', e);
      setError('Unable to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!profile) return;
    const enriched: ProfileData = {
      ...profile,
      publicationStatus: 'draft',
      verificationStatus: profile.verificationStatus || 'USER_PROVIDED',
      source: profile.source || 'USER_PROVIDED',
      lastVerified: profile.lastVerified || new Date().toISOString().split('T')[0],
    };
    const result = ProfileSchema.safeParse(enriched);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const res = await cmsApiClient.saveContentItem('profile', enriched);
      setSaving(false);

      if (!res.success) {
        console.error('Profile draft save failed:', res.error);
        setError('Unable to save your draft. Please try again.');
        return;
      }

      setProfile(enriched);
      setError(null);
      setSavedNotice('Draft saved successfully.');
      setTimeout(() => setSavedNotice(null), 3500);
    } catch (e: any) {
      setSaving(false);
      console.error('Profile draft save exception:', e);
      setError('Unable to save your draft. Please try again.');
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    const enriched: ProfileData = {
      ...profile,
      publicationStatus: 'approved',
      verificationStatus: profile.verificationStatus || 'USER_PROVIDED',
      source: profile.source || 'USER_PROVIDED',
      lastVerified: profile.lastVerified || new Date().toISOString().split('T')[0],
    };
    const result = ProfileSchema.safeParse(enriched);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setPublishing(true);
    try {
      // 1. Save as approved in draft store
      const saveRes = await cmsApiClient.saveContentItem('profile', enriched);
      if (!saveRes.success) {
        setPublishing(false);
        console.error('[PROFILE PUBLISH] saveContentItem failed', {
          error: saveRes.error,
          status: saveRes.status,
        });
        setError('Unable to prepare profile for publication. Please try again.');
        return;
      }

      // 2. Trigger publication workflow
      const pubRes = await cmsApiClient.publishContentItem(
        'profile',
        profile.id || 'profile_01',
        'approved',
        enriched.verificationStatus
      );
      setPublishing(false);

      if (!pubRes.success) {
        console.error('[PROFILE PUBLISH] publishContentItem failed', {
          error: pubRes.error,
          status: pubRes.status,
        });
        setError('Unable to publish your profile. Please try again.');
      } else {
        setSavedNotice('Profile published successfully.');
        setProfile({ ...enriched, publicationStatus: 'published' });
        setError(null);
      }
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (e: any) {
      setPublishing(false);
      console.error('[PROFILE PUBLISH] publish exception:', e);
      setError('Unable to publish your profile. Please try again.');
    }
  };

  return (
    <AdminLayout
      title="Profile & Identity Anchors"
      subtitle="Edit primary identity, biographical narratives, and verified professional channels"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={loading || saving || publishing || !profile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm disabled:opacity-50 transition-colors"
            title="Save changes as a draft without publishing"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'SAVE DRAFT'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={loading || saving || publishing || !profile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-medium shadow-sm disabled:opacity-50 transition-colors"
            title="Approve and trigger publication workflow"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{publishing ? 'Publishing...' : 'PUBLISH'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading profile data...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => { setError(null); loadProfile(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {savedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedNotice}</span>
          </div>
        )}

        {!loading && profile && (
          <>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
                Primary Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Full Legal Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              error={errors.fullName}
              required
            />
            <TextInput
              label="Display Name"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              error={errors.displayName}
              required
            />
            <TextInput
              label="Primary Email Address"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              error={errors.email}
              required
            />
            <TextInput
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              error={errors.location}
              required
            />
          </div>

          <TextInput
            label="Professional Headline"
            value={profile.headline}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            error={errors.headline}
            required
          />

          <TextInput
            label="Subheadline / Positioning"
            value={profile.subheadline}
            onChange={(e) => setProfile({ ...profile, subheadline: e.target.value })}
            error={errors.subheadline}
            required
          />

          <TextareaInput
            label="Executive Short Bio"
            value={profile.shortBio}
            onChange={(e) => setProfile({ ...profile, shortBio: e.target.value })}
            error={errors.shortBio}
            rows={3}
            required
          />

          <TextareaInput
            label="Detailed Narrative Bio & Philosophy (Separate paragraphs with double enter)"
            value={Array.isArray(profile.longBio) ? profile.longBio.join('\n\n') : (profile.longBio || '')}
            onChange={(e) => setProfile({ ...profile, longBio: e.target.value.split('\n\n').map(s => s.trim()).filter(Boolean) })}
            rows={5}
          />
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-100">
            Verified External Profiles & Academic Anchors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="GitHub Profile URL"
              value={profile.socials.github}
              onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, github: e.target.value } })}
              required
            />
            <TextInput
              label="LinkedIn Profile URL"
              value={profile.socials.linkedin || ''}
              onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, linkedin: e.target.value } })}
            />
            <TextInput
              label="Google Scholar URL"
              value={profile.socials.googleScholar || ''}
              onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, googleScholar: e.target.value } })}
            />
            <TextInput
              label="ResearchGate Profile URL"
              value={profile.socials.researchGate || ''}
              onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, researchGate: e.target.value } })}
            />
          </div>
        </div>
      </>
        )}
      </div>
    </AdminLayout>
  );
};
