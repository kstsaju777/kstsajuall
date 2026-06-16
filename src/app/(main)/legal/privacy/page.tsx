import { LEGAL_DOC_CLASS, PrivacyContent } from "@/components/legal/legal-content";

export const metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <div className={`bg-white container py-12 max-w-3xl ${LEGAL_DOC_CLASS}`}>
      <PrivacyContent />
    </div>
  );
}
