import { connection } from "next/server";
import { LoanCalculator } from "@/components/Calculators";
import { ConsultationForm } from "@/components/ConsultationForm";
import { EventLink } from "@/components/EventLink";
import { FinancialDisclosure } from "@/components/FinancialDisclosure";
import { HouseLineQuickForm } from "@/components/HouseLineQuickForm";
import { PublicShell } from "@/components/PublicLayout";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { fbHref } from "@/lib/fb-links";
import { lineHref } from "@/lib/line-links";
import { createPageMetadata } from "@/lib/seo";
import { readDB } from "@/lib/store";

export const metadata = createPageMetadata({
  title: "房屋貸款諮詢｜增貸、轉增貸、二胎房貸、購屋貸款｜銀行俱樂部",
  description: "房屋貸款分類、文件清單、鑑價到撥款流程與月付試算工具。",
  path: "/house-loan",
});

export default async function HouseLoanPage() {
  await connection();
  const { settings } = await readDB();
  const houseLineHref = lineHref(settings.lineUrl, { sourcePage: "house" });
  const houseFbHref = fbHref(settings.fbGroupUrl, { sourcePage: "house" });
  return (
    <PublicShell>
      <main className="subpage">
        <section className="page-hero compact">
          <h1>房屋貸款</h1>
          <p>購屋首貸、房屋增貸、轉增貸、二胎房貸與老屋修繕貸款諮詢。</p>
          <div className="hero-actions">
            <EventLink className="primary-btn" href="/consultation?loan_type=house&source_page=house" eventName="house_form_click" metadata={{ loanType: "house", sourcePage: "house" }}>
              預約房貸諮詢
            </EventLink>
            <EventLink className="secondary-btn" href={houseLineHref} eventName="house_line_click" target={houseLineHref.startsWith("http") ? "_blank" : undefined} metadata={{ loanType: "house", sourcePage: "house" }}>
              LINE 詢問專員
            </EventLink>
            <EventLink className="secondary-btn" href={houseFbHref} eventName="house_fb_click" target="_blank" metadata={{ loanType: "house", sourcePage: "house" }}>
              加入 FB 社團
            </EventLink>
          </div>
        </section>
        <section className="card-grid">
          {["購屋首貸", "房屋增貸", "轉增貸", "二胎房貸", "老屋修繕貸款"].map((item) => (
            <article className="small-card" key={item}>
              <h2>{item}</h2>
              <p>依房產條件、收入、負債與銀行鑑價結果評估成數、年限與利率。</p>
            </article>
          ))}
        </section>
        <FinancialDisclosure />
        <section className="content-section narrow">
          <h2>鑑價到撥款流程</h2>
          <ol className="step-list">
            <li>填寫房屋地區、類型、預估市值與是否已有貸款。</li>
            <li>專員協助初步整理房產條件與收入資料。</li>
            <li>銀行進行鑑價、審核、對保與撥款。</li>
          </ol>
        </section>
        <HouseLineQuickForm lineHref={lineHref(settings.lineUrl, { sourcePage: "house", sourceDetail: "property_quick_line" })} />
        <LoanCalculator title="房貸月付試算" />
        <section className="form-section">
          <h2>房屋資料諮詢表</h2>
          <ConsultationForm defaultLoanType="house" defaultIdentityType="home_owner" />
        </section>
        <BreadcrumbJsonLd current="房屋貸款" path="/house-loan" />
      </main>
    </PublicShell>
  );
}
