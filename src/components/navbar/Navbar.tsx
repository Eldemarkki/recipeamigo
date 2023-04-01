import styled from "styled-components";
import config from "../../config";
import Link from "next/link";

const Container = styled.nav({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "3rem",
  padding: "1rem",
});

const LinkList = styled.ul({
  display: "flex",
  flexDirection: "row",
  listStyle: "none",
  margin: 0,
  padding: 0,
  gap: "1rem",
});

const Title = styled.h1({
  margin: 0,
  padding: 0,
});

export type NavbarProps = {
  isLoggedIn: boolean
}

export const Navbar = ({ isLoggedIn }: NavbarProps) => {
  return <Container>
    <Title>
      <Link href="/">
        {config.APP_NAME}
      </Link>
    </Title>
    <nav>
      <LinkList>
        <li>
          <Link href="/">Home</Link>
        </li>
        {isLoggedIn &&
          <li>
            <Link href="/profile">Profile</Link>
          </li>}
      </LinkList>
    </nav>
  </Container>;
};
