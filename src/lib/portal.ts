/**
 * Stand-in for real authentication in the client portal.
 *
 * In production, the currently-authenticated dental-practice user determines
 * which client the portal scopes to. For the wireframe we hardcode it — swap
 * this value in dev to preview the portal as a different practice.
 *
 * Mayfair is the default because it's the only active client with
 * `clientApprovalRequired: true`, so the Approvals page has content to show.
 */
export const CURRENT_PORTAL_CLIENT_ID = "mayfair-dental";
