"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface HaikuboxSetupCardProps {
  onConnected: () => void;
}

type SetupPath = "own" | "public" | null;

export default function HaikuboxSetupCard({
  onConnected,
}: HaikuboxSetupCardProps) {
  const [path, setPath] = useState<SetupPath>(null);
  const [serial, setSerial] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    deviceName?: string;
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSerialHelp, setShowSerialHelp] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setSaveResult(null);
    try {
      const res = await fetch("/api/haikubox/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: serial.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          deviceName: data.deviceName,
          message: `Connected to ${data.deviceName}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection failed",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndConnect = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      // Step 1: Save the serial number
      const saveRes = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haikuboxSerial: serial.trim() }),
      });
      const saveData = await saveRes.json();

      if (!saveData.success) {
        setSaveResult({
          success: false,
          message: saveData.error || "Failed to save settings.",
        });
        return;
      }

      // Step 2: Trigger immediate sync
      setSaveResult({ success: true, message: "Saved! Syncing your data..." });

      const syncRes = await fetch("/api/haikubox/sync", { method: "POST" });
      const syncData = await syncRes.json();

      if (syncRes.ok && syncData.success) {
        setSaveResult({
          success: true,
          message: `Connected! Found ${syncData.processed} species detected this year.`,
        });
        // Brief delay so user can read the success message before transitioning
        setTimeout(() => onConnected(), 1500);
      } else {
        // Save succeeded but sync failed — still connected, cron will pick it up
        setSaveResult({
          success: true,
          message:
            "Connected! Your data will sync automatically within 24 hours.",
        });
        setTimeout(() => onConnected(), 2000);
      }
    } catch {
      setSaveResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--border-light)] overflow-hidden">
      <div className="text-center pt-10 pb-6 px-6">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--sky-100)] to-[var(--moss-100)] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[var(--forest-600)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[var(--forest-900)] mb-3">
          Connect a Haikubox
        </h2>
        <p className="text-[var(--mist-600)] max-w-md mx-auto mb-8">
          Track which bird species visit your area automatically. Connect a
          Haikubox device to see detection data, species activity, and more.
        </p>
      </div>

      {/* Path Selection — only shown if no path chosen yet and not in the middle of setup */}
      {path === null && (
        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Own Haikubox */}
            <button
              onClick={() => setPath("own")}
              className="group p-5 rounded-[var(--radius-lg)] border-2 border-[var(--mist-200)]
                bg-[var(--bg-secondary)] hover:border-[var(--moss-400)] hover:bg-[var(--moss-50)]
                transition-all duration-[var(--timing-fast)] text-left"
            >
              <div className="w-10 h-10 mb-3 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--moss-100)] to-[var(--moss-200)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--moss-700)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--forest-900)] mb-1">
                I have a Haikubox
              </h3>
              <p className="text-sm text-[var(--mist-500)]">
                Connect your own device using its serial number
              </p>
            </button>

            {/* Public Haikubox */}
            <button
              onClick={() => setPath("public")}
              className="group p-5 rounded-[var(--radius-lg)] border-2 border-[var(--mist-200)]
                bg-[var(--bg-secondary)] hover:border-[var(--sky-400)] hover:bg-[var(--sky-50)]
                transition-all duration-[var(--timing-fast)] text-left"
            >
              <div className="w-10 h-10 mb-3 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--sky-100)] to-[var(--sky-200)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--sky-700)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--forest-900)] mb-1">
                Find a public Haikubox
              </h3>
              <p className="text-sm text-[var(--mist-500)]">
                Browse public Haikuboxes near you on the map
              </p>
            </button>
          </div>

          {/* Don't have a Haikubox footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--mist-500)]">
              Don&apos;t know what a Haikubox is?{" "}
              <a
                href="https://haikubox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--moss-600)] hover:text-[var(--moss-700)] underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      )}

      {/* "I have a Haikubox" path */}
      {path === "own" && (
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto">
            {/* Back button */}
            <button
              onClick={() => {
                setPath(null);
                setTestResult(null);
                setSaveResult(null);
              }}
              className="flex items-center gap-1 text-sm text-[var(--mist-500)] hover:text-[var(--forest-700)]
                mb-4 transition-colors duration-[var(--timing-fast)]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <p className="text-sm text-[var(--mist-600)] mb-4">
              Enter the serial number from your Haikubox device. You can find it
              on the bottom of the device or in the Haikubox app under Settings.
            </p>

            <SerialInputForm
              serial={serial}
              setSerial={setSerial}
              testing={testing}
              testResult={testResult}
              saving={saving}
              saveResult={saveResult}
              showSerialHelp={showSerialHelp}
              setShowSerialHelp={setShowSerialHelp}
              onTest={handleTestConnection}
              onSave={handleSaveAndConnect}
            />
          </div>
        </div>
      )}

      {/* "Find a public Haikubox" path */}
      {path === "public" && (
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto">
            {/* Back button */}
            <button
              onClick={() => {
                setPath(null);
                setTestResult(null);
                setSaveResult(null);
              }}
              className="flex items-center gap-1 text-sm text-[var(--mist-500)] hover:text-[var(--forest-700)]
                mb-4 transition-colors duration-[var(--timing-fast)]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            {/* Instructions for finding a public Haikubox */}
            <div className="bg-gradient-to-br from-[var(--sky-50)] to-[var(--moss-50)] rounded-[var(--radius-lg)] border border-[var(--sky-200)] p-5 mb-6">
              <h3 className="font-semibold text-[var(--forest-900)] mb-3">
                How to find a public Haikubox
              </h3>
              <p className="text-sm text-[var(--mist-600)] mb-4">
                Many Haikubox owners share their devices publicly so anyone can
                see which birds are nearby. You can browse these on the official
                Haikubox Listen Map.
              </p>

              <ol className="text-sm text-[var(--mist-600)] space-y-2 mb-5">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--sky-200)] text-[var(--sky-800)] text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Open the Haikubox Listen Map (link below)
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--sky-200)] text-[var(--sky-800)] text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Zoom to your area and click on a Haikubox pin
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--sky-200)] text-[var(--sky-800)] text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Look for the serial number in the URL or device details
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--sky-200)] text-[var(--sky-800)] text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  Copy the serial number and paste it below
                </li>
              </ol>

              <a
                href="https://listen.haikubox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5
                  bg-gradient-to-b from-[var(--sky-500)] to-[var(--sky-600)]
                  text-white font-semibold rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
                  hover:from-[var(--sky-400)] hover:to-[var(--sky-500)]
                  transition-all duration-[var(--timing-fast)] active:scale-95"
              >
                Open Haikubox Listen Map
                <svg
                  className="w-4 h-4"
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
              </a>
            </div>

            <p className="text-sm text-[var(--mist-600)] mb-4">
              Once you have a serial number from the map, paste it below to
              connect.
            </p>

            <SerialInputForm
              serial={serial}
              setSerial={setSerial}
              testing={testing}
              testResult={testResult}
              saving={saving}
              saveResult={saveResult}
              showSerialHelp={showSerialHelp}
              setShowSerialHelp={setShowSerialHelp}
              onTest={handleTestConnection}
              onSave={handleSaveAndConnect}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Shared serial number input form used by both the "own" and "public" paths.
 */
function SerialInputForm({
  serial,
  setSerial,
  testing,
  testResult,
  saving,
  saveResult,
  showSerialHelp,
  setShowSerialHelp,
  onTest,
  onSave,
}: {
  serial: string;
  setSerial: (v: string) => void;
  testing: boolean;
  testResult: {
    success: boolean;
    deviceName?: string;
    message: string;
  } | null;
  saving: boolean;
  saveResult: { success: boolean; message: string } | null;
  showSerialHelp: boolean;
  setShowSerialHelp: (v: boolean) => void;
  onTest: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Serial input */}
      <div>
        <label className="block text-sm font-medium text-[var(--forest-900)] mb-2">
          Haikubox Serial Number
        </label>
        <input
          type="text"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="e.g., 1000000066e59043"
          className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
            text-[var(--forest-900)] bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
            transition-all duration-[var(--timing-fast)]"
        />
      </div>

      {/* Expandable help */}
      <button
        onClick={() => setShowSerialHelp(!showSerialHelp)}
        className="flex items-center gap-1 text-xs text-[var(--mist-500)] hover:text-[var(--forest-700)]
          transition-colors duration-[var(--timing-fast)]"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            showSerialHelp ? "rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        Where do I find my serial number?
      </button>

      {showSerialHelp && (
        <div className="bg-[var(--mist-50)] rounded-[var(--radius-md)] p-4 text-sm text-[var(--mist-600)] space-y-2">
          <p>
            Your Haikubox serial number is a 16-character alphanumeric code. You
            can find it in a few places:
          </p>
          <ul className="space-y-1 ml-4">
            <li className="list-disc">
              Printed on the <strong>bottom of your Haikubox</strong> device
            </li>
            <li className="list-disc">
              In the <strong>Haikubox app</strong> under Settings or Device Info
            </li>
            <li className="list-disc">
              In the <strong>URL</strong> when viewing your Haikubox at
              listen.haikubox.com
            </li>
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onTest}
          disabled={!serial.trim() || testing}
        >
          {testing ? "Testing..." : "Test Connection"}
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onSave}
          disabled={!serial.trim() || saving || !testResult?.success}
        >
          {saving ? "Connecting..." : "Save & Connect"}
        </Button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className={`p-3 rounded-[var(--radius-md)] text-sm font-medium ${
            testResult.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {testResult.success ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {testResult.message}
            </span>
          ) : (
            testResult.message
          )}
        </div>
      )}

      {/* Save/sync result */}
      {saveResult && (
        <div
          className={`p-3 rounded-[var(--radius-md)] text-sm font-medium ${
            saveResult.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveResult.success && (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {saveResult.message}
            </span>
          )}
          {!saveResult.success && saveResult.message}
        </div>
      )}
    </div>
  );
}
