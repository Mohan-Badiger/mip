"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import JewelryLoader from "@/components/jewelry-loader";

export default function RedirectSectionsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/cms?tab=layout");
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-125 text-slate-400 font-sans bg-bg-cream">
      <JewelryLoader size="md" label="Redirecting to Consolidated CMS Dashboard..." />
    </div>
  );
}
