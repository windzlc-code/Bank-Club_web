import { connection } from "next/server";
import { ConsultationForm } from "@/components/ConsultationForm";
import { EventLink } from "@/components/EventLink";
import { FinancialDisclosure } from "@/components/FinancialDisclosure";
import { LoanPageTabs, type LoanPageTab } from "@/components/LoanPageTabs";
import { PublicShell } from "@/components/PublicLayout";
import { BreadcrumbJsonLd, JsonLd } from "@/components/StructuredData";
import { TrackedFaqList, type TrackedFaqItem } from "@/components/TrackedFaqList";
import { fbHref } from "@/lib/fb-links";
import { lineHref } from "@/lib/line-links";
import { createPageMetadata } from "@/lib/seo";
import { readDB } from "@/lib/store";

export const metadata = createPageMetadata({
  title: "信用貸款申請指南｜網路申辦流程、文件準備、公司優惠綁約注意事項｜銀行俱樂部",
  description: "整理信用貸款資格、文件、網路申辦 SOP、資金用途風險與 LINE 一對一諮詢入口。",
  path: "/credit-loan",
});

const creditFaqs: TrackedFaqItem[] = [
  {
    id: "credit-official-fields",
    question: "申請金額、年限、案件來源和適用方案可以怎麼填？",
    answer: "這些屬於銀行官方申請欄位，不是網站承諾條件。請依真實需求、還款能力、資金用途與專員確認結果填寫，並以銀行官方頁面規則為準。",
    href: "/blog/credit-application-fields",
  },
  {
    id: "credit-high-risk-purpose",
    question: "資金用途可以填投資理財或股票操作嗎？",
    answer: "資金用途必須依本人真實需求、銀行官方頁面、最新規則與個案審核結果填寫；不確定時先諮詢專員，不能為了送件而包裝或偽造用途。",
    href: "/blog/loan-purpose-risk",
  },
  {
    id: "credit-income-documents",
    question: "財力證明要直接上傳到網站嗎？",
    answer: "本站信貸申請只收身分證正反面；薪轉、扣繳憑單、報稅資料等財力證明不要上傳本站，請透過 LINE 與專員確認補件方式。",
    href: "/documents",
  },
  {
    id: "credit-back-button-crash",
    question: "銀行官方申請頁當機或上一頁中斷怎麼辦？",
    answer: "先保留畫面截圖，不要重複送件或連續刷新，回到 LINE 或表單聯繫專員協助確認下一步。",
    href: "/application-flow",
  },
];

export default async function CreditLoanPage() {
  await connection();
  const { settings } = await readDB();
  const creditLineHref = lineHref(settings.lineUrl, { sourcePage: "credit" });
  const creditFbHref = fbHref(settings.fbGroupUrl, { sourcePage: "credit" });
  const tabs: LoanPageTab[] = [
    {
      id: "credit-plan",
      label: "方案與資格",
      title: "信貸方案與資格先確認",
      description: "先看適合對象、參考方案與合規邊界，再進入站內申請表。",
      content: (
        <>
          <section className="card-grid">
            <article className="small-card">
              <h3>最高 700 萬</h3>
              <p>站內表單會預填 700 萬供確認，實際額度仍依 DBR 22 倍、收入、信用與銀行審核結果為準。</p>
            </article>
            <article className="small-card">
              <h3>最長 10 年</h3>
              <p>站內表單會預填 10 年供確認，實際年限需依還款能力、契約條件與銀行核准結果調整。</p>
            </article>
            <article className="small-card">
              <h3>公司優惠 / 綁約</h3>
              <p>案件來源與適用方案是表單欄位；綁約可能涉及限制清償或提前清償費用。</p>
            </article>
          </section>
          <section className="two-col loan-tab-grid">
            <div className="info-block">
              <h3>適合對象與資格</h3>
              <ul>
                <li>年齡 18 至 65 歲，年齡加貸款年限原則上不超過 65 歲。</li>
                <li>現職工作年資滿半年以上，年收入 NT25 萬元以上。</li>
                <li>需有穩定收入，信用紀錄需正常。</li>
                <li>額度、期限、利率與是否核貸皆由銀行依個案綜合評估。</li>
              </ul>
            </div>
            <div className="warning-block">
              <h3>合規提醒</h3>
              <p>本平台為銀行服務人員媒合與諮詢平台，非銀行或金融機構，不保證核貸、額度、利率或撥款結果。</p>
              <p>資金用途請依本人真實需求、銀行官方頁面、銀行最新規則與個案審核結果填寫，不得包裝或偽造用途。</p>
            </div>
          </section>
        </>
      ),
    },
    {
      id: "credit-documents",
      label: "文件與風險",
      title: "本站只收身分證，財力走 LINE 補件",
      description: "信貸網路申請的敏感資料要最小化處理，避免普通表單收取不必要文件。",
      content: (
        <section className="two-col loan-tab-grid">
          <div className="info-block">
            <h3>本站上傳</h3>
            <ul>
              <li>身分證正面照片，需清楚對焦、四角完整。</li>
              <li>身分證反面照片，避免反光、模糊與裁切。</li>
              <li>支援 JPG、PNG、HEIC，表單會檢查格式、大小、預覽與缺件。</li>
            </ul>
          </div>
          <div className="warning-block">
            <h3>不要上傳本站</h3>
            <ul>
              <li>薪轉、薪資單、扣繳憑單、報稅資料等財力證明。</li>
              <li>自營業主 401/403 表、金融機構存摺、完稅資料。</li>
              <li>上述資料請先透過 LINE 與專員確認補件方式。</li>
            </ul>
          </div>
        </section>
      ),
    },
    {
      id: "credit-flow",
      label: "申請步驟",
      title: "信貸站內申請步驟",
      description: "申請資料、方案選項與身分證正反面上傳都在本站完成。",
      content: (
        <ol className="step-list compact-steps">
          <li>準備身分證正反面，確認照片清楚、完整、無反光。</li>
          <li>填寫姓名、手機、LINE ID、身份類型與預約時段。</li>
          <li>確認申請金額 700 萬、申請年限 10 年、案件來源公司優惠貸款、適用綁約方案。</li>
          <li>依真實需求選擇資金用途；不確定時選「先諮詢專員」。</li>
          <li>上傳身分證正反面，財力證明改用 LINE 與專員確認。</li>
          <li>送出後保留申請編號，若上傳失敗或資料誤填，使用站內修改或聯繫專員，不依賴瀏覽器上一頁。</li>
        </ol>
      ),
    },
    {
      id: "credit-apply",
      label: "站內申請",
      title: "站內信貸網路申請",
      description: "請填寫真實資料並上傳身分證正反面。薪轉、扣繳憑單、報稅資料等財力證明請改透過 LINE 與專員確認。",
      content: (
        <div id="credit-application" className="loan-application-card">
          <ConsultationForm defaultLoanType="credit" defaultIdentityType="employee" />
        </div>
      ),
    },
  ];

  return (
    <PublicShell>
      <main className="subpage">
        <section className="page-hero compact">
          <h1>信用貸款</h1>
          <p>上班族、自營業主高額信貸、公司優惠貸款與網路申辦注意事項一次整理。</p>
          <div className="hero-actions">
            <EventLink className="primary-btn" href="#credit-apply" eventName="credit_form_click" metadata={{ loanType: "credit", sourcePage: "credit" }}>
              開始信貸網路申請
            </EventLink>
            <EventLink className="secondary-btn" href={creditLineHref} eventName="credit_line_click" target={creditLineHref.startsWith("http") ? "_blank" : undefined} metadata={{ loanType: "credit", sourcePage: "credit" }}>
              LINE 詢問專員
            </EventLink>
            <EventLink className="secondary-btn" href={creditFbHref} eventName="credit_fb_click" target="_blank" metadata={{ loanType: "credit", sourcePage: "credit" }}>
              加入 FB 社團
            </EventLink>
          </div>
        </section>
        <FinancialDisclosure />
        <LoanPageTabs tabs={tabs} defaultTabId="credit-apply" />
        <section className="content-section narrow">
          <div className="section-heading">
            <h2>信貸常見問題</h2>
            <p>把網路申辦最容易填錯或中斷的問題做成可展開問答，點擊會寫入事件表，方便後續統計使用者卡點。</p>
          </div>
          <TrackedFaqList items={creditFaqs} eventName="credit_faq_toggle" sourcePage="credit" defaultOpenId={creditFaqs[0].id} />
        </section>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: creditFaqs.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
        <BreadcrumbJsonLd current="信用貸款" path="/credit-loan" />
      </main>
    </PublicShell>
  );
}
