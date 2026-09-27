"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

export const NextLinkAdapter = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function NextLinkAdapter(props, ref) {
    return <Link ref={ref} {...props} />;
  },
);
