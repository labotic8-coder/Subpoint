import React, { useState, useRef, useCallback } from "react";
import "./ProfileSettings.css";

/* ------------------------------------------------------------------ */
/* Inline icon set (no external icon dependency)                      */
/* ------------------------------------------------------------------ */

const Icon = {
  Camera: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.19a1 1 0 0 0 .87-.5l.79-1.38A1 1 0 0 1 10.22 4.6h3.56a1 1 0 0 1 .87.62l.79 1.38a1 1 0 0 0 .87.5h2.19A1.5 1.5 0 0 1 20 8.5v8A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.2" r="3.1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.2c1.2-3.2 4-4.8 7-4.8s5.8 1.6 7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Mail: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7l7.5 5.5L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Phone: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 3.5H6a1.5 1.5 0 0 0-1.5 1.5c0 8.28 6.72 15 15 15A1.5 1.5 0 0 0 21 18.5v-2a1 1 0 0 0-.76-.97l-3.2-.8a1 1 0 0 0-1 .27l-1.1 1.1a12.4 12.4 0 0 1-5.34-5.34l1.1-1.1a1 1 0 0 0 .27-1l-.8-3.2A1 1 0 0 0 8 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  At: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.4 12v1.4a2.6 2.6 0 0 0 5.1-.7V12a8.5 8.5 0 1 0-3.4 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Lock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="14.7" r="1.3" fill="currentColor" />
    </svg>
  ),
  Eye: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2.5 12S5.8 5.5 12 5.5 21.5 12 21.5 12 18.2 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  EyeOff: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3.5 3.5l17 17M9.9 5.6A10.4 10.4 0 0 1 12 5.5c6.2 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.3 4.1M6.6 6.6C4.4 8 2.5 10.5 2.5 12S5.8 18.5 12 18.5c1.2 0 2.3-.15 3.3-.45M9.6 9.6a2.8 2.8 0 0 0 3.9 3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Shield: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3.5l7 2.6v5.4c0 4.6-3 8-7 9.4-4-1.4-7-4.8-7-9.4V6.1l7-2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12.1l2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 12.3l2.5 2.5 5-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Alert: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M10.6 4.3a1.6 1.6 0 0 1 2.8 0l8.1 14.3a1.6 1.6 0 0 1-1.4 2.4H3.9a1.6 1.6 0 0 1-1.4-2.4l8.1-14.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 9.8v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="1" fill="currentColor" />
    </svg>
  ),
  Spinner: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  Clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Device: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 17.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Static config                                                      */
/* ------------------------------------------------------------------ */

const PERSONAL_FIELDS = [
  { id: "firstName", label: "First name", type: "text", icon: "User", autoComplete: "given-name" },
  { id: "lastName", label: "Last name", type: "text", icon: "User", autoComplete: "family-name" },
  { id: "username", label: "Username", type: "text", icon: "At", autoComplete: "username" },
  { id: "email", label: "Email address", type: "email", icon: "Mail", autoComplete: "email" },
  { id: "phone", label: "Phone number", type: "tel", icon: "Phone", autoComplete: "tel" },
];

const PASSWORD_FIELDS = [
  { id: "currentPassword", label: "Current password", hint: null },
  { id: "newPassword", label: "New password", hint: "Use at least 8 characters, with a number and a symbol." },
  { id: "confirmPassword", label: "Confirm new password", hint: null },
];

const SECURITY_ITEMS = [
  {
    id: "twoFactor",
    icon: "Shield",
    title: "Two-factor authentication",
    description: "Add an extra layer of protection to your account.",
    status: "Enabled",
    tone: "success",
  },
  {
    id: "lastLogin",
    icon: "Clock",
    title: "Last login",
    description: "Today, 09:42 AM from Warri, Nigeria.",
    status: "Verified",
    tone: "success",
  },
  {
    id: "devices",
    icon: "Device",
    title: "Active sessions",
    description: "1 device is currently signed in to your account.",
    status: "1 device",
    tone: "neutral",
  },
];

const INITIAL_PROFILE = {
  firstName: "Ejiro",
  lastName: "Otedo",
  username: "ejiro.otedo",
  email: "ejiro.otedo@example.com",
  phone: "+234 803 123 4567",
};

const INITIAL_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/* ------------------------------------------------------------------ */
/* Reusable pieces                                                    */
/* ------------------------------------------------------------------ */

function SectionCard({ icon, title, description, children, footer }) {
  const IconCmp = Icon[icon];
  return (
    <section className="ps-card">
      <header className="ps-card__header">
        {IconCmp && (
          <span className="ps-card__icon">
            <IconCmp width={18} height={18} />
          </span>
        )}
        <div>
          <h2 className="ps-card__title">{title}</h2>
          {description && <p className="ps-card__desc">{description}</p>}
        </div>
      </header>
      <div className="ps-card__body">{children}</div>
      {footer && <div className="ps-card__footer">{footer}</div>}
    </section>
  );
}

function FormField({ field, value, onChange, disabled }) {
  const IconCmp = Icon[field.icon];
  return (
    <label className="ps-field" htmlFor={field.id}>
      <span className="ps-field__label">{field.label}</span>
      <span className="ps-field__control">
        {IconCmp && (
          <span className="ps-field__icon">
            <IconCmp width={16} height={16} />
          </span>
        )}
        <input
          id={field.id}
          name={field.id}
          type={field.type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={field.autoComplete}
          className="ps-field__input"
          placeholder={field.label}
        />
      </span>
    </label>
  );
}

function PasswordField({ field, value, onChange, visible, onToggleVisible, disabled }) {
  return (
    <label className="ps-field" htmlFor={field.id}>
      <span className="ps-field__label">{field.label}</span>
      <span className="ps-field__control">
        <span className="ps-field__icon">
          <Icon.Lock width={16} height={16} />
        </span>
        <input
          id={field.id}
          name={field.id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete="new-password"
          className="ps-field__input"
          placeholder={field.label}
        />
        <button
          type="button"
          className="ps-field__toggle"
          onClick={onToggleVisible}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <Icon.EyeOff width={17} height={17} /> : <Icon.Eye width={17} height={17} />}
        </button>
      </span>
      {field.hint && <span className="ps-field__hint">{field.hint}</span>}
    </label>
  );
}

function StatusPill({ tone = "neutral", children }) {
  return <span className={`ps-pill ps-pill--${tone}`}>{children}</span>;
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className={`ps-toast ps-toast--${toast.type}`} role="status">
      <span className="ps-toast__icon">
        {isSuccess ? <Icon.Check width={18} height={18} /> : <Icon.Alert width={18} height={18} />}
      </span>
      <span className="ps-toast__message">{toast.message}</span>
      <button type="button" className="ps-toast__close" onClick={onDismiss} aria-label="Dismiss notification">
        &times;
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ProfileSettings() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [savedProfile, setSavedProfile] = useState(INITIAL_PROFILE);

  const [passwords, setPasswords] = useState(INITIAL_PASSWORDS);
  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const isDirty =
    JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
    passwords.currentPassword ||
    passwords.newPassword ||
    passwords.confirmPassword;

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (id) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please choose a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};

    if (!profile.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!profile.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!profile.username.trim()) nextErrors.username = "Username is required.";
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) nextErrors.email = "Enter a valid email address.";
    if (!profile.phone.trim()) nextErrors.phone = "Phone number is required.";

    const wantsPasswordChange =
      passwords.currentPassword || passwords.newPassword || passwords.confirmPassword;

    if (wantsPasswordChange) {
      if (!passwords.currentPassword) nextErrors.currentPassword = "Enter your current password.";
      if (passwords.newPassword.length < 8) nextErrors.newPassword = "Use at least 8 characters.";
      if (passwords.newPassword !== passwords.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validate()) {
      showToast("error", "Please fix the highlighted fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      // Replace with real API call, e.g. await api.updateProfile({ profile, passwords })
      await new Promise((resolve) => setTimeout(resolve, 1400));

      setSavedProfile(profile);
      setPasswords(INITIAL_PASSWORDS);
      showToast("success", "Your profile has been updated successfully.");
    } catch (err) {
      showToast("error", "Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(savedProfile);
    setPasswords(INITIAL_PASSWORDS);
    setErrors({});
    showToast("success", "Changes discarded.");
  };

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="ps-page">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="ps-page__intro">
        <h1 className="ps-page__title">Profile settings</h1>
        <p className="ps-page__subtitle">
          Manage your personal information, login details, and account security.
        </p>
      </div>

      <form className="ps-layout" onSubmit={handleSave}>
        {/* Profile summary */}
        <section className="ps-card ps-summary">
          <div className="ps-summary__avatar-wrap">
            <div className="ps-summary__avatar">
              {avatar ? (
                <img src={avatar} alt="Profile avatar" />
              ) : (
                <span className="ps-summary__initials">{initials || "U"}</span>
              )}
            </div>
            <button
              type="button"
              className="ps-summary__avatar-btn"
              onClick={handleAvatarClick}
              aria-label="Change profile photo"
            >
              <Icon.Camera width={15} height={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="ps-visually-hidden"
            />
          </div>

          <div className="ps-summary__info">
            <h2 className="ps-summary__name">
              {savedProfile.firstName} {savedProfile.lastName}
            </h2>
            <p className="ps-summary__username">@{savedProfile.username}</p>

            <div className="ps-summary__meta">
              <span className="ps-summary__meta-item">
                <Icon.Mail width={14} height={14} /> {savedProfile.email}
              </span>
              <span className="ps-summary__meta-item">
                <Icon.Phone width={14} height={14} /> {savedProfile.phone}
              </span>
            </div>

            <div className="ps-summary__badges">
              <StatusPill tone="success">
                <Icon.Check width={12} height={12} /> Verified account
              </StatusPill>
              <StatusPill tone="neutral">Member since Jan 2024</StatusPill>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <SectionCard
          icon="User"
          title="Personal information"
          description="Keep your account details accurate and up to date."
        >
          <div className="ps-grid">
            {PERSONAL_FIELDS.map((field) => (
              <div key={field.id} className={field.id === "email" || field.id === "username" ? "" : "ps-grid__half"}>
                <FormField
                  field={field}
                  value={profile[field.id]}
                  onChange={handleProfileChange}
                  disabled={isSaving}
                />
                {errors[field.id] && <p className="ps-field__error">{errors[field.id]}</p>}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Change password */}
        <SectionCard
          icon="Lock"
          title="Change password"
          description="Choose a strong password you don't use elsewhere."
        >
          <div className="ps-grid">
            {PASSWORD_FIELDS.map((field) => (
              <div key={field.id} className="ps-grid__half">
                <PasswordField
                  field={field}
                  value={passwords[field.id]}
                  onChange={handlePasswordChange}
                  visible={visibility[field.id]}
                  onToggleVisible={() => toggleVisibility(field.id)}
                  disabled={isSaving}
                />
                {errors[field.id] && <p className="ps-field__error">{errors[field.id]}</p>}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Account protection */}
        <SectionCard
          icon="Shield"
          title="Account protection"
          description="A quick overview of the security features on your account."
        >
          <ul className="ps-security-list">
            {SECURITY_ITEMS.map((item) => {
              const ItemIcon = Icon[item.icon];
              return (
                <li key={item.id} className="ps-security-item">
                  <span className="ps-security-item__icon">
                    <ItemIcon width={17} height={17} />
                  </span>
                  <div className="ps-security-item__text">
                    <p className="ps-security-item__title">{item.title}</p>
                    <p className="ps-security-item__desc">{item.description}</p>
                  </div>
                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        {/* Actions */}
        <div className="ps-actions">
          <p className="ps-actions__hint">
            {isDirty ? "You have unsaved changes." : "All changes are saved."}
          </p>
          <div className="ps-actions__buttons">
            <button
              type="button"
              className="ps-btn ps-btn--ghost"
              onClick={handleReset}
              disabled={isSaving || !isDirty}
            >
              Cancel
            </button>
            <button type="submit" className="ps-btn ps-btn--primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icon.Spinner width={16} height={16} className="ps-spin" />
                  Saving changes…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}