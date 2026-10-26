import CheckForm from "./CheckForm";

export const metadata = {
  title: "Free online presence check | BrandMover AI",
  description: "See in 30 seconds whether diners can find your restaurant on Google, with a menu website and social media.",
};

export default function Check() {
  return (
    <div className="wrap">
      <nav>
        <a className="logo" href="/" style={{ color: "inherit", textDecoration: "none" }}>Brand<i>Mover</i> AI</a>
        <a className="btn alt" href="/">Back to home</a>
      </nav>
      <section>
        <h2 style={{ marginTop: 16 }}>Can diners find your restaurant online?</h2>
        <p className="lead">Enter your restaurant or lounge name and city. We’ll check Google Maps for your listing and your website, and tell you what’s missing. It’s free, and we’ll use your contact details only to follow up about your result.</p>
        <CheckForm />
      </section>
    </div>
  );
}
