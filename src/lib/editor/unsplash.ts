export interface UnsplashPhoto {
  id: string;
  urls: { thumb: string; regular: string; small: string };
  alt_description: string;
  user: { name: string; links: { html: string } };
}

const FALLBACK_IMAGES: UnsplashPhoto[] = [
  { id: "1", urls: { thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60", regular: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", small: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" }, alt_description: "Mountain landscape", user: { name: "eberhard 🖐 grossgasteiger", links: { html: "https://unsplash.com/@eberhardgross" } } },
  { id: "2", urls: { thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=60", regular: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200", small: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" }, alt_description: "Forest path", user: { name: "v2osk", links: { html: "https://unsplash.com/@v2osk" } } },
  { id: "3", urls: { thumb: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=60", regular: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200", small: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400" }, alt_description: "Lake at sunset", user: { name: "Robert Lukeman", links: { html: "https://unsplash.com/@robertlukeman" } } },
  { id: "4", urls: { thumb: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=200&q=60", regular: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=1200", small: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=400" }, alt_description: "Ocean waves", user: { name: "Dave Hoefler", links: { html: "https://unsplash.com/@davehoefler" } } },
  { id: "5", urls: { thumb: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=200&q=60", regular: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200", small: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400" }, alt_description: "Green hills", user: { name: "Sven Mieke", links: { html: "https://unsplash.com/@sven_mieke" } } },
  { id: "6", urls: { thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60", regular: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200", small: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }, alt_description: "Tropical beach", user: { name: "Sean Oulashin", links: { html: "https://unsplash.com/@oulashin" } } },
  { id: "7", urls: { thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=60", regular: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200", small: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400" }, alt_description: "Forest canopy", user: { name: "Luis del Río", links: { html: "https://unsplash.com/@luisdelrio" } } },
  { id: "8", urls: { thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=60", regular: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200", small: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400" }, alt_description: "Mountain river", user: { name: "David Marcu", links: { html: "https://unsplash.com/@davidmarcu" } } },
];

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "";

export async function searchUnsplash(query: string, page: number = 1): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    const filtered = FALLBACK_IMAGES.filter(p =>
      p.alt_description.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.length > 0 ? filtered : FALLBACK_IMAGES;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await res.json();
    return data.results || [];
  } catch {
    return FALLBACK_IMAGES;
  }
}
