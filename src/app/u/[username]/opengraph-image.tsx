import { ImageResponse } from "next/og";
import { getCachedUserByUsername, getDisplayName } from "@/lib/user";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

export const alt = "Bird Feed Gallery";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getCachedUserByUsername(username);

  // Fallback card for missing/private galleries
  if (!user || !user.isPublicGalleryEnabled) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#022c22",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="#6ee7b7"
            >
              <ellipse cx="11" cy="14" rx="6.5" ry="4.5" />
              <circle cx="17" cy="8" r="3" />
              <path d="M5 12C7 8.5 11 7 14.5 8L12.5 10C10 11 7.5 12 5 12Z" />
              <path d="M5.5 12L2 10.5L3 14Z" />
              <path d="M19.5 7L22.5 8L19.5 9.5Z" />
            </svg>
            <span
              style={{
                color: "#6ee7b7",
                fontSize: "48px",
                fontWeight: 700,
              }}
            >
              Bird Feed
            </span>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const displayName = getDisplayName(user);

  const [photoResult, speciesResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(eq(photos.userId, user.id)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(species)
      .where(eq(species.userId, user.id)),
  ]);
  const photoCount = Number(photoResult[0]?.count ?? 0);
  const speciesCount = Number(speciesResult[0]?.count ?? 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#022c22",
          padding: "40px",
        }}
      >
        {/* Inner card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            background: "#064e3b",
            borderRadius: "24px",
            padding: "56px",
          }}
        >
          {/* Brand row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#6ee7b7"
            >
              <ellipse cx="11" cy="14" rx="6.5" ry="4.5" />
              <circle cx="17" cy="8" r="3" />
              <path d="M5 12C7 8.5 11 7 14.5 8L12.5 10C10 11 7.5 12 5 12Z" />
              <path d="M5.5 12L2 10.5L3 14Z" />
              <path d="M19.5 7L22.5 8L19.5 9.5Z" />
            </svg>
            <span
              style={{
                color: "#6ee7b7",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              Bird Feed
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "64px",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {displayName}&apos;s
            </span>
            <span
              style={{
                color: "#a7f3d0",
                fontSize: "48px",
                fontWeight: 600,
              }}
            >
              Bird Gallery
            </span>
          </div>

          {/* Stats + URL row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {/* Stats */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
              }}
            >
              <span
                style={{
                  color: "#a7f3d0",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              >
                {speciesCount} species
              </span>
              <span
                style={{
                  color: "#6ee7b7",
                  fontSize: "20px",
                }}
              >
                &bull;
              </span>
              <span
                style={{
                  color: "#a7f3d0",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              >
                {photoCount} photos
              </span>
            </div>

            {/* URL */}
            <span
              style={{
                color: "#059669",
                fontSize: "18px",
              }}
            >
              birdfeed.io/u/{username}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
