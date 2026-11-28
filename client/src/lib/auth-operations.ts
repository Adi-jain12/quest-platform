import { gql } from "@apollo/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "HOST" | "ADMIN";
};

export type EmailCheckData = {
  checkEmail: {
    exists: boolean;
  };
};

export type EmailCheckVariables = {
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  login: {
    accessToken: string;
    user: AuthUser;
  };
};

export type LoginVariables = {
  input: LoginInput;
};

export type RegisterData = {
  register: {
    user: AuthUser;
  };
};

export type RegisterVariables = {
  input: RegisterInput;
};

export type RefreshData = {
  refreshToken: {
    accessToken: string;
    user: AuthUser;
  };
};

export const CHECK_EMAIL = gql`
  query CheckEmail($email: String!) {
    checkEmail(email: $email) {
      exists
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;
