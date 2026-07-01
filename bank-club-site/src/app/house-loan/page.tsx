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
          {[
            ["購屋首貸", "購屋中或準備買房，先整理收入、頭期款與預估房價。"],
            ["房屋增貸", "已有房產想增加資金，需看鑑價、既有貸款與收入負債比。"],
            ["轉增貸", "評估轉貸並增加可用資金，需比較目前銀行、剩餘本金與成本。"],
            ["二胎房貸", "已有一胎設定時評估第二順位方案，條件與成本需由專員初評。"],
            ["老屋修繕貸款", "修繕、整修或裝潢用途，依房屋條件與資金用途整理。"],
          ].map(([item, text]) => (
            <article className="small-card" key={item}>
              <h2>{item}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <FinancialDisclosure />
        <section className="two-col">
          <div className="info-block">
            <h2>房貸文件提醒</h2>
            <ul>
              <li>常見文件包含身分證、房屋權狀、收入證明、稅單、銀行存摺。</li>
              <li>本站房貸表單不收權狀、稅單、收入證明等敏感文件。</li>
              <li>送出後請透過 LINE 與專員確認實際補件方式。</li>
            </ul>
          </div>
          <div className="warning-block">
            <h2>真實填寫重點</h2>
            <p>房屋所在地、房屋類型與是否已有貸款會影響初評。若已有貸款，請補充目前銀行與剩餘貸款金額，方便專員判斷可行方案。</p>
          </div>
        </section>
        <section className="content-section narrow">
          <h2>鑑價到撥款流程</h2>
          <ol className="step-list">
            <li>選擇房貸類型：購屋首貸、增貸、轉增貸、二胎或修繕。</li>
            <li>填寫房屋地區、類型、用途、持有狀態、預估市值與是否已有貸款。</li>
            <li>填寫期望金額、年限、資金用途與是否需要寬限期。</li>
            <li>專員協助初步整理房產條件與收入資料。</li>
            <li>銀行進行鑑價、審核、對保與撥款。</li>
          </ol>
        </section>
        <HouseLineQuickForm lineHref={lineHref(settings.lineUrl, { sourcePage: "house", sourceDetail: "property_quick_line" })} />
        <LoanCalculator title="房貸月付試算" />
        <section className="form-section">
          <h2>房屋貸款申請表</h2>
          <p>送出後會產生房貸申請編號，後台自動標記為房屋貸款案件，專員再透過電話或 LINE 跟進補件。</p>
          <ConsultationForm defaultLoanType="house" defaultIdentityType="home_owner" />
        </section>
        <BreadcrumbJsonLd current="房屋貸款" path="/house-loan" />
      </main>
    </PublicShell>
  );
}
