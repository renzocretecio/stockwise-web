import { OrderTrackingPage } from
    "@/modules/storefront/components/order-tracking";

export default async function TrackOrderPage({
    params,
    searchParams,
}: {
    params: Promise<{ reference: string }>;
    searchParams: Promise<{ token?: string | string[] }>;
}) {
    const { reference } = await params;
    const query = await searchParams;
    const token = typeof query.token === "string" ? query.token : "";

    return <OrderTrackingPage reference={reference} token={token} />;
}
