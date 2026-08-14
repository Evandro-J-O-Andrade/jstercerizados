export function mockLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email && password) {
                resolve({
                    success: true,
                    user: {
                        id: '1',
                        name: 'Administrador',
                        email,
                        role: 'admin',
                    },
                });
            }
            else {
                resolve({ success: false });
            }
        }, 800);
    });
}
export function mockLogout() {
    return Promise.resolve();
}
