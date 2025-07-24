"use client";

import dynamic from "next/dynamic";

// Dynamically import the App component to avoid SSR issues with Monaco Editor
const App = dynamic(() => import("../../components/App"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
      }}
    >
      Loading SpEL Rule Editor...
    </div>
  ),
});

export default function RuleEditorPage() {
  return <App />;
}
