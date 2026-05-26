'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';

export default function ConfigurarMFA() {
  const supabase = createClient();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string>('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 1. Iniciar el proceso de alta del MFA (Generar el secreto QR)
  const iniciarMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Linux Match', // El nombre que verá el usuario en su app de Authenticator
    });

    if (error) {
      setMensaje(`Error al iniciar MFA: ${error.message}`);
      return;
    }

    setFactorId(data.id);
    // La URI contiene el secreto que leerá la app de Google Authenticator
    setQrUri(data.totp.qr_code); 
  };

  // 2. Validar el primer código de la App para confirmar que funciona y ACTIVARLO definitivamente
  const verificarYActivarMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    // Supabase exige un "challenge" (desafío) para comprobar el código
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setMensaje(`Error en el desafío: ${challenge.error.message}`);
      return;
    }

    // Enviamos el código que el usuario ve en su móvil
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: codigoVerificacion,
    });

    if (verify.error) {
      setMensaje(`Código incorrecto: ${verify.error.message}`);
    } else {
      setMensaje('¡Doble factor (MFA) activado con éxito en tu cuenta!');
      // Guardar en un estado general o Redirigir
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg max-w-md mx-auto mt-10">
      <h3 className="text-xl font-bold mb-4">Seguridad de la cuenta</h3>
      
      {!qrUri ? (
        <button 
          onClick={iniciarMFA}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Activar Doble Factor (2FA)
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-300 text-center">
            Escanea este código QR con Google Authenticator o tu app de confianza:
          </p>
          
          <div className="bg-white p-3 rounded">
            <QRCodeSVG value={qrUri} size={200} />
          </div>

          <form onSubmit={verificarYActivarMFA} className="w-full flex flex-col gap-2">
            <label className="text-xs text-slate-400">Introduce el código de 6 dígitos:</label>
            <input
              type="text"
              maxLength={6}
              value={codigoVerificacion}
              onChange={(e) => setCodigoVerificacion(e.target.value)}
              placeholder="000000"
              className="p-2 rounded bg-slate-800 text-center text-xl tracking-widest text-white border border-slate-700"
              required
            />
            <button type="submit" className="bg-green-600 p-2 rounded hover:bg-green-700">
              Verificar y Activar
            </button>
          </form>
        </div>
      )}
      {mensaje && <p className="mt-4 text-center text-sm text-yellow-400">{mensaje}</p>}
    </div>
  );
}
