import CitilinkHeader from "@/components/CitilinkHeader";
import CitilinkNav from "@/components/CitilinkNav";
import CitilinkHero from "@/components/CitilinkHero";
import CitilinkCategories from "@/components/CitilinkCategories";
import CitilinkProducts from "@/components/CitilinkProducts";
import CitilinkPromo from "@/components/CitilinkPromo";
import CitilinkBrands from "@/components/CitilinkBrands";
import CitilinkFooter from "@/components/CitilinkFooter";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <CitilinkHeader />
      <CitilinkNav />
      <main className="flex-1">
        <CitilinkHero />
        <CitilinkCategories />
        <CitilinkPromo />
        <CitilinkProducts />
        <CitilinkBrands />
      </main>
      <CitilinkFooter />
    </div>
  );
}
