import { Users, Stethoscope, CalendarClock, BedDouble, ClipboardList, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { AppointmentsChart } from "@/components/charts/appointments-chart";
import { DepartmentDistributionChart } from "@/components/charts/department-distribution-chart";
import { OccupancyChart } from "@/components/charts/occupancy-chart";
import { AgeDistributionChart } from "@/components/charts/age-distribution-chart";
import { GenderDistributionChart } from "@/components/charts/gender-distribution-chart";
import {
  RecentPatientsPanel,
  TodaysAppointmentsPanel,
  LatestAdmissionsPanel,
  LatestInvoicesPanel,
} from "@/components/dashboard/recent-activity-panels";
import { formatCurrency } from "@/lib/utils";
import * as DashboardService from "@/server/services/dashboard.service";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", { month: "short" });

export default async function DashboardPage() {
  const [
    stats,
    revenueByMonth,
    appointmentsByMonth,
    patientsByDepartment,
    genderDistribution,
    ageDistribution,
    roomOccupancy,
    recentPatients,
    todaysAppointments,
    latestAdmissions,
    latestInvoices,
  ] = await Promise.all([
    DashboardService.getStatCards(),
    DashboardService.getRevenueByMonth(),
    DashboardService.getAppointmentsByMonth(),
    DashboardService.getPatientsByDepartment(),
    DashboardService.getGenderDistribution(),
    DashboardService.getAgeDistribution(),
    DashboardService.getRoomOccupancy(),
    DashboardService.getRecentPatients(),
    DashboardService.getTodaysAppointmentsList(),
    DashboardService.getLatestAdmissions(),
    DashboardService.getLatestInvoices(),
  ]);

  const revenueChartData = revenueByMonth.map((r) => ({
    month: MONTH_FORMATTER.format(new Date(r.month)),
    revenue: r.revenue,
  }));
  const appointmentsChartData = appointmentsByMonth.map((r) => ({
    month: MONTH_FORMATTER.format(new Date(r.month)),
    count: r.count,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of hospital operations"
        actions={<QuickActions />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Patients" value={String(stats.totalPatients)} icon={Users} trend={stats.patientsTrendPct} />
        <StatCard title="Doctors" value={String(stats.totalDoctors)} icon={Stethoscope} />
        <StatCard title="Today's Appointments" value={String(stats.todaysAppointments)} icon={CalendarClock} />
        <StatCard title="Occupied Rooms" value={`${stats.occupiedRooms}/${stats.totalRooms}`} icon={BedDouble} />
        <StatCard title="Admissions Today" value={String(stats.admissionsToday)} icon={ClipboardList} />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={Wallet}
          trend={stats.revenueTrendPct}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming (7 days)" value={String(stats.upcomingAppointments)} icon={CalendarClock} />
        <StatCard title="Bed Occupancy" value={`${stats.bedOccupancyPct.toFixed(0)}%`} icon={BedDouble} />
        <StatCard title="Pending Bills" value={`${stats.pendingBillsCount} · ${formatCurrency(stats.pendingBillsAmount)}`} icon={Wallet} />
        <StatCard title="Doctors On Duty" value={String(stats.doctorsOnDuty)} icon={Stethoscope} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} />
        </div>
        <OccupancyChart data={roomOccupancy} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AppointmentsChart data={appointmentsChartData} />
        <DepartmentDistributionChart data={patientsByDepartment} />
        <div className="grid grid-cols-1 gap-4">
          <GenderDistributionChart data={genderDistribution} />
        </div>
      </div>

      <div className="mt-4">
        <AgeDistributionChart data={ageDistribution} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RecentPatientsPanel patients={recentPatients} />
        <TodaysAppointmentsPanel appointments={todaysAppointments} />
        <LatestAdmissionsPanel admissions={latestAdmissions} />
        <LatestInvoicesPanel invoices={latestInvoices} />
      </div>
    </div>
  );
}
