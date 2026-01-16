import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { LuCheckCircle2 } from "@qwikest/icons/lucide";
import { db } from "database";

const createId = init({ length: 32 });

export const onGet: RequestHandler = async ({ url, cookie, redirect }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    throw redirect(302, "/auth/login?error=Invalid%20magic%20link");
  }

  const magicLink = await db.magicLink.findUnique({
    where: { token },
  });

  if (!magicLink || magicLink.expiresAt < new Date()) {
    throw redirect(
      302,
      "/auth/login?error=Magic%20link%20expired%20or%20invalid"
    );
  }

  let user = await db.user.findUnique({
    where: { email: magicLink.email },
  });

  const isNewUser = !user;

  if (!user) {
    user = await db.user.create({
      data: {
        email: magicLink.email,
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  await db.magicLink.delete({
    where: { id: magicLink.id },
  });

  const sessionToken = createId();
  await db.session.create({
    data: {
      userId: user.id,
      sessionToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  cookie.set("selfmail-session-token", sessionToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

  const hasMembership = await db.member.findFirst({
    where: { userId: user.id },
  });

  if (!hasMembership) {
    throw redirect(302, "/create");
  }

  throw redirect(302, `/?welcome=${isNewUser ? "true" : "false"}`);
};

export default component$(() => {
  const countdown = useSignal(3);

  useVisibleTask$(() => {
    const interval = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value === 0) {
        window.location.href = "/";
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div class="flex min-h-dvh w-full items-center justify-center bg-neutral-50">
      <div class="flex w-full max-w-md flex-col items-center gap-6 p-6 text-center">
        <div class="flex size-20 items-center justify-center rounded-full bg-green-100">
          <LuCheckCircle2 class="size-12 text-green-600" />
        </div>

        <div class="flex flex-col gap-2">
          <h1 class="font-semibold text-3xl text-neutral-900">
            Authentication successful!
          </h1>
          <p class="text-neutral-600 text-sm">
            You have successfully authenticated. Redirecting to your
            dashboard...
          </p>
        </div>

        <div class="mt-4 flex flex-col gap-2">
          <p class="text-neutral-500 text-sm">
            Redirecting in {countdown.value} second
            {countdown.value !== 1 ? "s" : ""}
          </p>
          <a
            class="text-blue-600 text-sm underline hover:text-blue-700"
            href="/"
          >
            Click here if not redirected automatically
          </a>
        </div>
      </div>
    </div>
  );
});
