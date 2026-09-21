import { PublicStorePage } from
    "@/modules/storefront/components/public-store";

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return <PublicStorePage slug={slug} />;
}
