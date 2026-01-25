import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpeciesActivityFilters from "../SpeciesActivityFilters";
import { SpeciesActivitySort } from "@/types";

describe("SpeciesActivityFilters", () => {
  const mockOnRarityChange = jest.fn();
  const mockOnPhotoFilterChange = jest.fn();
  const mockOnSortChange = jest.fn();

  const defaultProps = {
    rarityFilter: "all" as const,
    photoFilter: "all" as const,
    sortOption: "count-desc" as SpeciesActivitySort,
    resultCount: 42,
    totalCount: 100,
    onRarityChange: mockOnRarityChange,
    onPhotoFilterChange: mockOnPhotoFilterChange,
    onSortChange: mockOnSortChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all rarity filter options", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    // "All" appears twice (rarity + photo status)
    const allButtons = screen.getAllByText("All");
    expect(allButtons.length).toBe(2);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Uncommon")).toBeInTheDocument();
    expect(screen.getByText("Rare")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("calls onRarityChange with 'unassigned' when Unassigned filter is clicked", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityFilters {...defaultProps} />);

    await user.click(screen.getByText("Unassigned"));

    expect(mockOnRarityChange).toHaveBeenCalledWith("unassigned");
  });

  it("renders all photo filter options", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    expect(screen.getByText("Photographed")).toBeInTheDocument();
    expect(screen.getByText("Not Yet")).toBeInTheDocument();
  });

  it("displays result count", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    expect(screen.getByText("Showing 42 of 100 species")).toBeInTheDocument();
  });

  it("calls onRarityChange when rarity filter is clicked", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityFilters {...defaultProps} />);

    await user.click(screen.getByText("Common"));

    expect(mockOnRarityChange).toHaveBeenCalledWith("common");
  });

  it("calls onPhotoFilterChange when photo filter is clicked", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityFilters {...defaultProps} />);

    await user.click(screen.getByText("Photographed"));

    expect(mockOnPhotoFilterChange).toHaveBeenCalledWith("photographed");
  });

  it("calls onSortChange when sort option is changed", async () => {
    const user = userEvent.setup();
    render(<SpeciesActivityFilters {...defaultProps} />);

    const sortSelect = screen.getByRole("combobox");
    await user.selectOptions(sortSelect, "name-asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("name-asc");
  });

  it("shows clear filters button when filters are active", () => {
    render(
      <SpeciesActivityFilters {...defaultProps} rarityFilter="common" />
    );

    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("hides clear filters button when no filters are active", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  it("clears all filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SpeciesActivityFilters
        {...defaultProps}
        rarityFilter="common"
        photoFilter="photographed"
      />
    );

    await user.click(screen.getByText("Clear filters"));

    expect(mockOnRarityChange).toHaveBeenCalledWith("all");
    expect(mockOnPhotoFilterChange).toHaveBeenCalledWith("all");
  });

  it("highlights selected rarity filter", () => {
    const { container } = render(
      <SpeciesActivityFilters {...defaultProps} rarityFilter="uncommon" />
    );

    const uncommonButtons = Array.from(container.querySelectorAll("button"));
    const uncommonButton = uncommonButtons.find(
      (btn) => btn.textContent === "Uncommon"
    );

    expect(uncommonButton?.className).toContain("moss");
  });

  it("highlights selected photo filter", () => {
    const { container } = render(
      <SpeciesActivityFilters
        {...defaultProps}
        photoFilter="not-yet"
      />
    );

    const notYetButtons = Array.from(container.querySelectorAll("button"));
    const notYetButton = notYetButtons.find(
      (btn) => btn.textContent === "Not Yet"
    );

    expect(notYetButton?.className).toContain("sky");
  });

  it("displays all sort options in dropdown", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    const sortSelect = screen.getByRole("combobox");
    const options = Array.from(sortSelect.querySelectorAll("option"));

    expect(options).toHaveLength(6);
    expect(options[0]?.textContent).toContain("Count (Highest First)");
    expect(options[1]?.textContent).toContain("Count (Lowest First)");
    expect(options[2]?.textContent).toContain("Species Name (A-Z)");
    expect(options[3]?.textContent).toContain("Species Name (Z-A)");
    expect(options[4]?.textContent).toContain("Last Heard (Most Recent)");
    expect(options[5]?.textContent).toContain("Last Heard (Oldest)");
  });

  it("has proper ARIA labels for accessibility", () => {
    render(<SpeciesActivityFilters {...defaultProps} />);

    expect(
      screen.getByLabelText("Filter by All rarity")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Common rarity")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Unassigned rarity")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by All photo status")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Photographed photo status")
    ).toBeInTheDocument();
  });

  it("has aria-pressed attribute on filter buttons", () => {
    render(
      <SpeciesActivityFilters {...defaultProps} rarityFilter="rare" />
    );

    const rareButton = screen.getByLabelText("Filter by Rare rarity");
    expect(rareButton).toHaveAttribute("aria-pressed", "true");

    const commonButton = screen.getByLabelText("Filter by Common rarity");
    expect(commonButton).toHaveAttribute("aria-pressed", "false");
  });

  it("updates result count dynamically", () => {
    const { rerender } = render(<SpeciesActivityFilters {...defaultProps} />);

    expect(screen.getByText("Showing 42 of 100 species")).toBeInTheDocument();

    rerender(
      <SpeciesActivityFilters {...defaultProps} resultCount={10} totalCount={100} />
    );

    expect(screen.getByText("Showing 10 of 100 species")).toBeInTheDocument();
  });
});
