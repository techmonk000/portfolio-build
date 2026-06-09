import Navigation from "@/components/ui/Navigation";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import PageWrapper from "@/components/ui/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      {/* Navigation is outside smooth-content so fixed positioning works */}
      <Navigation />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero />
            <About />
            <Projects />
            <Skills />
            <Experience />
            <Contact />
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}
