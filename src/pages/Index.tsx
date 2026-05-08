import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickHero from "@/components/ServiceclickHero";
import ServiceclickDailyDeals from "@/components/ServiceclickDailyDeals";
import ServiceclickPromo from "@/components/ServiceclickPromo";
import ServiceclickCategories from "@/components/ServiceclickCategories";
import ServiceclickBrands from "@/components/ServiceclickBrands";
import ServiceclickFooter from "@/components/ServiceclickFooter";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <ServiceclickHeader />
      <ServiceclickNav />
      <main className="flex-1">
        <ServiceclickHero />
        <ServiceclickDailyDeals />
        <ServiceclickPromo />
        <ServiceclickCategories />
        <ServiceclickBrands />
      </main>
      <ServiceclickFooter />
    </div>
  );
}