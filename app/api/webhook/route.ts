import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
const data = body.requestBody || body; 

    const transactionId = data.transactionId;
    const status = data.status;

    console.log("ID recebido no Webhook:", transactionId);

    if (!transactionId) {
      return NextResponse.json({ error: "error, ausencia de id de transicao" }, { status: 400 });
    }

    const paymentRef = doc(db, "payments", transactionId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json({ error: "error" }, { status: 404 });
    }

    const payment = paymentSnap.data();
    const userid = payment.userid;
    const amount = payment.amount;

    if (status === "PAID") {
      await updateDoc(paymentRef, {
        status: "paid",
        paidAt: new Date(),
      });

      const userRef = doc(db, "users", userid);
      await updateDoc(userRef, {
        gastos: increment(amount),
      });

      //console.log(":", transactionId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    //console.error("error", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
