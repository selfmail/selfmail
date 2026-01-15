import { routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";

const createId = init({ length: 32 });

export const useSendMagicLink = routeAction$(
  async ({ email }) => {
    const token = createId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await db.user.findUnique({
      where: { email },
    });

    await db.magicLink.deleteMany({
      where: { email },
    });

    await db.magicLink.create({
      data: {
        email,
        token,
        expiresAt,
        userId: user?.id,
      },
    });

    console.log(`Magic link token: ${token}`);
    console.log(
      `Magic link URL: ${process.env.APP_URL || "http://localhost:5173"}/auth/magic-link/verify?token=${token}`
    );

    return {
      success: true,
      message: "Magic link sent! Check your email.",
    };
  },
  zod$({
    email: z.string().email("Invalid email address"),
  })
);
