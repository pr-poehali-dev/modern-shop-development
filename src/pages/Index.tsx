import CitilinkHeader from "@/components/CitilinkHeader";
import CitilinkNav from "@/components/CitilinkNav";
import CitilinkHero from "@/components/CitilinkHero";
import CitilinkDailyDeals from "@/components/CitilinkDailyDeals";
import CitilinkCategories from "@/components/CitilinkCategories";
import CitilinkPromo from "@/components/CitilinkPromo";
import CitilinkProducts from "@/components/CitilinkProducts";
import CitilinkBrands from "@/components/CitilinkBrands";
import CitilinkFooter from "@/components/CitilinkFooter";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <CitilinkHeader />
      <CitilinkNav />
      <main className="flex-1">
        <CitilinkHero />
        <CitilinkDailyDeals />
        <CitilinkCategories />
        <CitilinkPromo />
        <CitilinkProducts />
        <CitilinkBrands />
      </main>
      <CitilinkFooter />
    </div>
  );
}