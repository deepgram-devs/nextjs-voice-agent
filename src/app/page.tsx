import { Body } from "./components/body/Body";
import { Nav } from "./components/nav/Nav";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      paddingTop: '76px' // Account for fixed nav
    }}>
      <Nav />
      <Body />
    </div>
  );
}
