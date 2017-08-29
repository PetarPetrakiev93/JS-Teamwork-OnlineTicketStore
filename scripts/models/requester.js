const requester = (() => {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_SyAMbTzYW';
    const appSecret = 'c17e678b07a1482fbc53476ff2fea5f5';

    function makeHeader(type) {
        if (type === 'basic') {
            return {
                'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
                'Content-Type': 'application/json'
            }
        } else {
            return {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken'),
                'Content-Type': 'application/json'
            }
        }
    }

    function makeRequest(method, module, url, auth) {
        return {
            url: baseUrl + module + '/' + appKey + '/' + url,
            method,
            headers: makeHeader(auth)
        }
    }

    function get(module, url, auth) {
        return $.ajax(makeRequest('GET', module, url, auth))
    }

    function post(module, url, data, auth) {
        let req = makeRequest('POST', module, url, auth);
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    function update(module, url, data, auth) {
        let req = makeRequest('PUT', module, url, auth);
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    function remove(module, url, auth) {
        return $.ajax(makeRequest('DELETE', module, url, auth));
    }

    return {
        get: get,
        post: post,
        update: update,
        remove: remove
    }
})();
