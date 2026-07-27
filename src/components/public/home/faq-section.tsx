import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/public/section-heading";

const FAQS = [
  {
    question: "What are your visiting hours?",
    answer:
      "General visiting hours are from 10 AM to 12 PM and 5 PM to 7 PM daily. ICU visiting hours are more restricted — please check with the nursing station.",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "Yes, we work with most major insurance providers. Please bring your insurance card and ID when you visit, and our billing desk can verify your coverage.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "You can book an appointment online through our Appointments page, or call our reception desk directly during OPD hours.",
  },
  {
    question: "Is emergency care available 24/7?",
    answer:
      "Yes, our Emergency Department is staffed and open 24 hours a day, 7 days a week, including all holidays.",
  },
  {
    question: "What documents do I need to register?",
    answer:
      "Please bring a valid government-issued photo ID, your insurance card (if applicable), and any previous medical records relevant to your visit.",
  },
  {
    question: "Can I get a second opinion?",
    answer:
      "Absolutely. We welcome second opinion consultations — simply book an appointment with the relevant specialist and mention it's for a second opinion.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Have Questions?"
          title="Frequently Asked Questions"
          align="center"
          className="mx-auto"
        />
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
