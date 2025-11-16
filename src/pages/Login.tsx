import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot-password">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/#type=recovery`,
          }
        );

        if (resetError) {
          throw resetError;
        }

        setError(
          "Revisa tu email. Te hemos enviado un enlace para restablecer tu contraseña."
        );
        setTimeout(() => {
          setMode("login");
          setError("");
        }, 3000);
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden");
          setIsLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          // Si el email está confirmado automáticamente o en desarrollo
          if (data.user.confirmed_at || data.session) {
            onLoginSuccess();
          } else {
            setError(
              "Usuario creado. Revisa tu email para confirmar la cuenta antes de iniciar sesión."
            );
            setTimeout(() => {
              setMode("login");
            }, 3000);
          }
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (data.user) {
          onLoginSuccess();
        }
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error de autenticación. Verifica tus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-white/10 backdrop-blur-md">
            <Lock className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="mb-2 text-3xl font-light tracking-wide text-white">
            {mode === "forgot-password" ? "Recuperar Contraseña" : "Administración"}
          </h1>
          <p className="text-sm font-light text-white/80">
            {mode === "login"
              ? "Ingresa tus credenciales para continuar"
              : mode === "signup"
              ? "Crea tu cuenta"
              : "Ingresa tu email para restablecer tu contraseña"}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
              >
                EMAIL
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 bg-white py-3 pl-12 pr-4 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {mode !== "forgot-password" && (
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  CONTRASEÑA
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.5}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-neutral-300 bg-white py-3 pl-12 pr-12 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1 text-xs font-light text-neutral-500">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  CONFIRMAR CONTRASEÑA
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.5}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-neutral-300 bg-white py-3 pl-12 pr-12 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                className={`rounded-sm p-4 text-sm font-light ${
                  error.includes("Revisa tu email")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-900 py-4 font-light tracking-wider text-white transition-all hover:bg-neutral-800 disabled:bg-neutral-400"
            >
              {isLoading
                ? mode === "login"
                  ? "INICIANDO SESIÓN..."
                  : mode === "signup"
                  ? "CREANDO CUENTA..."
                  : "ENVIANDO EMAIL..."
                : mode === "login"
                ? "INICIAR SESIÓN"
                : mode === "signup"
                ? "CREAR CUENTA"
                : "ENVIAR ENLACE"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {mode === "login" && (
              <button
                onClick={() => {
                  setMode("forgot-password");
                  setError("");
                }}
                className="block w-full text-sm font-light text-neutral-600 transition-colors hover:text-neutral-900"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setConfirmPassword("");
              }}
              className="text-sm font-light text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Crear cuenta de RealStack"
                : "¿Ya tienes cuenta? Iniciar sesión"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-light text-white/60">
          Todos los derechos reservados © 2025 RealStack
        </p>
      </div>
    </div>
  );
}
