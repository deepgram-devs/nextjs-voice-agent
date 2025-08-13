import styles from "./ButtonLink.module.css";

interface ButtonLinkProps {
  url: string;
  size?: "small" | "large";
  children: React.ReactNode;
}

export const ButtonLink = ({ url, size, children }: ButtonLinkProps) => {
  const sizeClass = size === "large" ? styles.large : size === "small" ? styles.small : "";

  return (
    <a
      href={url}
      className={`${styles.button} ${sizeClass}`.trim()}
    >
      {children}
    </a>
  )
}