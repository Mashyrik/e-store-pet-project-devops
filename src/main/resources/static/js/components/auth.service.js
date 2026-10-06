class AuthService {
    static async login(username, password) {
        console.log('AuthService: Attempting login for', username);
        
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Неверное имя пользователя или пароль');
            }
            
            const data = await response.json();
            this.saveAuthData(data);
            return data;
            
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }
    
    static async register(userData) {
        console.log('AuthService: Attempting registration for', userData.username);
        
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                let errorMessage = 'Ошибка регистрации';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Ошибка сервера: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('Registration successful via API', data);
            return data;
            
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                throw new Error('Не удалось подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:8080');
            }
            throw error;
        }
    }
    
    static saveAuthData(data) {
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
        }));
        
        console.log('Auth data saved to localStorage');
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
    
    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'ROLE_ADMIN';
    }
}

window.AuthService = AuthService;