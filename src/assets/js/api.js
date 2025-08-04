


api.interceptors.request.use(
    (config) => {
        const skipAuthUrls = ["/auth/admin/login", "/auth/refresh"];
        const isSkip = skipAuthUrls.some((url) => config.url.includes(url));

        if (!isSkip) {
            const accessToken = getCookie("accessToken");
            const refreshToken = getCookie("refreshToken"); // 👈 Lấy refresh token nếu có

            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            if (refreshToken) {
                // 👇 Có thể gắn thêm custom header cho refresh token (nếu cần thiết)
                config.headers.Authorization = `Bearer ${refreshToken}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null; // không tìm thấy thì trả về null
}

