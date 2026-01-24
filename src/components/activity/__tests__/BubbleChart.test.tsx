import { render, screen, fireEvent } from "@testing-library/react";
import BubbleChart from "../BubbleChart";
import type { BubbleChartBird } from "@/types";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock createPortal for tooltip
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (children: React.ReactNode) => children,
}));

describe("BubbleChart", () => {
  const mockData: BubbleChartBird[] = [
    {
      commonName: "American Robin",
      yearlyCount: 1000,
      hasPhoto: true,
      lastHeardAt: "2024-01-20T10:00:00Z",
    },
    {
      commonName: "Blue Jay",
      yearlyCount: 500,
      hasPhoto: false,
      lastHeardAt: "2024-01-21T15:00:00Z",
    },
    {
      commonName: "Cardinal",
      yearlyCount: 750,
      hasPhoto: true,
      lastHeardAt: "2024-01-22T09:00:00Z",
    },
  ];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("should render empty state when data is empty", () => {
    render(<BubbleChart data={[]} />);

    expect(
      screen.getByText("No bird activity data available")
    ).toBeInTheDocument();
  });

  it("should render SVG with correct number of bubbles", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    expect(svg).toBeInTheDocument();

    // Check that circles are rendered (one for each bird)
    const circles = svg.querySelectorAll("circle");
    expect(circles.length).toBe(mockData.length);
  });

  it("should render group labels", () => {
    render(<BubbleChart data={mockData} />);

    // Should have "Photographed" text in both SVG label and legend
    const photographedElements = screen.getAllByText("Photographed");
    expect(photographedElements.length).toBeGreaterThan(0);

    expect(screen.getByText("Not Yet")).toBeInTheDocument();
  });

  it("should render legend", () => {
    render(<BubbleChart data={mockData} />);

    expect(screen.getByText(/Bubble size = visit frequency/)).toBeInTheDocument();
  });

  it("should navigate to species search on bubble click", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    const firstCircle = svg.querySelector("circle");

    if (firstCircle) {
      fireEvent.click(firstCircle);
      expect(mockPush).toHaveBeenCalled();
      expect(mockPush.mock.calls[0][0]).toContain("/species?search=");
    }
  });

  it("should have accessible attributes", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("aria-label", "Bird activity visualization");

    // Check that circles have role and aria-label
    const circles = svg.querySelectorAll("circle");
    circles.forEach((circle) => {
      expect(circle).toHaveAttribute("role", "button");
      expect(circle).toHaveAttribute("aria-label");
      expect(circle).toHaveAttribute("tabindex", "0");
    });
  });

  it("should handle keyboard navigation on Enter key", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    const firstCircle = svg.querySelector("circle");

    if (firstCircle) {
      fireEvent.keyDown(firstCircle, { key: "Enter" });
      expect(mockPush).toHaveBeenCalled();
    }
  });

  it("should handle keyboard navigation on Space key", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    const firstCircle = svg.querySelector("circle");

    if (firstCircle) {
      fireEvent.keyDown(firstCircle, { key: " " });
      expect(mockPush).toHaveBeenCalled();
    }
  });

  it("should apply correct colors based on photo status", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    const circles = svg.querySelectorAll("circle");

    // Check that photographed birds have moss color class
    // and not-yet birds have sky color class
    circles.forEach((circle) => {
      const className = circle.getAttribute("class") || "";
      expect(
        className.includes("fill-[var(--moss-400)]") ||
          className.includes("fill-[var(--sky-400)]")
      ).toBe(true);
    });
  });

  it("should not create overlapping bubbles", () => {
    render(<BubbleChart data={mockData} />);

    const svg = screen.getByRole("img");
    const circles = Array.from(svg.querySelectorAll("circle"));

    // Extract positions and radii
    const bubbles = circles.map((circle) => ({
      x: parseFloat(circle.getAttribute("cx") || "0"),
      y: parseFloat(circle.getAttribute("cy") || "0"),
      r: parseFloat(circle.getAttribute("r") || "0"),
    }));

    // Check each pair for overlap
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const b1 = bubbles[i];
        const b2 = bubbles[j];

        if (b1 && b2) {
          const distance = Math.hypot(b1.x - b2.x, b1.y - b2.y);
          const minDistance = b1.r + b2.r + 10; // 10px padding

          // Allow small overlap due to jitter
          expect(distance).toBeGreaterThan(minDistance * 0.9);
        }
      }
    }
  });
});
