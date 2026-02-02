import type * as React from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "lottie-player": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          src?: string;
          background?: string;
          speed?: number | string;
          loop?: boolean;
          autoplay?: boolean;
          style?: React.CSSProperties;
        };
      }
    }
  }
}

export {};
