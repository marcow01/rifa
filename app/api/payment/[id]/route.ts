import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("ID recebido na rota:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID da transação não informado" },
        { status: 400 }
      );
    }

    const paymentRef = doc(db, "payments", id);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id,
      ...paymentSnap.data(),
    });

  } catch (error: any) {
    console.error("ERRO_GET_PAYMENT:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar pagamento" },
      { status: 500 }
    );
  }
}