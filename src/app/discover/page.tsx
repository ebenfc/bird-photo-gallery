"use client";

import { useState, useEffect, useCallback } from "react";
import GalleryCard from "@/components/discover/GalleryCard";
import DiscoverFilters from "@/components/discover/DiscoverFilters";

interface GalleryListing {
  username: string;
  displayName: string;
  city: string | null;
  state: string | null;
  speciesCount: number;
  photoCount: number;
}

interface BookmarkListing extends GalleryListing {
  bookmarkedAt: string;
}

type Tab = "browse" | "saved";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>("browse");

  // Browse tab state
  const [galleries, setGalleries] = useState<GalleryListing[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [sort, setSort] = useState<"alpha" | "random">("alpha");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Saved tab state
  const [savedGalleries, setSavedGalleries] = useState<BookmarkListing[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  // Mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchGalleries = useCallback(async () => {
    setBrowseLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.set("state", selectedState);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/public/discover?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGalleries(data.galleries);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    } finally {
      setBrowseLoading(false);
    }
  }, [selectedState, sort, page]);

  const fetchSavedGalleries = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await fetch("/api/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setSavedGalleries(data.bookmarks);
      }
    } catch (error) {
      console.error("Failed to fetch saved galleries:", error);
    } finally {
      setSavedLoading(false);
    }
  }, []);

  // Fetch browse galleries when filters change
  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  // Fetch saved galleries when switching to saved tab
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedGalleries();
    }
  }, [activeTab, fetchSavedGalleries]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setPage(1);
  };

  const handleSortChange = (newSort: "alpha" | "random") => {
    setSort(newSort);
    setPage(1);
  };

  const activeFilterCount = selectedState ? 1 : 0;

  return (
    <div className="pnw-texture min-h-screen">
      {/* Desktop Header */}
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
          Discover
        </h1>
        <p className="text-[var(--mist-600)]">
          Browse bird galleries from birders across the country
        </p>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Discover
          </h1>
          {activeTab === "browse" && (
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label={`Toggle filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
              aria-expanded={showMobileFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                text-[var(--forest-700)] bg-[var(--card-bg)] border border-[var(--border-light)]
                rounded-[var(--radius-md)] hover:bg-[var(--mist-50)]
                transition-all duration-[var(--timing-fast)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-[var(--moss-500)] text-white text-xs rounded-full w-5 h-5
                  flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-light)]">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-[var(--timing-fast)]
            ${
              activeTab === "browse"
                ? "border-[var(--moss-500)] text-[var(--moss-700)]"
                : "border-transparent text-[var(--mist-500)] hover:text-[var(--forest-700)]"
            }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-[var(--timing-fast)]
            ${
              activeTab === "saved"
                ? "border-[var(--moss-500)] text-[var(--moss-700)]"
                : "border-transparent text-[var(--mist-500)] hover:text-[var(--forest-700)]"
            }`}
        >
          Saved
          {savedGalleries.length > 0 && activeTab !== "saved" && (
            <span className="ml-1.5 bg-[var(--mist-200)] text-[var(--mist-600)] text-xs
              rounded-full px-2 py-0.5 font-medium">
              {savedGalleries.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <>
          {/* Desktop Filters */}
          <div className="hidden sm:block mb-6">
            <DiscoverFilters
              selectedState={selectedState}
              onStateChange={handleStateChange}
              sort={sort}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Mobile Filters (collapsible) */}
          <div
            className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out
              ${showMobileFilters ? "max-h-40 mb-4" : "max-h-0"}`}
          >
            <div className="p-4 bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
              border border-[var(--border-light)]">
              <DiscoverFilters
                selectedState={selectedState}
                onStateChange={handleStateChange}
                sort={sort}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          {/* Gallery Grid */}
          {browseLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse p-5 rounded-[var(--radius-lg)] bg-[var(--card-bg)]
                  border border-[var(--border-light)]">
                  <div className="h-6 bg-[var(--mist-100)] rounded w-3/4 mb-3" />
                  <div className="h-4 bg-[var(--mist-100)] rounded w-1/2 mb-3" />
                  <div className="h-4 bg-[var(--mist-100)] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-[var(--mist-300)] mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No galleries found
              </h3>
              <p className="text-[var(--mist-500)] max-w-sm mx-auto">
                {selectedState
                  ? "No birders have listed their galleries in this state yet. Try a different state or browse all."
                  : "No birders have listed their galleries in the directory yet. Be the first!"}
              </p>
              {selectedState && (
                <button
                  onClick={() => handleStateChange("")}
                  className="mt-4 px-4 py-2 text-sm font-medium text-[var(--moss-700)]
                    bg-[var(--surface-moss)] rounded-[var(--radius-md)] hover:bg-[var(--moss-100)]
                    transition-all duration-[var(--timing-fast)]"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Result count */}
              <p className="text-sm text-[var(--mist-500)] mb-4">
                {totalCount} {totalCount === 1 ? "gallery" : "galleries"} found
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleries.map((gallery) => (
                  <GalleryCard key={gallery.username} {...gallery} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-[var(--forest-700)]
                      bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
                      hover:bg-[var(--mist-50)] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-[var(--timing-fast)]"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[var(--mist-500)]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-[var(--forest-700)]
                      bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
                      hover:bg-[var(--mist-50)] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-[var(--timing-fast)]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Saved Tab */}
      {activeTab === "saved" && (
        <>
          {savedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-5 rounded-[var(--radius-lg)] bg-[var(--card-bg)]
                  border border-[var(--border-light)]">
                  <div className="h-6 bg-[var(--mist-100)] rounded w-3/4 mb-3" />
                  <div className="h-4 bg-[var(--mist-100)] rounded w-1/2 mb-3" />
                  <div className="h-4 bg-[var(--mist-100)] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : savedGalleries.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-[var(--mist-300)] mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No saved galleries
              </h3>
              <p className="text-[var(--mist-500)] max-w-sm mx-auto">
                When you visit someone&apos;s public gallery, use the bookmark button to save it here
                for easy access later.
              </p>
              <button
                onClick={() => setActiveTab("browse")}
                className="mt-4 px-4 py-2 text-sm font-medium text-[var(--moss-700)]
                  bg-[var(--surface-moss)] rounded-[var(--radius-md)] hover:bg-[var(--moss-100)]
                  transition-all duration-[var(--timing-fast)]"
              >
                Browse galleries
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--mist-500)] mb-4">
                {savedGalleries.length} saved {savedGalleries.length === 1 ? "gallery" : "galleries"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedGalleries.map((gallery) => (
                  <GalleryCard key={gallery.username} {...gallery} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
