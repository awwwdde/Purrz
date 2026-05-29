import { Hero } from "@/widgets/Hero";
import { ServiceCategories } from "@/widgets/ServiceCategories";
import { PopularCompanies } from "@/widgets/PopularCompanies";
import { WhyUs } from "@/widgets/WhyUs";

export function HomePage() {
  return (
    <>
      <Hero />
      <ServiceCategories />
      <PopularCompanies />
      <WhyUs />
    </>
  );
}
