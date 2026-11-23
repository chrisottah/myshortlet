"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE_URL } from "@/lib/mock-data/stock-images";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";

export function Hero() {
  const fromAmount = `₦${INVESTMENT_CONFIG.minInvestmentDefault.toLocaleString("en-NG")}`;

  return (
    <section className="relative overflow-hidden bg-charcoal">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      >
        <Image
          src={HERO_IMAGE_URL}
          alt="Modern short-let apartment interior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlays for text contrast */}
        <div className="absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/85 to-charcoal/30" />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-transparent to-transparent" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl lg:text-6xl">
            Put your money to work in short-let opportunities.
          </h1>
          <p className="mt-6 text-lg text-ivory/70">
            Explore vetted short-let investment opportunities across Nigeria
            and grow your capital with illustrative returns, starting from{" "}
            {fromAmount}.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/opportunities">
              <Button size="lg" className="bg-emerald text-ivory hover:bg-emerald/90">
                Explore Opportunities
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                How It Works
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}