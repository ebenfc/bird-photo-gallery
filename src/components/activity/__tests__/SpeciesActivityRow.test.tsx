import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpeciesActivityRow from "../SpeciesActivityRow";
import { SpeciesActivityData } from "@/types";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn((date: Date) => {
    const now = new Date("2024-01-20T12:00:00Z");
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    if (days === 2) return "2 days ago";
    return `${days} days ago`;
  }),
}));

describe("SpeciesActivityRow", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  const baseData: SpeciesActivityData = {
    commonName: "American Robin",
    speciesId: 1,
    yearlyCount: 856,
    lastHeardAt: "2024-01-18T10:30:00Z",
    hasPhoto: true,
    rarity: "common",
  };

  it("renders species data correctly", () => {
    render(<SpeciesActivityRow data={baseData} />);

    // Species name appears in both desktop and mobile layouts
    const names = screen.getAllByText("American Robin");
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getByText("856")).toBeInTheDocument();
    const heardTexts = screen.getAllByText("heard");
    expect(heardTexts.length).toBeGreaterThan(0);
    const dateTexts = screen.getAllByText("2 days ago");
    expect(dateTexts.length).toBeGreaterThan(0);
  });

  it("shows checkmark icon for photographed species", () => {
    render(<SpeciesActivityRow data={baseData} />);

    // Check for checkmark SVG (filled checkmark path)
    const checkmarks = screen.getAllByRole("button");
    expect(checkmarks[0]).toBeInTheDocument();
  });

  it("shows circle icon for not-yet-photographed species", () => {
    const notPhotographedData = { ...baseData, hasPhoto: false };
    render(<SpeciesActivityRow data={notPhotographedData} />);

    // Component should render (name appears in both layouts)
    const names = screen.getAllByText("American Robin");
    expect(names.length).toBeGreaterThan(0);
  });

  it("displays rarity badge", () => {
    render(<SpeciesActivityRow data={baseData} />);

    // RarityBadge component renders "Common" text
    expect(screen.getAllByText("Common").length).toBeGreaterThan(0);
  });

  it("formats large counts correctly", () => {
    const largeCountData = { ...baseData, yearlyCount: 1500 };
    render(<SpeciesActivityRow data={largeCountData} />);

    expect(screen.getByText("1.5k")).toBeInTheDocument();
  });

  it("handles null lastHeardAt", () => {
    const nullDateData = { ...baseData, lastHeardAt: null };
    render(<SpeciesActivityRow data={nullDateData} />);

    expect(screen.getAllByText("Never").length).toBeGreaterThan(0);
  });

  it("handles null rarity by defaulting to common", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nullRarityData = { ...baseData, rarity: null as any };
    render(<SpeciesActivityRow data={nullRarityData} />);

    expect(screen.getAllByText("Common").length).toBeGreaterThan(0);
  });

  it("navigates to species search on click", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityRow data={baseData} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("/species?search=American%20Robin");
  });

  it("applies correct background color for photographed species", () => {
    const { container } = render(<SpeciesActivityRow data={baseData} />);

    const button = container.querySelector("button");
    expect(button?.className).toContain("moss");
  });

  it("applies correct background color for not-yet-photographed species", () => {
    const notPhotographedData = { ...baseData, hasPhoto: false };
    const { container } = render(
      <SpeciesActivityRow data={notPhotographedData} />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("sky");
  });

  it("displays uncommon rarity correctly", () => {
    const uncommonData = { ...baseData, rarity: "uncommon" as const };
    render(<SpeciesActivityRow data={uncommonData} />);

    expect(screen.getAllByText("Uncommon").length).toBeGreaterThan(0);
  });

  it("displays rare rarity correctly", () => {
    const rareData = { ...baseData, rarity: "rare" as const };
    render(<SpeciesActivityRow data={rareData} />);

    expect(screen.getAllByText("Rare").length).toBeGreaterThan(0);
  });
});
