/**
 * Slack webhook utility for posting messages to Slack channels.
 * Server-side only — never import this from client components.
 */

import { config } from "@/config";
import { logError, logInfo } from "@/lib/logger";

// Slack Block Kit types (subset we need)
interface SlackTextBlock {
  type: "section";
  text: { type: "mrkdwn"; text: string };
}

interface SlackContextBlock {
  type: "context";
  elements: Array<{ type: "mrkdwn"; text: string }>;
}

interface SlackDividerBlock {
  type: "divider";
}

type SlackBlock = SlackTextBlock | SlackContextBlock | SlackDividerBlock;

interface SlackPayload {
  text: string; // Fallback text for notifications
  blocks: SlackBlock[];
}

/**
 * Post a message to a Slack channel via incoming webhook.
 * Returns success/failure — never throws.
 */
export async function postToSlack(
  webhookUrl: string,
  payload: SlackPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      logError("Slack webhook failed", undefined, {
        status: response.status,
        body,
      });
      return { success: false, error: `Slack returned ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    logError(
      "Slack webhook request failed",
      err instanceof Error ? err : undefined
    );
    return { success: false, error: "Failed to reach Slack" };
  }
}

// Issue type display labels and emoji
const ISSUE_TYPE_META: Record<string, { emoji: string; label: string }> = {
  bug: { emoji: ":bug:", label: "Bug Report" },
  feature_request: { emoji: ":bulb:", label: "Feature Request" },
  question: { emoji: ":question:", label: "Question" },
  other: { emoji: ":speech_balloon:", label: "Other" },
};

interface IssueReportData {
  issueType: string;
  description: string;
  pageUrl: string;
  userAgent?: string;
  userId: string;
  submittedAt: string;
}

/**
 * Format an issue report as a Slack Block Kit message.
 */
export function formatIssueReport(data: IssueReportData): SlackPayload {
  const meta = ISSUE_TYPE_META[data.issueType] ?? {
    emoji: ":speech_balloon:",
    label: "Other",
  };

  // Parse user agent into something readable
  const browser = data.userAgent ? parseUserAgent(data.userAgent) : "Unknown";

  // Format timestamp for readability
  const time = new Date(data.submittedAt).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Extract just the path from the full URL
  let pagePath = data.pageUrl;
  try {
    pagePath = new URL(data.pageUrl).pathname;
  } catch {
    // If URL parsing fails, use the raw value
  }

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${meta.emoji} *New ${meta.label}*`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Description:*\n>${data.description.replace(/\n/g, "\n>")}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: [
            `*Page:* ${pagePath}`,
            `*Browser:* ${browser}`,
            `*Submitted:* ${time}`,
          ].join("  |  "),
        },
      ],
    },
  ];

  return {
    text: `${meta.emoji} New ${meta.label}: ${data.description.slice(0, 100)}`,
    blocks,
  };
}

/**
 * Post an issue report to the #support Slack channel.
 * Returns a friendly error if Slack is not configured.
 */
export async function postIssueReport(
  data: IssueReportData
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = config.slack.supportWebhookUrl;

  if (!webhookUrl) {
    logInfo("Issue report submitted but Slack webhook not configured", {
      userId: data.userId,
    });
    return {
      success: false,
      error: "Issue reporting is not yet configured. Please try again later.",
    };
  }

  const payload = formatIssueReport(data);
  return postToSlack(webhookUrl, payload);
}

/**
 * Parse a User-Agent string into a short, readable description.
 */
function parseUserAgent(ua: string): string {
  // Try to extract browser and OS
  let browser = "Unknown browser";
  let os = "";

  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/([\d]+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/([\d]+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/([\d]+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  }

  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return os ? `${browser} on ${os}` : browser;
}
