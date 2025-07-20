import { useIntersection } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Email from "@/components/dashboard/email";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import type { EmailData } from "@/types/email";

export const Route = createFileRoute("/second-inbox")({
  component: RouteComponent,
});

const mails: EmailData[] = [
  {
    id: "1",
    from: "Google Security",
    subject: "Security alert: New sign-in to your Google Account",
    content: `Hi Henri,

We noticed a new sign-in to your Google Account on a Mac device. If this was you, you don't need to do anything. If not, we'll help you secure your account.

Review Activity:
Device: Mac
Location: Amsterdam, Netherlands
Time: Today at 2:30 PM

You can review your account activity and manage your security settings at any time in your Google Account.

Best regards,
The Google Accounts team

This email was sent to you because your Google Account security settings indicate you'd like to be notified of important account activity.`,
    date: "2 hours ago",
    unread: true,
    avatar: "G",
  },
  {
    id: "2",
    from: "GitHub",
    subject: "Your GitHub Copilot subscription expires soon",
    content: `Hello Henri,

Your GitHub Copilot Individual subscription will expire in 3 days (July 23, 2025).

To continue using GitHub Copilot:
• Update your billing information
• Renew your subscription
• Or switch to a different plan

Subscription Details:
• Plan: GitHub Copilot Individual
• Price: $10/month
• Renewal Date: July 23, 2025

Don't lose access to AI-powered coding assistance. Renew now to keep coding with confidence.

Thanks,
The GitHub Team`,
    date: "4 hours ago",
    unread: true,
    avatar: "GH",
  },
  {
    id: "3",
    from: "Vercel",
    subject: "Your deployment is ready",
    content: `Hi Henri,

Great news! Your deployment has been successfully completed.

Project: selfmail-dashboard
Branch: main
Commit: feat: add email viewer panel
Status: ✅ Ready

Your application is now live at:
https://selfmail-dashboard-git-main-henri.vercel.app

Performance Score: 98/100
Build Time: 1m 23s
Function Regions: iad1

View your deployment dashboard for detailed analytics and logs.

Happy coding!
The Vercel Team`,
    date: "6 hours ago",
    unread: false,
    avatar: "V",
  },
  {
    id: "4",
    from: "Linear",
    subject: "SLF-123 assigned to you: Implement email viewer component",
    content: `Henri Generlich has assigned SLF-123 to you.

Issue Details:
Title: Implement email viewer component
Status: In Progress
Priority: High
Labels: frontend, react, component

Description:
Create a comprehensive email viewer component that displays:
- Email metadata (sender, subject, date)
- Full email content with proper formatting
- Action buttons (reply, delete, archive)
- Responsive design for different screen sizes

Acceptance Criteria:
✓ Component displays email content
✓ Handles HTML and plain text emails  
✓ Responsive layout
✓ Action buttons functional

Due Date: July 22, 2025

View in Linear: https://linear.app/selfmail/issue/SLF-123`,
    date: "1 day ago",
    unread: false,
    avatar: "L",
  },
  {
    id: "5",
    from: "Stripe",
    subject: "Payment succeeded for $29.00",
    content: `Hi Henri,

A payment of $29.00 has been successfully processed.

Payment Details:
Amount: $29.00 USD
Payment Method: •••• 4242
Date: July 20, 2025
Invoice: inv_1234567890

Description: SelfMail Pro Monthly Subscription

This payment covers your SelfMail Pro subscription for the period of July 20 - August 20, 2025.

Features included in your Pro plan:
• Unlimited email aliases
• Advanced filtering rules
• Priority customer support
• Custom domain integration
• Enhanced security features

Questions about this payment? Contact our support team.

Thanks for your business!
The Stripe Team`,
    date: "2 days ago",
    unread: false,
    avatar: "S",
  },
];

function RouteComponent() {
  const [open, setOpen] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

  const { entry, ref } = useIntersection({
    threshold: 0,
    rootMargin: "0%",
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [entry?.isIntersecting]);

  const handleEmailClick = (email: EmailData) => {
    setSelectedEmail(email);
    setOpen(true);
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader />
      <DashboardNavigation />
      <div ref={ref} className="flex flex-col space-x-3 px-32 py-5">
        <h1 className="text-2xl">Unified Inbox</h1>
        <p>
          About 5000 Mails,{" "}
          <span className="!text-black font-medium">100 unread</span>
        </p>
      </div>
      <EmailViewer
        setOpen={setOpen}
        open={open}
        selectedEmail={selectedEmail}
      />
      <motion.div
        initial={{ width: "100%" }}
        animate={{
          width: open ? "50%" : "100%",
        }}
        className="flex flex-col space-y-3 px-32 py-5"
      >
        {mails.map((email) => (
          <Email
            key={email.id}
            email={email}
            onClick={() => handleEmailClick(email)}
          />
        ))}
      </motion.div>
    </div>
  );
}
// if your scroll below to the list,
// a window will open to the right, the header fades
// out and you can select emails which are then displayed
// in the right window

// if you scroll to the top, to the nav, the window will fade out!

// see: https://www.cosmos.so/e/1227529052 (second image)
