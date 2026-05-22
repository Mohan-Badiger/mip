import StoresClient from '@/components/stores/StoresClient';
import PageLayout from '@/components/global/PageLayout';

export const metadata = {
  title: 'Store Locator | MIP Jewellers',
  description: 'Find your nearest MIP Jewellers showroom. Visit us to experience our complete jewellery collection in person.',
};

export default function StoresPage() {
  return (
    <PageLayout>
      <StoresClient />
    </PageLayout>
  );
}
