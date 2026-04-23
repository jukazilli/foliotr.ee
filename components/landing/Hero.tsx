import HeroCarousel from "@/components/landing/HeroCarousel";

export default function Hero() {
  return (
    <section className="flex min-h-screen items-stretch px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex w-full max-w-[97rem] flex-1 items-stretch">
        <HeroCarousel />
      </div>
    </section>
  );
}
