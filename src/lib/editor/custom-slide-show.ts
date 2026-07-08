"use client";

export interface CustomSlideShow {
  id: string;
  name: string;
  slideIndices: number[];
}

export function createCustomShow(
  slides: unknown[],
  selectedIndices: number[],
  name: string
): CustomSlideShow {
  return {
    id: `show_${Date.now()}`,
    name: name || `Custom Show ${new Date().toLocaleDateString()}`,
    slideIndices: selectedIndices.filter(
      (i) => i >= 0 && i < slides.length
    ),
  };
}

export function applyCustomShow<T>(slides: T[], show: CustomSlideShow): T[] {
  return show.slideIndices
    .filter((i) => i >= 0 && i < slides.length)
    .map((i) => slides[i]);
}

export async function saveCustomShow(
  show: CustomSlideShow,
  presentationId: string
): Promise<void> {
  const supabase = (await import("@/lib/supabase/client")).createClient();
  const { data: existing } = await supabase
    .from("presentations")
    .select("custom_shows")
    .eq("id", presentationId)
    .single();

  const shows: CustomSlideShow[] = existing?.custom_shows || [];
  const idx = shows.findIndex((s) => s.id === show.id);
  if (idx >= 0) {
    shows[idx] = show;
  } else {
    shows.push(show);
  }

  await supabase
    .from("presentations")
    .update({ custom_shows: shows as any })
    .eq("id", presentationId);
}

export async function loadCustomShows(
  presentationId: string
): Promise<CustomSlideShow[]> {
  const supabase = (await import("@/lib/supabase/client")).createClient();
  const { data } = await supabase
    .from("presentations")
    .select("custom_shows")
    .eq("id", presentationId)
    .single();
  return (data?.custom_shows as CustomSlideShow[]) || [];
}
