
import HeroSection from "../sections/hero-section";
import AboutOurApps from "../sections/about-our-apps";
import OurTestimonials from "../sections2/our-testimonials";
import JobPostSection from "../sections/job-post-section";
import ProjectsSection from "../sections/ProjectsSection";
import OurTeam from "../sections/our-team";
import AddRatings from "../sections2/add-ratings";

const QsHome = () => {
  return (
    <>
      <main className="px-6 md:px-16 lg:px-24 xl:px-32">
        <HeroSection />
       
        <AboutOurApps />
        <OurTeam />
        <ProjectsSection />
        
       
        <JobPostSection />
        <OurTestimonials />

         <AddRatings/>
       
      </main>
    </>
  );
};

export default QsHome;
