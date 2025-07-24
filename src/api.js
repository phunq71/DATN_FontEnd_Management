


api.interceptors.request.use(
    (config) => {

        // Mấy đường này KHÔNG gắn token
        const skipAuthUrls = ["/auth/admin/login", "/auth/refresh"];
        //console.log("Skip Auth URLs:", skipAuthUrls);

        const isSkip = skipAuthUrls.some((url) =>
            config.url.includes(url)
        );
        ////console.log("Is Skip:", isSkip);

        if (!isSkip) {
            const token = getCookie("accessToken");
            //console.log("Got Token From LocalStorage:", token);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                //console.log("Added Authorization Header:", config.headers.Authorization);
            } else {
                //console.log("No token found -> No Authorization header added");
            }
        } else {
            //console.log("This URL is in skip list -> No Authorization header added");
        }

        //console.log("==== INTERCEPTOR DONE ====");
        return config;
    },
    (error) => {
        //console.log("INTERCEPTOR ERROR:", error);
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

