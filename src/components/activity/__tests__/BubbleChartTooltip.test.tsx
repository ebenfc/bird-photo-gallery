import { render, screen } from "@testing-library/react";
import BubbleChartTooltip from "../BubbleChartTooltip";
import type { BubbleChartBird } from "@/types";

// Mock createPortal to render children directly
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (children: React.ReactNode) => children,
}));

describe("BubbleChartTooltip", () => {
  const mockBird: BubbleChartBird = {
    commonName: "American Robin",
    yearlyCount: 1234,
    hasPhoto: true,
    lastHeardAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  };

  it("should not render when visible is false", () => {
    const { container } = render(
      <BubbleChartTooltip
        bird={mockBird}
        position={{ x: 100, y: 100 }}
        visible={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should not render when bird is null", () => {
    const { container } = render(
      <BubbleChartTooltip
        bird={null}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render bird information when visible", () => {
    render(
      <BubbleChartTooltip
        bird={mockBird}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(screen.getByText("American Robin")).toBeInTheDocument();
    expect(screen.getByText(/Heard.*this year/)).toBeInTheDocument();
  });

  it("should show photographed status for birds with photos", () => {
    render(
      <BubbleChartTooltip
        bird={mockBird}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(screen.getByText("✓ Photographed")).toBeInTheDocument();
  });

  it("should show not photographed status for birds without photos", () => {
    const birdWithoutPhoto: BubbleChartBird = {
      ...mockBird,
      hasPhoto: false,
    };

    render(
      <BubbleChartTooltip
        bird={birdWithoutPhoto}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(screen.getByText("📸 Not yet photographed")).toBeInTheDocument();
  });

  it("should format large counts correctly", () => {
    const birdWithLargeCount: BubbleChartBird = {
      ...mockBird,
      yearlyCount: 5500,
    };

    render(
      <BubbleChartTooltip
        bird={birdWithLargeCount}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(screen.getByText(/5\.5k.*this year/)).toBeInTheDocument();
  });

  it("should show last heard time when available", () => {
    render(
      <BubbleChartTooltip
        bird={mockBird}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    expect(screen.getByText(/Last heard:/)).toBeInTheDocument();
  });

  it("should handle null lastHeardAt gracefully", () => {
    const birdWithoutLastHeard: BubbleChartBird = {
      ...mockBird,
      lastHeardAt: null,
    };

    render(
      <BubbleChartTooltip
        bird={birdWithoutLastHeard}
        position={{ x: 100, y: 100 }}
        visible={true}
      />
    );

    // Should not crash, and last heard section should not be present
    expect(screen.queryByText(/Last heard:/)).not.toBeInTheDocument();
  });
});
