import { init } from "@paralleldrive/cuid2";
import { db } from "database";

const createId = init({ length: 32 });

const MAGIC_LINK_EXPIRATION_MINUTES = 15;

interface CreateMagicLinkParams {
  email: string;
}

interface CreateMagicLinkResult {
  token: string;
  expiresAt: Date;
  userId: string | null;
}

export const createMagicLink = async ({
  email,
}: CreateMagicLinkParams): Promise<CreateMagicLinkResult> => {
  const token = createId();
  const expiresAt = new Date(
    Date.now() + MAGIC_LINK_EXPIRATION_MINUTES * 60 * 1000
  );

  const user = await db.user.findUnique({
    where: { email },
  });

  await db.magicLink.deleteMany({
    where: { email },
  });

  const magicLink = await db.magicLink.create({
    data: {
      email,
      token,
      expiresAt,
      userId: user?.id,
    },
  });

  return {
    token: magicLink.token,
    expiresAt: magicLink.expiresAt,
    userId: magicLink.userId,
  };
};
