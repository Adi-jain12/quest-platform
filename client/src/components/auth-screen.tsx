"use client";

import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

type AuthStep = "email" | "login" | "signup";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    const graphQLError = error.errors[0];
    const fieldErrors = graphQLError?.extensions?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstFieldError = Object.values(fieldErrors)
        .flat()
        .find((message): message is string => typeof message === "string");
      if (firstFieldError) {
        return firstFieldError;
      }
    }

    return graphQLError?.message ?? "We couldn't complete that request.";
  }

  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "We couldn't reach Quest. Check your connection and try again.";
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function Spinner() {
  return <span aria-hidden="true" className="auth-spinner" />;
}

function BrandMark() {
  return (
    <div aria-hidden="true" className="brand-mark">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 3.5 27 9.75v12.5L16 28.5 5 22.25V9.75L16 3.5Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12.1 12.35a5.55 5.55 0 1 1 7.8 7.9l-7.8-7.9Zm0 0 7.8 7.9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={visible ? "Hide password" : "Show password"}
      className="password-toggle"
      onClick={onToggle}
      type="button"
    >
      {visible ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.1 0 8.5 4.7 9.5 6.4a1.1 1.1 0 0 1 0 1.2 16.3 16.3 0 0 1-3.1 3.6M6.2 6.3a16.2 16.2 0 0 0-3.7 5.1 1.1 1.1 0 0 0 0 1.2C3.5 14.3 6.9 19 12 19c.9 0 1.7-.1 2.5-.4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )}
    </button>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const { user, isRestoring, restoreError, login, register, checkEmail } =
    useAuth();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const submissionLock = useRef(false);

  useEffect(() => {
    if (user && !isRestoring) {
      router.replace("/explore");
    }
  }, [isRestoring, router, user]);

  const trimmedEmail = email.trim();
  const isEmailValid = emailPattern.test(trimmedEmail);
  const isNameValid = name.trim().length >= 2 && name.trim().length <= 80;
  const isPasswordValid =
    password.length >= (step === "signup" ? 8 : 1) &&
    new TextEncoder().encode(password).length <= 72;

  function changeStep(nextStep: AuthStep) {
    setError(null);
    setNotice(null);
    setPassword("");
    setStep(nextStep);
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    setError(null);
    if (!isEmailValid || submissionLock.current) {
      return;
    }

    submissionLock.current = true;
    setNotice(null);
    setIsSubmitting(true);
    try {
      const exists = await checkEmail(trimmedEmail);
      setEmail(trimmedEmail);
      setStep(exists ? "login" : "signup");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isPasswordValid || submissionLock.current) {
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isNameValid || !isPasswordValid || submissionLock.current) {
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: trimmedEmail, password });
      setPassword("");
      setStep("login");
      setNotice("Your account is ready. Sign in to get started.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  const heading =
    step === "email"
      ? "Find your people."
      : step === "login"
        ? "Welcome back."
        : "A little about you.";
  const description =
    step === "email"
      ? "Make room for good plans and the people who make them better."
      : step === "login"
        ? "Sign in and pick up where your next good plan begins."
        : "A few details and you’re ready to find your next great plan.";

  return (
    <main className="auth-backdrop min-h-screen flex items-center justify-center px-5 py-10">
      <div className="auth-image-shade" aria-hidden="true" />
      <div className="auth-content">
        <header className="auth-brand" aria-label="Quest">
          <BrandMark />
          <span>quest</span>
        </header>

        <section aria-labelledby="auth-heading" className="auth-card">
          {isRestoring ? (
            <div className="session-loading" role="status">
              <Spinner />
              <span>Getting things ready…</span>
            </div>
          ) : user ? (
            <div className="success-panel" key="signed-in">
              <div aria-hidden="true" className="success-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m5 12.5 4.2 4.2L19 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <p className="eyebrow">YOU’RE IN</p>
              <h1 id="auth-heading">Welcome, {user.name.split(" ")[0]}.</h1>
              <p className="auth-description">
                You’re signed in as <span className="user-email">{user.email}</span>.
                Good things are better together.
              </p>
            </div>
          ) : (
            <div className="auth-panel" key={step}>
              <div className="card-intro">
                <p className="eyebrow">
                  {step === "email" ? "A BETTER WAY TO MAKE PLANS" : "WELCOME TO QUEST"}
                </p>
                <h1 id="auth-heading">{heading}</h1>
                <p className="auth-description">{description}</p>
              </div>

              {restoreError && (
                <div className="form-message form-message-error" role="status">
                  {restoreError}
                </div>
              )}
              {notice && (
                <div className="form-message form-message-success" role="status">
                  {notice}
                </div>
              )}
              {error && (
                <div className="form-message form-message-error" role="alert">
                  {error}
                </div>
              )}

              {step === "email" && (
                <form className="auth-form" onSubmit={submitEmail} noValidate>
                  <div className="field-group">
                    <label className="field-label" htmlFor="email">
                      Email address
                    </label>
                    <input
                      autoComplete="email"
                      autoFocus
                      className="auth-input"
                      id="email"
                      inputMode="email"
                      name="email"
                      onBlur={() => setEmailTouched(true)}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError(null);
                      }}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                      aria-invalid={emailTouched && !isEmailValid}
                      aria-describedby={
                        emailTouched && !isEmailValid ? "email-error" : undefined
                      }
                    />
                    {emailTouched && !isEmailValid && (
                      <p className="field-error" id="email-error">
                        Enter a valid email address.
                      </p>
                    )}
                  </div>
                  <button
                    className="primary-button"
                    disabled={!isEmailValid || isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Checking…
                      </>
                    ) : (
                      <>
                        Continue
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M4 10h12m-5-5 5 5-5 5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === "login" && (
                <form className="auth-form" onSubmit={submitLogin} noValidate>
                  <div className="selected-email">
                    <span className="selected-email-icon" aria-hidden="true">
                      {trimmedEmail.charAt(0).toUpperCase()}
                    </span>
                    <span className="selected-email-address">{trimmedEmail}</span>
                    <button
                      className="text-button"
                      onClick={() => changeStep("email")}
                      type="button"
                    >
                      Change
                    </button>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="login-password">
                      Password
                    </label>
                    <div className="password-field">
                      <input
                        autoComplete="current-password"
                        autoFocus
                        className="auth-input"
                        id="login-password"
                        name="password"
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError(null);
                        }}
                        placeholder="Enter your password"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        aria-invalid={password.length === 0}
                      />
                      <PasswordToggle
                        visible={passwordVisible}
                        onToggle={() => setPasswordVisible((visible) => !visible)}
                      />
                    </div>
                  </div>
                  <button
                    className="primary-button"
                    disabled={!isPasswordValid || isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Signing in…
                      </>
                    ) : (
                      "Log in"
                    )}
                  </button>
                  <p className="auth-footnote">
                    New to Quest?{" "}
                    <button
                      className="inline-link"
                      onClick={() => changeStep("email")}
                      type="button"
                    >
                      Use another email
                    </button>
                  </p>
                </form>
              )}

              {step === "signup" && (
                <form className="auth-form" onSubmit={submitSignup} noValidate>
                  <div className="selected-email">
                    <span className="selected-email-icon" aria-hidden="true">
                      {trimmedEmail.charAt(0).toUpperCase()}
                    </span>
                    <span className="selected-email-address">{trimmedEmail}</span>
                    <button
                      className="text-button"
                      onClick={() => changeStep("email")}
                      type="button"
                    >
                      Change
                    </button>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="name">
                      Your name
                    </label>
                    <input
                      autoComplete="name"
                      autoFocus
                      className="auth-input"
                      id="name"
                      maxLength={80}
                      name="name"
                      onChange={(event) => {
                        setName(event.target.value);
                        setError(null);
                      }}
                      placeholder="What should we call you?"
                      type="text"
                      value={name}
                      aria-invalid={name.length > 0 && !isNameValid}
                    />
                    {name.length > 0 && !isNameValid && (
                      <p className="field-error">Name must be 2–80 characters.</p>
                    )}
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="signup-password">
                      Create a password
                    </label>
                    <div className="password-field">
                      <input
                        autoComplete="new-password"
                        className="auth-input"
                        id="signup-password"
                        name="password"
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError(null);
                        }}
                        placeholder="At least 8 characters"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        aria-invalid={password.length > 0 && !isPasswordValid}
                      />
                      <PasswordToggle
                        visible={passwordVisible}
                        onToggle={() => setPasswordVisible((visible) => !visible)}
                      />
                    </div>
                    {password.length > 0 && !isPasswordValid && (
                      <p className="field-error">
                        Use 8 or more characters (up to 72 bytes).
                      </p>
                    )}
                  </div>
                  <button
                    className="primary-button"
                    disabled={!isNameValid || !isPasswordValid || isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Creating account…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                  <p className="auth-footnote">
                    Already have an account?{" "}
                    <button
                      className="inline-link"
                      onClick={() => changeStep("email")}
                      type="button"
                    >
                      Check another email
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
          <div className="card-footer">
            <span>Made for getting out there.</span>
            <span aria-hidden="true" className="footer-sparkle">✳</span>
          </div>
        </section>

        <p className="backdrop-caption">
          <span aria-hidden="true" className="caption-dot" />
          Good things happen together
        </p>
      </div>
    </main>
  );
}
