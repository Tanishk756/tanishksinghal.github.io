import React from 'react';
import { clsx } from 'clsx';

export interface FormFieldProps {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  description,
  required,
  children,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase font-semibold text-slate-700 tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {children}
      {description && <p className="text-[11px] text-slate-500 font-sans">{description}</p>}
      {error && <p className="text-xs text-rose-600 font-mono">{error}</p>}
    </div>
  );
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, description, required, className, ...props }) => {
  return (
    <FormField label={label} error={error} description={description} required={required}>
      <input
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans bg-white transition-all outline-none',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-200',
          className
        )}
        {...props}
      />
    </FormField>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
}

export const TextareaInput: React.FC<TextareaProps> = ({ label, error, description, required, className, rows = 4, ...props }) => {
  return (
    <FormField label={label} error={error} description={description} required={required}>
      <textarea
        rows={rows}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans bg-white transition-all outline-none leading-relaxed',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-200',
          className
        )}
        {...props}
      />
    </FormField>
  );
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  description?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, options, error, description, required, className, ...props }) => {
  return (
    <FormField label={label} error={error} description={description} required={required}>
      <select
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans bg-white transition-all outline-none',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-200',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export interface ArrayInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  description?: string;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({
  label,
  values = [],
  onChange,
  placeholder = 'Add new item...',
  description,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onChange([...values, inputValue.trim()]);
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase font-semibold text-slate-700 tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
        {values.map((val, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-800 shadow-sm"
          >
            <span>{val}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-slate-400 hover:text-rose-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-slate-400 italic">No items added yet.</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-sans bg-white focus:outline-none focus:border-slate-900"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium hover:bg-slate-800"
        >
          Add
        </button>
      </div>
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
    </div>
  );
};

export interface ProvenanceEditorProps {
  data: {
    source: string;
    sourceUrl?: string;
    verificationStatus: string;
    lastVerified: string;
    notes?: string;
  };
  onChange: (updated: {
    source: string;
    sourceUrl?: string;
    verificationStatus: 'USER_PROVIDED' | 'GITHUB_VERIFIED' | 'PUBLIC_WEB_VERIFIED' | 'PROBABLE' | 'UNVERIFIED';
    lastVerified: string;
    notes?: string;
  }) => void;
}

export const ProvenanceEditor: React.FC<ProvenanceEditorProps> = ({ data, onChange }) => {
  return (
    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
        <div>
          <h4 className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">
            DATA PROVENANCE & AUDITING
          </h4>
          <p className="text-[11px] text-amber-800/80 font-sans">
            Controls public production visibility. Only USER_PROVIDED, GITHUB_VERIFIED, and PUBLIC_WEB_VERIFIED render publicly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Source Identifier"
          value={data.source}
          onChange={(e) => onChange({ ...data, source: e.target.value, verificationStatus: data.verificationStatus as any })}
          placeholder="e.g. GitHub Repository, Direct Input"
          required
        />
        <TextInput
          label="Source URL"
          value={data.sourceUrl || ''}
          onChange={(e) => onChange({ ...data, sourceUrl: e.target.value, verificationStatus: data.verificationStatus as any })}
          placeholder="https://..."
        />
        <SelectInput
          label="Verification Level"
          value={data.verificationStatus}
          onChange={(e) => onChange({ ...data, verificationStatus: e.target.value as any })}
          options={[
            { value: 'USER_PROVIDED', label: 'USER_PROVIDED (Verified by Owner)' },
            { value: 'GITHUB_VERIFIED', label: 'GITHUB_VERIFIED (Source Repository Confirmed)' },
            { value: 'PUBLIC_WEB_VERIFIED', label: 'PUBLIC_WEB_VERIFIED (Independently Verified)' },
            { value: 'PROBABLE', label: 'PROBABLE (Quarantined from Public Site)' },
            { value: 'UNVERIFIED', label: 'UNVERIFIED (Quarantined from Public Site)' },
          ]}
          required
        />
        <TextInput
          label="Last Verified Date"
          value={data.lastVerified}
          onChange={(e) => onChange({ ...data, lastVerified: e.target.value, verificationStatus: data.verificationStatus as any })}
          placeholder="YYYY-MM-DD"
          required
        />
      </div>

      <TextareaInput
        label="Auditor Notes / Verification Evidence"
        value={data.notes || ''}
        onChange={(e) => onChange({ ...data, notes: e.target.value, verificationStatus: data.verificationStatus as any })}
        placeholder="Document verification provenance, citations, or reason for quarantine..."
        rows={2}
      />
    </div>
  );
};
