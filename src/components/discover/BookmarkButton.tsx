"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface BookmarkButtonProps {
  username: string;
}

export default function BookmarkButton({ username }: BookmarkButtonProps) {
  const { isSignedIn, userId } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/check/${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setBookmarked(data.bookmarked);
        }
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkBookmark();
  }, [isSignedIn, username, userId]);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);

    try {
      if (bookmarked) {
        const res = await fetch(`/api/bookmarks/${encodeURIComponent(username)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setBookmarked(false);
        }
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        if (res.ok) {
          setBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setToggling(false);
    }
  };

  // Don't render for unauthenticated users or while loading
  if (!isSignedIn || loading) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      title={bookmarked ? "Remove bookmark" : "Bookmark this gallery"}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--radius-md)]
        transition-all duration-[var(--timing-fast)] active:scale-95
        ${
          bookmarked
            ? "bg-[var(--moss-100)] text-[var(--moss-700)] border border-[var(--moss-300)] hover:bg-[var(--moss-200)]"
            : "bg-white text-[var(--forest-700)] border border-[var(--border-light)] hover:bg-[var(--mist-50)] hover:border-[var(--moss-300)]"
        }
        ${toggling ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {bookmarked ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      <span className="hidden sm:inline">{bookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}
