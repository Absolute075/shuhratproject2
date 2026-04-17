import { useEffect, useState } from 'react';

type StatusResponse = {
  error: number;
  errMessage?: string;
  data: {
    shop_transaction_id: string;
    octo_payment_UUID: string;
    status: string;
  } | null;
};

export default function PaymentReturnPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const shopTransactionId = localStorage.getItem('octo_shop_transaction_id');
    if (!shopTransactionId) {
      setError('No saved transaction id. Start a payment first.');
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(
          `/api/payments/octo/status?shop_transaction_id=${encodeURIComponent(shopTransactionId)}`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as StatusResponse;
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <h1 className="h2">Payment status</h1>

      {loading ? <div style={{ marginTop: 12 }}>Loading…</div> : null}
      {error ? <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div> : null}

      {result ? (
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}
