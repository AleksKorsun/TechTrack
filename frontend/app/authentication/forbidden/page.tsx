'use client';

import React from 'react';

const ForbiddenPage: React.FC = () => {
  return (
    <div>
      <h1>Доступ запрещен</h1>
      <p>У вас нет прав для просмотра этой страницы.</p>
    </div>
  );
};

export default ForbiddenPage;
