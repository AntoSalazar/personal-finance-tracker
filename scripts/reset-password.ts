import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

async function resetPassword() {
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error("Usage: npx ts-node scripts/reset-password.ts <new-password>");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const hashedPassword = await hashPassword(newPassword);

    const result = await prisma.authAccount.updateMany({
      where: { providerId: "credential" },
      data: { password: hashedPassword },
    });

    if (result.count === 0) {
      console.log("No credential accounts found to update.");
    } else {
      console.log(`Password reset for ${result.count} account(s).`);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
