"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { identityLabels, loanLabels } from "@/lib/site-data";
import { getTrackingSessionId } from "@/lib/tracking-session";
import type { IdentityType, LoanType } from "@/lib/types";

type Props = {
  defaultLoanType?: string;
  defaultIdentityType?: string;
};

function sourceFromReferrer(referrer: string) {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("facebook") || host.includes("fb.")) return "facebook";
    if (host.includes("line.me") || host.includes("lin.ee")) return "line";
    if (["google.", "bing.", "yahoo.", "duckduckgo.", "baidu."].some((name) => host.includes(name))) return "seo";
    return "referral";
  } catch {
    return "referral";
  }
}

function keywordFromReferrer(referrer: string) {
  if (!referrer) return "";
  try {
    const params = new URL(referrer).searchParams;
    return params.get("q") || params.get("p") || params.get("query") || params.get("keyword") || "";
  } catch {
    return "";
  }
}

export function ConsultationForm({ defaultLoanType = "unknown", defaultIdentityType = "" }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formStartedAt] = useState(() => Date.now().toString());
  const [loanType, setLoanType] = useState<LoanType>(defaultLoanType as LoanType);
  const [purpose, setPurpose] = useState("unsure");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const search = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    const sessionId = getTrackingSessionId();
    const source = {
      sourcePage: search.get("source_page") || window.location.pathname,
      sourceChannel: search.get("utm_source") || search.get("source_channel") || sourceFromReferrer(referrer),
      sessionId,
      utmSource: search.get("utm_source") || "",
      utmMedium: search.get("utm_medium") || "",
      utmCampaign: search.get("utm_campaign") || "",
      utmContent: search.get("utm_content") || "",
      utmTerm: search.get("utm_term") || "",
      referrer,
      seoKeyword:
        search.get("utm_term") ||
        search.get("keyword") ||
        search.get("q") ||
        keywordFromReferrer(referrer),
    };
    Object.entries(source).forEach(([key, value]) => data.set(key, value));
    const response = await fetch("/api/leads", { method: "POST", body: data });
    const result = (await response.json().catch(() => ({}))) as { leadId?: string; message?: string };
    setSubmitting(false);
    if (!response.ok || !result.leadId) {
      setMessage(result.message || "送出失敗，請稍後再試。");
      return;
    }
    router.push(`/success?lead_id=${encodeURIComponent(result.leadId)}`);
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="bot-field" />
      <input name="formStartedAt" type="hidden" value={formStartedAt} />
      <div className="field-grid">
        <label>
          姓名
          <input name="name" required placeholder="請輸入姓名" />
        </label>
        <label>
          手機
          <input name="phone" required placeholder="09xx xxx xxx" inputMode="tel" />
        </label>
        <label>
          LINE ID
          <input name="lineId" placeholder="方便專員後續聯繫" />
        </label>
        <label>
          身份類型
          <select name="identityType" required defaultValue={defaultIdentityType as IdentityType | ""}>
            <option value="" disabled>
              請選擇
            </option>
            {Object.entries(identityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          貸款類型
          <select name="loanType" required value={loanType} onChange={(event) => setLoanType(event.target.value as LoanType)}>
            {Object.entries(loanLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          期望金額
          <input name="desiredAmount" placeholder="可留空，或填預估金額" inputMode="numeric" />
        </label>
        <label>
          預約時段
          <input name="appointmentTime" required type="datetime-local" />
        </label>
        <label>
          資金用途
          <select name="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)}>
            <option value="living">生活消費</option>
            <option value="renovation">房屋修繕</option>
            <option value="business">合法營運週轉</option>
            <option value="unsure">不確定，想先諮詢專員</option>
            <option value="high_risk">投資理財或高風險用途</option>
          </select>
        </label>
      </div>
      {purpose === "high_risk" ? (
        <div className="warning-block form-warning" role="alert">
          <h3>資金用途需先確認是否符合銀行規範</h3>
          <p>貸款資金不得用於投資理財、股票操作或其他不符合銀行規範的用途。請勿包裝或填寫不真實用途，建議先由專員協助釐清是否可送件。</p>
        </div>
      ) : null}
      {loanType === "house" ? (
        <fieldset className="context-fields">
          <legend>房屋資料</legend>
          <div className="field-grid">
            <label>
              房屋地區
              <input name="propertyRegion" placeholder="例如：新北市中和區" />
            </label>
            <label>
              房屋類型
              <select name="propertyType" defaultValue="">
                <option value="">尚不確定</option>
                <option value="apartment">公寓</option>
                <option value="elevator">電梯大樓</option>
                <option value="townhouse">透天 / 別墅</option>
                <option value="factory">廠房 / 商辦</option>
              </select>
            </label>
            <label>
              預估市值
              <input name="estimatedPropertyValue" placeholder="可留空，或填預估金額" inputMode="numeric" />
            </label>
            <label>
              是否已有貸款
              <select name="existingMortgage" defaultValue="">
                <option value="">尚不確定</option>
                <option value="none">無既有房貸</option>
                <option value="has_mortgage">已有房貸</option>
                <option value="second_mortgage">已有二胎或其他設定</option>
              </select>
            </label>
          </div>
        </fieldset>
      ) : null}
      {loanType === "business" ? (
        <fieldset className="context-fields">
          <legend>企業資料</legend>
          <div className="field-grid">
            <label>
              公司 / 商號名稱
              <input name="companyName" placeholder="可填公司、商號或品牌名稱" />
            </label>
            <label>
              登記型態
              <select name="businessRegistrationType" defaultValue="">
                <option value="">尚不確定</option>
                <option value="company">有限公司 / 股份有限公司</option>
                <option value="business">商號 / 行號</option>
                <option value="factory">工廠 / 廠房</option>
                <option value="self_employed">自營接案</option>
              </select>
            </label>
            <label>
              月營收概估
              <input name="monthlyRevenue" placeholder="可留空，或填概估金額" inputMode="numeric" />
            </label>
          </div>
        </fieldset>
      ) : null}
      <label className="full-field">
        備註
        <textarea name="note" rows={5} placeholder="可描述目前工作、收入型態、是否已有貸款、想詢問的問題。" />
      </label>
      <div className="consent-box">
        <input id="consent" name="consent" type="checkbox" required />
        <label htmlFor="consent">
          我已閱讀並同意個資告知事項：資料僅用於貸款諮詢、資格初步評估與專員電話/LINE 聯繫；利用地區為台灣，利用對象為本平台與受指派專員，利用方式包含電話、LINE、Email、後台案件管理與來源追蹤；保存期間以案件跟進、法令或爭議處理必要期間為限；系統會記錄同意時間、來源、IP 與瀏覽器資訊以供稽核；可要求查詢、更正、停止利用或刪除，不提供必要資料將無法完成諮詢媒合。平台非銀行或金融機構，不保證核貸、額度、利率或撥款結果。
        </label>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <button className="primary-btn form-submit" disabled={submitting}>
        {submitting ? "送出中..." : "送出免費諮詢"}
      </button>
    </form>
  );
}
