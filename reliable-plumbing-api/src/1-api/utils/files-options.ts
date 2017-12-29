import * as multer from 'multer';
import config from '../../config';
import * as uuid from 'uuid';
import * as fs from 'fs';

export const fileUploadOptions = {
    storage: multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
            let basePath = config.filesSettings.basePath;
            if (!fs.existsSync(basePath))
                fs.mkdirSync(basePath);
            cb(null, basePath);
        },
        filename: (req: any, file: any, cb: any) => {
            //mimetype
            let originalFileName = file.originalname;
            let extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1, originalFileName.length);
            cb(null, uuid() + '.' + extension);
        }
    }),
    fileFilter: (req: any, file: any, cb: any) => {
        // validate file type here
        cb(null, true);
    },
    limits: {
        fieldNameSize: 255,
        fileSize: 1024 * 1024 * 2
    }
};
