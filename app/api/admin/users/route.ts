import { NextResponse } from "next/server";
import { getCurrentUser,ensureSchema,query } from "@/app/lib/security";
export const runtime="nodejs";
export async function GET(){
  const user=await getCurrentUser();if(!user||user.role!=="admin")return NextResponse.json({error:"No autorizado"},{status:403});
  await ensureSchema();
  const r=await query(`
    SELECT u.id,u.email,u.role,u.created_at,e.plan,e.status AS access_status,
      p.status AS payment_status,p.plan AS payment_plan,p.amount,p.created_at AS payment_created
    FROM users u LEFT JOIN entitlements e ON e.user_id=u.id
    LEFT JOIN LATERAL (SELECT status,plan,amount,created_at FROM payments WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1) p ON TRUE
    ORDER BY u.created_at DESC LIMIT 250
  `);
  return NextResponse.json({users:r.rows});
}
