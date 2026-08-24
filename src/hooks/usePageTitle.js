import { useEffect } from "react";

const SITE_NAME = "Shoply";

/** Sets the tab title and <meta name="description"> for the current page. */
export default function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);
}
