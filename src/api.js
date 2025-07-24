


api.interceptors.request.use(
    (config) => {
        console.log("==== INTERCEPTOR RUNNING ====");
        console.log("Request URL:", config.url);

        // Mấy đường này KHÔNG gắn token
        const skipAuthUrls = ["/auth/admin/login", "/auth/refresh"];
        console.log("Skip Auth URLs:", skipAuthUrls);

        const isSkip = skipAuthUrls.some((url) =>
            config.url.includes(url)
        );
        console.log("Is Skip:", isSkip);

        if (!isSkip) {
            const token = localStorage.getItem("accessToken");
            console.log("Got Token From LocalStorage:", token);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log("Added Authorization Header:", config.headers.Authorization);
            } else {
                console.log("No token found -> No Authorization header added");
            }
        } else {
            console.log("This URL is in skip list -> No Authorization header added");
        }

        console.log("==== INTERCEPTOR DONE ====");
        return config;
    },
    (error) => {
        console.log("INTERCEPTOR ERROR:", error);
        return Promise.reject(error);
    }
);

