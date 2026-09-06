import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { contentStore, ProfileData } from '../../cms/store';
import { ProfileSchema } from '../../cms/schemas';
import { TextInput, TextareaInput, ProvenanceEditor } from '../../components/admin/FormFields';
import { Save, CheckCircle2 } from 'lucide-react';
import { ZodIssue } from 'zod';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(contentStore.getProfile());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    const result = ProfileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    contentStore.saveProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <AdminLayout
      title="Profile & Identity Anchors"
      subtitle="Edit primary identity, biographical narratives, and verified professional channels"
      action={
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Profile</span>
        </button>
      }
    >
      <div className="space-y-6">
        {savedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

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

        <ProvenanceEditor
          data={profile}
          onChange={(provenance) => setProfile((prev) => ({ ...prev, ...provenance }))}
        />
      </div>
    </AdminLayout>
  );
};
