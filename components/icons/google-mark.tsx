import * as React from "react";

type Props = React.SVGProps<SVGSVGElement>;

/**
 * Simple Google-style mark (not an exact brand asset).
 * If you need the official logo, replace this with an approved SVG in /public.
 */
export function GoogleMark({ className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {/* A friendly, abstract multicolor "G" */}
      <path
        d="M12 3.5a8.5 8.5 0 0 1 5.99 2.4l-1.9 1.9A5.9 5.9 0 0 0 12 6.1c-2.07 0-3.86 1.06-4.92 2.66L4.9 6.6A8.48 8.48 0 0 1 12 3.5z"
        fill="#EA4335"
      />
      <path
        d="M4.9 6.6l2.18 2.17A5.87 5.87 0 0 0 6.1 12c0 .92.21 1.8.6 2.58L4.45 16.8A8.49 8.49 0 0 1 3.5 12c0-2.05.73-3.93 1.4-5.4z"
        fill="#FBBC05"
      />
      <path
        d="M6.7 14.58A5.9 5.9 0 0 0 12 17.9c1.62 0 2.98-.52 3.98-1.4l2.02 2.02A8.5 8.5 0 0 1 12 20.5a8.49 8.49 0 0 1-7.55-3.7l2.25-2.22z"
        fill="#34A853"
      />
      <path
        d="M20.5 12c0-.6-.07-1.04-.16-1.5H12v3.1h4.85c-.1.77-.5 1.93-1.62 2.9l2.02 2.02C19.07 17.05 20.5 14.9 20.5 12z"
        fill="#4285F4"
      />
    </svg>
  );
}
