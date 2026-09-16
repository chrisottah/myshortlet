import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is MyShortlet?",
    answer:
      "MyShortlet is an investment platform where members of the public fund vetted short-let apartment opportunities for a fixed term and receive illustrative returns at maturity. It is not a property marketplace and does not offer fractional ownership.",
  },
  {
    question: "Are the returns guaranteed?",
    answer:
      "No. All returns shown on MyShortlet are illustrative, demo, or projected figures — never guaranteed.",
  },
  {
    question: "How are properties vetted?",
    answer:
      "Property owners submit their short-let apartments through our application form. Our team reviews ownership documents, financials, and property details before approving a listing.",
  },
  {
    question: "How do I withdraw my investment?",
    answer:
      "At maturity, your principal and illustrative earnings are credited to your MyShortlet wallet, from which you can withdraw via bank transfer or crypto.",
  },
  {
    question: "Is this a live platform?",
    answer:
      "MyShortlet is currently a demo. No real payments, crypto, or banking integrations are active.",
  },
  {
    question: "How do I list my property?",
    answer:
      "Property owners can apply through our Partner Application form. Once submitted, your property enters our vetting queue.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-charcoal">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-champagne">
              FAQ
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/70">
              Answers to common questions about investing and listing on
              MyShortlet.
            </p>
          </div>
        </section>

        {/* Accordion */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <Accordion>
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="font-display text-lg text-charcoal">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-charcoal/60">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <Footer />
    </>
  );
}