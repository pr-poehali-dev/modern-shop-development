import ServiceclickHeader from "@/components/CitilinkHeader";
import ServiceclickNav from "@/components/CitilinkNav";
import ServiceclickHero from "@/components/CitilinkHero";
import ServiceclickDailyDeals from "@/components/CitilinkDailyDeals";
import ServiceclickCategories from "@/components/CitilinkCategories";
import ServiceclickPromo from "@/components/CitilinkPromo";
import ServiceclickProducts from "@/components/CitilinkProducts";
import ServiceclickBrands from "@/components/CitilinkBrands";
import ServiceclickFooter from "@/components/CitilinkFooter";

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
