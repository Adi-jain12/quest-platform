"use client";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ApolloProvider } from "@apollo/client/react";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { from, switchMap, throwError } from "rxjs";
import {
  REFRESH_TOKEN,
  type AuthUser,
  type RefreshData,
} from "@/lib/auth-operations";

type AuthSession = {
  accessToken: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthSession & {
  isRestoring: boolean;
  restoreError: string | null;
  setSession: (session: AuthSession) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

class AuthSessionStore {
  private session: AuthSession = {
    accessToken: null,
    user: null,
  };
  private listeners = new Set<() => void>();

  getSnapshot = () => this.session;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  setSession = (session: AuthSession) => {
    this.session = session;
    this.listeners.forEach((listener) => listener());
  };
}

function isUnauthenticated(error: unknown) {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === "UNAUTHENTICATED",
    )
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "We couldn't restore your session. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionStore] = useState(() => new AuthSessionStore());
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getSnapshot,
  );
  const setSession = sessionStore.setSession;
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const authClient = useMemo(() => {
    const graphQLEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    if (!graphQLEndpoint) {
      return null;
    }

    const clientReference: { current: ApolloClient | null } = {
      current: null,
    };
    let refreshPromise: Promise<string | null> | null = null;

    const getClient = () => {
      const client = clientReference.current;
      if (!client) {
        throw new Error("The authentication client is not initialized.");
      }
      return client;
    };

    const refreshSession = (): Promise<string | null> => {
      if (!refreshPromise) {
        refreshPromise = getClient()
          .mutate<RefreshData>({
            mutation: REFRESH_TOKEN,
            fetchPolicy: "no-cache",
          })
          .then(({ data }) => {
            if (!data) {
              throw new Error("The server returned no refreshed session.");
            }

            const nextSession = {
              accessToken: data.refreshToken.accessToken,
              user: data.refreshToken.user,
            };
            setSession(nextSession);
            return nextSession.accessToken;
          })
          .catch((error: unknown) => {
            if (!isUnauthenticated(error)) {
              throw error;
            }

            setSession({ accessToken: null, user: null });
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return refreshPromise;
    };

    const refreshLink = new ErrorLink(({ error, operation, forward }) => {
      const isAuthOperation = [
        "CheckEmail",
        "Login",
        "Register",
        "RefreshToken",
      ].includes(operation.operationName ?? "");
      const hasAuthError = isUnauthenticated(error);

      if (
        isAuthOperation ||
        !hasAuthError ||
        !sessionStore.getSnapshot().accessToken
      ) {
        return;
      }

      return from(refreshSession()).pipe(
        switchMap((accessToken) => {
          if (!accessToken) {
            return throwError(() => error);
          }

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${accessToken}`,
            },
          }));
          return forward(operation);
        }),
      );
    });

    const authLink = new SetContextLink((previousContext) => {
      const headers = { ...previousContext.headers };
      const accessToken = sessionStore.getSnapshot().accessToken;
      if (accessToken) {
        headers.authorization = `Bearer ${accessToken}`;
      } else {
        delete headers.authorization;
      }
      return { headers };
    });

    const client = new ApolloClient({
      link: ApolloLink.from([
        refreshLink,
        authLink,
        new HttpLink({
          uri: graphQLEndpoint,
          credentials: "include",
        }),
      ]),
      cache: new InMemoryCache(),
    });
    clientReference.current = client;

    return { client, refreshSession };
  }, [sessionStore, setSession]);

  useEffect(() => {
    if (!authClient) {
      return;
    }

    let active = true;

    authClient
      .refreshSession()
      .catch((error: unknown) => {
        if (active) {
          setRestoreError(errorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setIsRestoring(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authClient]);

  const contextValue = useMemo(
    () => ({
      ...session,
      isRestoring,
      restoreError,
      setSession,
    }),
    [isRestoring, restoreError, session, setSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {authClient ? (
        <ApolloProvider client={authClient.client}>{children}</ApolloProvider>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider.");
  }
  return context;
}
