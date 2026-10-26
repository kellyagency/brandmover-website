import "./globals.css";
export const metadata = {
  title: "BrandMover AI | Websites and social media for restaurants and lounges",
  description: "We build your restaurant a website with your menu and run your social media. You only pay once you've seen and approved the result.",
};
export const viewport = { width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
