// components/quotes/SignaturePad.tsx

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onChange: (signatureData: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const clear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsSigned(false);
    }
  };

  const save = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const data = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      onChange(data);
    } else {
      alert('Холст пуст. Пожалуйста, нарисуйте подпись.');
    }
  };

  const handleEnd = () => {
    setIsSigned(true);
  };

  return (
    <div>
      <h3>Подпись</h3>
      <SignatureCanvas
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
        ref={sigPadRef}
        onEnd={handleEnd}
      />
      <div>
        <button type="button" onClick={clear}>
          Очистить
        </button>
        <button type="button" onClick={save} disabled={!isSigned}>
          Сохранить подпись
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;

