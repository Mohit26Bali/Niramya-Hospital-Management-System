import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/public/home/hero";
import { StatsSection } from "@/components/public/home/stats-section";
import { DepartmentsSection } from "@/components/public/home/departments-section";
import { FeaturedDoctorsSection } from "@/components/public/home/featured-doctors-section";
import { WhyNiramayaSection } from "@/components/public/home/why-niramaya-section";
import { FacilitiesSection } from "@/components/public/home/facilities-section";
import { TestimonialsSection } from "@/components/public/home/testimonials-section";
import { HealthPackagesSection } from "@/components/public/home/health-packages-section";
import { NewsEventsSection } from "@/components/public/home/news-events-section";
import { FaqSection } from "@/components/public/home/faq-section";
import { CtaSection } from "@/components/public/home/cta-section";

export default async function PublicHomePage() {
  const [doctorCount, departmentCount, patientCount, departments, doctors] = await Promise.all([
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { isActive: true } }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.doctor.findMany({
      where: { isActive: true, isAvailable: true },
      take: 6,
      include: { department: true },
      orderBy: { yearsExperience: "desc" },
    }),
  ]);

  return (
    <main className="flex-1">
      <Hero />
      <StatsSection
        doctorCount={doctorCount}
        departmentCount={departmentCount}
        patientCount={patientCount}
      />
      <DepartmentsSection departments={departments} />
      <FeaturedDoctorsSection doctors={doctors} />
      <WhyNiramayaSection />
      <FacilitiesSection />
      <TestimonialsSection />
      <HealthPackagesSection />
      <NewsEventsSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
