import { render, screen, fireEvent } from "@testing-library/react";
import CollapsibleSection from "../CollapsibleSection";

describe("CollapsibleSection", () => {
  it("should render with title and children", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  it("should start collapsed by default", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const content = screen.getByText("Test Content");
    expect(content.parentElement?.parentElement).toHaveClass("max-h-0");
  });

  it("should start expanded when defaultExpanded is true", () => {
    render(
      <CollapsibleSection title="Test Section" defaultExpanded={true}>
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const content = screen.getByText("Test Content");
    expect(content.parentElement?.parentElement).toHaveClass("max-h-[10000px]");
  });

  it("should toggle expansion on click", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole("button");
    const content = screen.getByText("Test Content");

    // Initially collapsed
    expect(content.parentElement?.parentElement).toHaveClass("max-h-0");

    // Click to expand
    fireEvent.click(button);
    expect(content.parentElement?.parentElement).toHaveClass("max-h-[10000px]");

    // Click to collapse
    fireEvent.click(button);
    expect(content.parentElement?.parentElement).toHaveClass("max-h-0");
  });

  it("should toggle on Enter key", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole("button");
    const content = screen.getByText("Test Content");

    // Press Enter to expand
    fireEvent.keyDown(button, { key: "Enter" });
    expect(content.parentElement?.parentElement).toHaveClass("max-h-[10000px]");
  });

  it("should toggle on Space key", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole("button");
    const content = screen.getByText("Test Content");

    // Press Space to expand
    fireEvent.keyDown(button, { key: " " });
    expect(content.parentElement?.parentElement).toHaveClass("max-h-[10000px]");
  });

  it("should have correct aria attributes", () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole("button");

    // Initially collapsed
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Expand
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
