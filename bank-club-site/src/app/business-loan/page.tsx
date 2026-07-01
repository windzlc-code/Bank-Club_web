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
              <li>企業信用貸：以企業營運、負責人信用與收入資料初評。</li>
              <li>廠房不動產抵押貸：需整理廠房或不動產條件、鑑價與既有設定。</li>
              <li>營運週轉金貸款：以營收、流水、報稅與資金用途評估。</li>
            </ul>
          </div>
          <div className="info-block">
            <h2>申請文件</h2>
            <ul>
              <li>營業登記或營業執照、報稅資料。</li>
              <li>近 6 個月銀行存摺、公司財務資料。</li>
              <li>負責人身分資料與財力證明。</li>
              <li>上述敏感文件不在本站普通表單上傳，送出後由 LINE 或專員確認補件方式。</li>
            </ul>
          </div>
        </section>
        <FinancialDisclosure />
        <section className="card-grid">
          <article className="small-card">
            <h2>企業基本資料</h2>
            <p>公司 / 商號名稱、企業型態、營業年數、所在地會寫入企業貸申請詳情，方便後台篩選。</p>
          </article>
          <article className="small-card">
            <h2>營運狀況</h2>
            <p>月平均營收、近一年營業額、員工人數與既有貸款會作為專員初評資訊。</p>
          </article>
          <article className="small-card">
            <h2>貸款需求</h2>
            <p>企業貸款類型、期望金額、還款年限、資金用途與是否有抵押品都是真實表單欄位。</p>
          </article>
        </section>
        <section className="content-section narrow">
          <h2>審核重點與常見驳件原因</h2>
          <p>銀行通常會評估營業時間、營收穩定度、負債狀態、負責人信用與文件完整度。若報稅資料、流水、營業登記或負責人資料不足，可能需要補件或改採其他方案。</p>
          <ol className="step-list">
            <li>選擇企業信用貸、廠房不動產抵押貸或營運週轉金。</li>
            <li>填寫負責人聯絡資料、公司 / 商號名稱、企業型態、營業年數與所在地。</li>
            <li>填寫月營收區間、近一年營業額、期望金額、用途、是否有抵押品與既有企業貸款。</li>
            <li>送出後生成企業貸申請編號，專員再透過 LINE 確認報稅資料、存摺、執照與財力證明補件方式。</li>
          </ol>
        </section>
        <section className="form-section">
          <h2>企業貸款申請表</h2>
          <p>送出後後台會標記為企業貸款案件，優先級設為需要人工判斷，方便專員依企業資料初評。</p>
          <ConsultationForm defaultLoanType="business" defaultIdentityType="business_owner" />
        </section>
        <BreadcrumbJsonLd current="企業貸款" path="/business-loan" />
      </main>
    </PublicShell>
  );
}
