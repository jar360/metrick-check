import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { LayoutDashboard, FilePlus as FilePlus2, ClipboardList, Package, ListChecks, FileText, BookOpen, Users, Settings } from "lucide-react";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <PlaceholderPage
              title="Dashboard"
              subtitle="Overview of packaged commodity inspections and compliance status"
              description="The dashboard will display inspection summary cards, recent inspections, review queue summaries, activity visualizations, and category distribution."
              icon={<LayoutDashboard className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/inspections/new"
          element={
            <PlaceholderPage
              title="New Inspection"
              subtitle="Create a new packaged commodity inspection"
              description="The multi-step inspection workflow will guide inspectors through inspection details, image upload, analysis, and evidence-first compliance results."
              icon={<FilePlus2 className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/inspections"
          element={
            <PlaceholderPage
              title="Inspections"
              subtitle="Search and filter all packaged commodity inspections"
              description="The inspections history page will provide a searchable, filterable table of all inspections with status and review state indicators."
              icon={<ClipboardList className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/inspections/:id"
          element={
            <PlaceholderPage
              title="Inspection Detail"
              subtitle="Evidence-first compliance findings and verification"
              description="The inspection detail page will show evidence-first findings, source images, confidence indicators, and the manual verification workflow."
              icon={<ClipboardList className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/products"
          element={
            <PlaceholderPage
              title="Products"
              subtitle="Product compliance passports with historical inspection records"
              description="The products page will display product cards with compliance trends, recurring issues, and links to each product's compliance passport."
              icon={<Package className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/products/:id"
          element={
            <PlaceholderPage
              title="Product Compliance Passport"
              subtitle="Persistent compliance history for this product"
              description="The product detail page will show a historical timeline of inspections, recurring issues, and compliance evidence."
              icon={<Package className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/review-queue"
          element={
            <PlaceholderPage
              title="Review Queue"
              subtitle="Findings requiring human verification and attention"
              description="The review queue will list findings needing manual verification, with confidence, evidence, priority, and inspector actions."
              icon={<ListChecks className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Reports"
              subtitle="Generate and download inspection and compliance reports"
              description="The reports page will offer inspection reports, evidence reports, review summaries, and historical comparisons."
              icon={<FileText className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/rules"
          element={
            <PlaceholderPage
              title="Rules Repository"
              subtitle="Compliance requirements for packaged commodities"
              description="The rules repository will display verified compliance requirements with their applicable commodities, sources, and rule versions."
              icon={<BookOpen className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/users"
          element={
            <PlaceholderPage
              title="Users"
              subtitle="Manage inspectors, reviewers, and administrators"
              description="The users page will list all users with their roles, status, last active time, and permissions."
              icon={<Users className="h-8 w-8 text-brand-500" />}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Settings"
              subtitle="Configure organization, inspection, and system preferences"
              description="The settings page will include organization settings, inspection preferences, evidence preferences, notification preferences, and system status."
              icon={<Settings className="h-8 w-8 text-brand-500" />}
            />
          }
        />
      </Route>
    </Routes>
  );
}
