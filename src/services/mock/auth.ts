export function mockLogin(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  user?: { id: string; name: string; email: string; role: string };
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          success: true,
          user: {
            id: '1',
            name: 'Administrador',
            email,
            role: 'admin_master',
          },
        });
      } else {
        resolve({ success: false });
      }
    }, 800);
  });
}

export function mockLogout(): Promise<void> {
  return Promise.resolve();
}
