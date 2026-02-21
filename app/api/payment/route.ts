import { NextResponse } from "next/server";
import { runTransaction, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PIXUP_AUTH_URL = "https://api.pixupbr.com/v2/oauth/token";
const PIXUP_QRCODE_URL = "https://api.pixupbr.com/v2/pix/qrcode";

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getPixupToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && (cachedToken.expires_at - 30000) > now) {
    return cachedToken.access_token;
  }

  const clientId = process.env.PIXUP_CLIENT_ID;
  const clientSecret = process.env.PIXUP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais não encontradas no .env");
  }

  const credentials = `${clientId}:${clientSecret}`;
  const base64 = Buffer.from(credentials).toString("base64");

  const response = await fetch(PIXUP_AUTH_URL, {
  method: "POST",
  headers: {
    Authorization: `Basic ${base64}` 
  },
  body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    throw new Error(`Falha na autenticação: ${response.status} - ${errorDetail}`);
  }

  const data = await response.json();

  cachedToken = {
    access_token: data.access_token,
    expires_at: now + (data.expires_in * 1000), 
  };

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = await getPixupToken();
    const quantity = Math.round(body.amount * 100);

    const counterRef = doc(db, "settings", "numbers_counter");
    const interval = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      // Se não existir, começa do 0
      const lastNumber = counterDoc.exists() ? counterDoc.data().lastNumber : 0;
      
      const startNumber = lastNumber + 1;
      const endNumber = lastNumber + quantity;

      // Atualiza o contador para o próximo
      transaction.set(counterRef, { lastNumber: endNumber }, { merge: true });

      return { startNumber, endNumber };
    });


    const pixRes = await fetch(PIXUP_QRCODE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: body.amount,
        postbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook`,
        external_id: body.external_id || `ref_${Date.now()}`,
        payer: body.payer,
      }),
    });

    const pixData = await pixRes.json();
    //console.log(pixData)

    if (!pixRes.ok) {
        return NextResponse.json({ error: "Erro na PixUp", detail: pixData }, { status: pixRes.status });
    }

    return NextResponse.json({
      ...pixData,
      numbersInterval: interval // { startNumber: 1, endNumber: 1980 }
    });

  } catch (err: any) {
    console.error("ERRO_PIX_ROUTE:", err.message);
    return NextResponse.json({ error: "Erro interno ao processar PIX" }, { status: 500 });
  }
}