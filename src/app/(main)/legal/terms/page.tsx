import { LEGAL_DOC_CLASS, TermsContent } from "@/components/legal/legal-content";

export const metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <div className={`bg-white container py-12 max-w-3xl ${LEGAL_DOC_CLASS}`}>
      <TermsContent />
    </div>
  );
}
