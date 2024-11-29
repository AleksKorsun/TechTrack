// app/authentication/error/page.tsx

import React from 'react';

const ErrorPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Ошибка аутентификации</h1>
      <p>Произошла ошибка при попытке входа в систему. Пожалуйста, попробуйте снова.</p>
    </div>
  );
};

export default ErrorPage;
