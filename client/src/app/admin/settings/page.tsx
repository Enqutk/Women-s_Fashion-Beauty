"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import styles from "../admin.module.css";

type AdminSettings = {
  storeName: string;
  supportEmail: string;
  currency: string;
  autoCancelHours: number;
  enableOrderEmails: boolean;
  enableLowStockAlerts: boolean;
};

const STORAGE_KEY = "admin:settings";

const defaultSettings: AdminSettings = {
  storeName: "Beauty Store",
  supportEmail: "support@beauty.com",
  currency: "USD",
  autoCancelHours: 24,
  enableOrderEmails: true,
  enableLowStockAlerts: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<AdminSettings>;
      setSettings((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      // Ignore malformed local state and keep defaults.
    }
  }, []);

  function updateSetting<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]): void {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function onSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedMessage("Settings saved successfully.");
    setTimeout(() => setSavedMessage(null), 1800);
  }

  return (
    <AdminShell title="Settings">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.muted}>
              Configure storefront preferences, operational defaults, and admin controls.
            </p>
          </div>
        </header>

        <section className={styles.card}>
          <h2 className={styles.sectionHeading}>Platform Settings</h2>
          <p className={styles.muted}>Update operational defaults and storefront preferences.</p>

          {savedMessage ? <p className={`${styles.alert} ${styles.ok}`}>{savedMessage}</p> : null}

          <form className={styles.formGrid} onSubmit={onSave}>
            <label>
              Store name
              <input
                required
                type="text"
                value={settings.storeName}
                onChange={(event) => updateSetting("storeName", event.target.value)}
              />
            </label>

            <label>
              Support email
              <input
                required
                type="email"
                value={settings.supportEmail}
                onChange={(event) => updateSetting("supportEmail", event.target.value)}
              />
            </label>

            <label>
              Currency
              <select
                value={settings.currency}
                onChange={(event) => updateSetting("currency", event.target.value)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </label>

            <label>
              Auto-cancel unpaid orders (hours)
              <input
                required
                type="number"
                min={1}
                max={168}
                value={settings.autoCancelHours}
                onChange={(event) => updateSetting("autoCancelHours", Number(event.target.value))}
              />
            </label>

            <label className={styles.settingToggle}>
              <input
                type="checkbox"
                checked={settings.enableOrderEmails}
                onChange={(event) => updateSetting("enableOrderEmails", event.target.checked)}
              />
              <span>Send order status emails to customers</span>
            </label>

            <label className={styles.settingToggle}>
              <input
                type="checkbox"
                checked={settings.enableLowStockAlerts}
                onChange={(event) => updateSetting("enableLowStockAlerts", event.target.checked)}
              />
              <span>Enable low-stock alerts for admins</span>
            </label>

            <div className={styles.actions}>
              <button type="submit" className={styles.narrowButton}>
                Save settings
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminShell>
  );
}
