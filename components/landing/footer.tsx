import Link from "next/link";

const footerLinks = {
  resources: {
    title: "Resources",
    links: [
      { href: "#", label: "Documentation" },
      {
        href: "https://github.com/yourusername/ai-chat-saas-stack/issues",
        label: "GitHub Issues",
        external: true,
      },
      { href: "#", label: "Changelog" },
    ],
  },
  community: {
    title: "Community",
    links: [
      { href: "#", label: "Discord" },
      { href: "#", label: "Twitter" },
      {
        href: "https://github.com/yourusername/ai-chat-saas-stack",
        label: "GitHub",
        external: true,
      },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { href: "#", label: "MIT License" },
      { href: "#", label: "Privacy" },
    ],
  },
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link className="flex items-center space-x-2" href="/">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-primary-foreground text-sm">
                  AI
                </span>
              </div>
              <span className="font-bold text-xl">Chat SaaS Stack</span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm">
              The open-source AI SaaS template. Build and monetize your own AI
              chatbot business.
            </p>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            {currentYear} AI Chat SaaS Stack. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
};
