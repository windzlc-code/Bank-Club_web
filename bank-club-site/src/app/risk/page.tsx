import { PublicShell } from "@/components/PublicLayout";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "金融風險聲明｜銀行俱樂部",
  description: "聲明銀行俱樂部非銀行或金融機構，不保證核貸、額度、利率或撥款結果，貸款資金不得用於違規用途。",
  path: "/risk",
});

export default function RiskPage() {
  return (
    <PublicShell>
      <main className="legal-page">
        <h1>金融風險聲明</h1>
        <section>
          <h2>平台身份</h2>
          <p>本平台為銀行服務人員媒合與貸款諮詢平台，非銀行或金融機構，亦非銀行官方申請網站。</p>
        </section>
        <section>
          <h2>審核與費用揭露</h2>
          <p>所有貸款申請、審核、利率、額度、年限、費用、綁約條件、提前清償限制與撥款結果均以銀行最終審核及官方契約文件為準。</p>
          <p>如頁面或文章提及利率、開辦費、帳戶管理費、總費用年百分率或其他費用，均僅作資訊整理與申請前提醒；總費用年百分率不等於貸款利率，實際費用與年百分率仍以銀行揭露為準。</p>
        </section>
        <section>
          <h2>禁止承諾與用途風險</h2>
          <p>本平台不保證核貸、不保證額度、不保證利率、不承諾最低費用，也不協助包裝財力、規避銀行審核或填寫不實用途。</p>
          <p>貸款資金不得用於投資理財、股票操作或其他違反銀行規定用途。申請人必須提供真實資料，偽造文件或虛假陳述可能觸犯法律。</p>
        </section>
        <BreadcrumbJsonLd current="金融風險聲明" path="/risk" />
      </main>
    </PublicShell>
  );
}
