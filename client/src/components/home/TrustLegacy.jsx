"use client";
import React from 'react';
import FadeInUp from '@/components/global/FadeInUp';

export default function TrustLegacy() {
  return (
    <section className="py-12 md:py-20 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 bg-white border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* Left Column - Big Headline */}
        <div className="lg:col-span-5">
          <FadeInUp>
            <h2 className="font-secondary text-3xl md:text-5xl text-brand-brown leading-tight mb-6">
              MIP Jewellers – <br className="hidden md:inline" />A Choice You Can Trust
            </h2>
            <p className="font-sans text-brand-brown text-sm md:text-base leading-relaxed font-semibold max-w-md">
              {"At MIP Jewellers, Trust is our Foundation. Choosing MIP is not merely selecting jewellery; it's making a conscious decision to entrust your moments and milestones to a brand with a rich legacy of trust and integrity."}
            </p>
          </FadeInUp>
        </div>

        {/* Right Column - Descriptive details */}
        <div className="lg:col-span-7 font-sans text-gray-500 text-sm md:text-base leading-relaxed space-y-6">
          <FadeInUp delay={0.1}>
            <p>
              We have existed since 1925. Need we say more? Would it have been possible without the unwavering trust of generations? Since our inception in 1925, MIP Jewellers has withstood the test of time. A lot has changed over the years, but one thing remains the same: our dedication to purity, quality, authenticity and excellence in every piece we craft. And, we stand behind all our creations.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <ul className="space-y-4 border-l border-brand-gold pl-6 py-2 my-6">
              <li>
                <strong className="text-brand-brown font-medium">BIS (Bureau of Indian Standards) 916 Hallmarked Gold:</strong>
                <span className="block text-xs md:text-sm text-gray-400 mt-1">Easily verify the purity and fitness grade with the BIS logo and the Hallmark Unique Identification (HUID) number.</span>
              </li>
              <li>
                <strong className="text-brand-brown font-medium">Diamond Assurance:</strong>
                <span className="block text-xs md:text-sm text-gray-400 mt-1">Our diamonds undergo rigorous quality testing and grading by the International Gemological Institute (IGI) and the Gemological Institute of America (GIA), guaranteeing their authenticity and quality.</span>
              </li>
            </ul>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <p className="italic font-serif text-brand-gold text-lg mb-4">{"But there's more ..."}</p>
            <p>
              <strong>Transparency</strong> in transactions is one of the foundations of trust. At MIP Jewellers, we give you every detail of your purchase, from gold weight and stone specifics to net weight, stone charge, and making charge. With each transaction, we aim to build more than just a sale; we strive to build a relationship founded on openness, reliability, and the enduring trust you place in MIP Jewellers. {"That's our commitment. We provide you with an unprecedented level of transparency in exchange for your trust. We value YOU."}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <p className="font-secondary text-brand-brown text-lg font-medium pt-4">
              So go ahead, let your jewellery do the talking with MIP Jewellers!
            </p>
          </FadeInUp>
        </div>

      </div>
    </section>
  );
}
