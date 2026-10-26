const SOCIAL = /(facebook|instagram|tiktok|twitter|x)\.com|linktr\.ee|wa\.me/i;

export type Found = {
  placeId: string; name: string; category?: string; address?: string; phone?: string;
  websiteUri?: string; hasWebsite: boolean; socialStatus: "none" | "found" | "unknown";
};

export async function lookupBusiness(name: string, city: string): Promise<Found | null> {
  return (await searchPlaces(name, city))[0] ?? null;
}

// Google Places API (New) Text Search: public listing data, used within Google's terms.
export async function searchPlaces(query: string, city: string): Promise<Found[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.primaryTypeDisplayName",
    },
    body: JSON.stringify({ textQuery: `${query} in ${city}`, pageSize: 20 }),
  });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.places ?? []).map((p: any): Found => {
    const uri: string | undefined = p.websiteUri;
    const isSocial = !!uri && SOCIAL.test(uri);
    return {
      placeId: p.id, name: p.displayName?.text ?? "Unknown",
      category: p.primaryTypeDisplayName?.text, address: p.formattedAddress,
      phone: p.nationalPhoneNumber, websiteUri: uri,
      hasWebsite: !!uri && !isSocial,
      // Places can't see social pages. A social link as the listed site proves one exists; otherwise unverified.
      socialStatus: isSocial ? "found" : "unknown",
    };
  });
}
