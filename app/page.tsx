import Nav from "../components/Nav";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import AddSection from "../components/AddSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <AboutSection />
      <AddSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
