import AuthScreen from "@/components/auth-screen";

export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return (
      <main className="api-config-error" role="alert">
        <h1>Authentication needs a little setup</h1>
        <p>
          Set <code>NEXT_PUBLIC_GRAPHQL_URL</code> to your GraphQL endpoint and
          restart the client.
        </p>
      </main>
    );
  }

  return <AuthScreen />;
}
