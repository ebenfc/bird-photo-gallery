"use client";

import { useState, useEffect } from "react";
import { US_STATES } from "@/config/usStates";

export default function LocationSettings() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedCity, setSavedCity] = useState("");
  const [savedState, setSavedState] = useState("");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (res.ok) {
          const data = await res.json();
          setCity(data.city || "");
          setState(data.state || "");
          setSavedCity(data.city || "");
          setSavedState(data.state || "");
        }
      } catch (error) {
        console.error("Failed to load location settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const hasChanges = city !== savedCity || state !== savedState;

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city || null,
          state: state || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSavedCity(data.city || "");
        setSavedState(data.state || "");
        setSaveMessage({ type: "success", text: "Location saved!" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-[var(--mist-100)] rounded-[var(--radius-md)]" />
        <div className="h-10 bg-[var(--mist-100)] rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--mist-600)]">
        Your location helps other birders find your gallery in the Discover directory.
        Only your city and state are shown — never your exact address.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Portland"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-[var(--text-primary)] bg-[var(--card-bg)]
              focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
              transition-all duration-[var(--timing-fast)]"
          />
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-[var(--text-primary)] bg-[var(--card-bg)]
              focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
              transition-all duration-[var(--timing-fast)]"
          >
            <option value="">Select a state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-4 py-2.5 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
            text-white rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-sm)]
            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-95"
        >
          {saving ? "Saving..." : "Save Location"}
        </button>

        {saveMessage && (
          <p
            className={`text-sm font-medium ${
              saveMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {saveMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}
