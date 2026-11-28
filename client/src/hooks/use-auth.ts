"use client";

import { useApolloClient } from "@apollo/client/react";
import {
  CHECK_EMAIL,
  LOGIN,
  REGISTER,
  type EmailCheckData,
  type EmailCheckVariables,
  type LoginData,
  type LoginVariables,
  type RegisterData,
  type RegisterVariables,
} from "@/lib/auth-operations";
import { useAuthSession } from "@/providers/auth-provider";

export function useAuth() {
  const client = useApolloClient();
  const { setSession, ...session } = useAuthSession();

  async function checkEmail(email: string) {
    const { data } = await client.query<EmailCheckData, EmailCheckVariables>({
      query: CHECK_EMAIL,
      variables: { email },
      fetchPolicy: "no-cache",
    });
    if (!data) {
      throw new Error("The server returned no email check response.");
    }
    return data.checkEmail.exists;
  }

  async function login(input: LoginVariables["input"]) {
    const { data } = await client.mutate<LoginData, LoginVariables>({
      mutation: LOGIN,
      variables: { input },
      fetchPolicy: "no-cache",
    });
    if (!data) {
      throw new Error("The server returned no login response.");
    }

    setSession({
      accessToken: data.login.accessToken,
      user: data.login.user,
    });
    return data.login.user;
  }

  async function register(input: RegisterVariables["input"]) {
    const { data } = await client.mutate<RegisterData, RegisterVariables>({
      mutation: REGISTER,
      variables: { input },
      fetchPolicy: "no-cache",
    });
    if (!data) {
      throw new Error("The server returned no registration response.");
    }

    return data.register.user;
  }

  return { ...session, checkEmail, login, register };
}
