import "./globals.css";

export const metadata = {
  title: "EV Transition Advisor | FleetAxis Advisory",
  description: "AI-powered EV fleet transition advisor by FleetAxis Advisory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
