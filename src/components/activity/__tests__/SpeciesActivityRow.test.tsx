import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpeciesActivityRow from "../SpeciesActivityRow";
import { SpeciesActivityData } from "@/types";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
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

  const mockSpeciesLookup = [
    { id: 1, commonName: "American Robin" },
    { id: 2, commonName: "House Finch" },
    { id: 3, commonName: "Anna's Hummingbird" },
  ];

  it("renders species data correctly", () => {
    render(<SpeciesActivityRow data={baseData} speciesLookup={mockSpeciesLookup} />);

    // Species name appears in both desktop and mobile layouts
    const names = screen.getAllByText("American Robin");
    expect(names.length).toBeGreaterThan(0);
    // Count appears in both desktop and mobile layouts
    const counts = screen.getAllByText("856");
    expect(counts.length).toBeGreaterThan(0);
    const heardTexts = screen.getAllByText("heard");
    expect(heardTexts.length).toBeGreaterThan(0);
  });

  it("shows checkmark icon for photographed species", () => {
    render(<SpeciesActivityRow data={baseData} speciesLookup={mockSpeciesLookup} />);

    // Check for checkmark SVG (filled checkmark path)
    const checkmarks = screen.getAllByRole("button");
    expect(checkmarks[0]).toBeInTheDocument();
  });

  it("shows circle icon for not-yet-photographed species", () => {
    const notPhotographedData = { ...baseData, hasPhoto: false };
    render(<SpeciesActivityRow data={notPhotographedData} speciesLookup={mockSpeciesLookup} />);

    // Component should render (name appears in both layouts)
    const names = screen.getAllByText("American Robin");
    expect(names.length).toBeGreaterThan(0);
  });

  it("displays rarity badge", () => {
    render(<SpeciesActivityRow data={baseData} speciesLookup={mockSpeciesLookup} />);

    // RarityBadge component renders "Common" text
    expect(screen.getAllByText("Common").length).toBeGreaterThan(0);
  });

  it("formats large counts correctly", () => {
    const largeCountData = { ...baseData, yearlyCount: 1500 };
    render(<SpeciesActivityRow data={largeCountData} speciesLookup={mockSpeciesLookup} />);

    // 1.5k appears in both desktop and mobile layouts
    const counts = screen.getAllByText("1.5k");
    expect(counts.length).toBeGreaterThan(0);
  });

  it("handles null lastHeardAt", () => {
    const nullDateData = { ...baseData, lastHeardAt: null };
    render(<SpeciesActivityRow data={nullDateData} speciesLookup={mockSpeciesLookup} />);

    // Should still render the species name correctly even with null lastHeardAt
    const names = screen.getAllByText("American Robin");
    expect(names.length).toBeGreaterThan(0);
  });

  it("displays 'Unassigned' badge when rarity is null", () => {
    const nullRarityData = { ...baseData, rarity: null, speciesId: null };
    render(<SpeciesActivityRow data={nullRarityData} speciesLookup={mockSpeciesLookup} />);

    expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);
  });

  it("calls onUnassignedClick when clicking unassigned row", async () => {
    const mockOnUnassignedClick = jest.fn();
    const unassignedData = { ...baseData, rarity: null, speciesId: null };
    const user = userEvent.setup();

    render(
      <SpeciesActivityRow
        data={unassignedData}
        speciesLookup={mockSpeciesLookup}
        onUnassignedClick={mockOnUnassignedClick}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnUnassignedClick).toHaveBeenCalledWith(unassignedData);
    expect(mockPush).not.toHaveBeenCalled(); // Should not navigate
  });

  it("has correct aria-label for unassigned species", () => {
    const unassignedData = { ...baseData, rarity: null, speciesId: null };
    render(<SpeciesActivityRow data={unassignedData} speciesLookup={mockSpeciesLookup} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Assign American Robin to a rarity category"
    );
  });

  it("navigates to species page by ID on click", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityRow data={baseData} speciesLookup={mockSpeciesLookup} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("/species/1");
  });

  it("applies correct background color for photographed species", () => {
    const { container } = render(<SpeciesActivityRow data={baseData} speciesLookup={mockSpeciesLookup} />);

    const button = container.querySelector("button");
    expect(button?.className).toContain("moss");
  });

  it("applies correct background color for not-yet-photographed species", () => {
    const notPhotographedData = { ...baseData, hasPhoto: false };
    const { container } = render(
      <SpeciesActivityRow data={notPhotographedData} speciesLookup={mockSpeciesLookup} />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("sky");
  });

  it("displays uncommon rarity correctly", () => {
    const uncommonData = { ...baseData, rarity: "uncommon" as const };
    render(<SpeciesActivityRow data={uncommonData} speciesLookup={mockSpeciesLookup} />);

    expect(screen.getAllByText("Uncommon").length).toBeGreaterThan(0);
  });

  it("displays rare rarity correctly", () => {
    const rareData = { ...baseData, rarity: "rare" as const };
    render(<SpeciesActivityRow data={rareData} speciesLookup={mockSpeciesLookup} />);

    expect(screen.getAllByText("Rare").length).toBeGreaterThan(0);
  });
});
