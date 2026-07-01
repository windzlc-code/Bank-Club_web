import { ConsultationForm } from "@/components/ConsultationForm";
import { PublicShell } from "@/components/PublicLayout";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { createPageMetadata } from "@/lib/seo";
import type { IdentityType, LoanType } from "@/lib/types";

export const metadata = createPageMetadata({
  title: "免費諮詢預約｜銀行俱樂部",
  description: "填寫貸款諮詢表單，後台自動建立線索並由專員跟進。",
  path: "/consultation",
});

function normalizedLoanType(value: string | undefined): LoanType {
  if (value === "credit" || value === "house" || value === "business") return value;
  return "unknown";
}

function defaultIdentityForLoanType(loanType: LoanType): IdentityType | "" {
  if (loanType === "business") return "business_owner";
  if (loanType === "house") return "home_owner";
  return "";
}

export default async function ConsultationPage({ searchParams }: { searchParams: Promise<{ loan_type?: string }> }) {
  const params = await searchParams;
  const loanType = normalizedLoanType(params.loan_type);
  return (
    <PublicShell>
      <main className="subpage">
        <section className="page-hero compact">
          <h1>免費諮詢預約</h1>
          <p>表單只收初步諮詢必要資料，不收身分證照片、財力證明或銀行存摺影本。</p>
        </section>
        <section className="form-section">
          <ConsultationForm defaultLoanType={loanType} defaultIdentityType={defaultIdentityForLoanType(loanType)} />
        </section>
        <BreadcrumbJsonLd current="免費諮詢預約" path="/consultation" />
      </main>
    </PublicShell>
  );
}
