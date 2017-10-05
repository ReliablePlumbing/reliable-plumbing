export interface Config {
    authorization: {
        tokenKey: string,
        tokenExpiration: string
    };

    db: {
        mongoConnectionString: string
    }
}


// interface authorization {
//     tokenKey: string;
//     tokenExpiration: string
// }

// interface db {
//     mongoConnectionString: string
// }