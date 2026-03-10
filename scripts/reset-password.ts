import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: npx ts-node scripts/reset-password.ts <email> <new-password>");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await prisma.authAccount.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: { password: hashedPassword },
    });

    if (result.count === 0) {
      console.log("No credential account found for this user.");
    } else {
      console.log(`Password reset successfully for ${email}.`);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
