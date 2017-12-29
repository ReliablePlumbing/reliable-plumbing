import { Service } from 'typedi'
import config from '../../config';
import * as fs from 'fs';
import * as uuid from 'uuid';
@Service()
export class FilesManager {

    getImagesFilesNames(files) {
        if (!files || files.length == 0)
            return [];
        return files.map(img => img.filename);
    }

    moveFilesToObjectFolder(objectId, files) {
        if (!files || files.length == 0)
            return;

        let objectPath = config.filesSettings.basePath + '/' + objectId;
        if (!fs.existsSync(objectPath))
            fs.mkdirSync(objectPath);

        for (let file of files) {
            let oldPath = file.path;
            let newPath = objectPath + '/' + file.filename;
            fs.rename(oldPath, newPath, err => {
                if (err)
                    console.log(err);
            })

        }
    }

    getFilesUrls(filesDic) {
        let urls = [];
        let basePath = config.filesSettings.basePath;

        for (let objectId in filesDic) {
            for (let fileName of filesDic[objectId])
                urls.push(basePath + '/' + objectId + '/' + fileName);
        }
        return urls;
    }

}