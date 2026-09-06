import React, { useState } from 'react';
import { profileData } from '../content/profile';
import { Mail, Github, Linkedin, ArrowUpRight, MapPin, Calendar, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cmsApiClient } from '../cms/apiClient';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    subject: '',
    inquiryType: 'Project / Engineering',
    message: '',
    website: '', // Honeypot
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formStatus, setFormStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const googleBookingUrl = (import.meta as any).env?.VITE_GOOGLE_BOOKING_URL || '';

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name is required (at least 2 characters).';
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'A valid email address is required.';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 2) {
      errs.subject = 'Subject is required.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus('SUBMITTING');
    setErrorMessage('');

    try {
      const res = await cmsApiClient.submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        inquiryType: formData.inquiryType || undefined,
        message: formData.message.trim(),
        website: formData.website || undefined,
      });

      if (res.success) {
        setFormStatus('SUCCESS');
        setFormData({
          name: '',
          email: '',
          organization: '',
          phone: '',
          subject: '',
          inquiryType: 'Project / Engineering',
          message: '',
          website: '',
        });
      } else {
        setFormStatus('ERROR');
        setErrorMessage(res.error || 'Something went wrong while sending your message. Please try again.');
      }
    } catch {
      setFormStatus('ERROR');
      setErrorMessage('Something went wrong while sending your message. Please try again.');
    }
  };

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Header */}
      <div className="space-y-4 pb-8 border-b border-paper-400">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span>CONTACT & INQUIRIES</span>
          <span>·</span>
          <span>CHANNELS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink-900 tracking-tight">
          Initiate Dialogue
        </h1>
        <p className="text-lg sm:text-xl text-ink-600 font-serifDisplay italic max-w-xl">
          "Open to engineering discussions, autonomous systems research, and challenging technical collaboration."
        </p>
      </div>

      {/* Primary Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        
        {/* Email Direct */}
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center text-ink-900">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">Direct Email</h2>
            <p className="text-xs text-ink-600 font-sans leading-relaxed">
              For research inquiries, project proposals, and scholarly questions.
            </p>
          </div>

          <div>
            <a
              href={`mailto:${profileData.email}`}
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-sans uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              <span>{profileData.email}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* GitHub Engineering */}
        <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center text-ink-900">
              <Github className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">GitHub Profile</h2>
            <p className="text-xs text-ink-600 font-sans leading-relaxed">
              Review open-source robotics control packages, algorithms, and models.
            </p>
          </div>

          <div>
            <a
              href={profileData.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-paper-100 hover:bg-paper-200 border border-paper-300 text-ink-900 text-xs font-sans uppercase tracking-wider font-semibold transition-all"
            >
              <span>github.com/Tanishk756</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Send an Inquiry Form Section */}
      <section aria-labelledby="inquiry-heading" className="p-8 sm:p-10 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-stone-500 tracking-wider">
            COMMUNICATION DISPATCH
          </div>
          <h2 id="inquiry-heading" className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
            Send an Inquiry
          </h2>
          <p className="text-sm text-ink-600 font-sans">
            Directly dispatch structured research questions, consulting opportunities, or engineering collaboration proposals.
          </p>
        </div>

        {formStatus === 'SUCCESS' ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900 font-display">Inquiry Received</h3>
            <p className="text-sm text-emerald-700 max-w-md mx-auto">
              Thanks — your message has been received. I will review it and respond promptly.
            </p>
            <button
              type="button"
              onClick={() => setFormStatus('IDLE')}
              className="mt-4 px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Honeypot field (hidden from screen readers and visual users) */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="website-hp">Website</label>
              <input
                id="website-hp"
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {formStatus === 'ERROR' && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3" role="alert">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage || 'Something went wrong while sending your message. Please try again.'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Full Name <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  autoComplete="name"
                  placeholder="e.g. Dr. Alex Vance"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-paper-50 border ${
                    errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-paper-300 focus:border-ink-900 focus:ring-ink-900'
                  } text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all`}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-xs text-rose-600 font-sans" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Email Address <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  autoComplete="email"
                  placeholder="e.g. alex.vance@mit.edu"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-paper-50 border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-paper-300 focus:border-ink-900 focus:ring-ink-900'
                  } text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all`}
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-xs text-rose-600 font-sans" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label htmlFor="contact-org" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Organization / University
                </label>
                <input
                  id="contact-org"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. MIT CSAIL / Robotics Lab"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-paper-50 border border-paper-300 focus:border-ink-900 focus:ring-ink-900 text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. +1 617-555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-paper-50 border border-paper-300 focus:border-ink-900 focus:ring-ink-900 text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Inquiry Type */}
              <div className="space-y-1.5">
                <label htmlFor="contact-inquiry-type" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Inquiry Type
                </label>
                <select
                  id="contact-inquiry-type"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-paper-50 border border-paper-300 focus:border-ink-900 focus:ring-ink-900 text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all"
                >
                  <option value="Project / Engineering">Project / Engineering</option>
                  <option value="Research / Collaboration">Research / Collaboration</option>
                  <option value="Speaking / Workshop">Speaking / Workshop</option>
                  <option value="Internship / Career">Internship / Career</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                  Subject <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  placeholder="e.g. ROS 2 Kinematics Research Collaboration"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (errors.subject) setErrors({ ...errors, subject: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-paper-50 border ${
                    errors.subject ? 'border-rose-400 focus:ring-rose-400' : 'border-paper-300 focus:border-ink-900 focus:ring-ink-900'
                  } text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all`}
                />
                {errors.subject && (
                  <p id="contact-subject-error" className="text-xs text-rose-600 font-sans" role="alert">
                    {errors.subject}
                  </p>
                )}
              </div>

            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-xs font-mono uppercase text-ink-700 font-semibold tracking-wider">
                Message <span className="text-rose-600" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                placeholder="Detail your engineering requirements, research focus, or discussion objectives..."
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl bg-paper-50 border ${
                  errors.message ? 'border-rose-400 focus:ring-rose-400' : 'border-paper-300 focus:border-ink-900 focus:ring-ink-900'
                } text-ink-900 text-sm focus:outline-none focus:ring-1 transition-all leading-relaxed`}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-xs text-rose-600 font-sans" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                * Required fields
              </span>

              <button
                type="submit"
                disabled={formStatus === 'SUBMITTING'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:bg-stone-400 text-paper-100 text-xs font-sans uppercase tracking-wider font-semibold transition-all shadow-sm"
              >
                {formStatus === 'SUBMITTING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </section>

      {/* Book a Call / Appointment Section */}
      <section aria-labelledby="booking-heading" className="p-8 sm:p-10 rounded-3xl bg-paper-100 border border-paper-300 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-stone-600 tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>DIRECT SCHEDULING</span>
            </div>
            <h2 id="booking-heading" className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
              Book a Conversation
            </h2>
            <p className="text-sm text-ink-700 font-sans">
              Prefer to talk directly? Choose a time that works for you on Google Calendar.
            </p>
          </div>

          <div>
            {googleBookingUrl ? (
              <a
                href={googleBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-ink-900 hover:bg-ink-800 text-paper-100 text-xs font-sans uppercase tracking-wider font-semibold transition-all shadow-sm group whitespace-nowrap"
              >
                <span>Book a Call</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <div className="px-5 py-3 rounded-full bg-paper-200 border border-paper-300 text-stone-600 text-xs font-mono">
                Direct calendar booking available via inquiry above
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Profiles Strip */}
      <div className="p-8 rounded-3xl bg-white border border-paper-400 shadow-xs space-y-4">
        <div className="text-xs font-mono uppercase text-stone-500 tracking-wider">
          ADDITIONAL VERIFIED ANCHORS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          {profileData.socials.linkedin && (
            <a
              href={profileData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-paper-100 border border-paper-200 hover:border-paper-400 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-ink-800" />
                <span className="font-semibold text-ink-900">LinkedIn Profile</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-ink-900" />
            </a>
          )}

          <div className="p-4 rounded-2xl bg-paper-100 border border-paper-200 flex items-center gap-2 text-stone-600">
            <MapPin className="w-4 h-4 text-ink-800" />
            <span>Location: {profileData.location}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
