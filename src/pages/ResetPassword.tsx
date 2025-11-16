import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ResetPasswordProps {
  onResetSuccess: () => void;
}

export default function ResetPassword({ onResetSuccess }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si hay un hash de recuperación en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (!accessToken || type !== "recovery") {
      setError(
        "Enlace inválido o expirado. Solicita un nuevo enlace de recuperación."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        onResetSuccess();
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar la contraseña. Intenta nuevamente."
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
            Nueva Contraseña
          </h1>
          <p className="text-sm font-light text-white/80">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-light tracking-wide text-neutral-900">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-sm font-light text-neutral-600">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  NUEVA CONTRASEÑA
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
                <p className="mt-1 text-xs font-light text-neutral-500">
                  Mínimo 6 caracteres
                </p>
              </div>

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

              {error && (
                <div className="rounded-sm bg-red-50 p-4 text-sm font-light text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-900 py-4 font-light tracking-wider text-white transition-all hover:bg-neutral-800 disabled:bg-neutral-400"
              >
                {isLoading ? "ACTUALIZANDO..." : "ACTUALIZAR CONTRASEÑA"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs font-light text-white/60">
          Todos los derechos reservados © 2025 RealStack
        </p>
      </div>
    </div>
  );
}
