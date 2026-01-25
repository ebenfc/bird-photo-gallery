import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpeciesActivityList from "../SpeciesActivityList";
import { SpeciesActivityData } from "@/types";
import { useRouter } from "next/navigation";

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ species: [] }),
  } as Response)
);

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock("../SpeciesActivityRow", () => ({
  __esModule: true,
  default: ({ data }: { data: SpeciesActivityData; speciesLookup: unknown }) => (
    <div data-testid={`species-row-${data.commonName}`}>
      {data.commonName} - {data.yearlyCount}
    </div>
  ),
}));

describe("SpeciesActivityList", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ species: [] }),
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  const mockData: SpeciesActivityData[] = [
    {
      commonName: "American Robin",
      speciesId: 1,
      yearlyCount: 856,
      lastHeardAt: "2024-01-18T10:30:00Z",
      hasPhoto: true,
      rarity: "common",
    },
    {
      commonName: "Steller's Jay",
      speciesId: 2,
      yearlyCount: 423,
      lastHeardAt: "2024-01-15T10:30:00Z",
      hasPhoto: false,
      rarity: "uncommon",
    },
    {
      commonName: "Dark-eyed Junco",
      speciesId: 3,
      yearlyCount: 612,
      lastHeardAt: "2024-01-19T10:30:00Z",
      hasPhoto: true,
      rarity: "common",
    },
    {
      commonName: "Spotted Towhee",
      speciesId: 4,
      yearlyCount: 234,
      lastHeardAt: "2024-01-17T10:30:00Z",
      hasPhoto: false,
      rarity: "rare",
    },
  ];

  it("renders loading state", () => {
    render(<SpeciesActivityList data={[]} loading={true} />);

    // Check for skeleton loaders (animated pulse divs)
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state when no data", () => {
    render(<SpeciesActivityList data={[]} loading={false} />);

    expect(screen.getByText("No Bird Detections Yet")).toBeInTheDocument();
    expect(
      screen.getByText(/No bird activity has been recorded yet/i)
    ).toBeInTheDocument();
  });

  it("renders all species rows", () => {
    render(<SpeciesActivityList data={mockData} />);

    expect(screen.getByTestId("species-row-American Robin")).toBeInTheDocument();
    expect(screen.getByTestId("species-row-Steller's Jay")).toBeInTheDocument();
    expect(screen.getByTestId("species-row-Dark-eyed Junco")).toBeInTheDocument();
    expect(screen.getByTestId("species-row-Spotted Towhee")).toBeInTheDocument();
  });

  it("sorts by count descending by default", () => {
    render(<SpeciesActivityList data={mockData} />);

    const rows = screen.getAllByTestId(/species-row-/);
    expect(rows[0]).toHaveTextContent("American Robin - 856");
    expect(rows[1]).toHaveTextContent("Dark-eyed Junco - 612");
    expect(rows[2]).toHaveTextContent("Steller's Jay - 423");
    expect(rows[3]).toHaveTextContent("Spotted Towhee - 234");
  });

  it("filters by rarity", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    // Click "Uncommon" filter
    await user.click(screen.getByLabelText("Filter by Uncommon rarity"));

    // Only Steller's Jay should be visible
    expect(screen.getByTestId("species-row-Steller's Jay")).toBeInTheDocument();
    expect(screen.queryByTestId("species-row-American Robin")).not.toBeInTheDocument();
  });

  it("filters by photo status - photographed", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    // Click "Photographed" filter
    await user.click(screen.getByLabelText("Filter by Photographed photo status"));

    // Only photographed species should be visible
    expect(screen.getByTestId("species-row-American Robin")).toBeInTheDocument();
    expect(screen.getByTestId("species-row-Dark-eyed Junco")).toBeInTheDocument();
    expect(screen.queryByTestId("species-row-Steller's Jay")).not.toBeInTheDocument();
  });

  it("filters by photo status - not yet", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    // Click "Not Yet" filter
    await user.click(screen.getByLabelText("Filter by Not Yet photo status"));

    // Only not-yet-photographed species should be visible
    expect(screen.getByTestId("species-row-Steller's Jay")).toBeInTheDocument();
    expect(screen.getByTestId("species-row-Spotted Towhee")).toBeInTheDocument();
    expect(screen.queryByTestId("species-row-American Robin")).not.toBeInTheDocument();
  });

  it("combines multiple filters", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    // Filter by rare + not yet
    await user.click(screen.getByLabelText("Filter by Rare rarity"));
    await user.click(screen.getByLabelText("Filter by Not Yet photo status"));

    // Only Spotted Towhee matches
    expect(screen.getByTestId("species-row-Spotted Towhee")).toBeInTheDocument();
    expect(screen.queryByTestId("species-row-American Robin")).not.toBeInTheDocument();
  });

  it("sorts by count ascending", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    const sortSelect = screen.getAllByRole("combobox")[0]!; // Get desktop select
    await user.selectOptions(sortSelect, "count-asc");

    const rows = screen.getAllByTestId(/species-row-/);
    expect(rows[0]).toHaveTextContent("Spotted Towhee - 234");
    expect(rows[1]).toHaveTextContent("Steller's Jay - 423");
    expect(rows[2]).toHaveTextContent("Dark-eyed Junco - 612");
    expect(rows[3]).toHaveTextContent("American Robin - 856");
  });

  it("sorts alphabetically A-Z", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    const sortSelect = screen.getAllByRole("combobox")[0]!; // Get desktop select
    await user.selectOptions(sortSelect, "name-asc");

    const rows = screen.getAllByTestId(/species-row-/);
    expect(rows[0]).toHaveTextContent("American Robin");
    expect(rows[1]).toHaveTextContent("Dark-eyed Junco");
    expect(rows[2]).toHaveTextContent("Spotted Towhee");
    expect(rows[3]).toHaveTextContent("Steller's Jay");
  });

  it("sorts alphabetically Z-A", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    const sortSelect = screen.getAllByRole("combobox")[0]!; // Get desktop select
    await user.selectOptions(sortSelect, "name-desc");

    const rows = screen.getAllByTestId(/species-row-/);
    expect(rows[0]).toHaveTextContent("Steller's Jay");
    expect(rows[1]).toHaveTextContent("Spotted Towhee");
    expect(rows[2]).toHaveTextContent("Dark-eyed Junco");
    expect(rows[3]).toHaveTextContent("American Robin");
  });

  it("clears filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    // Apply a filter
    await user.click(screen.getByLabelText("Filter by Rare rarity"));

    // Only 1 species visible
    expect(screen.getAllByTestId(/species-row-/)).toHaveLength(1);

    // Clear filters
    await user.click(screen.getByText("Clear filters"));

    // All species visible again
    expect(screen.getAllByTestId(/species-row-/)).toHaveLength(4);
  });

  it("shows empty filtered state when no matches", async () => {
    const user = userEvent.setup();
    const limitedData = mockData.filter((d) => d.rarity !== "rare");
    render(<SpeciesActivityList data={limitedData} />);

    // Filter by rare (no matches)
    await user.click(screen.getByLabelText("Filter by Rare rarity"));

    expect(screen.getByText("No Species Match These Filters")).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your filter selection/i)
    ).toBeInTheDocument();
  });

  it("updates result count when filtering", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityList data={mockData} />);

    let resultCounts = screen.getAllByText("Showing 4 of 4 species");
    expect(resultCounts.length).toBeGreaterThan(0);

    // Filter by common
    await user.click(screen.getByLabelText("Filter by Common rarity"));

    resultCounts = screen.getAllByText("Showing 2 of 4 species");
    expect(resultCounts.length).toBeGreaterThan(0);
  });

  it("filters by unassigned rarity (null rarity)", async () => {
    const dataWithNullRarity: SpeciesActivityData[] = [
      ...mockData,
      {
        commonName: "Unassigned Bird",
        speciesId: null,
        yearlyCount: 100,
        lastHeardAt: "2024-01-18T10:30:00Z",
        hasPhoto: false,
        rarity: null,
      },
    ];

    const user = userEvent.setup();
    render(<SpeciesActivityList data={dataWithNullRarity} />);

    // Filter by unassigned should show only the null rarity bird
    await user.click(screen.getByLabelText("Filter by Unassigned rarity"));

    expect(screen.getByTestId("species-row-Unassigned Bird")).toBeInTheDocument();
    expect(screen.queryByTestId("species-row-American Robin")).not.toBeInTheDocument();
  });

  it("excludes null rarity from common filter", async () => {
    const dataWithNullRarity: SpeciesActivityData[] = [
      ...mockData,
      {
        commonName: "Unassigned Bird",
        speciesId: null,
        yearlyCount: 100,
        lastHeardAt: "2024-01-18T10:30:00Z",
        hasPhoto: false,
        rarity: null,
      },
    ];

    const user = userEvent.setup();
    render(<SpeciesActivityList data={dataWithNullRarity} />);

    // Filter by common should NOT include the null rarity bird
    await user.click(screen.getByLabelText("Filter by Common rarity"));

    expect(screen.queryByTestId("species-row-Unassigned Bird")).not.toBeInTheDocument();
    expect(screen.getByTestId("species-row-American Robin")).toBeInTheDocument();
  });

});
