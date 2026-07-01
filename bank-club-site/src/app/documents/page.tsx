import Image from "next/image";
import { connection } from "next/server";
import { EventLink } from "@/components/EventLink";
import { PublicShell } from "@/components/PublicLayout";
import { SessionDownloadLink } from "@/components/SessionDownloadLink";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { fbHref } from "@/lib/fb-links";
import { lineHref } from "@/lib/line-links";
import { materialAssets, materialAssetPath } from "@/lib/material-assets";
import { createPageMetadata } from "@/lib/seo";
import { readDB } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "銀行資格與文件總整理｜信貸、房貸、企業貸文件清單｜銀行俱樂部",
  description: "比較不同貸款類型的資格、文件與諮詢入口，支援公開文件清單下載與事件追蹤。",
  path: "/documents",
});

export default async function DocumentsPage() {
  await connection();
  const db = await readDB();
  const publicFiles = db.files.filter((file) => file.visibility === "public");
  const rows = [
    {
      label: "信用貸款",
      audience: "上班族、自營業主",
      qualification: "年齡、收入、信用",
      documents: "身分證、財力證明",
      loanType: "credit",
      eventPrefix: "documents_credit",
    },
    {
      label: "房屋貸款",
      audience: "有房族、購屋族",
      qualification: "房產條件、收入",
      documents: "權狀、收入證明、稅單",
      loanType: "house",
      eventPrefix: "documents_house",
    },
    {
      label: "企業貸款",
      audience: "企業主、商號負責人",
      qualification: "營業時間、營收",
      documents: "報稅資料、存摺、執照",
      loanType: "business",
      eventPrefix: "documents_business",
    },
  ];
  const documentsLineHref = lineHref(db.settings.lineUrl, { sourcePage: "documents" });
  const documentsFbHref = fbHref(db.settings.fbGroupUrl, { sourcePage: "documents", sourceDetail: "file_checklist" });
  return (
    <PublicShell>
      <main className="subpage">
        <section className="page-hero compact">
          <h1>銀行資格與文件總整理</h1>
          <p>不同身分的文件要求不同，先用清單整理方向，再由專員確認補件方式。</p>
        </section>
        <section className="compare-table">
          <table>
            <thead>
              <tr>
                <th>類型</th>
                <th>適合對象</th>
                <th>常見資格</th>
                <th>常見文件</th>
                <th>諮詢入口</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.loanType}>
                  <td>{row.label}</td>
                  <td>{row.audience}</td>
                  <td>{row.qualification}</td>
                  <td>{row.documents}</td>
                  <td>
                    <div className="table-actions">
                      <EventLink
                        className="text-link"
                        href={lineHref(db.settings.lineUrl, { sourcePage: "documents", sourceDetail: row.loanType })}
                        eventName={`${row.eventPrefix}_line_click`}
                        target={documentsLineHref.startsWith("http") ? "_blank" : undefined}
                      >
                        LINE
                      </EventLink>
                      <EventLink
                        className="text-link"
                        href={`/consultation?loan_type=${row.loanType}&source_page=documents`}
                        eventName={`${row.eventPrefix}_form_click`}
                      >
                        表單
                      </EventLink>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card-grid">
          {publicFiles.map((file) => (
            <article className="small-card" key={file.id}>
              <h2>{file.title}</h2>
              <p>{file.description}</p>
              <p className="muted-line">版本 v{file.version}｜已下載 {file.downloads} 次</p>
              <SessionDownloadLink className="outline-link" href={`/api/files/${file.id}/download?source=/documents`}>
                下載 PDF 清單
              </SessionDownloadLink>
              <EventLink
                className="outline-link"
                href={lineHref(db.settings.lineUrl, { sourcePage: "documents", sourceDetail: file.type })}
                eventName="documents_file_line_click"
                target={documentsLineHref.startsWith("http") ? "_blank" : undefined}
                metadata={{ fileId: file.id, fileType: file.type }}
              >
                下載後用 LINE 確認
              </EventLink>
            </article>
          ))}
        </section>
        <section className="content-section narrow">
          <h2>下載後到社團看文件範例</h2>
          <p>清單只適合先整理方向，實際補件方式仍需依銀行官方頁面或專員確認。若想看常見文件問題與流程提醒，可加入 FB 社團；涉及個人條件時請改用 LINE 或表單。</p>
          <div className="hero-actions">
            <EventLink className="primary-btn" href={documentsLineHref} eventName="documents_bottom_line_click" target={documentsLineHref.startsWith("http") ? "_blank" : undefined}>
              LINE 確認文件
            </EventLink>
            <EventLink className="secondary-btn" href={documentsFbHref} eventName="documents_fb_click" target="_blank" metadata={{ sourceDetail: "file_checklist" }}>
              加入 FB 社團看文件範例
            </EventLink>
          </div>
        </section>
        <section className="content-section">
          <div className="section-heading">
            <h2>首批圖文素材</h2>
            <p>可用於站內文章、FB 社團貼文與 LINE 諮詢前置說明，所有圖卡都保留合規提醒。</p>
          </div>
          <div className="material-grid">
            {materialAssets.map((asset) => (
              <article className="material-card" key={asset.slug}>
                <Image
                  src={materialAssetPath(asset.slug)}
                  alt={`${asset.title}：${asset.subtitle}`}
                  width={1080}
                  height={1080}
                  unoptimized
                />
                <h3>{asset.title}</h3>
                <p>{asset.subtitle}</p>
                <EventLink
                  className="outline-link"
                  href={materialAssetPath(asset.slug)}
                  eventName="material_asset_open"
                  target="_blank"
                  metadata={{ materialSlug: asset.slug, sourceChannel: "documents" }}
                >
                  開啟圖卡
                </EventLink>
              </article>
            ))}
          </div>
        </section>
        <BreadcrumbJsonLd current="銀行資格與文件總整理" path="/documents" />
      </main>
    </PublicShell>
  );
}
