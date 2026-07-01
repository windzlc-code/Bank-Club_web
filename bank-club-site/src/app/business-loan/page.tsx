import { connection } from "next/server";
import { ConsultationForm } from "@/components/ConsultationForm";
import { EventLink } from "@/components/EventLink";
import { FinancialDisclosure } from "@/components/FinancialDisclosure";
import { PublicShell } from "@/components/PublicLayout";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { fbHref } from "@/lib/fb-links";
import { lineHref } from "@/lib/line-links";
import { createPageMetadata } from "@/lib/seo";
import { readDB } from "@/lib/store";

export const metadata = createPageMetadata({
  title: "企業貸款諮詢｜中小企業營運週轉、企業信用貸、廠房抵押貸｜銀行俱樂部",
  description: "企業貸款分類、申請文件、審核重點與常見驳件原因整理。",
  path: "/business-loan",
});

export default async function BusinessLoanPage() {
  await connection();
  const { settings } = await readDB();
  const businessLineHref = lineHref(settings.lineUrl, { sourcePage: "business" });
  const businessFbHref = fbHref(settings.fbGroupUrl, { sourcePage: "business" });
  return (
    <PublicShell>
      <main className="subpage">
        <section className="page-hero compact">
          <h1>企業貸款</h1>
          <p>中小企業營運週轉、企業信用貸與廠房不動產抵押貸，先整理資料再對接銀行審核。</p>
          <div className="hero-actions">
            <EventLink className="primary-btn" href="/consultation?loan_type=business&source_page=business" eventName="business_form_click" metadata={{ loanType: "business", sourcePage: "business" }}>
              預約企業貸諮詢
            </EventLink>
            <EventLink className="secondary-btn" href={businessLineHref} eventName="business_line_click" target={businessLineHref.startsWith("http") ? "_blank" : undefined} metadata={{ loanType: "business", sourcePage: "business" }}>
              LINE 詢問專員
            </EventLink>
            <EventLink className="secondary-btn" href={businessFbHref} eventName="business_fb_click" target="_blank" metadata={{ loanType: "business", sourcePage: "business" }}>
              加入 FB 社團
            </EventLink>
          </div>
        </section>
        <section className="two-col">
          <div className="info-block">
            <h2>產品分類</h2>
            <ul>
              <li>企業信用貸</li>
              <li>廠房不動產抵押貸</li>
              <li>營運週轉金貸款</li>
            </ul>
          </div>
          <div className="info-block">
            <h2>申請文件</h2>
            <ul>
              <li>營業登記或營業執照、報稅資料。</li>
              <li>近 6 個月銀行存摺、公司財務資料。</li>
              <li>負責人身分資料與財力證明。</li>
            </ul>
          </div>
        </section>
        <FinancialDisclosure />
        <section className="content-section narrow">
          <h2>審核重點與常見驳件原因</h2>
          <p>銀行通常會評估營業時間、營收穩定度、負債狀態、負責人信用與文件完整度。若報稅資料、流水或負責人資料不足，可能需要補件或改採其他方案。</p>
        </section>
        <section className="form-section">
          <h2>企業貸款諮詢</h2>
          <ConsultationForm defaultLoanType="business" defaultIdentityType="business_owner" />
        </section>
        <BreadcrumbJsonLd current="企業貸款" path="/business-loan" />
      </main>
    </PublicShell>
  );
}
