import Styles from "./ButtonLink.module.css";

interface ButtonLinkProps {
    url: string;
    size?: "small" | "large";
    children: React.ReactNode;
}

export const ButtonLink = ({ url, size, children}: ButtonLinkProps) => {
    return (
        <a
      href={url}
      className={`${Styles["appbutton-link"]} ${size === "large" ? Styles.large : Styles.small}`}
    >
      <div className={Styles["appbutton-link-content"]}>{children}</div>
    </a>
    )
}