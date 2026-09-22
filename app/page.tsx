import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsStrip from '@/components/StatsStrip';
import ProgramAgenda from '@/components/ProgramAgenda';
import Objectives from '@/components/Objectives';
import Speaker from '@/components/Speaker';
import RegistrationForm from '@/components/RegistrationForm';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsStrip />
      <ProgramAgenda />
      <Objectives />
      <Speaker />
      <RegistrationForm />
      <Faq />
      <Footer />
    </main>
  );
}
