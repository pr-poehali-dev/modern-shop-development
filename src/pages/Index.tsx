import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickHero from "@/components/ServiceclickHero";
import ServiceclickDailyDeals from "@/components/ServiceclickDailyDeals";
import ServiceclickCategories from "@/components/ServiceclickCategories";
import ServiceclickPromo from "@/components/ServiceclickPromo";
import ServiceclickProducts from "@/components/ServiceclickProducts";
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
        <ServiceclickCategories />
        <ServiceclickPromo />
        <ServiceclickProducts />
        <ServiceclickBrands />
      </main>
      <ServiceclickFooter />
    </div>
  );
}
