import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#1a3a2f",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple bird silhouette */}
          <path
            d="M12 4C14 4 16 5 17 7C18 9 18 11 17 13C16 15 14 16 12 16C10 16 8 15 7 13C6 11 6 9 7 7C8 5 10 4 12 4Z"
            fill="#7cb892"
          />
          <path
            d="M4 12C3 13 2 14 2 15C2 16 3 17 4 17C5 17 6 16 7 15C8 14 8 13 7 13C6 13 5 12 4 12Z"
            fill="#7cb892"
          />
          <circle cx="14" cy="9" r="1.5" fill="#1a3a2f" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
