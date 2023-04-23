import config from "../../config";
import Link from "next/link";
import styles from "./Navbar.module.css";

export type NavbarProps = {
  isLoggedIn: boolean
}

export const Navbar = ({ isLoggedIn }: NavbarProps) => {
  return <div className={styles.container}>
    <h1 className={styles.title}>
      <Link href="/">
        {config.APP_NAME}
      </Link>
    </h1>
    <nav>
      <ol className={styles.linkList}>
        <li>
          <Link href="/">Home</Link>
        </li>
        {isLoggedIn &&
          <li>
            <Link href="/profile">Profile</Link>
          </li>}
      </ol>
    </nav>
  </div>;
};
