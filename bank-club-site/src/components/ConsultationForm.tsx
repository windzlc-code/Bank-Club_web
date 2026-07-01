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
  const [idFrontName, setIdFrontName] = useState("");
  const [idBackName, setIdBackName] = useState("");

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
          <p>請依本人真實需求、銀行官方頁面與個案審核結果填寫，不要包裝或填寫不真實用途。不確定時先由專員協助確認是否適合送件。</p>
        </div>
      ) : null}
      {loanType === "credit" ? (
        <fieldset className="context-fields">
          <legend>信貸網路申請資料</legend>
          <p className="field-note">本站信貸申請只收身分證正反面。財力證明請傳 LINE 給專員確認補件方式。</p>
          <div className="field-grid">
            <label>
              申請金額
              <input name="requestedAmount" defaultValue="7000000" required inputMode="numeric" />
            </label>
            <label>
              申請年限
              <select name="requestedTermYears" required defaultValue="10">
                <option value="10">10 年</option>
                <option value="7">7 年</option>
                <option value="5">5 年</option>
                <option value="3">3 年</option>
              </select>
            </label>
            <label>
              案件來源
              <select name="caseSource" required defaultValue="company_preferential">
                <option value="company_preferential">公司優惠貸款</option>
                <option value="specialist_referral">專員協助確認</option>
                <option value="unsure">不確定，先諮詢</option>
              </select>
            </label>
            <label>
              適用方案
              <select name="programType" required defaultValue="binding">
                <option value="binding">綁約方案</option>
                <option value="non_binding">不綁約方案</option>
                <option value="unsure">不確定，先諮詢</option>
              </select>
            </label>
            <label>
              身分證正面
              <input
                name="idFront"
                type="file"
                required
                accept="image/jpeg,image/png,image/heic,image/heif"
                onChange={(event) => setIdFrontName(event.currentTarget.files?.[0]?.name || "")}
              />
              <span className="field-help">{idFrontName || "支援 JPG、PNG、HEIC，請確認四角完整且清楚對焦。"}</span>
            </label>
            <label>
              身分證反面
              <input
                name="idBack"
                type="file"
                required
                accept="image/jpeg,image/png,image/heic,image/heif"
                onChange={(event) => setIdBackName(event.currentTarget.files?.[0]?.name || "")}
              />
              <span className="field-help">{idBackName || "正反面缺一不可；若上傳失敗可刪除重選後再送出。"}</span>
            </label>
          </div>
          <div className="warning-block form-warning">
            <h3>信貸申請操作提醒</h3>
            <p>填寫過程請使用站內返回修改，不要按瀏覽器上一頁。綁約方案可能涉及限制清償或提前清償費用，實際條件以銀行審核與契約為準。</p>
          </div>
        </fieldset>
      ) : null}
      {loanType === "house" ? (
        <fieldset className="context-fields">
          <legend>房屋貸款申請資料</legend>
          <p className="field-note">權狀、收入證明、稅單與存摺不在本站上傳；送出後由專員透過 LINE 確認補件方式。</p>
          <div className="field-grid">
            <label>
              房貸類型
              <select name="houseLoanType" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="first_purchase">購屋首貸</option>
                <option value="home_equity">房屋增貸</option>
                <option value="refinance">轉增貸</option>
                <option value="second_mortgage">二胎房貸</option>
                <option value="renovation">老屋修繕貸款</option>
                <option value="unsure">不確定，先諮詢</option>
              </select>
            </label>
            <label>
              房屋縣市
              <input name="propertyCity" required placeholder="例如：新北市" />
            </label>
            <label>
              房屋區域
              <input name="propertyArea" placeholder="例如：中和區" />
            </label>
            <label>
              房屋類型
              <select name="propertyType" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="apartment">公寓</option>
                <option value="elevator">電梯大樓</option>
                <option value="townhouse">透天 / 別墅</option>
                <option value="factory">廠房 / 商辦</option>
              </select>
            </label>
            <label>
              房屋用途
              <select name="propertyUsage" defaultValue="self_use">
                <option value="self_use">自住</option>
                <option value="rental">出租</option>
                <option value="business_use">營業使用</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label>
              持有狀態
              <select name="ownershipStatus" defaultValue="self_owned">
                <option value="self_owned">本人持有</option>
                <option value="family_owned">家人持有</option>
                <option value="buying">購屋中</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label>
              預估市值
              <input name="estimatedPropertyValue" placeholder="可留空，或填預估金額" inputMode="numeric" />
            </label>
            <label>
              是否已有貸款
              <select name="existingMortgage" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="none">無既有房貸</option>
                <option value="has_mortgage">已有房貸</option>
                <option value="second_mortgage">已有二胎或其他設定</option>
              </select>
            </label>
            <label>
              目前貸款銀行
              <input name="currentBank" placeholder="已有貸款時可填" />
            </label>
            <label>
              剩餘貸款金額
              <input name="remainingBalance" placeholder="已有貸款時可填" inputMode="numeric" />
            </label>
            <label>
              期望貸款年限
              <input name="requestedTermYears" placeholder="例如：20" inputMode="numeric" />
            </label>
            <label>
              是否需要寬限期
              <select name="gracePeriodNeeded" defaultValue="no">
                <option value="no">不需要或不確定</option>
                <option value="yes">需要專員評估</option>
              </select>
            </label>
          </div>
        </fieldset>
      ) : null}
      {loanType === "business" ? (
        <fieldset className="context-fields">
          <legend>企業貸款申請資料</legend>
          <p className="field-note">報稅資料、存摺、執照與負責人財力證明不在本站上傳；送出後透過 LINE 與專員確認補件方式。</p>
          <div className="field-grid">
            <label>
              企業貸款類型
              <select name="businessLoanType" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="business_credit">企業信用貸</option>
                <option value="factory_mortgage">廠房不動產抵押貸</option>
                <option value="working_capital">營運週轉金貸款</option>
              </select>
            </label>
            <label>
              公司 / 商號名稱
              <input name="businessName" required placeholder="可填公司、商號或品牌名稱" />
            </label>
            <label>
              統編 / 登記編號
              <input name="registrationNo" placeholder="依實際情況填寫" />
            </label>
            <label>
              企業型態
              <select name="businessType" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="company">公司</option>
                <option value="business">商號 / 行號</option>
                <option value="self_employed">自營接案</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label>
              產業類別
              <input name="industry" placeholder="例如：餐飲、工程、批發零售" />
            </label>
            <label>
              營業年數
              <input name="operatingYears" required placeholder="例如：3" inputMode="decimal" />
            </label>
            <label>
              員工人數
              <input name="employeeCount" placeholder="可留空" inputMode="numeric" />
            </label>
            <label>
              企業所在地
              <input name="businessLocation" required placeholder="例如：新北市中和區" />
            </label>
            <label>
              近一年營業額區間
              <select name="annualRevenueRange" defaultValue="">
                <option value="">尚不確定</option>
                <option value="under_1m">100 萬以下</option>
                <option value="1m_5m">100 萬到 500 萬</option>
                <option value="5m_20m">500 萬到 2,000 萬</option>
                <option value="over_20m">2,000 萬以上</option>
              </select>
            </label>
            <label>
              月平均營收區間
              <select name="monthlyRevenueRange" required defaultValue="">
                <option value="" disabled>請選擇</option>
                <option value="under_100k">10 萬以下</option>
                <option value="100k_500k">10 萬到 50 萬</option>
                <option value="500k_1m">50 萬到 100 萬</option>
                <option value="over_1m">100 萬以上</option>
              </select>
            </label>
            <label>
              期望還款年限
              <input name="requestedTermYears" placeholder="例如：5" inputMode="numeric" />
            </label>
            <label>
              是否有抵押品
              <select name="hasCollateral" defaultValue="no">
                <option value="no">無或不確定</option>
                <option value="yes">有</option>
              </select>
            </label>
            <label>
              是否已有企業貸款
              <select name="hasExistingBusinessLoan" defaultValue="no">
                <option value="no">無或不確定</option>
                <option value="yes">有</option>
              </select>
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
