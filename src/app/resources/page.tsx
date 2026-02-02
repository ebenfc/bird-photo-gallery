"use client";

import { useState, useEffect } from "react";
import PublicGallerySettings from "@/components/settings/PublicGallerySettings";

export default function ResourcesPage() {
  // Haikubox connection form state
  const [haikuboxSerial, setHaikuboxSerial] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load existing serial on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.haikuboxSerial) {
          setHaikuboxSerial(data.haikuboxSerial);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/haikubox/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: haikuboxSerial }),
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          success: true,
          message: `✓ Connected to ${data.deviceName}`,
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || "Connection failed",
        });
      }
    } catch (_error) {
      setTestStatus({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haikuboxSerial }),
      });
      const data = await res.json();

      if (data.success) {
        setSaveStatus("✓ Settings saved successfully!");
        // Clear save status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus(data.error || "Failed to save");
      }
    } catch (_error) {
      setSaveStatus("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resources = [
    {
      title: "Bird Identification",
      description: "Tools and apps to help identify birds in your photos",
      links: [
        {
          name: "Merlin Bird ID",
          url: "https://merlin.allaboutbirds.org/",
          description: "Free app by Cornell Lab with photo ID, sound ID, and bird identification by answering simple questions",
        },
        {
          name: "eBird",
          url: "https://ebird.org/",
          description: "Global database of bird observations with species information and range maps",
        },
        {
          name: "iNaturalist",
          url: "https://www.inaturalist.org/",
          description: "Community-powered identification for all wildlife, including birds",
        },
      ],
    },
    {
      title: "Bird Information & Encyclopedia",
      description: "Learn more about bird species, behavior, and natural history",
      links: [
        {
          name: "All About Birds",
          url: "https://www.allaboutbirds.org/",
          description: "Comprehensive species guides from Cornell Lab with photos, sounds, ID tips, and range maps",
        },
        {
          name: "Audubon Field Guide",
          url: "https://www.audubon.org/bird-guide",
          description: "Detailed species profiles with conservation status and habitat information",
        },
        {
          name: "What Bird",
          url: "https://www.whatbird.com/",
          description: "Bird identification guide with photos, songs, and detailed species information",
        },
        {
          name: "Birds of the World",
          url: "https://birdsoftheworld.org/",
          description: "Comprehensive scientific encyclopedia (subscription required)",
        },
      ],
    },
    {
      title: "Haikubox Setup",
      description: "Automated bird detection and monitoring for your property",
      links: [
        {
          name: "Get a Haikubox",
          url: "https://haikubox.com/",
          description: "Purchase a Haikubox to automatically detect and identify birds visiting your yard 24/7",
        },
        {
          name: "Haikubox API Documentation",
          url: "https://api.haikubox.com/docs",
          description: "Technical documentation for the Haikubox API",
        },
      ],
    },
  ];

  return (
    <div className="pnw-texture min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
            Resources
          </h1>
          <p className="text-[var(--mist-600)]">
            Bird Feed is an online gallery tool for cataloguing your bird activity.
            Use these resources for bird identification and in-depth species information.
          </p>
        </div>

        {/* Public Gallery Section */}
        <section className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
          border border-[var(--border-light)] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[var(--moss-50)] to-[var(--forest-50)]
            border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--forest-900)] mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Public Gallery
            </h2>
            <p className="text-sm sm:text-base text-[var(--mist-600)]">
              Share your bird feed with friends and followers
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <PublicGallerySettings />
          </div>
        </section>

        {/* Resource Sections */}
        <div className="space-y-8">
          {resources.map((section, idx) => (
            <section
              key={idx}
              className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
                border border-[var(--border-light)] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[var(--forest-50)] to-[var(--moss-50)]
                border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--forest-900)] mb-1">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--mist-600)]">
                  {section.description}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                {/* Haikubox Connection Form (special case for Haikubox section) */}
                {section.title === "Haikubox Setup" && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-[var(--sky-50)] to-[var(--moss-50)]
                    rounded-[var(--radius-lg)] border border-[var(--sky-200)]">
                    <h3 className="font-semibold text-[var(--forest-900)] mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--sky-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Device Configuration
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--forest-900)] mb-2">
                          Haikubox Serial Number
                        </label>
                        <input
                          type="text"
                          value={haikuboxSerial}
                          onChange={(e) => setHaikuboxSerial(e.target.value)}
                          placeholder="e.g., 1000000066e59043"
                          className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
                            text-[var(--forest-900)] bg-white
                            focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
                            transition-all duration-[var(--timing-fast)]"
                        />
                        <p className="text-xs text-[var(--mist-600)] mt-1.5">
                          Find your serial number on your Haikubox device or in the Haikubox app
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleTestConnection}
                          disabled={!haikuboxSerial || testing}
                          className="px-4 py-2.5 border-2 border-[var(--moss-600)] text-[var(--moss-700)]
                            rounded-[var(--radius-md)] font-medium
                            hover:bg-[var(--moss-50)] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-[var(--timing-fast)] active:scale-95"
                        >
                          {testing ? "Testing..." : "Test Connection"}
                        </button>

                        <button
                          onClick={handleSave}
                          disabled={!haikuboxSerial || saving || !testStatus?.success}
                          className="px-4 py-2.5 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
                            text-white rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-sm)]
                            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-[var(--timing-fast)] active:scale-95"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>

                      {testStatus && (
                        <div className={`p-3 rounded-[var(--radius-md)] text-sm font-medium ${
                          testStatus.success
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                          {testStatus.message}
                        </div>
                      )}

                      {saveStatus && (
                        <div className="p-3 rounded-[var(--radius-md)] bg-blue-50 text-blue-800 border border-blue-200 text-sm font-medium">
                          {saveStatus}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {section.links.map((link, linkIdx) => (
                    <a
                      key={linkIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)]
                        bg-[var(--bg-secondary)] hover:bg-[var(--forest-50)]
                        border border-[var(--border-light)] hover:border-[var(--moss-300)]
                        transition-all duration-[var(--timing-fast)]
                        hover:shadow-[var(--shadow-sm)]">

                        {/* External link icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            className="w-5 h-5 text-[var(--moss-600)] group-hover:text-[var(--moss-700)]
                              transition-colors duration-[var(--timing-fast)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--forest-900)] mb-1
                            group-hover:text-[var(--moss-700)] transition-colors duration-[var(--timing-fast)]">
                            {link.name}
                          </h3>
                          <p className="text-sm text-[var(--mist-600)] leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-[var(--moss-50)] rounded-[var(--radius-md)]
        border border-[var(--moss-200)]">
        <p className="text-sm text-[var(--mist-600)] text-center">
          <span className="font-semibold text-[var(--forest-900)]">Note:</span> Bird Feed
          is designed for organizing and cataloguing your bird photos, not for detailed species
          identification or research. These external resources complement Bird Feed by providing
          expert identification tools and comprehensive species information.
        </p>
      </div>
    </div>
  );
}
