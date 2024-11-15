export async function fetchLinkMetadata(url: string) {
    try {
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const html = await response.text();

        // Use a DOMParser to parse the HTML and extract metadata
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Get the title from the HTML
        const title = doc.querySelector("title")?.innerText || "Untitled";

        // Get the favicon, if available
        let faviconUrl;
        const icon = doc.querySelector(
            'link[rel="icon"], link[rel="shortcut icon"]'
        );

        if (icon) {
            faviconUrl = new URL(icon.getAttribute("href") || "", url).href;
        } else {
            // Fallback to using the domain root favicon
            const domain = new URL(url);
            faviconUrl = `${domain.origin}/favicon.ico`;
        }

        return { title, faviconUrl };

    } catch (error) {
        console.error("Failed to fetch metadata:", error);
        return { title: "Untitled", faviconUrl: "" };
    }
}
